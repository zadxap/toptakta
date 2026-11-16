import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { store } from '../store'
import { useAuth } from '../auth'
import { useListen } from '../hooks'
import { fmtDate, tasksLabel, useLang } from '../i18n'
import { STATUSES, type Group, type Member, type Status, type Task, type TaskInput } from '../types'
import { TopBar } from '../components/TopBar'
import { BottomNav } from '../components/BottomNav'
import { OrnamentBand } from '../components/Ornament'
import { Avatar, AvatarStack } from '../components/Avatar'
import { Sheet } from '../components/Sheet'
import { EmptyState } from '../components/EmptyState'
import { ShareSheet } from '../components/ShareSheet'
import { IconBack, IconClock, IconPlus, IconQr } from '../components/Icons'

const DAY = 24 * 3600e3

interface DeadlineChip {
  label: string
  cls: string
}

function deadlineChip(deadline: number | undefined, done: boolean, lang: ReturnType<typeof useLang>['lang'], t: ReturnType<typeof useLang>['t']): DeadlineChip | null {
  if (!deadline || done) return null
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const today = start.getTime()
  if (deadline < today) return { label: t('overdue'), cls: 'over' }
  if (deadline < today + DAY) return { label: t('today'), cls: 'soon' }
  if (deadline < today + 2 * DAY) return { label: t('tomorrow'), cls: 'norm' }
  return { label: fmtDate(deadline, lang), cls: deadline < today + 3 * DAY ? 'soon' : 'norm' }
}

export function BoardScreen() {
  const { gid } = useParams()
  const { user } = useAuth()
  const { t, lang } = useLang()
  const nav = useNavigate()

  const group = useListen<Group | null>((cb) => store.groups.get(gid!, cb), [gid])
  const tasks = useListen(useMemo(() => (cb: (v: Task[]) => void) => store.tasks.listen(gid!, cb), [gid]), [gid])

  const [newOpen, setNewOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [selected, setSelected] = useState<Task | null>(null)

  if (!group) {
    return (
      <div className="page">
        <TopBar
          left={
            <button type="button" className="iconbtn" onClick={() => nav('/')}>
              <IconBack />
            </button>
          }
          title="…"
        />
        <div className="pad" />
      </div>
    )
  }

  const members: Member[] = Object.values(group.members)
  const byMember = (uid?: string) => (uid ? members.find((m) => m.uid === uid) : undefined)

  return (
    <div className="page">
      <TopBar
        left={
          <button type="button" className="iconbtn" onClick={() => nav('/')}>
            <IconBack />
          </button>
        }
        title={<span className="group-title">{group.name}</span>}
        right={
          <button type="button" className="codechip" onClick={() => setShareOpen(true)}>
            <IconQr size={15} />
            {group.code}
          </button>
        }
      />

      <OrnamentBand accent={group.accent} className="board-band" />

      <div className="board-head">
        <AvatarStack users={members} max={5} />
        <span className="board-sub">{tasksLabel(tasks?.length ?? 0, lang)}</span>
      </div>

      <div className="board">
        {STATUSES.map((s) => {
          const list = (tasks ?? []).filter((x) => x.status === s)
          return (
            <section key={s} className={`col col-${s}`}>
              <header className="col-head">
                <span className={`col-dot dot-${s}`} />
                <h3>{t(s === 'todo' ? 'statusTodo' : s === 'doing' ? 'statusDoing' : 'statusDone')}</h3>
                <span className="col-count">{list.length}</span>
              </header>
              {s === 'todo' && (tasks ?? []).length === 0 && <EmptyState text={t('emptyBoard')} />}
              {list.map((task, i) => {
                const d = deadlineChip(task.deadline, task.status === 'done', lang, t)
                const a = byMember(task.assignee)
                return (
                  <button
                    type="button"
                    key={task.id}
                    className={`taskcard fade${task.status === 'done' ? ' done' : ''}`}
                    style={{ animationDelay: `${Math.min(i * 40, 200)}ms` }}
                    onClick={() => setSelected(task)}
                  >
                    <span className="taskcard-title">{task.title}</span>
                    <span className="taskcard-meta">
                      {a && (
                        <span className="chip chip-person">
                          <Avatar user={a} size={18} />
                          {a.name}
                        </span>
                      )}
                      {d && (
                        <span className={`chip chip-deadline ${d.cls}`}>
                          <IconClock size={13} />
                          {d.label}
                        </span>
                      )}
                    </span>
                  </button>
                )
              })}
            </section>
          )
        })}
      </div>

      <button type="button" className="fab" onClick={() => setNewOpen(true)} aria-label={t('addTask')}>
        <IconPlus size={26} />
      </button>

      <BottomNav gid={gid!} />

      <NewTaskSheet open={newOpen} onClose={() => setNewOpen(false)} members={members} groupId={gid!} user={user!} />
      <TaskSheet task={selected} onClose={() => setSelected(null)} members={members} groupId={gid!} user={user!} />
      <ShareSheet group={group} open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  )
}

/* ── Жаңа тапсырма ─────────────────────────────────────────── */

function AssigneePicker({
  members,
  value,
  onChange,
}: {
  members: Member[]
  value: string | undefined
  onChange: (uid: string | undefined) => void
}) {
  const { t } = useLang()
  return (
    <div className="person-row">
      <button
        type="button"
        className={`person${value === undefined ? ' sel' : ''}`}
        onClick={() => onChange(undefined)}
      >
        <span className="avatar avatar-none" />
        {t('none')}
      </button>
      {members.map((m) => (
        <button
          type="button"
          key={m.uid}
          className={`person${value === m.uid ? ' sel' : ''}`}
          onClick={() => onChange(m.uid)}
        >
          <Avatar user={m} size={22} />
          {m.name}
        </button>
      ))}
    </div>
  )
}

function NewTaskSheet({
  open,
  onClose,
  members,
  groupId,
  user,
}: {
  open: boolean
  onClose: () => void
  members: Member[]
  groupId: string
  user: { uid: string; name: string; photo?: string }
}) {
  const { t } = useLang()
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [assignee, setAssignee] = useState<string | undefined>(undefined)
  const [date, setDate] = useState('')
  const [err, setErr] = useState<string | null>(null)

  const save = async () => {
    if (!title.trim()) {
      setErr('errTaskTitle')
      return
    }
    const input: TaskInput = {
      title: title.trim(),
      desc: desc.trim() || undefined,
      assignee,
      deadline: date ? new Date(date + 'T12:00:00').getTime() : undefined,
    }
    await store.tasks.add(groupId, input, user)
    setTitle('')
    setDesc('')
    setAssignee(undefined)
    setDate('')
    setErr(null)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={t('addTask')}>
      <label className="field">
        <span>{t('taskTitle')}</span>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setErr(null)
          }}
          autoFocus
        />
      </label>
      {err && <p className="field-err">{t(err as 'errTaskTitle')}</p>}
      <label className="field">
        <span>{t('taskDesc')}</span>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} />
      </label>
      <div className="field">
        <span>{t('assignee')}</span>
        <AssigneePicker members={members} value={assignee} onChange={setAssignee} />
      </div>
      <label className="field">
        <span>{t('deadline')}</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <div className="sheet-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          {t('cancel')}
        </button>
        <button type="button" className="btn btn-primary" onClick={save}>
          {t('save')}
        </button>
      </div>
    </Sheet>
  )
}

