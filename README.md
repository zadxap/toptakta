# ТопТақта

**Совместная доска задач для студенческих групп** — мобильное веб-приложение (PWA)
с облачной базой данных **Google Firestore**.

> Проект по дисциплине **В06.075 «Бұлтты және мобильдік технологиялар»**
> (облачные и мобильные технологии), тема №5: *«Google Firestore негізінде
> бұлттық деректер базасы бар мобильдік қосымша жасау»*.

## Концепция

Студенческая группа создаёт «топ», приглашает участников **кодом из 6 символов или QR-кодом**
(по образцу игровых сервисов, знакомых студентам) и ведёт общие задачи по трём колонкам:
**Кезекте → Жасалуда → Дайын**. Все изменения синхронизируются в реальном времени:
перетащили задачу на одном телефоне — она мгновенно обновилась у всех.

Изюминка — визуальная идентичность на основе **казахского орнамента ою-өрнек**:
у каждой группы свой вариант ленты-орнамента и акцентный цвет (терракота, бирюза,
кобальт, маржан). Интерфейс двуязычный — **қазақша / русский**, переключается на лету.

## Возможности

- 🔐 Вход через Google (Firebase Authentication)
- 🗂 Группы: создание и присоединение по коду / QR-глубокой ссылке
- ✅ Задачи: исполнитель, срок (чипы «Бүгін / Ертең / Мерзім өтті»), описание, статусы
- ⚡ **Real-time**: Firestore `onSnapshot` — живая доска и «Тірі ағын» (лента событий)
- 📊 Прогресс группы и личные результаты участников
- 📱 PWA: устанавливается на телефон, работает в автономном браузере Chrome
- 🇰🇿🇷🇺 Двуязычный интерфейс (kk/ru) с сохранением выбора
- 🧪 **Демо-режим**: без ключей Firebase всё работает локально (localStorage) — удобно для показа дизайна

## Стек

| Слой | Технология |
|---|---|
| Клиент | React 19 + TypeScript, Vite 7 |
| Облако | Firebase: Firestore (NoSQL, real-time), Authentication (Google) |
| PWA | vite-plugin-pwa (Workbox precache), установочные иконки |
| Шрифты | Montserrat + Inter (self-hosted через @fontsource, кириллица + cyrillic-ext) |
| CI | GitHub Actions: typecheck + сборка на каждый push |
| Хостинг | Vercel (SPA-rewrites уже настроены в `vercel.json`) |

Стек выбран под слабое железо (2 ядра / 4 ГБ RAM): сборка идёт без Gradle и эмуляторов,
дев-сервер и браузер спокойно умещаются в память.

## Структура данных Firestore

```
groups/{groupId}
  name, code, accent, ownerUid, createdAt
  memberUids: string[]            // для запросов и правил безопасности
  members: { uid: { name, photo, role, joinedAt } }
  tasks/{taskId}
    title, desc, status(todo|doing|done), assignee, deadline,
    createdBy, createdByName, createdAt, doneAt
  events/{eventId}                // лента событий (append-only)
    type(created_group|joined|task_added|task_moved|task_done|task_deleted),
    actorUid, actorName, taskTitle, at
users/{uid}
  name, photo, updatedAt
```

Правила безопасности — в [`firestore.rules`](firestore.rules): задачи и лента доступны
только участникам группы, история событий неизменяема, профиль пишет только владелец.

## Запуск локально

```bash
npm install
npm run dev          # демо-режим, данные в localStorage
```

### Подключение настоящего облака (Firestore)

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. **Build → Authentication → Sign-in method → Google → Enable**
3. **Build → Firestore Database → Create database** (production mode)
4. Вкладка **Rules** → вставить содержимое `firestore.rules` → Publish
5. **Project settings → Your apps → Web app** → скопировать конфиг
6. `cp .env.example .env` → заполнить значения `VITE_FIREBASE_*`
7. `npm run dev` — приложение автоматически переключится с демо-режима на облако

Для деплоя правил через CI: секреты репозитория `FIREBASE_TOKEN` (`firebase login:ci`)
и `FIREBASE_PROJECT_ID`, затем запустить workflow **Deploy Firestore rules** вручную.

## Деплой на Vercel

1. **Import Git Repository** → этот репозиторий (framework определится сам: Vite)
2. Environment Variables → добавить все `VITE_FIREBASE_*` из `.env`
3. Deploy. Готово.
4. ⚠️ В Firebase Console → Authentication → Settings → **Authorized domains**
   добавить домен `*.vercel.app`, иначе вход через Google на проде не сработает.

## CI

`ci.yml` — на каждый push/PR: `npm ci` → `tsc` (typecheck) → `vite build` (в демо-режиме,
без секретов) → артефакт `dist`. Сборка проходит зелёной и без ключей Firebase.

## Скрипты

```bash
npm run dev          # дев-сервер
npm run build        # tsc + vite build
npm run typecheck    # только проверка типов
npm run icons        # перегенерация PNG-иконок (scripts/gen-icons.mjs, чистый Node)
```

---

*Қазақша: «Топ» — группа, «тақта» — доска. ТопТақта = доска для группы.*
