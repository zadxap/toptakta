import { LogoMark } from './Icons'

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="empty">
      <div className="empty-mark" aria-hidden="true">
        <LogoMark size={44} />
      </div>
      <p>{text}</p>
    </div>
  )
}
