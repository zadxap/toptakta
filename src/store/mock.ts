import type { AppUser, FeedEvent, Group, Status, Task, TaskInput } from '../types'
import type { Store } from './api'
import { CodeNotFoundError } from './api'
import { makeSeed } from './seed'

/**
 * Демо-режим: Firebase кілттері .env-де көрсетілмегенде қолданылады.
 * Барлық деректер localStorage-та, бұлтсыз жұмыс істейді.
 */

const KEY = 'toptakta.demo.v2'
const DAY = 24 * 3600e3

interface MockDB {
  currentUid: string | null
  groups: Group[]
  tasks: Record<string, Task[]>
  events: Record<string, FeedEvent[]>
}

function load(): MockDB {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as MockDB
  } catch {
    /* бұзылған сақтауыш — жаңартамыз */
  }
  const fresh = makeSeed(Date.now())
  persist(fresh)
  return fresh
}

function persist(db: MockDB): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    /* кванта сыймаса — тек жадта қалады */
  }
}

let db: MockDB | null = null
const subs = new Map<string, Set<(v: unknown) => void>>()

function store(): MockDB {
  if (!db) db = load()
  return db
}

function subKey(...parts: string[]): string {
  return parts.join(':')
}

function notify(...keys: string[]): void {
  for (const k of keys) {
    const set = subs.get(k)
    if (!set) continue
    for (const fn of set) fn(null)
  }
}

function subscribe(key: string, fn: (v: unknown) => void): () => void {
  let set = subs.get(key)
  if (!set) {
    set = new Set()
    subs.set(key, set)
  }
  set.add(fn)
  return () => {
    set!.delete(fn)
    if (set!.size === 0) subs.delete(key)
  }
}

const GUEST: AppUser = { uid: 'guest', name: 'Қонақ' }

const CODE_ALPHABET = 'ACDEFGHJKLMNPQRTUVWXYZ234679'
function genCode(): string {
  let s = ''
  for (let i = 0; i < 6; i++) s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  return s
}

function pushEvent(gid: string, ev: Omit<FeedEvent, 'id' | 'at'>): void {
  const d = store()
  const list = d.events[gid] ?? (d.events[gid] = [])
  list.unshift({ ...ev, id: 'ev-' + Math.random().toString(36).slice(2, 9), at: Date.now() })
  d.events[gid] = list.slice(0, 40)
}

export const mockStore: Store = {
  mock: true,

  auth: {
    user() {
      return store().currentUid ? GUEST : null
    },
    onUser(cb) {
      const fn = () => cb(store().currentUid ? GUEST : null)
      const un = subscribe('user', fn as (v: unknown) => void)
      fn()
      return un
    },
    async signIn() {
      store().currentUid = GUEST.uid
      persist(store())
      notify('user')
    },
    async signOut() {
      store().currentUid = null
      persist(store())
      notify('user')
    },
    async redirectError() {
      return null
    },
  },

  groups: {
    listenMine(uid, cb) {
      const fn = () => cb(store().groups.filter((g) => g.memberUids.includes(uid)))
      const un = subscribe('groups', fn as (v: unknown) => void)
      fn()
      return un
    },

    get(id, cb) {
      const fn = () => cb(store().groups.find((g) => g.id === id) ?? null)
      const un = subscribe(subKey('group', id), fn as (v: unknown) => void)
      fn()
      return un
    },

    async byCode(code) {
      const c = code.trim().toUpperCase()
      return store().groups.find((g) => g.code === c) ?? null
    },

    async create(name, accent, user) {
      const now = Date.now()
      const g: Group = {
        id: 'g-' + Math.random().toString(36).slice(2, 9),
        name,
        code: genCode(),
        ownerUid: user.uid,
        accent,
        createdAt: now,
        memberUids: [user.uid],
        members: { [user.uid]: { ...user, role: 'owner', joinedAt: now } },
      }
      store().groups.unshift(g)
      pushEvent(g.id, { type: 'created_group', actorUid: user.uid, actorName: user.name })
      persist(store())
      notify('groups', subKey('group', g.id))
      return g
    },

    async join(code, user) {
      const d = store()
      const c = code.trim().toUpperCase()
      const g = d.groups.find((x) => x.code === c)
      if (!g) throw new CodeNotFoundError()
      if (!g.memberUids.includes(user.uid)) {
        g.memberUids.push(user.uid)
        g.members[user.uid] = { ...user, role: 'member', joinedAt: Date.now() }
        pushEvent(g.id, { type: 'joined', actorUid: user.uid, actorName: user.name })
        persist(d)
        notify('groups', subKey('group', g.id))
      }
      return g
    },
  },

  tasks: {
    listen(gid, cb) {
      const fn = () => cb([...(store().tasks[gid] ?? [])].sort((a, b) => b.createdAt - a.createdAt))
      const un = subscribe(subKey('tasks', gid), fn as (v: unknown) => void)
      fn()
      return un
    },

    async add(gid, input, user) {
      const d = store()
      const list = d.tasks[gid] ?? (d.tasks[gid] = [])
      list.unshift({
        id: 't-' + Math.random().toString(36).slice(2, 9),
        title: input.title,
        desc: input.desc,
        status: 'todo' as Status,
        assignee: input.assignee,
        deadline: input.deadline,
        createdBy: user.uid,
        createdByName: user.name,
        createdAt: Date.now(),
      })
      pushEvent(gid, { type: 'task_added', actorUid: user.uid, actorName: user.name, taskTitle: input.title })
      persist(d)
      notify(subKey('tasks', gid), subKey('events', gid))
    },

    async move(gid, task, status, user) {
      const d = store()
      const list = d.tasks[gid] ?? []
      const t = list.find((x) => x.id === task.id)
      if (!t) return
      t.status = status
      t.doneAt = status === 'done' ? Date.now() : undefined
      pushEvent(gid, {
        type: status === 'done' ? 'task_done' : 'task_moved',
        actorUid: user.uid,
        actorName: user.name,
        taskTitle: t.title,
      })
      persist(d)
      notify(subKey('tasks', gid), subKey('events', gid))
    },

    async assign(gid, task, assignee) {
      const d = store()
      const t = (d.tasks[gid] ?? []).find((x) => x.id === task.id)
      if (!t) return
      t.assignee = assignee
      persist(d)
      notify(subKey('tasks', gid))
    },

    async remove(gid, task, user) {
      const d = store()
      d.tasks[gid] = (d.tasks[gid] ?? []).filter((x) => x.id !== task.id)
      pushEvent(gid, { type: 'task_deleted', actorUid: user.uid, actorName: user.name, taskTitle: task.title })
      persist(d)
      notify(subKey('tasks', gid), subKey('events', gid))
    },
  },

  events: {
    listen(gid, cb) {
      const fn = () => cb([...(store().events[gid] ?? [])])
      const un = subscribe(subKey('events', gid), fn as (v: unknown) => void)
      fn()
      return un
    },
  },
}

export { DAY }
