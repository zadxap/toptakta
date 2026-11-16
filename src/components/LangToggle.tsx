import { useLang } from '../i18n'
import type { Lang } from '../types'

/** ҚҚ/РУ ауыстырғышы */
export function LangToggle() {
  const { lang, setLang } = useLang()
  const other: Lang = lang === 'kk' ? 'ru' : 'kk'
  return (
    <button
      type="button"
      className="lang-toggle"
      onClick={() => setLang(other)}
      aria-label="language"
      title={lang === 'kk' ? 'Русский' : 'Қазақша'}
    >
      {lang.toUpperCase()}
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <path d="M5 1v8M1.5 4.5 5 1l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
