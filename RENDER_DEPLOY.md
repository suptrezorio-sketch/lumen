# Backend Деплой на Render.com (Бесплатно)

## Почему Render.com?

✅ **Бесплатный tier**: 750 часов/месяц для web services  
✅ **WebSocket поддержка**: Работает с Socket.IO  
✅ **Автоматический SSL**: HTTPS из коробки  
✅ **GitHub интеграция**: Автоматический деплой  
✅ **Environment variables**: Безопасное хранение ключей  
✅ **Поддержка Node.js**: Идеально для нашего backend  

---

## 📋 Предварительные требования

1. **GitHub аккаунт** — Репозиторий должен быть на GitHub
2. **Render.com аккаунт** — Зарегистрироваться на [render.com](https://render.com)
3. **Supabase проект** — Уже настроен с данными

---

## 🚀 Пошаговая инструкция

### Шаг 1: Подготовка GitHub репозитория

Убедитесь что ваш код находится на GitHub:

```bash
cd /Users/panfi.love/Downloads/lumen-bank

# Если репозиторий еще не на GitHub:
git remote add origin https://github.com/ВАШ_ЮЗЕРНЕЙМ/lumen-bank.git
git branch -M main
git push -u origin main
```

### Шаг 2: Создать сервис на Render.com

1. Откройте [render.com](https://dashboard.render.com)
2. Нажмите **"New +"** → **"Web Service"**
3. Подключите ваш GitHub репозиторий
4. Выберите репозиторий `lumen-bank`

### Шаг 3: Конфигурация сервиса

**Basic Settings**:
- **Name**: `lumen-bank-api`
- **Region**: `Oregon (us west)` (ближайшая к вам)
- **Branch**: `main`

**Build & Runtime**:
- **Runtime**: `Node`
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && npm start`

**Root Directory**: Оставьте пустым или укажите `server`

### Шаг 4: Environment Variables

Render автоматически использует `render.yaml` если он есть в корне проекта, но можно также указать вручную:

**Required Variables**:
```
SUPABASE_URL=https://jryxgykfmgtaoywkdqql.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ABLY_API_KEY=dtltw.CwotFA:DlvVBwpaytpUD0plGqFNPQUqbsgXBFm-lX_fBG5BoEo
POLLINATIONS_API_KEY=080a31652692f35c01f9df2a55189325
SMART_GROW_API_KEY=sgl_6f6b779c4f9402bf575e8ede565cd21236734d8b5ee7a5efdbd3f9a2969ab055
PORT=5001
ADMIN_LOGIN=admin
ADMIN_PASSWORD=lumen2026
```

**Optional Variables**:
```
FRONTEND_URL=https://your-app.netlify.app  # После деплоя frontend
MONGODB_URI=  # Оставьте пустым, используем Supabase
```

### Шаг 5: Advanced Settings

**Health Check**:
- **Path**: `/health`

**Auto-Deploy**:
- ✅ Включите (автоматический деплой при push в main)

### Шаг 6: Деплой

Нажмите **"Create Web Service"** и подождите 3-5 минут.

Render автоматически:
- Склонирует репозиторий
- Установит зависимости
- Запустит сервер
- Выдаст SSL сертификат
- Предоставит URL вида: `https://lumen-bank-api.onrender.com`

---

## 🔍 Проверка деплоя

### 1. Проверить логи
В Render dashboard откройте **"Logs"** — должны видеть:
```
✅ Using Supabase database
Server running on port 5001
```

### 2. Проверить health endpoint
```bash
curl https://lumen-bank-api.onrender.com/health
```
Должен вернуть: `{"status":"ok"}`

### 3. Проверить API endpoints
```bash
# Тестовый endpoint
curl https://lumen-bank-api.onrender.com/api/banners
```

---

## 📝 Полученный Production URL

После успешного деплоя Render предоставит URL вида:
```
https://lumen-bank-api.onrender.com
```

**Сохраните этот URL** — он понадобится для:
1. Обновления `VITE_BACKEND_URL` в `.env`
2. Пересборки APK с production конфигурацией
3. Настройки CORS в Supabase (если нужно)

---

## ⚙️ Настройка CORS в Supabase

**Важно**: Добавьте ваш Render URL в разрешенные origins в Supabase:

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите проект `jryxgykfmgtaoywkdqql`
3. **Settings** → **API**
4. **Add CORS origin**: `https://lumen-bank-api.onrender.com`

---

## 🔄 Обновление .env файлов

### Root .env (для frontend)
```bash
VITE_BACKEND_URL=https://lumen-bank-api.onrender.com
```

### Server/.env (для локальной разработки)
```bash
# Для тестирования production backend локально
VITE_BACKEND_URL=https://lumen-bank-api.onrender.com
```

---

## 🚨 Решение проблем

### Проблема: "Spawn ENOMEM"
**Решение**: Увеличьте память в Render settings (Basic plan имеет больше памяти)

### Проблема: WebSocket не работает
**Решение**: Render поддерживает WebSocket, но убедитесь что:
- Socket.IO версия совместима
- Правильная конфигурация CORS

### Проблема: База данных не подключается
**Решение**: Проверьте что SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY правильные

---

## 📊 Мониторинг

### Render Dashboard
- **Logs**: Просмотр логов в реальном времени
- **Metrics**: CPU, Memory, Response time
- **Events**: История деплоев

### Бесплатные ограничения
- **750 часов/месяц** — достаточно для работы 24/7
- **512MB RAM** — достаточно для Node.js backend
- **0.1 CPU** — достаточно для наших задач

---

## 💰 Стоимость

**Free Tier** (навсегда бесплатно):
- ✅ 750 часов/месяц
- ✅ 512MB RAM
- ✅ 0.1 CPU
- ✅ SSL сертификат
- ✅ Персистентное хранилище (не нужно для нас)

**Paid tiers** (только если нужно больше ресурсов):
- Starter ($7/месяц) — больше RAM/CPU
- Standard ($25/месяц) — еще больше ресурсов

---

## 🎯 Следующие шаги после деплоя backend

1. ✅ Backend задеплоен на Render
2. 🔄 Обновить `VITE_BACKEND_URL` в `.env`
3. 🔄 Пересобрать APK: `npm run build && npm run cap:sync`
4. 🔄 Собрать новый APK: `cd android && ./gradlew assembleDebug`
5. 📱 Загрузить новый APK на Loadly.io
6. 🧪 Протестировать на реальном устройстве

---

## 📞 Поддержка

**Render Documentation**: [docs.render.com](https://docs.render.com)
**Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
**Loadly Documentation**: [loadly.io/doc/view/api](https://loadly.io/doc/view/api)

---

## ✅ Чек-лист перед загрузкой на Loadly.io

- [ ] Backend задеплоен на Render.com
- [ ] Health endpoint отвечает: `curl https://lumen-bank-api.onrender.com/health`
- [ ] API endpoints работают
- [ ] Supabase CORS настроен
- [ ] Frontend `.env` обновлен с production URL
- [ ] APK пересобран с production конфигурацией
- [ ] Socket.IO работает через HTTPS
- [ ] Тестовый пользователь может залогиниться (PIN: 1388)

После выполнения этого чек-листа система готова для работы на 100%!