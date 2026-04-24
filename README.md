# FMG Console

A friendlier front end for FortiManager. Wraps the FMG JSON-RPC API in a keyboard-driven dashboard with role-based presets (Network / Security), a global command palette, and at-a-glance views that the native GUI buries.

**Version:** 0.1.0

## Stack

- **Backend:** Node.js + Express (CommonJS), axios for FMG JSON-RPC, pino for logging, Supabase for auth
- **Frontend:** Vite + React 18, Tailwind, TanStack Query, Zustand, cmdk, lucide-react, Recharts
- **Deploy:** Railway, single service, Express serves the React build in production

## Project layout

```
fmg-console/
├── backend/               Express API + FMG proxy
│   └── src/
│       ├── server.js
│       ├── config.js
│       ├── logger.js
│       ├── services/      fmgClient, supabase, mockData
│       ├── middleware/    auth, errorHandler
│       └── routes/        devices, policies, objects, tasks, dashboard...
└── frontend/              Vite React SPA
    └── src/
        ├── components/
        │   ├── layout/    AppShell, NavTree, TopBar
        │   ├── common/    Tile, KpiCard, CommandPalette
        │   ├── auth/      AuthGate, LoginForm
        │   └── tiles/     SdwanMatrix, PolicyHeatmap, etc.
        ├── hooks/         data-fetching hooks
        ├── lib/           api client, supabase client
        ├── pages/         Dashboard, Devices, Policy, etc.
        └── stores/        Zustand ui store
```

## Local development

```powershell
# Install everything
npm run install:all

# Terminal 1 - backend on :8300
npm run dev:backend

# Terminal 2 - frontend on :5173
npm run dev:frontend
```

Frontend proxies `/api` to `http://localhost:8300`.

## Environment variables

**backend/.env**

```
PORT=8300
NODE_ENV=development
LOG_LEVEL=debug

# FortiManager
FMG_HOST=fmg.example.com
FMG_PORT=443
FMG_USER=apiuser
FMG_PASSWORD=changeme
FMG_VERIFY_TLS=false
FMG_DEFAULT_ADOM=root

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_JWT_SECRET=...

# Mode
USE_MOCK_DATA=true         # set to false once FMG is reachable

CORS_ORIGIN=http://localhost:5173
```

**frontend/.env**

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Set `USE_MOCK_DATA=true` to run the dashboard with generated data. Every tile renders against realistic fixtures so you can build UI without FMG access.

## Mock mode

The backend ships with a full mock layer (`backend/src/services/mockData.js`) that returns fixture data for every endpoint. Leave `USE_MOCK_DATA=true` during UI work, flip to `false` once `FMG_*` vars are set and the lab is reachable.

## FortiManager API

Uses the JSON-RPC API documented at
[docs.fortinet.com/document/fortimanager/8.0.0/api-best-practices](https://docs.fortinet.com/document/fortimanager/8.0.0/api-best-practices/140185/getting-started).

The FMG client (`backend/src/services/fmgClient.js`) handles session login/logout, refreshes expired sessions transparently, and exposes a small helper API (`get`, `exec`, `set`, `add`, `del`) that wraps the JSON-RPC payload shape.

## Deploy to Railway

1. Create a Railway project, link this repo
2. Set environment variables in Railway (same as `backend/.env`, plus `NODE_ENV=production`)
3. Railway auto-detects `railway.json` and runs `npm run build` then `npm start`
4. Point Cloudflare DNS to the Railway domain
