# LUMEN BANK — IMPLEMENTATION PLAN
> Пошаговый план для любого AI. Каждый шаг содержит задачу, файл, и критерий проверки перед переходом к следующему.
> Статусы: ✅ Готово | 🔶 Частично | ❌ Не начато

---

## ПРАВИЛА ВЫПОЛНЕНИЯ

1. **Читай перед кодом**: перед любым изменением — читай целевой файл полностью
2. **Один файл за раз**: не трогай несколько файлов в одном шаге
3. **Проверка после каждого шага**: `npm run build` должен быть чистым (0 errors, 0 warnings)
4. **Не удалять**: ничего не удалять без явного указания
5. **Дизайн**: строго по `design_guide.md` — монохромная система, Tailwind токены, Framer Motion
6. **Socket события**: строго по списку в `LUMEN_MASTER_DOCUMENT.md` Раздел 4

---

## ФАЗА 1 — КРИТИЧЕСКИЕ БАГИ (делать первым)

### ШАГ 1.1 — Typo в socketService.js
**Файл**: `src/services/socketService.js`
**Проблема**: строка вызывает `setForceRedirect` — метода не существует в orchestratorStore
**Правило**: найди все упоминания `setForceRedirect` (без Path) и замени на `setForceRedirectPath`
**Проверка**: `grep -n "setForceRedirect" src/services/socketService.js` — должно вернуть только строки с `setForceRedirectPath`

### ШАГ 1.2 — Balance desync (AppContext ↔ orchestratorStore)
**Файл**: `src/screens/Home.jsx`
**Проблема**: Home показывает `user.balance` из AppContext, но Admin override пишет в `orchestratorStore.balance`
**Правило**:
```
const orchestratorBalance = useOrchestratorStore(s => s.balance);
const displayBalance = orchestratorBalance !== null ? orchestratorBalance : user?.balance ?? 0;
```
Использовать `displayBalance` везде где показывается баланс на Home
**Проверка**: Admin → Override Balance → число → нажать Update → баланс на Home экране должен измениться без перезагрузки

### ШАГ 1.3 — Дублирующиеся socket listeners
**Файл**: `src/context/SocketContext.jsx`
**Проблема**: и `socketService.js` и `SocketContext.jsx` регистрируют одни и те же обработчики (UPDATE_BALANCE, UI_LOCK, FORCE_REDIRECT)
**Правило**: в `SocketContext.jsx` оставить ТОЛЬКО регистрацию соединения и передачу userId. Все обработчики событий — только в `socketService.js`
**Проверка**: `grep -n "socket.on" src/context/SocketContext.jsx` — должно вернуть только `connect` и `disconnect`

### ШАГ 1.4 — Аудио файлы в правильном месте
**Статус**: ✅ ВЫПОЛНЕНО (файлы скопированы в `public/audio/` в предыдущей сессии)
**Проверка**: `ls public/audio/` — должны быть `lumenbankENG.mp3` и `lumenbankFR.mp3`

---

## ФАЗА 2 — VOICE CALL (полный цикл)

