import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  type Firestore,
} from 'firebase/firestore'
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
  type Auth,
  type User as FBUser,
} from 'firebase/auth'
import type { AppUser, FeedEvent, Group, Task, TaskInput } from '../types'
import { firebaseApp } from '../firebase'
import { CodeNotFoundError, type Store } from './api'

const CODE_ALPHABET = 'ACDEFGHJKLMNPQRTUVWXYZ234679'

function genCode(): string {
  let s = ''
  for (let i = 0; i < 6; i++) s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  return s
}

function toAppUser(u: FBUser): AppUser {
  return { uid: u.uid, name: u.displayName || u.email?.split('@')[0] || '—', photo: u.photoURL || undefined }
}

/**
 * Ленивая инициализация: модуль импортируется и в демо-режиме,
 * когда firebaseApp === null — трогаем SDK только по делу.
 */
let _db: Firestore | null = null
let _auth: Auth | null = null

function db(): Firestore {
  if (!_db) _db = getFirestore(firebaseApp!)
  return _db
}

function auth(): Auth {
  if (!_auth) _auth = getAuth(firebaseApp!)
  return _auth
}

async function uniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = genCode()
    const hit = await getDocs(query(collection(db(), 'groups'), where('code', '==', code), limit(1)))
    if (hit.empty) return code
  }
  return genCode() + Date.now().toString(36).slice(-2)
}

function addEvent(groupId: string, ev: Omit<FeedEvent, 'id'>) {
  return setDoc(doc(collection(db(), 'groups', groupId, 'events')), ev)
}

export const fbStore: Store = {
  mock: false,

  auth: {
    user() {
      const u = auth().currentUser
      return u ? toAppUser(u) : null
    },
    onUser(cb) {
      return onAuthStateChanged(auth(), (u) => {
        if (u) {
          // профиль: имя/аватар обновляем при входе
          void setDoc(
            doc(db(), 'users', u.uid),
            { name: toAppUser(u).name, photo: u.photoURL || null, updatedAt: Date.now() },
            { merge: true },
          )
        }
        cb(u ? toAppUser(u) : null)
      })
    },
    async signIn() {
      const provider = new GoogleAuthProvider()
      try {
        await signInWithPopup(auth(), provider)
      } catch (err) {
        const code = (err as { code?: string }).code ?? ''
        if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
          await signInWithRedirect(auth(), provider)
        } else if (code !== 'auth/cancelled-popup-request' && code !== 'auth/popup-closed-by-user') {
          throw err
        }
      }
    },
    async signOut() {
      await fbSignOut(auth())
    },
  },

  groups: {
    listenMine(uid, cb) {
      const q = query(collection(db(), 'groups'), where('memberUids', 'array-contains', uid))
      return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Group)))
    },

    get(id, cb) {
      return onSnapshot(doc(db(), 'groups', id), (snap) =>
        cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as Group) : null),
      )
    },

    async byCode(code) {
      const snap = await getDocs(query(collection(db(), 'groups'), where('code', '==', code), limit(1)))
      if (snap.empty) return null
      const d = snap.docs[0]
      return { id: d.id, ...d.data() } as Group
    },

    async create(name, accent, user) {
      const code = await uniqueCode()
      const ref = doc(collection(db(), 'groups'))
      const now = Date.now()
      const data = {
        name,
        code,
        accent,
        ownerUid: user.uid,
        createdAt: now,
        memberUids: [user.uid],
        members: {
          [user.uid]: { uid: user.uid, name: user.name, photo: user.photo ?? null, role: 'owner', joinedAt: now },
        },
      }
      await setDoc(ref, data)
      await addEvent(ref.id, { type: 'created_group', actorUid: user.uid, actorName: user.name, at: now })
      return { id: ref.id, ...data } as Group
    },

    async join(code, user) {
      const snap = await getDocs(
        query(collection(db(), 'groups'), where('code', '==', code.trim().toUpperCase()), limit(1)),
      )
      if (snap.empty) throw new CodeNotFoundError()
      const d = snap.docs[0]
      const g = { id: d.id, ...d.data() } as Group
      if (g.memberUids.includes(user.uid)) return g
      const now = Date.now()
      await updateDoc(doc(db(), 'groups', g.id), {
        memberUids: arrayUnion(user.uid),
        [`members.${user.uid}`]: {
          uid: user.uid,
          name: user.name,
          photo: user.photo ?? null,
          role: 'member',
          joinedAt: now,
        },
      })
      await addEvent(g.id, { type: 'joined', actorUid: user.uid, actorName: user.name, at: now })
      return g
    },
  },

  tasks: {
    listen(groupId, cb) {
      const q = query(collection(db(), 'groups', groupId, 'tasks'), orderBy('createdAt', 'desc'))
      return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Task)))
    },

    async add(groupId, input, user) {
      const now = Date.now()
      await setDoc(doc(collection(db(), 'groups', groupId, 'tasks')), {
        title: input.title,
        desc: input.desc || null,
        status: 'todo',
        assignee: input.assignee || null,
        deadline: input.deadline || null,
        createdBy: user.uid,
        createdByName: user.name,
        createdAt: now,
        doneAt: null,
      })
      await addEvent(groupId, {
        type: 'task_added',
        actorUid: user.uid,
        actorName: user.name,
        taskTitle: input.title,
        at: now,
      })
    },

    async move(groupId, task, status, user) {
      const now = Date.now()
      await updateDoc(doc(db(), 'groups', groupId, 'tasks', task.id), {
        status,
        doneAt: status === 'done' ? now : null,
      })
      const type = status === 'done' ? 'task_done' : 'task_moved'
      await addEvent(groupId, { type, actorUid: user.uid, actorName: user.name, taskTitle: task.title, at: now })
    },

    async assign(groupId, task, assignee, _user) {
      await updateDoc(doc(db(), 'groups', groupId, 'tasks', task.id), { assignee: assignee ?? null })
    },

    async remove(groupId, task, user) {
      await deleteDoc(doc(db(), 'groups', groupId, 'tasks', task.id))
      await addEvent(groupId, {
        type: 'task_deleted',
        actorUid: user.uid,
        actorName: user.name,
        taskTitle: task.title,
        at: Date.now(),
      })
    },
  },

  events: {
    listen(groupId, cb) {
      const q = query(collection(db(), 'groups', groupId, 'events'), orderBy('at', 'desc'), limit(40))
      return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FeedEvent)))
    },
  },
}
