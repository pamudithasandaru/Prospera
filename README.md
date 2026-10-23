# Prospera
<img width="1024" height="289" alt="logo" src="https://github.com/user-attachments/assets/dcefe31b-895f-4b2b-9114-9e1134efdc7b" />


Comprehensive agriculture platform with a React + Express web app backed by PostgreSQL (Neon), plus an optional Python ML service for plant disease prediction.

## Current Modules

- Farm management (`/api/farm`)
- Wholesale market (`/api/market`)
- Social feed (`/api/social`)
- Learning portal (`/api/learning`)
- AI tools (`/api/ai` and `/api/ml/predict`)
- Marketplace (`/api/marketplace`)
- Government schemes (`/api/government`)
- Weather dashboard (`/api/weather`)
- Support center (`/api/support`)
- FinTech (`/api/fintech`)

## Tech Stack

- Frontend: React 19, MUI, React Router, Axios
- Backend: Node.js, Express, JWT auth, Socket.io
- Data: PostgreSQL on Neon, accessed through Prisma ORM
- Optional ML: FastAPI + TensorFlow (`ml-service`)

## Repository Structure

```text
Prospera/
├── client/                 # React frontend
├── server/                 # Express API
├── ml-service/             # Optional Python ML service
├── prisma/                 # Prisma schema, migrations and seed script
├── scripts/                # Utility scripts
├── docs/                   # Additional setup docs
├── API_DOCUMENTATION.md
├── INSTALLATION.md
├── QUICKSTART.md
└── README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- A Neon PostgreSQL database (free tier is fine) — https://neon.tech
- Python 3.10+ (only if using `ml-service`)

## Environment Setup

1. Create `.env` in the project root from `.env.example`.
2. Set safe values for your local environment (do not commit secrets).
3. Recommended local defaults:
   - `PORT=5000`
   - `CLIENT_URL=http://localhost:3001`
4. Add your Neon connection strings (Neon console → your project → Connection Details):
   - `DATABASE_URL` — the **pooled** endpoint (host contains `-pooler`), used at runtime
   - `DIRECT_URL` — the **direct** endpoint, used by Prisma Migrate to run DDL
5. Copy `client/.env.example` to `client/.env`.

## Install Dependencies

From the project root:

```bash
npm run install-all
```

This installs both root and `client` dependencies.

## Set Up the Database

With `DATABASE_URL` and `DIRECT_URL` set in `.env`:

```bash
npm run db:migrate    # create the tables
npm run db:seed       # load demo users, posts, farms, courses, listings
```

Browse the data any time with `npm run db:studio`.

## Run in VS Code (Recommended)

1. Open folder in VS Code: `D:\Prospera`
2. Open terminal (`Ctrl+``)
3. Run:

```bash
npm run dev
```

What starts:

- Backend API: `http://localhost:5000`
- Frontend UI: `http://localhost:3001`

Health check:

- `http://localhost:5000/api/health`

### If you want separate terminals in VS Code

Terminal 1 (backend):

```bash
npm run server
```

Terminal 2 (frontend):

```bash
npm run client
```

## Optional: Run Python ML Service

From a new terminal:python

```bash
cd ml-service
pip install -r requirements.txt
python app.py
```

Use this only when testing Python-based disease prediction flow.

## Available Root Scripts

- `npm run dev` - run backend + frontend together
- `npm run server` - run backend with nodemon
- `npm run client` - run frontend on port 3001
- `npm run build` - build frontend production bundle
- `npm start` - start backend in production mode
- `npm run install-all` - install all dependencies

### Database scripts

- `npm run db:migrate` - create and apply a migration in development
- `npm run db:deploy` - apply existing migrations (production)
- `npm run db:push` - sync the schema without creating a migration
- `npm run db:seed` - load demo data (idempotent, safe to re-run)
- `npm run db:studio` - browse the database in Prisma Studio
- `npm run db:reset` - drop, re-migrate and re-seed

## Notes

- Keep `.env` and credential files private.
- For API details, see `API_DOCUMENTATION.md`.

## Quick Troubleshooting

- Port conflict: close conflicting process or change ports in `.env`
- CORS issue: ensure `CLIENT_URL` matches frontend URL (`http://localhost:3001`)
- API connection issue: verify frontend API base URL (`REACT_APP_API_URL`) if you changed backend port
- Database connection issue: confirm `DATABASE_URL` uses the pooled Neon host and ends with `?sslmode=require`
