import type { ReactNode, SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

function base({ size = 20, ...props }: P, children: ReactNode, viewBox = '0 0 24 24') {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconBack = (p: P) => base(p, <><path d="M15 5l-7 7 7 7" /></>)
export const IconPlus = (p: P) => base(p, <><path d="M12 5v14M5 12h14" /></>)
export const IconClock = (p: P) =>
  base(p, <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>)
export const IconCheck = (p: P) => base(p, <><path d="M5 12.5l4.5 4.5L19 7" /></>)
export const IconClose = (p: P) => base(p, <><path d="M6 6l12 12M18 6L6 18" /></>)
export const IconCopy = (p: P) =>
  base(p, <><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></>)
export const IconSignOut = (p: P) =>
  base(p, <><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" /><path d="M14 8l4 4-4 4M18 12H8.5" /></>)

export const IconBoard = (p: P) =>
  base(p, <><rect x="4" y="4.5" width="16" height="15" rx="2.5" /><path d="M9.5 4.5v15M14.5 4.5v15" /></>)
export const IconPulse = (p: P) =>
  base(p, <><path d="M3 12h4l2.5-6 4 12 2.5-6h5" /></>)
export const IconUsers = (p: P) =>
  base(p, <><circle cx="9" cy="8.5" r="3.2" /><path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" /><path d="M15.5 5.8a3.2 3.2 0 0 1 0 5.4M17.6 14.9c1.6.8 2.6 2.3 3 4.6" /></>)
export const IconQr = (p: P) =>
  base(p, <><rect x="4" y="4" width="6" height="6" rx="1.2" /><rect x="14" y="4" width="6" height="6" rx="1.2" /><rect x="4" y="14" width="6" height="6" rx="1.2" /><path d="M14 14h3v3h-3zM20 14v.5M14 20.5h.5M17 20h3M20 17v3" /></>)
export const IconInfo = (p: P) =>
  base(p, <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8v.5" /></>)

/** Google «G» — өндірістік бренд белгісі */
export function IconGoogle({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

/** Таңба-логотип: ромб өрнегі */
export function LogoMark({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="#BF4E24" />
      <g fill="none" stroke="#F7F2E8" strokeWidth="3" strokeLinejoin="round">
        <path d="M9 32 L21 20 L33 32 L21 44 Z" />
        <path d="M33 32 L41 24 L49 32 L41 40 Z" />
      </g>
      <circle cx="54" cy="32" r="3" fill="#F7F2E8" />
      <circle cx="5" cy="32" r="3" fill="#F7F2E8" />
    </svg>
  )
}
