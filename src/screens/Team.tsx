import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { store } from '../store'
import { useAuth } from '../auth'
import { useListen } from '../hooks'
import { useLang } from '../i18n'
import type { Group, Task } from '../types'
import { TopBar } from '../components/TopBar'
import { BottomNav } from '../components/BottomNav'
import { Avatar } from '../components/Avatar'
import { ProgressRing } from '../components/ProgressRing'
import { ShareSheet } from '../components/ShareSheet'
import { IconQr, IconSignOut } from '../components/Icons'

export function TeamScreen() {
  const { gid } = useParams()
  const { user, signOut } = useAuth()
  const { t } = useLang()
  const [shareOpen, setShareOpen] = useState(false)

  const group = useListen<Group | null>((cb) => store.groups.get(gid!, cb), [gid])
  const tasks = useListen<Task[]>((cb) => store.tasks.listen(gid!, cb), [gid])

  if (!group) return <div className="page pad" />

  const members = Object.values(group.members).sort((a, b) =>
    a.role === b.role ? a.joinedAt - b.joinedAt : a.role === 'owner' ? -1 : 1,
  )
  const total = tasks?.length ?? 0
  const done = (tasks ?? []).filter((x) => x.status === 'done').length
  const doneBy = (uid: string) => (tasks ?? []).filter((x) => x.status === 'done' && x.assignee === uid).length

  return (
    <div className="page">
      <TopBar title={t('members')} />

      <div className="progress-card">
        <ProgressRing value={total ? done / total : 0} />
        <div className="progress-nums">
          <span className="progress-big">
            {done}/{total}
          </span>
          <span>
            {done} {t('tasksDone')} · {total} {t('tasksTotal')}
          </span>
        </div>
      </div>

      <ul className="memberlist">
        {members.map((m) => (
          <li key={m.uid}>
            <Avatar user={m} size={38} />
            <div className="memberinfo">
              <span className="membername">
                {m.name}
                {m.uid === user?.uid && <em> — {t('you')}</em>}
              </span>
              <span className="memberrole">{t(m.role === 'owner' ? 'owner' : 'member')}</span>
            </div>
            <span className="memberdone">
              <b>{doneBy(m.uid)}</b> {t('tasksDone')}
            </span>
          </li>
        ))}
      </ul>

      <button type="button" className="codecard" onClick={() => setShareOpen(true)}>
        <span className="codecard-label">{t('groupCode')}</span>
        <span className="codecard-code">
          {group.code}
          <IconQr size={20} />
        </span>
      </button>

      <button type="button" className="btn btn-ghost signout" onClick={signOut}>
        <IconSignOut /> {t('signOut')}
      </button>

      <BottomNav gid={gid!} />
      <ShareSheet group={group} open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  )
}
