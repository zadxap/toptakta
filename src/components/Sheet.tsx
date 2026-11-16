import type { ReactNode } from 'react'
import { IconClose } from './Icons'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

/** Төменнен сырғалайтын парақ — мобильді хикаяның негізгі үлгісі */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  return (
    <div className={`sheet-wrap${open ? ' open' : ''}`} aria-hidden={!open}>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal={open}>
        <div className="sheet-handle" />
        <header className="sheet-head">
          <h2>{title}</h2>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="close">
            <IconClose />
          </button>
        </header>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}
