# Run Haritha Bhoomi on your own computer (Windows)

This guide starts **every part** of the project locally: the website, the API, the AI plant-disease service,
and the Sprout chatbot with its admin site. All commands are for **PowerShell**, run from the project folder
(`D:\Prospera`) unless a step says otherwise. Each long-running part gets its **own terminal window**.

If you only want the website and API (no AI tool, no chatbot), do steps 1–3 and 4A, and skip the rest.

---

## 0. What runs where

| Part | What it is | Port | Needed for |
|---|---|---|---|
| **Neon PostgreSQL** | the database (hosted, no install) | - | everything |
| **API** (`server/`) | Node/Express backend | 5000 | everything |
| **Website** (`client/`) | React site | 3001 | everything |
| **ML service** (`ml-service/`) | plant-disease model (FastAPI) | 8000 | AI Tools Lab |
| **Qdrant** | vector database for the chatbot (Docker) | 6333 | chatbot |
| **Sprout backend** (`sprout/backend/`) | chatbot API (FastAPI) | 8001 | chatbot |
| **Sprout admin site** (`sprout/frontend/`) | upload documents, test chat (Vite) | 5173 | optional |

---

## 1. Install the tools (once)

| Tool | Version | Check with |
|---|---|---|
| Node.js | 18 or newer (tested on 24) | `node -v` |
| Python | 3.10 or newer (tested on 3.14) | `python --version` |
| Git | any | `git --version` |
| Docker Desktop | only for the chatbot's Qdrant | `docker --version` |

