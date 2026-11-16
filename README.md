# ТопТақта

**ТопТақта** (каз. «топ» — группа, «тақта» — доска) — **совместная доска задач для студенческих
групп**: мобильное веб-приложение (PWA) на облачной базе данных **Google Firestore**.

> Проект по дисциплине **В06.075 «Бұлтты және мобильдік технологиялар»**, тема №5:
> *«Google Firestore негізінде бұлттық деректер базасы бар мобильдік қосымша жасау»*.

## Что это и зачем

Студенческая группа (курсовой проект, сессия, любое общее дело) создаёт «топ» и получает
**код-приглашение из 6 символов + QR-ссылку** — по аналогии с игровыми сервисами, к которым
все привыкли. Одногруппники заходят по коду с любого устройства и ведут общие задачи:

- **Доска** — три колонки: *Кезекте → Жасалуда → Дайын* (to-do / in progress / done);
- у задачи — исполнитель, срок, описание; чипы «Бүгін / Ертең / Мерзім өтті» подсвечивают просрочки;
- **Real-time**: Firestore `onSnapshot` — изменил задачу на одном телефоне, у остальных она
  обновилась мгновенно (главный демонстрационный момент);
- **Тірі ағын** — живая лента событий: кто добавил, перенёс, завершил, удалил, присоединился;
- **Жетістік** — прогресс группы и личные результаты каждого участника;
- вход через **Google** (Firebase Authentication), роли «Құрушы / Қатысушы»;
- двуязычный интерфейс **қазақша ⇄ русский**, выбор сохраняется;
- PWA: устанавливается на телефон как обычное приложение, работает офлайн-оболочкой.

### Изюминка

Визуальная идентичность построена на **казахском орнаменте ою-өрнек**: мотивы «қошқар мүйіз»,
ромбов и зигзагов собраны в SVG-ленты, каждая группа при создании получает случайный вариант
орнамента и акцентный цвет (терракота / бирюза / кобальт / маржан). Палитра — тёплая «степная»
бумага, никакого дефолтного фиолетового градиента.

## Как устроено (архитектура)

```
┌──────────────────────┐        onSnapshot (real-time)      ┌──────────────────────┐
│  PWA / React 19      │ ──── запись: add/update/delete ───▶ │  Firestore (eur3)    │
│  Vite 7, TypeScript  │ ◀─── чтение: живые подписки ──────  │  groups·tasks·events │
│  Firebase JS SDK 11  │                                     │  Security Rules      │
└──────────────────────┘                                     └──────────────────────┘
        ▲
        │ Firebase Authentication (Google) — вход, uid
```

- Клиент — одностраничное приложение, весь бэкенд — управляемый Firebase: ни одного
  собственного сервера. Это и есть связка «мобильдік қосымша + бұлттық сервис».
- Безопасность — не в коде, а в **правилах Firestore** (`firestore.rules`): задачи и лента
  доступны только участникам группы, историю событий изменить/удалить нельзя, свой профиль
  пишет только владелец.

### Структура данных Firestore

```
groups/{groupId}
  name, code, accent, ownerUid, createdAt
  memberUids: string[]                    // для запросов и правил
  members: { uid: { name, photo, role, joinedAt } }
  tasks/{taskId}
    title, desc, status(todo|doing|done), assignee, deadline,
    createdBy, createdByName, createdAt, doneAt
  events/{eventId}                        // append-only лента
    type(created_group|joined|task_added|task_moved|task_done|task_deleted),
    actorUid, actorName, taskTitle, at
users/{uid}
  name, photo, updatedAt
```

## Стек

| Слой | Технология |
|---|---|
| Клиент | React 19 + TypeScript, Vite 7 |
| Облако | Firebase: Firestore (NoSQL, real-time), Authentication (Google) |
| PWA | vite-plugin-pwa (Workbox precache), иконки генерируются скриптом на чистом Node |
| Шрифты | Montserrat + Inter, self-hosted через @fontsource (cyrillic + cyrillic-ext — ә, ғ, қ, ң, ө, ұ, ү, і) |
| CI | GitHub Actions: typecheck + сборка на каждый push |
| Хостинг | Vercel (SPA-rewrites в `vercel.json`) |

Стек выбран под слабое железо (2 ядра / 4 ГБ RAM): сборка без Gradle и эмуляторов,
дев-сервер и браузер спокойно умещаются в память.

## Текущий статус проекта

Облачная часть **уже настроена и работает**:

- проект Firebase: **`toptakta-kz`**;
- Firestore `(default)`, регион **eur3**;
- правила безопасности задеплоены из `firestore.rules`;
- Google-вход включён, `localhost` и `*.web.app` в разрешённых доменах.

## Запуск локально

### Вариант 1 — с настоящим облаком (рекомендуется)

Конфиг уже лежит в `.env` рядом с проектом (не коммитится). Просто:

```bash
npm install
npm run dev        # → http://localhost:5173
```

Вход через Google работает сразу (домен `localhost` разрешён в Firebase Auth).

### Вариант 2 — демо-режим (без ключей)

Если `.env` отсутствует, приложение автоматически переходит в демо-режим: те же экраны,
но данные хранятся в `localStorage` устройства. Удобно для показа дизайна без облака —
в интерфейсе появляется янтарный чип «Демо режимі».

### Подключение к другому Firebase-проекту

1. [console.firebase.google.com](https://console.firebase.google.com) → создать проект
2. **Authentication → Sign-in method → Google → Enable**
3. **Firestore Database → Create** (регион eur3)
4. **Rules** → вставить `firestore.rules` → Publish
5. **Project settings → Your apps → Web** → конфиг скопировать в `.env` по образцу `.env.example`

Деплой правил из репозитория: workflow **«Deploy Firestore rules»** (ручной запуск,
секреты `FIREBASE_TOKEN` и `FIREBASE_PROJECT_ID`).

## Деплой на Vercel

1. **Add New Project → Import** `zadxap/toptakta` — Vercel сам определит Vite
2. Environment Variables → перенести 6 строк `VITE_FIREBASE_*` из `.env`
3. Deploy — `vercel.json` уже содержит SPA-rewrites
4. ⚠️ Firebase Console → Authentication → Settings → **Authorized domains** → добавить
   домен `*.vercel.app`, иначе Google-вход на проде не сработает

## CI

`ci.yml` — на каждый push/PR: `npm ci` → `tsc` (typecheck) → `vite build` (в демо-режиме,
без секретов) → артефакт `dist`.

## Скрипты

```bash
npm run dev          # дев-сервер
npm run build        # tsc + vite build
npm run typecheck    # только проверка типов
npm run icons        # перегенерация PNG-иконок (scripts/gen-icons.mjs, чистый Node, без canvas)
```

## Структура кода

```
src/
  store/          # слой данных: api.ts (интерфейс) → fb.ts (Firestore) | mock.ts (демо)
  screens/        # Auth, Home, Board, Feed, Team
  components/     # Sheet, OrnamentBand, Avatar, ProgressRing, ShareSheet (QR)…
  i18n.tsx        # kk/ru словари, формат дат и склонений
  firebase.ts     # инициализация, флаг firebaseConfigured
  theme.ts        # палитра акцентов, аватары
firestore.rules   # правила безопасности (задеплоены)
```
