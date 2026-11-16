import type { ReactNode } from 'react'

interface TopBarProps {
  left?: ReactNode
  title?: ReactNode
  right?: ReactNode
}

export function TopBar({ left, title, right }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar-side">{left}</div>
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-side right">{right}</div>
    </header>
  )
}
