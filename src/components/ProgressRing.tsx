interface ProgressRingProps {
  /** 0..1 */
  value: number
  size?: number
}

export function ProgressRing({ value, size = 92 }: ProgressRingProps) {
  const r = 38
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <svg className="ring" width={size} height={size} viewBox="0 0 100 100" role="img">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(36,29,21,.1)" strokeWidth="9" />
      <circle
        className="ring-fill"
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="#3F7D50"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - v)}
        transform="rotate(-90 50 50)"
      />
    </svg>
  )
}
