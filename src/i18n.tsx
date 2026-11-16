import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { EventType, Lang } from './types'

const kk = {
  langName: 'Қазақша',
  appTagline: 'Студенттік топтарға арналған бірлескен тапсырма тақтасы',
  signIn: 'Кіру',
  signInGoogle: 'Google арқылы кіру',
  demoBadge: 'Демо режимі',
  demoNoteTitle: 'Демо режимі дегеніміз не?',
  demoNote:
    'Деректер осы құрылғының жадында сақталады — нақты бұлт емес. Нақты бұлттық базаға (Firestore) қосу үшін .env файлында Firebase кілттерін көрсетіңіз. Қадамдық нұсқаулық README-де.',
  myGroups: 'Топтарым',
  joinByCode: 'Код арқылы қосылу',
  codePlaceholder: 'Топ коды',
  join: 'Қосылу',
  newGroup: 'Жаңа топ',
  groupName: 'Топ атауы',
  accentPick: 'Тақтаның ою-өрнегі',
  create: 'Топты құру',
  cancel: 'Болдырмау',
  emptyGroups: 'Әзірше топ жоқ — жаңа топ құрыңыз немесе код арқылы қосылыңыз.',
  membersShort: 'мүше',
  tabBoard: 'Тақта',
  tabFeed: 'Ағын',
  tabTeam: 'Топ',
  statusTodo: 'Кезекте',
  statusDoing: 'Жасалуда',
  statusDone: 'Дайын',
  addTask: 'Тапсырма қосу',
  taskTitle: 'Тапсырма атауы',
  taskDesc: 'Сипаттама (міндетті емес)',
  assignee: 'Жауапты',
  none: 'Тағайындалмады',
  deadline: 'Мерзім',
  save: 'Сақтау',
  delete: 'Өшіру',
  confirmDelete: 'Шынымен?',
  moveTo: 'Статусы',
  takeIt: 'Өзіме аламын',
  overdue: 'Мерзім өтті',
  today: 'Бүгін',
  tomorrow: 'Ертең',
  emptyBoard: 'Тапсырма жоқ. «+» батырмасымен бірінші тапсырманы қосыңыз.',
  emptyFeed: 'Әзірше оқиға жоқ — бірінші тапсырманы қосыңыз.',
  feedTitle: 'Тірі ағын',
  live: 'тірі',
  members: 'Топ мүшелері',
  owner: 'Құрушы',
  member: 'Қатысушы',
  progress: 'Жетістік',
  tasksDone: 'дайын',
  tasksTotal: 'барлығы',
  groupCode: 'Топ коды',
  scanHint: 'Телефон камерасымен сканерлеңіз — сілтеме топқа ашылады',
  copy: 'Көшіру',
  copied: 'Көшірілді ✓',
  signOut: 'Шығу',
  you: 'сіз',
  evCreatedGroup: 'топ құрды',
  evJoined: 'топқа қосылды',
  evAdded: 'тапсырма қосты',
  evMoved: 'жылжытты',
  evDone: 'аяқтады',
  evDeleted: 'өшірді',
  errCodeNotFound: 'Мұндай кодпен топ табылмады',
  errEnterCode: 'Кодты енгізіңіз',
  errGroupName: 'Топ атауын енгізіңіз',
  errTaskTitle: 'Тапсырма атауын енгізіңіз',
  errAuthDomain: 'Бұл домен Firebase Authentication ішінде рұқсат етілмеген (Authorized domains)',
  errAuthGeneric: 'Кіру қатесі',
  errAuthOrphan: 'Google-ден кайту келді, бірақ сессия қалпына келтірілмеді — браузердің куки/блоктаушыларын тексеріңіз',
  task: 'Тапсырма',
  joinTitle: 'Топқа қосылу',
  joinLead: 'Айдарыңызды енгізіңіз:',
  minutesShort: 'мин',
  hoursShort: 'сағ',
  daysShort: 'күн',
  justNow: 'қазір',
  yesterday: 'кеше',
  footer: 'В06.075 «Бұлтты және мобильдік технологиялар» — жоба жұмысы',
} as const

export type StringKey = keyof typeof kk

