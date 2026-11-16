export type Status = 'todo' | 'doing' | 'done'
export type Lang = 'kk' | 'ru'

export interface AppUser {
  uid: string
  name: string
  photo?: string
}

export interface Member extends AppUser {
  role: 'owner' | 'member'
  joinedAt: number
}

export interface Group {
  id: string
  name: string
  code: string
  ownerUid: string
  /** ornament/accent variant index, 0..3 */
  accent: number
  members: Record<string, Member>
  memberUids: string[]
  createdAt: number
}

export interface Task {
  id: string
  title: string
  desc?: string
  status: Status
  assignee?: string
  deadline?: number
  createdBy: string
  createdByName: string
  createdAt: number
  doneAt?: number
}

export interface TaskInput {
  title: string
  desc?: string
  assignee?: string
  deadline?: number
}

export type EventType =
  | 'created_group'
  | 'joined'
  | 'task_added'
  | 'task_moved'
  | 'task_done'
  | 'task_deleted'

export interface FeedEvent {
  id: string
  type: EventType
  actorUid: string
  actorName: string
  taskTitle?: string
  at: number
}

export const STATUSES: Status[] = ['todo', 'doing', 'done']
