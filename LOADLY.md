# Публикация на Loadly.io

## Сборка

```bash
npm install
npm run build          # PWA → dist/
npm run cap:sync       # если используете Capacitor для .ipa/.apk
```

## Android (.apk)

1. `npx cap open android` → Build → Generate Signed APK.
2. Загрузите APK на [Loadly.io](https://loadly.io/) (drag & drop или API).
3. Отправьте студентам QR / ссылку.

## iOS (.ipa)

Требуется Apple Developer + Ad Hoc / Enterprise профиль.

1. `npx cap open ios` → Archive → Export .ipa.
2. Загрузите на Loadly.io.
3. На iPhone: Safari → установить → Developer Mode → доверить профилю.

## Backend для продакшена

Перед публикацией задеплойте API (Render) и PWA (Netlify) — см. [DEPLOY.md](DEPLOY.md).

В Netlify Environment Variables:

- `VITE_BACKEND_URL` = URL Render API
- `VITE_ABLY_API_KEY` = Ably root key
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`

В Render Environment Variables — см. [server/.env.example](server/.env.example).