Accounts you need:
- **Neon** (https://neon.tech) for the database. Free.
- **OpenAI API key**, only for the chatbot (it creates embeddings and writes answers). Usage is a few cents.

---

## 2. Get the code and install packages (once)

```powershell
git clone https://github.com/pamudithasandaru/Prospera.git D:\Prospera
cd D:\Prospera

npm run install-all        # installs the API and the website
npx prisma generate        # builds the database client (required, or the API crashes)
```

Already cloned? Update instead: `git pull --rebase origin main`, then `npm run install-all`.

---

## 3. Database and settings (once)

### 3.1 Use a separate database for local work (strongly recommended)
Your `DATABASE_URL` points at a real database. If it is the same one the live website uses, test data and
mistakes land in production. Two safe options:

**Option A: a Neon branch (a private copy of the live database).** Open the Neon console, your project,
**Branches**, **Create branch** (name it `local-dev`). A branch starts as a copy of the tables **and the data**,
so it already contains the live users and content. Edits you make in it never touch production. Treat your
`.env` as private, because it now reaches a copy of real user data. Because the tables already exist, step 3.3
will say "no pending migrations" and you can skip the seed.

**Option B: a brand-new empty database.** Create a new Neon **project**. It starts with no tables, so do both
parts of step 3.3 (migrate, then seed for demo data).

Either way, open the Connection Details of the branch or project and copy **both** strings:
- the **pooled** one (host contains `-pooler`) goes into `DATABASE_URL`
- the **direct** one (no `-pooler`) goes into `DIRECT_URL`

### 3.2 Create your settings files
```powershell
if (-not (Test-Path .env))         { Copy-Item .env.example .env }
if (-not (Test-Path client\.env))  { Copy-Item client\.env.example client\.env }
```
(The `if` lines make sure an existing `.env` with your real settings is never overwritten.)

Open `.env` and set at least these (everything else can stay as is):

```ini
PORT=5000
CLIENT_URL=http://localhost:3001

DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxxx.REGION.aws.neon.tech/neondb?sslmode=require"

JWT_SECRET=paste-a-long-random-string        # generate: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
SUPERADMIN_EMAIL=superadmin@prospera.lk
SUPERADMIN_PASSWORD=choose-a-strong-password

ML_SERVICE_URL=http://localhost:8000
```

`client\.env` normally needs no change (`REACT_APP_API_URL=http://localhost:5000/api`,
`REACT_APP_SPROUT_URL=http://localhost:8001`).

The Cloudinary, email and Stripe lines are optional; the features that need them stay switched off until you
fill them in. Never commit `.env`.

### 3.3 Create the tables and demo data
```powershell
npx prisma migrate status      # tells you whether the database is already up to date
npx prisma migrate deploy      # creates any missing tables (does nothing if they all exist)
npm run db:seed                # OPTIONAL: adds the demo accounts and sample content (safe to repeat)
```

> **Warning:** `npm run db:reset` **deletes everything** in the database. Never run it against production.
> Do not run `db:seed` against the live database either.

---

## 4. Start the website and API

### 4A. Easiest: both in one terminal
```powershell
npm run dev
```
- API: http://localhost:5000
- Website: http://localhost:3001 (the first build takes about half a minute)

### 4B. Or in two terminals (easier to read the logs)
```powershell
# Terminal 1: API (restarts automatically when you edit server files)
npm run server

# Terminal 2: website
npm run client
```

Check it:
- http://localhost:5000/api/health should show `"database":"up"`.
- Open http://localhost:3001 and sign in (see section 7).

---

## 5. Start the AI plant-disease service (optional)

Set it up once:
```powershell
cd ml-service
if (-not (Test-Path .venv)) { python -m venv .venv }      # only creates it if it does not exist yet
.venv\Scripts\Activate.ps1
pip install -r requirements.txt                            # safe to repeat; installs anything missing
cd ..
```
Never run `python -m venv .venv` while that environment is **activated**: Windows cannot replace the
`python.exe` it is running from ("Unable to copy ... venvlauncher.exe"). If `.venv` already exists, just
activate it and run `pip install -r requirements.txt`.

Run it (new terminal, every time):
```powershell
cd D:\Prospera\ml-service
.venv\Scripts\Activate.ps1
python app_optimized.py        # listens on http://localhost:8000
```
(From the project root with the environment activated, `npm run ml` does the same.)

Check it: http://localhost:8000/health shows `"model_loaded": true`. Then in the website open **AI Tools Lab**,
choose a leaf photo and click **Analyse Image**.

A prediction takes **about 4 to 8 seconds** on a normal computer. That is the model, not a fault.

---

## 6. Start the Sprout chatbot (optional)

### 6.1 Start Qdrant (the chatbot's memory)
Make sure Docker Desktop is running, then:
```powershell
cd D:\Prospera\sprout
docker compose up -d           # Qdrant on http://localhost:6333
cd ..
```
Dashboard: http://localhost:6333/dashboard

No Docker? Put `QDRANT_URL=:memory:` in the Sprout settings below instead. Everything works, but the
chatbot's memory is wiped each time Sprout restarts (you re-run the sync), and you must start Sprout **without**
`--reload`.

### 6.2 Set up and start the Sprout backend
Once:
```powershell
cd D:\Prospera\sprout\backend
if (-not (Test-Path .venv)) { python -m venv .venv }
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Edit `sprout\backend\.env`:
```ini
OPENAI_API_KEY=sk-...your key...
ADMIN_API_KEY=pick-a-private-value          # you will reuse this value below
QDRANT_URL=http://localhost:6333
CORS_ORIGINS=http://localhost:5173,http://localhost:3001
```

Every time (new terminal):
```powershell
cd D:\Prospera\sprout\backend
.venv\Scripts\Activate.ps1
uvicorn app.main:app --port 8001 --reload
```

Check it: http://localhost:8001/api/health must show `"qdrant": true` and `"openai_key_set": true`.
API docs: http://localhost:8001/docs

### 6.3 Teach Sprout (load guides and database data)
Easiest, from the website: sign in as the super admin, open **Admin Panel**, **Chatbot** tab, and click
**Sync everything now**. For that to work, add these two lines to the **main** `.env` and restart the API
(`Ctrl+C`, then `npm run server`):

```ini
SPROUT_URL=http://localhost:8001
SPROUT_ADMIN_KEY=the-same-value-as-ADMIN_API_KEY-above
```

The sync loads the how-to guides and farming documents, plus every product, wholesale listing, course and
government scheme. Afterwards changes sync by themselves a few seconds after you save them.

Alternative for the guide files only (no website needed):
```powershell
cd D:\Prospera\sprout\backend
.venv\Scripts\Activate.ps1
python -m app.cli ..\knowledge
```

Then click the green chat button on the website and ask something like "how do I add a crop?".

### 6.4 Sprout admin site (optional)
```powershell
cd D:\Prospera\sprout\frontend
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev                    # http://localhost:5173
```
Use its **Documents** tab (enter your `ADMIN_API_KEY`) to upload your own PDF, DOCX, TXT or MD files.

---

## 7. Sign in

After `npm run db:seed` (or on a branch copied from the live database, where they may already exist) these demo accounts work:

| Role | Email | Password |
|---|---|---|
| Farmer | `demo@prospera.lk` | `Prospera123!` |
| Expert | `expert@prospera.lk` | `ExpertPass123!` |
| Farmer | `sunil@prospera.lk` | `Sunil123!` |
| Farmer | `latha@prospera.lk` | `Latha123!` |
| Farmer | `rajith@prospera.lk` | `Rajith123!` |
| Farmer | `kamala@prospera.lk` | `Kamala123!` |
| **Admin** | the `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD` from your `.env` | |

The admin sees an **Admin Panel** link in the top bar (users, posts, courses, market, schemes, tickets, loans,
chatbot).

The Weather page needs internet access (it uses free weather services).

---

## 8. Everyday cheat sheet

Open these terminals, each in `D:\Prospera`:

| # | Terminal | Command | URL |
|---|---|---|---|
| 1 | API | `npm run server` | http://localhost:5000/api/health |
| 2 | Website | `npm run client` | http://localhost:3001 |
| 3 | ML service | `cd ml-service; .venv\Scripts\Activate.ps1; python app_optimized.py` | http://localhost:8000/health |
| 4 | Qdrant | `cd sprout; docker compose up -d` (then it runs in the background) | http://localhost:6333/dashboard |
| 5 | Sprout | `cd sprout\backend; .venv\Scripts\Activate.ps1; uvicorn app.main:app --port 8001 --reload` | http://localhost:8001/api/health |
| 6 | Sprout admin (optional) | `cd sprout\frontend; npm run dev` | http://localhost:5173 |

**Stop:** press `Ctrl+C` in each terminal. For Qdrant: `cd sprout; docker compose down`
(adding `-v` also deletes its stored data).

**Run the tests:**
```powershell
cd sprout\backend; .venv\Scripts\Activate.ps1; pytest -q     # chatbot tests (no OpenAI or Qdrant needed)
cd D:\Prospera; npm --prefix client run build                 # checks the website compiles
```

**Useful database commands:** `npm run db:studio` opens a browser to view and edit rows (http://localhost:5555);
`npx prisma migrate status` shows whether the database is up to date.

---

## 9. When something goes wrong

| Problem | Fix |
|---|---|
| `Cannot find module '@prisma/client'` when starting the API | `npm install`, then `npx prisma generate` |
| `DATABASE_URL is not set` | `.env` is missing or empty; redo step 3.2 |
| `Can't reach database server` | Check both Neon strings end with `?sslmode=require`. A Neon database that has been idle takes a few seconds to wake; retry. |
| Prisma complains about a "pooled connection" | `DIRECT_URL` must be the Neon string **without** `-pooler` |
| Browser shows a **CORS error** | `CLIENT_URL` in `.env` must be `http://localhost:3001`; restart the API. For Sprout, `CORS_ORIGINS` must include `http://localhost:3001`. |
| Changes to `client\.env` have no effect | Stop `npm run client` and start it again; those values are read once at start. |
| Port already in use | Free it (change 5000 to the busy port): `$p = (Get-NetTCPConnection -LocalPort 5000 -State Listen).OwningProcess; Stop-Process -Id $p -Force` |
| `Activate.ps1 cannot be loaded` (scripts disabled) | `Set-ExecutionPolicy -Scope Process Bypass`, then activate again |
| `Unable to copy ... venvlauncher.exe to ...\.venv\Scripts\python.exe` | You ran `python -m venv .venv` while that environment was activated. Do not recreate it: just `pip install -r requirements.txt`. To rebuild it from scratch: `deactivate`, `Remove-Item -Recurse -Force .venv`, then `python -m venv .venv`. |
| ML service: `No module named 'PIL'` | The environment was not activated or the packages are missing: `.venv\Scripts\Activate.ps1`, then `pip install -r requirements.txt` |
| AI Tools says "ML service request failed" | The ML service is not running or not on port 8000. Start it (step 5) and check `ML_SERVICE_URL=http://localhost:8000` in `.env`. |
| Sprout health shows `"qdrant": false` | Qdrant is not running: start Docker Desktop, then `cd sprout; docker compose up -d` |
| Sprout health shows `"openai_key_set": false` | Add `OPENAI_API_KEY` to `sprout\backend\.env` and restart Sprout |
| Chat says "Could not reach Sprout" | Sprout is not running on port 8001 or CORS is missing `http://localhost:3001` |
| Chat answers "I don't have that information" | The chatbot has not learned anything yet: run the sync (step 6.3) |
| Admin **Chatbot** tab says "not set up" | Add `SPROUT_URL` and `SPROUT_ADMIN_KEY` to the main `.env` and restart the API |
| Admin **Chatbot** tab says "rejected the admin key" | `SPROUT_ADMIN_KEY` in `.env` must equal `ADMIN_API_KEY` in `sprout\backend\.env` |
| `LF will be replaced by CRLF` warnings from Git | Harmless on Windows |
| `npm run dev` shows nothing after the API starts | The website needs about 30 seconds for its first build. Wait for "Compiled successfully". |

---

## 10. Where each setting lives (summary)

| File | Used by | Key settings |
|---|---|---|
| `.env` | API | `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `SUPERADMIN_*`, `CLIENT_URL`, `ML_SERVICE_URL`, `SPROUT_URL`, `SPROUT_ADMIN_KEY` |
| `client\.env` | website | `REACT_APP_API_URL`, `REACT_APP_SPROUT_URL` |
| `sprout\backend\.env` | Sprout backend | `OPENAI_API_KEY`, `ADMIN_API_KEY`, `QDRANT_URL`, `CORS_ORIGINS` |
| `sprout\frontend\.env` | Sprout admin site | `VITE_API_URL` |
| `ml-service` | ML service | no settings file; it reads the model from `ml-service\models` |

More detail: `QUICKSTART.md` (setup and deployment), `sprout\README.md` (the chatbot), `API_DOCUMENTATION.md`.
