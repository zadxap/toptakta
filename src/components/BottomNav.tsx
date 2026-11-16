import { NavLink } from 'react-router-dom'
import { useLang } from '../i18n'
import { IconBoard, IconPulse, IconUsers } from './Icons'

/** Топ ішіндегі төменгі навигация */
export function BottomNav({ gid }: { gid: string }) {
  const { t } = useLang()
  const items = [
    { to: `/g/${gid}`, end: true, icon: <IconBoard />, label: t('tabBoard') },
    { to: `/g/${gid}/feed`, end: false, icon: <IconPulse />, label: t('tabFeed') },
    { to: `/g/${gid}/team`, end: false, icon: <IconUsers />, label: t('tabTeam') },
  ]
  return (
    <nav className="bottomnav">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          className={({ isActive }) => `navitem${isActive ? ' active' : ''}`}
        >
          {it.icon}
          <span>{it.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
