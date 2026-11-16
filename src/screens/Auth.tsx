import { useEffect, useState } from 'react'
import { useAuth } from '../auth'
import { store, isDemo } from '../store'
import { useLang } from '../i18n'
import { IconGoogle, IconInfo, LogoMark } from '../components/Icons'
import { LangToggle } from '../components/LangToggle'
import { OrnamentBand } from '../components/Ornament'
import { Sheet } from '../components/Sheet'

/** человекочитаемый текст ошибки входа */
function authErrText(err: string, t: ReturnType<typeof useLang>['t']): string {
  if (err.includes('unauthorized-domain')) return t('errAuthDomain')
  if (err.includes('orphan-redirect-params')) return t('errAuthOrphan')
  return `${t('errAuthGeneric')}: ${err}`
}

export function AuthScreen() {
  const { signIn } = useAuth()
  const { t } = useLang()
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // ошибка незавершённого redirect-входа (возврат после Google)
  useEffect(() => {
    if (isDemo) return
    void store.auth.redirectError().then((e) => e && setErr(e))
  }, [])

  const enter = async () => {
    setBusy(true)
    setErr(null)
    try {
      await signIn()
    } catch (e) {
      setErr((e as { code?: string }).code ?? String(e))
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

        {err && <p className="field-err auth-err">{authErrText(err, t)}</p>}

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
