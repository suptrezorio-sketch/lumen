# LUMEN Bank

**LUMEN Bank** is a classroom banking **training simulator**: students use a mobile-first PWA, instructors control sessions in real time (balance overrides, UI lock, simulated security calls, transfer scenarios).

## Stack

| Layer | Technology |
|-------|------------|
| Client | React 18, Vite, Tailwind, Framer Motion, Zustand |
| Realtime | Socket.IO (optional Ably via env) |
| API | Node.js, Express, Mongoose |
| Database | MongoDB Atlas (M0 free tier) |
| Hosting | Netlify (PWA) + Render (API) |

## Quick start

```bash
npm install
cp .env.example .env
cp server/.env.example server/.env
```

**Database (recommended):** Supabase — set in `server/.env`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Or legacy MongoDB via `MONGODB_URI`.

**Realtime:** Ably — `ABLY_API_KEY` in `server/.env`, `VITE_ABLY_API_KEY` in `.env`.

**Receipts (share):** `POLLINATIONS_API_KEY` in `server/.env` ([Pollinations API](https://gen.pollinations.ai/docs#description/generate-an-image)).

```bash
npm run dev:all
```

Seed test user (PIN `1388`): after server starts, login syncs automatically.

- **Student PWA:** http://127.0.0.1:5173  
- **Admin:** http://127.0.0.1:5173/admin/login (default `admin` / `lumen2026`)  
- **API health:** http://localhost:5001/health  

Test student PIN: `1388` (syncs test user to CRM).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server only |
| `npm run dev:all` | Vite + Express API |
| `npm run build` | Production PWA build |
| `npm run preview` | Preview production build |


## First Loadly upload

Native beta install for students uses **Loadly.io** (`.apk` / `.ipa`), not the PWA `dist/` folder. Production web deploy stays on Netlify — see [DEPLOY.md](DEPLOY.md).

1. `npm run build` then `npm run cap:sync`
2. Build Android APK (see [LOADLY.md](LOADLY.md) — path `android/app/build/outputs/apk/debug/app-debug.apk`)
3. Drag the APK to [loadly.io](https://loadly.io/) and share the QR / link

Full first-upload checklist (Russian): **[LOADLY.md](LOADLY.md)**.

## Documentation

- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) — step-by-step build checklist  
- [architecture_plan.md](architecture_plan.md) — system design & socket events  
- [design_guide.md](design_guide.md) — UI tokens & patterns  
- [DEPLOY.md](DEPLOY.md) — Netlify + Render + Atlas  
- [DISTRIBUTION.md](DISTRIBUTION.md) — Loadly / AppHost (native phase)  

## Project layout

```
src/           React PWA (screens, admin, socket client)
server/        Express API + Socket.IO + scenario engine
public/        Static assets (audio, PWA icons)
netlify/       Serverless functions (Wallet pass)
supabase/      Postgres schema (backend v2)
```

## License

See [LICENSE](LICENSE).
