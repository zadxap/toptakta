import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { useLang } from '../i18n'
import type { Group } from '../types'
import { Sheet } from './Sheet'
import { IconCheck, IconCopy } from './Icons'

/** Топ коды + QR арқылы шақыру парағы */
export function ShareSheet({ group, open, onClose }: { group: Group; open: boolean; onClose: () => void }) {
  const { t } = useLang()
  const [qr, setQr] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    const url = `${location.origin}/join/${group.code}`
    QRCode.toDataURL(url, {
      width: 480,
      margin: 1,
      color: { dark: '#241D15', light: '#FFFCF5' },
    })
      .then(setQr)
      .catch(() => setQr(null))
  }, [open, group.code])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}/join/${group.code}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* қол жетімсіз — үндемей өтеміз */
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={t('groupCode')}>
      <div className="share">
        <div className="share-code">{group.code}</div>
        {qr ? (
          <img className="share-qr" src={qr} alt="QR" width={200} height={200} />
        ) : (
          <div className="share-qr share-qr-empty" />
        )}
        <p className="share-hint">{t('scanHint')}</p>
        <button type="button" className="btn btn-ghost" onClick={copy}>
          {copied ? <IconCheck /> : <IconCopy />} {copied ? t('copied') : t('copy')}
        </button>
      </div>
    </Sheet>
  )
}
