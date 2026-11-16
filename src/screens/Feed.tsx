import { useParams } from 'react-router-dom'
import { store } from '../store'
import { useListen } from '../hooks'
import { EV_KEY, relTime, useLang } from '../i18n'
import type { FeedEvent, Group } from '../types'
import { TopBar } from '../components/TopBar'
import { BottomNav } from '../components/BottomNav'
import { Avatar } from '../components/Avatar'
import { EmptyState } from '../components/EmptyState'

export function FeedScreen() {
  const { gid } = useParams()
  const { t, lang } = useLang()

  const events = useListen<FeedEvent[]>(
    (cb) => store.events.listen(gid!, cb),
    [gid],
  )
  const group = useListen<Group | null>((cb) => store.groups.get(gid!, cb), [gid])

  const members = group ? Object.values(group.members) : []
  const byUid = (uid: string) => members.find((m) => m.uid === uid)

  return (
    <div className="page">
      <TopBar
        title={
          <span className="feed-title">
            {t('feedTitle')}
            <span className="live-dot">
              <span className="live-pulse" />
              {t('live')}
            </span>
          </span>
        }
      />
      <div className="feed">
        {events && events.length === 0 && <EmptyState text={t('emptyFeed')} />}
        {events?.map((e) => {
          const m = byUid(e.actorUid)
          return (
            <div className="feedrow" key={e.id}>
              <Avatar user={m ?? { uid: e.actorUid, name: e.actorName }} size={34} />
              <p>
                <b>{e.actorName}</b> {t(EV_KEY[e.type])}
                {e.taskTitle && (
                  <>
                    {' '}
                    <span className="feedtask">«{e.taskTitle}»</span>
                  </>
                )}
              </p>
              <time>{relTime(e.at, lang, t)}</time>
            </div>
          )
        })}
      </div>
      <BottomNav gid={gid!} />
    </div>
  )
}
