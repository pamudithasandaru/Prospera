# 🚀 Quick Start Guide — හරිත භූමි (Haritha Bhoomi)

Haritha Bhoomi is made of four parts:

| Part | Folder | Local port | Needed for |
| ---- | ------ | ---------- | ---------- |
| React frontend | `client/` | 3001 | the website |
| Node/Express API + Socket.IO | `server/` | 5000 | everything (auth, farm, market, social…) |
| Plant-disease ML service (FastAPI) | `ml-service/` | 8000 | AI Tools Lab (optional) |
| Sprout chatbot (FastAPI + Qdrant + OpenAI) | `sprout/backend/` | 8001 | floating chat widget (optional) |

You only need the first two to run the app. The ML service and Sprout are optional.

## Prerequisites

- Node.js 18+ and npm 9+
- A Neon PostgreSQL database — free tier is fine: https://neon.tech
- Python 3.10–3.13 (only for the ML service / Sprout; very new Python releases may lack wheels for some packages)
- For Sprout only: an OpenAI API key and a Qdrant instance (Docker locally, or a free cluster at https://cloud.qdrant.io)

No local database install is needed. Neon is hosted.

## 1. Install Dependencies

```powershell
npm run install-all
npx prisma generate
```

Installs backend and frontend packages. Takes 2–3 minutes. `prisma generate` builds
the database client — without it the server crashes with
`Cannot find module '@prisma/client'`.

## 2. Create a Neon Database

1. Sign in at https://console.neon.tech and create a project.
2. Open **Connection Details** and copy **both** connection strings:
   - the **pooled** one (host contains `-pooler`)
   - the **direct** one (no `-pooler`)

## 3. Configure Environment

Copy the templates:

```powershell
Copy-Item .env.example .env
Copy-Item client\.env.example client\.env
```

Then set these in `.env`:

```ini
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxxx.REGION.aws.neon.tech/neondb?sslmode=require"

JWT_SECRET=<generate your own>
JWT_EXPIRE=30d

# Super admin — never stored in the database; login is disabled if either is empty
SUPERADMIN_EMAIL=superadmin@prospera.lk
SUPERADMIN_PASSWORD=<choose a strong password>
```

Generate a secret with:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`DATABASE_URL` is the pooled endpoint used at runtime. `DIRECT_URL` is the direct
endpoint — Prisma Migrate needs a session connection to run DDL and will fail
against the pooler.

Never commit `.env`, and never put real keys in `.env.example`.

## 4. Create the Tables and Seed Data

```powershell
npm run db:migrate
npm run db:seed
```

`db:seed` is idempotent — re-run it whenever you want the demo data back.

It creates 6 users, 3 posts with likes and comments, 3 groups, 1 farm with crops
and finances, 4 courses, 4 market listings, 4 marketplace products, 3 government
schemes, 3 loans and 3 support tickets.

**Test logins** (all seeded users):

| Role   | Email                | Password        |
| ------ | -------------------- | --------------- |
| Farmer | `demo@prospera.lk`   | `Prospera123!`  |
| Expert | `expert@prospera.lk` | `ExpertPass123!` |
| Farmer | `sunil@prospera.lk`  | `Sunil123!`     |
| Farmer | `latha@prospera.lk`  | `Latha123!`     |
| Farmer | `rajith@prospera.lk` | `Rajith123!`    |
| Farmer | `kamala@prospera.lk` | `Kamala123!`    |

Most demo content (farm, loans, tickets, applications, credit score) belongs to
`demo@prospera.lk` — these are scoped per user, so other accounts see their
own empty lists.

The super admin signs in with `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` from `.env`.

### Admin panel

Signing in as the super admin (or any user with the `admin` role) shows an **Admin Panel**
link in the navbar (`/admin`). Tabs:

- **Overview** — platform counts, users by role, pending loans / scheme applications, restricted users, recent signups and posts.
- **Users** — search and filter by role or status; change roles; **suspend**, **ban** or **reactivate** (with an optional reason); delete.
- **Posts** — search and remove posts.
- **Courses** — add, edit, delete, including each course's **videos** (YouTube link or video ID) and **materials**
  (title, format and a download link). Duration is in hours. Experts manage the same fields from the Learning Hub.
- **Market** — wholesale listings: mark sellers verified, delete.
- **Products** — marketplace catalogue: add, edit (price, stock…), delete.
- **Schemes** — government schemes: add, edit, delete; plus an **Applications** view to approve or reject.
- **Tickets** — filter and change status (open, pending, resolved, closed).
- **Loans** — filter and change status (pending, approved, active, rejected, closed).
- **Chatbot** — see what the Sprout chatbot knows and **sync** products, wholesale listings, courses, schemes and the how-to guides into it (see section 7).

All of it is served by `/api/admin/*`, which requires the `admin` role on the server, not just in the UI.

Rules worth knowing:

- Admins can open **every page** of the app. The navbar's **More** menu holds the pages that don't fit in the top bar, and the Learning Hub lets admins add and manage any course. `/farm` sends admins to the all-farmers view, since they have no farms of their own.
- Nobody can register as an admin — promote people from the Users tab.
- Suspended and banned users can't log in, existing sessions stop working on their next request,
  and they can't open a realtime connection. Reactivating restores access immediately.
- Admins must be demoted before they can be suspended or banned. The super admin can't be edited or
  deleted, and admins can't change or delete their own account.

Suspend/ban uses a `status` column on `users` (migration `20261024180000_user_status`).
Run `npm run db:deploy` (or `npm run db:migrate` locally) after pulling this change; the Render build
command already runs `prisma migrate deploy`.

## 5. Run the App

```powershell
npm run dev
```

- **Backend API:** http://localhost:5000
- **Frontend:** http://localhost:3001

Run them separately with `npm run server` and `npm run client`.

## 6. Optional: Plant-Disease ML Service (AI Tools Lab)

```powershell
cd ml-service
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Runs on http://127.0.0.1:8000 (`/health` reports whether the ONNX model loaded).
The backend reaches it through `ML_SERVICE_URL` (defaults to `http://localhost:8000`).
Add it to `.env` if you run the service elsewhere.

> `npm run ml` / `npm run dev:all` start `app_optimized.py`, which expects a different
> model file. Use `python app.py` (the quantized ONNX model in `ml-service/models/`)
> unless you know you need the other one.

## 7. Optional: Sprout Chatbot

Sprout answers questions from three sources: how-to guides and farming documents in `sprout/knowledge/`,
and public catalogue data (products, wholesale listings, courses, government schemes) synced from the database.
See `sprout/README.md` for the full guide; the short version:

```powershell
cd sprout
docker compose up -d                       # starts Qdrant on :6333
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env                # set OPENAI_API_KEY and ADMIN_API_KEY
python -m app.cli ..\knowledge             # load the starter documents (do this once)
uvicorn app.main:app --port 8001 --reload
```

The widget in the frontend talks to `REACT_APP_SPROUT_URL` (`client/.env`,
default `http://localhost:8001`). Check it with http://localhost:8001/api/health —
you want `"qdrant": true` and `"openai_key_set": true`.

Using a cloud Qdrant cluster instead of Docker? Set `QDRANT_URL`
(`https://<cluster>.cloud.qdrant.io:6333`) and `QDRANT_API_KEY` in
`sprout/backend/.env` before running the ingest.

### Teaching Sprout from the database

1. On the **platform API** set (in `.env` locally, or Render's Environment tab):
   ```ini
   SPROUT_URL=http://localhost:8001        # on Render: https://<your-sprout-service>.onrender.com
   SPROUT_ADMIN_KEY=<same value as ADMIN_API_KEY on Sprout>
   CHATBOT_SYNC_INTERVAL_HOURS=6           # 0 = no scheduled full re-sync
   ```
   Use a strong `ADMIN_API_KEY` on Sprout (not `change-me`).
2. Check Sprout's `/api/health` shows `"qdrant": true` and `"openai_key_set": true`.
3. Sign in as an admin, open **Admin Panel > Chatbot** and click **Sync everything now**. The first sync after a quiet
   period can take a minute while a free-tier Sprout wakes up. The table compares "In the database" with
   "Known to the chatbot".
4. After that, changes to products, listings, courses and schemes reach the chatbot a few seconds after they are saved.

Only public catalogue fields are synced (never users, contact details, messages, loans, tickets, farm finances, carts or
applications). The how-to guides in `sprout/knowledge/guides/` are re-read by the same button, so editing a guide and
pushing it is enough; no upload is needed. Keep the guides in step with the website when features change.

### Weather

The Weather page shows **live data** for Sri Lanka's 25 districts from two free providers that need no API key:
[Open-Meteo](https://open-meteo.com/) (primary, non-commercial use) and [MET Norway](https://api.met.no/) (automatic
fallback). Shared hosts such as Render are often rate-limited by Open-Meteo (HTTP 429); when that happens the server
switches to MET Norway for 10 minutes. The page credits whichever provider answered. It defaults to the district in the user's profile, falls back to Colombo, and
the District dropdown overrides it (remembered per user in the browser).

- Served by `GET /api/weather/current?district=Kandy` and `GET /api/weather/locations`; results are cached for
  15 minutes per district, and slightly older data is served if Open-Meteo is briefly unreachable.
- The alerts and the "Agricultural Insights" cards are generated by simple rules from the real forecast
  (`server/services/weatherService.js`). They are general guidance, not official warnings.
- The server needs outbound internet access to `api.open-meteo.com` and `api.met.no`. If both are down and nothing
  is cached, the page shows an error with a Retry button instead of made-up numbers.
- Optional: set `WEATHER_USER_AGENT` (for example `YourApp/1.0 you@example.com`) so MET Norway can contact you;
  its terms ask for an identifying User-Agent. It defaults to the project's GitHub URL.

## ✅ Verify

```powershell
Invoke-WebRequest http://localhost:5000/api/health | Select-Object -ExpandProperty Content
```

Expect `"database":"up"`. A `503` with `"database":"down"` means the connection
string is wrong or the Neon project is suspended.

Then open http://localhost:3001 and sign in with a test account.

## 🔍 Inspecting the Database

```powershell
npm run db:studio
```

Opens Prisma Studio at http://localhost:5555 to browse and edit rows.

## ☁️ Deploying (Vercel + Render)

| Part | Host | Settings |
| ---- | ---- | -------- |
| Frontend | Vercel | Root directory `client`, framework Create React App, output `build` |
| Node API | Render Web Service | Root directory blank, start `npm start` |
| ML service | Render Web Service | Root directory `ml-service`, start `uvicorn app:app --host 0.0.0.0 --port $PORT` |
| Sprout | Render Web Service | Root directory `sprout/backend`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

**Node API (Render)**

- Build command:
  ```
  npm install --include=dev && npx prisma generate && npx prisma migrate deploy
  ```
  (`--include=dev` is needed because the `prisma` CLI is a dev dependency and Render
  sets `NODE_ENV=production`.)
- Environment variables: `NODE_ENV=production`, `DATABASE_URL` (pooled),
  `DIRECT_URL` (direct), `JWT_SECRET`, `JWT_EXPIRE`, `CLIENT_URL`,
  `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, `ML_SERVICE_URL`, `DEMO_LOGIN_ENABLED=false`,
  plus the Cloudinary / email / Stripe keys you use. (Weather needs no key.)
- Do **not** set `PORT` — Render provides it.
- `CLIENT_URL` must be your exact Vercel URL — `https://<app>.vercel.app`, `https`, **no trailing slash**.
  It drives CORS and Socket.IO.
- `ML_SERVICE_URL` is the ML service's base URL, with no path.

**Sprout (Render)**

`OPENAI_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`, `QDRANT_COLLECTION=sprout_kb`,
`ADMIN_API_KEY`, and `CORS_ORIGINS=https://<app>.vercel.app`.
Leave `CHAT_API_KEY` empty (anything the browser sends is public). Run the ingest once
from your machine against the cloud Qdrant (step 7).

**Frontend (Vercel)**

Environment variables (baked in at build time — **redeploy after changing them**):

```ini
REACT_APP_API_URL=https://<node-api>.onrender.com/api      # must end in /api
REACT_APP_SOCKET_URL=https://<node-api>.onrender.com       # no /api
REACT_APP_SPROUT_URL=https://<sprout>.onrender.com
```

`client/vercel.json` already sets the build command (`CI=false npm run build`, so lint
warnings don't fail the build) and rewrites every path to `index.html` so deep links
and refreshes work with React Router.

Free Render instances sleep after ~15 minutes idle; the first request afterwards can
take 30–60 seconds.

## 🐛 Troubleshooting

### `Cannot find module '@prisma/client'`
Dependencies aren't installed or the client isn't generated:
```powershell
npm install
npx prisma generate
```

### `DATABASE_URL is not set`
`.env` is missing or the variable is empty. The server exits deliberately rather
than starting without a database.

### `Can't reach database server`
- Check the host, password and that the URL ends with `?sslmode=require`.
- Neon free-tier projects suspend when idle; the first query wakes them and may
  take a few seconds.

### Prisma Migrate errors about a pooled connection
`DIRECT_URL` is missing or is pointing at the `-pooler` host. Migrations need the
direct endpoint.

### Schema changed but the client disagrees
```powershell
npm run db:generate
```

### Port already in use (5000 or 3001)
```powershell
$p = (Get-NetTCPConnection -LocalPort 5000 -State Listen).OwningProcess
Stop-Process -Id $p -Force
```

### CORS error in the browser console
- **Local:** `CLIENT_URL` in `.env` must match the frontend origin (`http://localhost:3001`);
  restart the backend.
- **Deployed:** `CLIENT_URL` on the Render Node service must be exactly your Vercel URL
  (https, no trailing slash). For Sprout, set `CORS_ORIGINS` the same way.

### `Route not found` (404) on login/register after deploying
`REACT_APP_API_URL` is missing the `/api` suffix. Fix it in Vercel and **redeploy**.

### Sprout: "Could not reach Sprout" or `Connection refused`
- "Could not reach" in the browser → CORS: set `CORS_ORIGINS` on Sprout.
- `[Errno 111] Connection refused` in the chat → Sprout can't reach Qdrant: set `QDRANT_URL`
  and `QDRANT_API_KEY`. `/api/health` should show `"qdrant": true`.
- Chat works but answers nothing → Qdrant is empty: run `python -m app.cli ..\knowledge`.

### AI Tools Lab: "ML service request failed"
- Free-tier cold start: open the ML service's `/health` to wake it, wait for
  `"model_loaded": true`, then retry. The first prediction can take 30–60 seconds.
- Check `ML_SERVICE_URL` on the Node API (base URL only, no `/api/predict`).
- Out-of-memory crashes in the ML logs mean the 512 MB free tier is too small.

### Vercel build fails with lint "errors"
Vercel sets `CI=true`, which makes Create React App treat warnings as errors.
`client/vercel.json` sets `CI=false` for the build; keep it.

## 📝 Command Reference

```powershell
npm run install-all   # install root + client dependencies
npm run dev           # backend + frontend
npm run server        # backend only (nodemon)
npm run client        # frontend only (port 3001)
npm run build         # production frontend bundle

npm run db:generate   # regenerate the Prisma client
npm run db:migrate    # create/apply a migration (development)
npm run db:deploy     # apply migrations (production)
npm run db:push       # sync schema without a migration
npm run db:seed       # load demo data
npm run db:studio     # browse the database
npm run db:reset      # drop, re-migrate, re-seed
```

## 🌐 URLs

- Frontend: http://localhost:3001
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health
- ML service: http://localhost:8000/health
- Sprout: http://localhost:8001/api/health
- Prisma Studio: http://localhost:5555
- API docs: `API_DOCUMENTATION.md`
