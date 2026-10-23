# 🚀 Quick Start Guide — Prospera

## Prerequisites

- Node.js 18+ and npm 9+
- A Neon PostgreSQL database — free tier is fine: https://neon.tech
- Python 3.10+ (only if you want the ML service)

No local database install is needed. Neon is hosted.

## 1. Install Dependencies

```powershell
npm run install-all
```

Installs backend (~370 packages) and frontend (~1550 packages). Takes 2–3 minutes.

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
```

Generate a secret with:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`DATABASE_URL` is the pooled endpoint used at runtime. `DIRECT_URL` is the direct
endpoint — Prisma Migrate needs a session connection to run DDL and will fail
against the pooler.

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
`demo@prospera.lk` — these are now scoped per user, so other accounts see their
own empty lists.

## 5. Run the App

```powershell
npm run dev
```

- **Backend API:** http://localhost:5000
- **Frontend:** http://localhost:3001

Run them separately with `npm run server` and `npm run client`.
Use `npm run dev:all` to also start the Python ML service.

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

## 🐛 Troubleshooting

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
Ensure `CLIENT_URL` in `.env` matches the frontend origin (`http://localhost:3001`)
and restart the backend.

## 📝 Command Reference

```powershell
npm run install-all   # install root + client dependencies
npm run dev           # backend + frontend
npm run dev:all       # backend + frontend + ML service
npm run server        # backend only (nodemon)
npm run client        # frontend only (port 3001)
npm run build         # production frontend bundle

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
- Prisma Studio: http://localhost:5555
- API docs: `API_DOCUMENTATION.md`
