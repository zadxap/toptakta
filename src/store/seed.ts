import type { FeedEvent, Group, Task } from '../types'

/** Демо-режимге арналған бастапқы деректер / seed data for the demo store */
export function makeSeed(now: number): {
  currentUid: string | null
  groups: Group[]
  tasks: Record<string, Task[]>
  events: Record<string, FeedEvent[]>
} {
  const guest = { uid: 'guest', name: 'Қонақ' }
  const aidana = { uid: 'u-aidana', name: 'Айдана' }
  const erasyl = { uid: 'u-erasyl', name: 'Ерасыл' }
  const madina = { uid: 'u-madina', name: 'Мадина' }

  const gid = 'demo-group'
  const g: Group = {
    id: gid,
    name: 'Курс жобасы: «ТопТақта»',
    code: 'KURS24',
    ownerUid: guest.uid,
    accent: 0,
    createdAt: now - 6 * 24 * 3600e3,
    memberUids: [guest.uid, aidana.uid, erasyl.uid, madina.uid],
    members: {
      [guest.uid]: { ...guest, role: 'owner', joinedAt: now - 6 * 24 * 3600e3 },
      [aidana.uid]: { ...aidana, role: 'member', joinedAt: now - 6 * 24 * 3600e3 },
      [erasyl.uid]: { ...erasyl, role: 'member', joinedAt: now - 5 * 24 * 3600e3 },
      [madina.uid]: { ...madina, role: 'member', joinedAt: now - 5 * 24 * 3600e3 },
    },
  }

  const DAY = 24 * 3600e3
  const mk = (
    id: string,
    title: string,
    status: Task['status'],
    assignee: string | undefined,
    days: number,
    createdByName: string,
    createdAt: number,
    desc?: string,
  ): Task => ({
    id,
    title,
    desc,
    status,
    assignee,
    deadline: now + days * DAY,
    createdBy: 'seed',
    createdByName,
    createdAt,
    doneAt: status === 'done' ? createdAt + 2 * 3600e3 : undefined,
  })

  const tasks: Task[] = [
    mk('t1', 'Топтық жоба жоспарын бекіту', 'done', aidana.uid, -1, 'Айдана', now - 6 * DAY),
    mk('t2', 'Firebase жобасын құру және баптау', 'done', guest.uid, 0, 'Қонақ', now - 5 * DAY),
    mk('t3', 'UI макеттерін дайындау (Figma)', 'done', madina.uid, 0, 'Мадина', now - 4 * DAY),
    mk('t4', 'Тапсырма тақтасын кодтау', 'doing', guest.uid, 1, 'Қонақ', now - 2 * DAY, 'React + Firestore, real-time жаңартулар'),
    mk('t5', 'Презентация слайдтарын дайындау', 'doing', aidana.uid, 2, 'Айдана', now - 1 * DAY),
    mk('t6', 'Есеп-құжатты рәсімдеу (ГОСТ бойынша)', 'todo', madina.uid, 3, 'Мадина', now - 8 * 3600e3),
    mk('t7', 'Сынақтық тәжірибе жүргізу (QR-код арқылы)', 'todo', erasyl.uid, 4, 'Ерасыл', now - 6 * 3600e3),
  ]

  const ev = (id: string, type: FeedEvent['type'], actor: typeof guest, taskTitle: string | undefined, at: number): FeedEvent => ({
    id,
    type,
    actorUid: actor.uid,
    actorName: actor.name,
    taskTitle,
    at,
  })

  const events: FeedEvent[] = [
    ev('e1', 'created_group', guest, undefined, now - 6 * DAY),
    ev('e2', 'joined', aidana, undefined, now - 6 * DAY + 40 * 60e3),
    ev('e3', 'joined', erasyl, undefined, now - 5 * DAY),
    ev('e4', 'joined', madina, undefined, now - 5 * DAY + 15 * 60e3),
    ev('e5', 'task_added', aidana, 'Топтық жоба жоспарын бекіту', now - 6 * DAY + 2 * 3600e3),
    ev('e6', 'task_done', aidana, 'Топтық жоба жоспарын бекіту', now - 4 * DAY),
    ev('e7', 'task_added', guest, 'Тапсырма тақтасын кодтау', now - 2 * DAY),
    ev('e8', 'task_done', madina, 'UI макеттерін дайындау (Figma)', now - 1 * DAY - 3 * 3600e3),
    ev('e9', 'task_added', madina, 'Есеп-құжатты рәсімдеу (ГОСТ бойынша)', now - 8 * 3600e3),
    ev('e10', 'task_added', erasyl, 'Сынақтық тәжірибе жүргізу (QR-код арқылы)', now - 6 * 3600e3),
  ]

  return { currentUid: null, groups: [g], tasks: { [gid]: tasks }, events: { [gid]: events } }
}