### ШАГ 2.1 — VoiceCallOverlay: проверка текущего состояния
**Статус**: ✅ ВЫПОЛНЕНО (переписан в предыдущей сессии)
**Файл**: `src/components/VoiceCallOverlay.jsx`
**Проверка текущего кода**:
- [ ] Фаза `incoming` — кнопки Accept/Decline
- [ ] Фаза `playing` — воспроизводит `/audio/lumenbankENG.mp3` или `.../lumenbankFR.mp3` по `lang`
- [ ] Фаза `active` — таймер, mute/keypad/speaker кнопки
- [ ] Фаза `active + showKeypad` — полный 12-кнопочный диалер (1-9, *, 0, #)
- [ ] Нажал 1 → `DTMF_INPUT {digit:'1'}` → сообщение → закрыть
- [ ] Нажал 9 → `DTMF_INPUT {digit:'9'}` → сообщение → закрыть
- [ ] Нажал # → `DTMF_INPUT {digit:'#'}` → сообщение → закрыть → `setForceRedirectPath('/chat')`
- [ ] DTMF тон при каждом нажатии (Web Audio API)
**Проверка**: `npm run build` → 0 errors

### ШАГ 2.2 — ObservationDashboard: Call Status + SCREEN BLOCK
**Статус**: ✅ ВЫПОЛНЕНО (обновлён в предыдущей сессии)
**Файл**: `src/screens/admin/ObservationDashboard.jsx`
**Проверка**:
- [ ] Хедер: кнопка `BLOCK ALL SCREENS` / `UNLOCK ALL SCREENS`
- [ ] Command Panel: блок "CALL STATUS" — показывает ответ ученика
- [ ] START CALL передаёт `lang` из `selectedStudent.lang`
- [ ] `/chat` добавлен в Force Navigation
- [ ] Слушает `adminDTMF` → обновляет callStatus

### ШАГ 2.3 — Автотриггер звонка при крупном переводе
**Файл**: `server/scenarioEngine.js` (или `server/index.js` если scenarioEngine не существует)
**Задача**: при получении POST `/api/transfers` — если `amount >= 100` (CAD) → автоматически эмитировать `TRIGGER_CALL` к тому же userId через socket
**Логика**:
```
POST /api/transfers
  → если amount >= 100 → io.to(`student:${userId}`).emit('TRIGGER_CALL', {
      callerName: 'LUMEN Security',
      callerNumber: lang==='fr' ? '+33 1 86 76 00 00' : '+1 800-932-1102',
      lang: req.body.lang || 'en',
      callId: uuid(),
    })
  → перевод не блокируем, ждём DTMF от клиента
  → Admin решает вручную подтверждать/отклонять транзакцию
```
**Проверка**: сделать перевод на 150 CAD → должен появиться VoiceCallOverlay автоматически

---

## ФАЗА 3 — ADMIN PANEL (полное восстановление)

### ШАГ 3.1 — Users вкладка: inline редактирование + статусы
**Файл**: `src/screens/admin/AdminPanel.jsx`
**Задача**:
- Таблица: ID, имя, email, баланс (inline edit), KYC, AML, статус (Active/Blocked)
- `[Approve]` → PATCH `/admin/user/:id/status` body: `{status:'active'}`
- `[Block]` → PATCH `/admin/user/:id/status` body: `{status:'blocked'}`
- Inline баланс: blur → PATCH `/admin/user/:id/balance` body: `{balance: число}`
**Проверка**: изменить баланс в таблице → нажать Enter/blur → проверить в MongoDB через `/api/users` что значение обновилось

### ШАГ 3.2 — Transactions вкладка: approve/reject работает
**Файл**: `src/screens/admin/AdminPanel.jsx`
**Задача**:
- `[✓]` → PATCH `/admin/transaction/:id` body: `{status:'completed'}`
- `[✗]` → PATCH `/admin/transaction/:id` body: `{status:'rejected'}`
- После изменения — строка меняет цвет/badge без перезагрузки страницы
**Проверка**: создать тестовый перевод → в Admin нажать ✓ → статус меняется на "completed"

### ШАГ 3.3 — Credits вкладка: approve → деньги к клиенту
**Файлы**: `server/index.js` (endpoint) + `src/screens/admin/AdminPanel.jsx`
**Задача на сервере**:
```
PATCH /admin/credit/:id/approve
  → найти credit в MongoDB
  → найти user по userId
  → user.balance += credit.amount
  → сохранить user
  → io.to(`student:${userId}`).emit('UPDATE_BALANCE', newBalance)
  → вернуть { success: true }
```
**Задача на клиенте** (`orchestratorStore` + `Home.jsx`): socket `UPDATE_BALANCE` уже слушается в socketService.js — убедиться что он вызывает `setBalance`
**Проверка**: подать кредит → Admin approve → баланс клиента на Home экране увеличился

### ШАГ 3.4 — KYC/AML вкладка: approve/reject + уведомление клиенту
**Файлы**: `server/index.js` + `src/screens/admin/AdminPanel.jsx`
**Задача на сервере**:
```
PATCH /admin/kyc/:userId/approve → user.kycStatus = 'verified' → save → socket show_modal к клиенту
PATCH /admin/kyc/:userId/reject  → user.kycStatus = 'rejected' → save → socket show_modal к клиенту
```
**Socket сообщение клиенту**:
```js
io.to(`student:${userId}`).emit('show_modal', {
  modalType: 'info',
  title: 'KYC Update',
  message: 'Your identity verification has been approved.'
})
```
**Проверка**: Admin approve KYC → у клиента в Profile появился badge "verified"

### ШАГ 3.5 — PUSH/CHAT вкладка: live feed в Admin
**Файл**: `src/screens/admin/AdminPanel.jsx`
**Задача**: Admin видит входящие сообщения от клиентов в реальном времени
```
socket.on('chatMessage', (data) => {
  if (data.sender !== 'admin') addToAdminChat(data)
})
```
Добавить список сообщений над полем ввода, разделить по userId
**Проверка**: клиент пишет в чат → Admin видит сообщение без перезагрузки

### ШАГ 3.6 — Admin authentication
**Файл**: `src/screens/admin/AdminLogin.jsx` (создать новый)
**Задача**: простая форма логин/пароль перед входом в `/admin/*`
- Credentials хранятся в `.env`: `VITE_ADMIN_LOGIN` / `VITE_ADMIN_PASSWORD`
- После успешного входа — токен в sessionStorage → пускать в Admin
- Без токена — редирект на `/admin/login`
**НЕ использовать**: JWT, bcrypt, сложную auth — это тренажёр, не банк
**Проверка**: открыть `/admin/AdminPanel` без входа → редирект на `/admin/login`

---

## ФАЗА 4 — КЛИЕНТСКИЕ ЭКРАНЫ (доработка)

### ШАГ 4.1 — Home: порядок секций + баннеры
**Файл**: `src/screens/Home.jsx`
**Задача — порядок**:
```
1. Баланс + карусель карт
2. Быстрые действия
3. Рекламные баннеры (авторотация)  ← сюда, до транзакций
4. Последние 5 транзакций
```
**Задача — баннеры**:
- Тип баннера: `{ id, imageUrl, linkType: 'url'|'event', linkValue: string }`
- `linkType: 'url'` → открыть в браузере
- `linkType: 'event'` → `socket.emit('STUDENT_ACTION', { type: 'banner_click', bannerId })`
- Баннеры берутся из `GET /api/banners` (создать endpoint) или из hardcoded массива
**Проверка**: баннеры выше транзакций, нажатие на баннер работает

### ШАГ 4.2 — Transfers: "Done" кнопка на экране успеха
**Файл**: `src/screens/Transfers.jsx`
**Проблема**: кнопка Done не всегда возвращает на Home
**Правило**: `navigate('/home', { replace: true })`
**Проверка**: после успешного перевода нажать Done → переход на Home, back-кнопка не возвращает на экран успеха

### ШАГ 4.3 — Transfers: пиксельный чек при Share
**Файл**: `src/screens/Transfers.jsx`
**Задача**: при нажатии [Share] генерировать PNG чека через Canvas API
```
Canvas: 400x600, чёрно-белый
Содержимое:
  - Логотип LUMEN (текст) вверху
  - Линия-разделитель
  - "TRANSFER RECEIPT"
  - Дата/время
  - Сумма крупно
  - Отправитель → Получатель
  - Статус: COMPLETED
  - Transaction ID
  - Нижний штамп с датой
```
Использовать `canvas.toBlob()` → `navigator.share({ files: [blob] })`
**Проверка**: нажать Share → появляется системный шейринг с PNG чеком

### ШАГ 4.4 — UILockOverlay: локализация
**Файл**: `src/components/UILockOverlay.jsx`
**Задача**: получать `lang` из AppContext, показывать текст на нужном языке
```
EN: "We're performing scheduled maintenance. We'll be back shortly."
FR: "Maintenance en cours. Nous serons de retour bientôt."
```
**Проверка**: ученик с lang=fr → Admin Lock UI → французский текст

### ШАГ 4.5 — Credit: уведомление при reject
**Файл**: `src/screens/Credit.jsx`
**Задача**: при получении `show_modal` с типом `credit_rejected` → показать модал
Уже реализован `show_modal` handler в socketService — убедиться что ModalOverlay его поймает
**Проверка**: Admin reject кредит → клиент видит модал "Ваша заявка отклонена"

### ШАГ 4.6 — Banners: Admin управление
**Файл**: `src/screens/admin/AdminPanel.jsx` + `server/index.js`
**Задача**:
- Новая секция в Admin (можно в PUSH/CHAT вкладке) — список баннеров
- Upload PNG/SVG (multipart → сохранить в `public/banners/`)
- Поле: URL или event name
- Toggle: активен/неактивен
- `GET /api/banners` → массив активных баннеров
**Проверка**: загрузить PNG → сохранился → появился на Home у клиента

---

## ФАЗА 5 — ДЕПЛОЙ (для удалённой работы)

### ШАГ 5.1 — Переменные окружения
**Файлы**: `src/services/socketService.js`, `src/screens/admin/AdminPanel.jsx`, все fetch calls
**Задача**: заменить все вхождения `http://localhost:5001` на `import.meta.env.VITE_API_URL`
**Команда поиска**: `grep -rn "localhost:5001" src/`
**Создать**: `.env` (локально) и `.env.example` (в репо)
```
VITE_API_URL=http://localhost:5001
VITE_ADMIN_LOGIN=admin
VITE_ADMIN_PASSWORD=lumen2026
```
**Проверка**: `grep -rn "localhost:5001" src/` → 0 результатов

### ШАГ 5.2 — Бекенд: CORS для продакшн домена
**Файл**: `server/socket.js` и `server/index.js`
**Задача**: `FRONTEND_URL` в `.env` → использовать в CORS origin
```
origin: process.env.FRONTEND_URL || '*'
```
**Проверка**: сервер запускается без ошибок с `FRONTEND_URL=https://lumen-bank.netlify.app`

### ШАГ 5.3 — MongoDB Atlas
**Файл**: `server/index.js`
**Задача**: убедиться что `MONGODB_URI` из `.env` используется для подключения
**Проверка**: подключиться к MongoDB Atlas строкой вида `mongodb+srv://...`

### ШАГ 5.4 — Netlify деплой (фронтенд)
**Файл**: создать `netlify.toml` в корне
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
**Проверка**: `npm run build` → `dist/` содержит `index.html` + `sw.js`

### ШАГ 5.5 — Render/Railway деплой (бекенд)
**Файл**: создать `Procfile` в `server/`
```
web: node index.js
```
**Переменные окружения на Render**:
- `MONGODB_URI`
- `FRONTEND_URL`
- `PORT` (автоматически от Render)
**Проверка**: бекенд отвечает на `GET /health` → `{status: 'ok'}`

---

## ФАЗА 6 — ПОДГОТОВКА К КЛАССУ

### ШАГ 6.1 — Seed: создать N тестовых учеников одним нажатием
**Файл**: `server/index.js` + Admin UI
**Endpoint**: `POST /admin/seed` body: `{ count: 5 }`
**Логика**: создать N пользователей с именами Student1...N, PIN `111111`, баланс 5000 CAD, lang=en
**Admin UI**: кнопка в шапке `[SEED STUDENTS]` с полем количества
**Проверка**: нажать → 5 пользователей в таблице Users

### ШАГ 6.2 — Session health check
**Файл**: `server/socket.js`
**Задача**: каждые 30 сек Admin получает ping от всех подключённых учеников
```
setInterval(() => {
  io.to('admins').emit('PING_ALL')
}, 30000)
```
Клиент: `socket.on('PING_ALL', () => socket.emit('PONG', { userId, route, balance }))`
**Проверка**: Admin видит live статус каждого ученика без перезагрузки

### ШАГ 6.3 — Scenario Engine: настройка порогов из Admin UI
**Файл**: `server/scenarioEngine.js` + Admin UI
**Задача**: хранить пороги в памяти сервера (или MongoDB):
```js
let thresholds = {
  callTriggerAmount: 100,  // CAD — сумма для авто-звонка
  suspiciousAmount: 10000, // CAD — для предупреждения
}
```
Admin UI: поля в CONTROLS вкладке для изменения порогов
`PUT /admin/thresholds` body: `{ callTriggerAmount, suspiciousAmount }`
**Проверка**: изменить порог с 100 на 50 → перевод 75 CAD → автозвонок

### ШАГ 6.4 — Audit Log: фиксировать действия преподавателя
**Файл**: `server/index.js`
**Задача**: при каждом adminCommand → сохранять в MongoDB коллекцию `auditLog`:
```js
{ adminId, command, targetUserId, data, timestamp }
```
Admin UI: вкладка или выпадающий список в CONTROLS — показывает последние 50 действий
**Проверка**: Admin Lock UI → запись появилась в Audit Log

### ШАГ 6.5 — Финальный чеклист перед запуском в классе

#### Клиентское приложение:
- [ ] Онбординг работает: язык → форма → PIN → Home
- [ ] PIN вход работает
- [ ] Переводы: форма → OTP → слайдер → Receipt
- [ ] Звонок: Admin триггер → Overlay → аудио → keypad → результат к Admin
- [ ] Блокировка: Admin Lock → экран замораживается → Admin Unlock → работает
- [ ] Чат: клиент пишет → Admin видит → Admin отвечает → клиент видит
- [ ] Кредит: заявка → Admin approve → баланс обновился
- [ ] KYC: форма → Admin approve → badge "verified"
- [ ] Тёмный режим: переключается из Profile

#### Admin Panel:
- [ ] Вход требует логин/пароль
- [ ] CONTROLS: видит всех подключённых учеников с маршрутом и балансом
- [ ] Все команды работают: Lock/Unlock, Call, Balance, Modal, Navigate
- [ ] BLOCK ALL — блокирует всех одновременно
- [ ] Users: список, баланс, approve/block
- [ ] Transactions: список, approve/reject
- [ ] Credits: список, approve/reject → деньги к клиенту
- [ ] KYC: approve/reject → статус у клиента

#### Деплой:
- [ ] Фронт доступен по HTTPS URL
- [ ] Бекенд доступен по HTTPS URL
- [ ] WebSocket соединение работает через WSS (не WS)
- [ ] PWA устанавливается на телефон
- [ ] Ученик из другого города подключается и виден в Admin

---

## ПРИОРИТЕТЫ (в каком порядке делать)

```
Сейчас (критично для базовой работы):
  1.1 → 1.2 → 1.3 → 2.3

После (для полного погружения):
  3.1 → 3.2 → 3.3 → 3.4 → 3.5

Для класса (до первого запуска):
  3.6 → 4.1 → 4.2 → 5.1 → 5.2 → 5.3 → 5.4 → 5.5

Полировка (можно позже):
  4.3 → 4.4 → 4.5 → 4.6 → 6.1 → 6.2 → 6.3 → 6.4
```
