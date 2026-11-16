import { useState } from 'react'
import { useAuth } from '../auth'
import { isDemo } from '../store'
import { useLang } from '../i18n'
import { IconGoogle, IconInfo, LogoMark } from '../components/Icons'
import { LangToggle } from '../components/LangToggle'
import { OrnamentBand } from '../components/Ornament'
import { Sheet } from '../components/Sheet'

export function AuthScreen() {
  const { signIn } = useAuth()
  const { t } = useLang()
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState(false)

  const enter = async () => {
    setBusy(true)
    try {
      await signIn()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth-deco top" aria-hidden="true">
        <OrnamentBand accent={0} />
        <OrnamentBand accent={1} />
      </div>

      <LangToggle />

      <div className="auth-card">
        <LogoMark size={76} />
        <h1 className="wordmark">
          Топ<span className="wordmark-dia">◆</span>Тақта
        </h1>
        <p className="auth-tagline">{t('appTagline')}</p>

        <button type="button" className="btn btn-google" onClick={enter} disabled={busy}>
          <IconGoogle />
          {busy ? '…' : t('signInGoogle')}
        </button>

        {isDemo && (
          <button type="button" className="demo-chip" onClick={() => setInfo(true)}>
            <IconInfo size={15} /> {t('demoBadge')}
          </button>
        )}
      </div>

      <p className="auth-footer">{t('footer')}</p>

      <div className="auth-deco bottom" aria-hidden="true">
        <OrnamentBand accent={2} />
        <OrnamentBand accent={3} />
      </div>

      <Sheet open={info} onClose={() => setInfo(false)} title={t('demoNoteTitle')}>
        <p className="sheet-note">{t('demoNote')}</p>
      </Sheet>
    </div>
  )
}
