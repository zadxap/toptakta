import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { store, isDemo, CodeNotFoundError } from '../store'
import { useAuth } from '../auth'
import { useListen } from '../hooks'
import { useLang } from '../i18n'
import { ACCENTS } from '../theme'
import type { Group } from '../types'
import { TopBar } from '../components/TopBar'
import { LangToggle } from '../components/LangToggle'
import { OrnamentBand, ornamentBG } from '../components/Ornament'
import { Avatar, AvatarStack } from '../components/Avatar'
import { Sheet } from '../components/Sheet'
import { EmptyState } from '../components/EmptyState'
import { IconInfo, IconPlus, IconQr } from '../components/Icons'

export function HomeScreen() {
  const { user } = useAuth()
  const { t } = useLang()
  const nav = useNavigate()
  const params = useParams()

  const groups = useListen<Group[]>(
    (cb) => store.groups.listenMine(user!.uid, cb),
    [user?.uid],
  )

  const [code, setCode] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [newOpen, setNewOpen] = useState(false)
  const [name, setName] = useState('')
  const [accent, setAccent] = useState(0)
  const [demoInfo, setDemoInfo] = useState(false)

  // /join/ABCDE терең сілтемесі — кодты алдын ала толтырамыз
  useEffect(() => {
    if (params.code) setCode(params.code.toUpperCase())
  }, [params.code])

  const join = async () => {
    if (!code.trim()) {
      setErr('errEnterCode')
      return
    }
    try {
      const g = await store.groups.join(code, user!)
      nav(`/g/${g.id}`)
    } catch (e) {
      setErr(e instanceof CodeNotFoundError ? 'errCodeNotFound' : 'errCodeNotFound')
    }
  }

  const create = async () => {
    if (!name.trim()) {
      setErr('errGroupName')
      return
    }
    const g = await store.groups.create(name.trim(), accent, user!)
    setNewOpen(false)
    setName('')
    setErr(null)
    nav(`/g/${g.id}`)
  }

  return (
    <div className="page">
      <TopBar
        title={t('myGroups')}
        right={
          <>
            {isDemo && (
              <button type="button" className="demo-chip small" onClick={() => setDemoInfo(true)}>
                <IconInfo size={14} /> {t('demoBadge')}
              </button>
            )}
            <LangToggle />
          </>
        }
      />

      <div className="join-row">
        <input
          className={`code-input${err ? ' invalid' : ''}`}
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase())
            setErr(null)
          }}
          placeholder={t('codePlaceholder')}
          maxLength={6}
          autoCapitalize="characters"
          spellCheck={false}
        />
        <button type="button" className="btn btn-primary" onClick={join}>
          {t('join')}
        </button>
      </div>
      {err && <p className="field-err">{t(err as 'errCodeNotFound')}</p>}

      <button type="button" className="newgroup" onClick={() => setNewOpen(true)}>
        <span className="newgroup-plus">
          <IconPlus />
        </span>
        {t('newGroup')}
      </button>

      {groups && groups.length === 0 && <EmptyState text={t('emptyGroups')} />}

      <div className="grouplist">
        {groups?.map((g, i) => (
          <button
            type="button"
            className="groupcard fade"
            style={{ animationDelay: `${Math.min(i * 40, 240)}ms` }}
            key={g.id}
            onClick={() => nav(`/g/${g.id}`)}
          >
            <OrnamentBand accent={g.accent} />
            <div className="groupcard-body">
              <span className="groupcard-name">{g.name}</span>
              <span className="groupcard-meta">
                <AvatarStack users={Object.values(g.members)} />
                <span className="groupcard-count">
                  {g.memberUids.length} {t('membersShort')}
                </span>
              </span>
            </div>
            <span className="groupcard-code" aria-hidden="true">
              <IconQr size={16} />
              {g.code}
            </span>
          </button>
        ))}
      </div>

      <Sheet open={newOpen} onClose={() => setNewOpen(false)} title={t('newGroup')}>
        <label className="field">
          <span>{t('groupName')}</span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setErr(null)
            }}
            placeholder="«Физика 10А», «Курс жобасы»…"
            autoFocus
          />
        </label>
        <div className="field">
          <span>{t('accentPick')}</span>
          <div className="swatches">
            {ACCENTS.map((a, i) => (
              <button
                type="button"
                key={i}
                className={`swatch${accent === i ? ' sel' : ''}`}
                style={{ backgroundColor: a.main, backgroundImage: ornamentBG(i) }}
                onClick={() => setAccent(i)}
                aria-label={`accent ${i + 1}`}
              />
            ))}
          </div>
        </div>
        <div className="sheet-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setNewOpen(false)}>
            {t('cancel')}
          </button>
          <button type="button" className="btn btn-primary" onClick={create}>
            {t('create')}
          </button>
        </div>
      </Sheet>

      <Sheet open={demoInfo} onClose={() => setDemoInfo(false)} title={t('demoNoteTitle')}>
        <p className="sheet-note">{t('demoNote')}</p>
      </Sheet>
    </div>
  )
}
