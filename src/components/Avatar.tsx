import { avatarColor, initials } from '../theme'
import type { AppUser } from '../types'

interface AvatarProps {
  user: Pick<AppUser, 'uid' | 'name' | 'photo'> | undefined
  size?: number
}

export function Avatar({ user, size = 28 }: AvatarProps) {
  if (!user) {
    return <span className="avatar avatar-none" style={{ width: size, height: size, fontSize: size * 0.38 }} />
  }
  const style = { width: size, height: size, fontSize: size * 0.38 }
  if (user.photo) {
    return <img className="avatar" src={user.photo} alt={user.name} style={style} />
  }
  return (
    <span
      className="avatar"
      style={{ ...style, backgroundColor: avatarColor(user.uid) }}
      title={user.name}
    >
      {initials(user.name)}
    </span>
  )
}

/** қабаттасқан аватарлар тізбегі */
export function AvatarStack({ users, max = 4 }: { users: Array<Pick<AppUser, 'uid' | 'name' | 'photo'>>; max?: number }) {
  const shown = users.slice(0, max)
  const rest = users.length - shown.length
  return (
    <span className="avatar-stack">
      {shown.map((u) => (
        <Avatar key={u.uid} user={u} size={26} />
      ))}
      {rest > 0 && <span className="avatar avatar-more">+{rest}</span>}
    </span>
  )
}
