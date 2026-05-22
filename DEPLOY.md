# Deploy LUMEN Bank (free tier)

## 1. MongoDB Atlas

1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Database user + network access (`0.0.0.0/0` for Render).
3. Copy connection string → `MONGODB_URI` in Render.

## 2. API — Render

1. New **Web Service** → connect repo, root directory: `server`.
2. Build: `npm install`
3. Start: `npm start`
4. Environment:

| Variable | Example |
|----------|---------|
| `MONGODB_URI` | `mongodb+srv://...` |
| `PORT` | `5001` (Render sets `PORT` automatically) |
| `FRONTEND_URL` | `https://your-app.netlify.app` |
| `ADMIN_LOGIN` | `admin` |
| `ADMIN_PASSWORD` | strong password |

5. Health check: `/health`

## 3. PWA — Netlify

1. Site settings → Build: `npm run build`, publish `dist`.
2. Environment:

| Variable | Value |
|----------|--------|
| `VITE_BACKEND_URL` | `https://your-api.onrender.com` |
| `WALLETWALLET_API_KEY` | optional, for Wallet pass function |

3. `netlify.toml` already configures SPA redirects.

## 4. Smoke test

```bash
curl https://your-api.onrender.com/health
# Open Netlify URL → login PIN 1388 → Admin /admin/login
```

## 5. CORS

Set `FRONTEND_URL` to your exact Netlify origin (no trailing slash).