const ru: Record<StringKey, string> = {
  langName: 'Русский',
  appTagline: 'Совместная доска задач для студенческих групп',
  signIn: 'Войти',
  signInGoogle: 'Войти через Google',
  demoBadge: 'Демо-режим',
  demoNoteTitle: 'Что такое демо-режим?',
  demoNote:
    'Данные хранятся в памяти этого устройства — это не облако. Чтобы подключить настоящую облачную базу (Firestore), укажите ключи Firebase в файле .env. Пошаговая инструкция — в README.',
  myGroups: 'Мои группы',
  joinByCode: 'Войти по коду',
  codePlaceholder: 'Код группы',
  join: 'Присоединиться',
  newGroup: 'Новая группа',
  groupName: 'Название группы',
  accentPick: 'Орнамент доски',
  create: 'Создать группу',
  cancel: 'Отмена',
  emptyGroups: 'Пока нет групп — создайте новую или присоединитесь по коду.',
  membersShort: 'участн.',
  tabBoard: 'Доска',
  tabFeed: 'Лента',
  tabTeam: 'Команда',
  statusTodo: 'В очереди',
  statusDoing: 'В работе',
  statusDone: 'Готово',
  addTask: 'Добавить задачу',
  taskTitle: 'Название задачи',
  taskDesc: 'Описание (необязательно)',
  assignee: 'Исполнитель',
  none: 'Не назначено',
  deadline: 'Срок',
  save: 'Сохранить',
  delete: 'Удалить',
  confirmDelete: 'Точно удалить?',
  moveTo: 'Статус',
  takeIt: 'Взять себе',
  overdue: 'Просрочено',
  today: 'Сегодня',
  tomorrow: 'Завтра',
  emptyBoard: 'Задач нет. Нажмите «+», чтобы добавить первую.',
  emptyFeed: 'Пока ничего не произошло — добавьте первую задачу.',
  feedTitle: 'Живая лента',
  live: 'live',
  members: 'Участники группы',
  owner: 'Создатель',
  member: 'Участник',
  progress: 'Прогресс',
  tasksDone: 'готово',
  tasksTotal: 'всего',
  groupCode: 'Код группы',
  scanHint: 'Отсканируйте камерой телефона — ссылка откроет группу',
  copy: 'Копировать',
  copied: 'Скопировано ✓',
  signOut: 'Выйти',
  you: 'вы',
  evCreatedGroup: 'создаёт группу',
  evJoined: 'присоединяется',
  evAdded: 'добавляет задачу',
  evMoved: 'переносит',
  evDone: 'завершает',
  evDeleted: 'удаляет',
  errCodeNotFound: 'Группа с таким кодом не найдена',
  errEnterCode: 'Введите код',
  errGroupName: 'Введите название группы',
  errTaskTitle: 'Введите название задачи',
  errAuthDomain: 'Этот домен не добавлен в Firebase Auth (Authorized domains)',
  errAuthGeneric: 'Ошибка входа',
  errAuthOrphan: 'Возврат с Google пришёл, но сессия не восстановилась — проверьте куки/блокировщики браузера',
  task: 'Задача',
  joinTitle: 'Присоединиться к группе',
  joinLead: 'Введите код-приглашение:',
  minutesShort: 'мин',
  hoursShort: 'ч',
  daysShort: 'дн',
  justNow: 'только что',
  yesterday: 'вчера',
  footer: 'Проект по дисциплине В06.075 «Облачные и мобильные технологии»',
}

const dicts: Record<Lang, Record<StringKey, string>> = { kk, ru }

export const EV_KEY: Record<EventType, StringKey> = {
  created_group: 'evCreatedGroup',
  joined: 'evJoined',
  task_added: 'evAdded',
  task_moved: 'evMoved',
  task_done: 'evDone',
  task_deleted: 'evDeleted',
}

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (k: StringKey, vars?: Record<string, string>) => string
}

const Ctx = createContext<LangCtx | null>(null)

const LOCALE: Record<Lang, string> = { kk: 'kk-KZ', ru: 'ru-RU' }

export function locale(lang: Lang): string {
  return LOCALE[lang]
}

/* Intl для kk-KZ даёт странные краткие месяцы («М11») — берём свои */
const MONTHS: Record<Lang, string[]> = {
  kk: ['қаң.', 'ақп.', 'нау.', 'сәу.', 'мам.', 'мау.', 'шіл.', 'там.', 'қыр.', 'қаз.', 'қар.', 'жел.'],
  ru: ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
}

export function fmtDate(ts: number, lang: Lang): string {
  const d = new Date(ts)
  return `${d.getDate()} ${MONTHS[lang][d.getMonth()]}`
}

export function fmtTime(ts: number, lang: Lang): string {
  try {
    return new Intl.DateTimeFormat(LOCALE[lang], { hour: '2-digit', minute: '2-digit' }).format(ts)
  } catch {
    return ''
  }
}

/** «7 задач» по-русски склоняется, по-казахски — нет */
export function tasksLabel(n: number, lang: Lang): string {
  if (lang === 'kk') return `${n} тапсырма`
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return `${n} задача`
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `${n} задачи`
  return `${n} задач`
}

export function relTime(ts: number, lang: Lang, t: (k: StringKey) => string): string {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60e3)
  if (min < 1) return t('justNow')
  if (min < 60) return `${min} ${t('minutesShort')}`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} ${t('hoursShort')}`
  const days = Math.floor(h / 24)
  if (days === 1) return t('yesterday')
  if (days < 7) return `${days} ${t('daysShort')}`
  return fmtDate(ts, lang)
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('toptakta.lang') === 'ru' ? 'ru' : 'kk'))

  useEffect(() => {
    localStorage.setItem('toptakta.lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  const t = useCallback(
    (k: StringKey, vars?: Record<string, string>) => {
      let s = dicts[lang][k] ?? k
      if (vars) {
        for (const [key, v] of Object.entries(vars)) s = s.replace(`{${key}}`, v)
      }
      return s
    },
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useLang(): LangCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useLang outside provider')
  return ctx
}
