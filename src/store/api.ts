import type { AppUser, FeedEvent, Group, Status, Task, TaskInput } from '../types'

/**
 * Еңгізу қабаты: Firebase немесе құрылғы ішіндегі демо-сақтауыш.
 * Data layer: Firebase backend or on-device demo storage.
 */
export interface Store {
  readonly mock: boolean
  auth: {
    user(): AppUser | null
    onUser(cb: (u: AppUser | null) => void): () => void
    signIn(): Promise<void>
    signOut(): Promise<void>
    /** код ошибки возврата redirect-входа, если была */
    redirectError(): Promise<string | null>
  }
  groups: {
    listenMine(uid: string, cb: (groups: Group[]) => void): () => void
    get(id: string, cb: (g: Group | null) => void): () => void
    byCode(code: string): Promise<Group | null>
    create(name: string, accent: number, user: AppUser): Promise<Group>
    join(code: string, user: AppUser): Promise<Group>
  }
  tasks: {
    listen(groupId: string, cb: (tasks: Task[]) => void): () => void
    add(groupId: string, input: TaskInput, user: AppUser): Promise<void>
    move(groupId: string, task: Task, status: Status, user: AppUser): Promise<void>
    assign(groupId: string, task: Task, assignee: string | undefined, user: AppUser): Promise<void>
    remove(groupId: string, task: Task, user: AppUser): Promise<void>
  }
  events: {
    listen(groupId: string, cb: (events: FeedEvent[]) => void): () => void
  }
}

export class CodeNotFoundError extends Error {}