/* ── Тапсырма карточкасы ───────────────────────────────────── */

function TaskSheet({
  task,
  onClose,
  members,
  groupId,
  user,
}: {
  task: Task | null
  onClose: () => void
  members: Member[]
  groupId: string
  user: { uid: string; name: string; photo?: string }
}) {
  const { t, lang } = useLang()
  const [confirming, setConfirming] = useState(false)

  // парақ жабылғанда растау күйін тазалаймыз
  const [lastTask, setLastTask] = useState<Task | null>(null)
  if (task !== lastTask) {
    setLastTask(task)
    if (!task) setConfirming(false)
  }

  if (!task) return <Sheet open={false} onClose={onClose}>{null}</Sheet>

  const a = members.find((m) => m.uid === task.assignee)
  const d = deadlineChip(task.deadline, task.status === 'done', lang, t)

  return (
    <Sheet open={!!task} onClose={onClose} title={t('task')}>
      <div className="tsheet">
        <h3 className="tsheet-title">{task.title}</h3>
        {task.desc && <p className="tsheet-desc">{task.desc}</p>}
        <div className="tsheet-meta">
          {d && (
            <span className={`chip chip-deadline ${d.cls}`}>
              <IconClock size={13} /> {d.label}
            </span>
          )}
          {a && (
            <span className="chip chip-person">
              <Avatar user={a} size={18} />
              {a.name}
            </span>
          )}
        </div>

        <div className="field">
          <span>{t('moveTo')}</span>
          <div className="segment">
            {STATUSES.map((s) => (
              <button
                type="button"
                key={s}
                className={task.status === s ? 'sel' : ''}
                onClick={() => {
                  void store.tasks.move(groupId, task, s, user)
                  onClose()
                }}
              >
                {t(s === 'todo' ? 'statusTodo' : s === 'doing' ? 'statusDoing' : 'statusDone')}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span>{t('assignee')}</span>
          <AssigneePicker
            members={members}
            value={task.assignee}
            onChange={(uid) => void store.tasks.assign(groupId, task, uid, user)}
          />
        </div>

        <div className="sheet-actions">
          <button
            type="button"
            className={`btn btn-danger${confirming ? ' armed' : ''}`}
            onClick={async () => {
              if (!confirming) {
                setConfirming(true)
                return
              }
              await store.tasks.remove(groupId, task, user)
              onClose()
            }}
          >
            {confirming ? t('confirmDelete') : t('delete')}
          </button>
          {task.assignee !== user.uid && task.status !== 'done' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                void store.tasks.assign(groupId, task, user.uid, user)
                onClose()
              }}
            >
              {t('takeIt')}
            </button>
          )}
        </div>
      </div>
    </Sheet>
  )
}
