<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="client/public/images/haritha-bhoomi-horizontal-dark.png">
  <img src="client/public/images/haritha-bhoomi-horizontal_1.png" alt="Haritha Bhoomi (හරිත භූමි) - Grow · Learn · Share" width="560">
</picture>

**Haritha Bhoomi (හරිත භූමි)** is an AgriTech platform for farmers: manage your farm, trade at wholesale, buy equipment, learn, get help from AI and connect with the community.

The repository is called **Prospera**.

</div>

---

## What is in the project

| Part | Folder | Tech | Port |
|---|---|---|---|
| Website | `client/` | React 19, MUI, React Router, Axios, Socket.io client | 3001 |
| API | `server/` | Node.js, Express, JWT auth, Socket.io | 5000 |
| Database | `prisma/` | PostgreSQL on Neon, Prisma ORM | - |
| AI plant-disease service (optional) | `ml-service/` | FastAPI + ONNX Runtime | 8000 |
| Sprout chatbot (optional) | `sprout/` | FastAPI + OpenAI + Qdrant, React/Vite admin site | 8001 / 5173 |

## Features

| Module | API | What it does |
|---|---|---|
| Farm management | `/api/farm` | Farms, crops, expenses and revenue, insights |
| Wholesale market | `/api/market` | Farmers list produce, buyers browse and inquire |
| Marketplace | `/api/marketplace` | Equipment and product catalogue |
| Social feed | `/api/social`, `/api/stories` | Posts, stories, community |
| Messages and notifications | `/api/messages`, `/api/notifications` | Real-time chat and alerts (Socket.io) |
| Search | `/api/search` | Search across the platform |
| Learning hub | `/api/learning` | Courses and lessons |
| Government schemes | `/api/government` | Schemes and how to apply |
| Weather | `/api/weather` | Weather dashboard |
| Support center | `/api/support` | Support tickets and help |
| AgriFinTech | `/api/fintech` | Loans and financial tools |
| AI tools | `/api/ai`, `/api/ml/predict` | Plant disease detection |
| Admin panel | `/api/admin` | Users, listings, products, courses, schemes, posts, loans, tickets, chatbot sync (admin role only) |
| Sprout chatbot | `sprout/` (port 8001) | Answers farming and "how do I use the site" questions with cited sources and links to the pages it mentions |

## Repository structure

```text
Prospera/
├── client/                 # React website (public/images holds the logos)
├── server/                 # Express API (routes, controllers, services)
├── prisma/                 # Prisma schema, migrations, seed script
├── ml-service/             # Plant-disease prediction service (FastAPI)
├── sprout/                 # Sprout chatbot: backend, frontend, knowledge/ guides
├── scripts/                # Utility scripts
├── docs/                   # Additional docs
├── OverView/               # Project overview
├── API_DOCUMENTATION.md
├── INSTALLATION.md
├── QUICKSTART.md
├── RUN_LOCALLY.md          # Full Windows guide: website, API, ML and chatbot
├── ML_MODELS_DOCUMENTATION.md
├── PROJECT_SUMMARY.md
└── README.md
```

## Prerequisites

- Node.js 18+ and npm 9+
- A Neon PostgreSQL database (free tier is fine): https://neon.tech
- Python 3.10+ (only for `ml-service` and `sprout`)
- Docker Desktop (only for the chatbot's Qdrant)
- An OpenAI API key (only for the chatbot)

## Quick start

```bash
npm run install-all     # root + client dependencies
npx prisma generate     # build the database client
```

1. Copy `.env.example` to `.env` in the project root and `client/.env.example` to `client/.env`. Do not commit secrets.
2. In `.env` set at least:
   - `PORT=5000`, `CLIENT_URL=http://localhost:3001`
   - `DATABASE_URL`: Neon **pooled** endpoint (host contains `-pooler`, ends with `?sslmode=require`)
   - `DIRECT_URL`: Neon **direct** endpoint, used by Prisma Migrate
   - `JWT_SECRET`
3. Create the tables and demo data:

```bash
npm run db:migrate
npm run db:seed
```

4. Start the API and website together:

```bash
npm run dev
```

- Website: http://localhost:3001
- API: http://localhost:5000 (health check: `/api/health`)

Run them separately with `npm run server` and `npm run client`.

Use a separate Neon branch or database for local work so test data never reaches production. See [RUN_LOCALLY.md](RUN_LOCALLY.md).

### Other environment variables

Optional features read these from `.env`: `CLOUDINARY_*` (image uploads), `EMAIL_*` (mail), `STRIPE_*` (payments), `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` (first admin), `DEMO_LOGIN_ENABLED`, `ML_SERVICE_URL` (AI service), `SPROUT_URL`, `SPROUT_ADMIN_KEY` and `CHATBOT_SYNC_INTERVAL_HOURS` (chatbot sync).

## Optional: AI plant-disease service

```bash
cd ml-service
pip install -r requirements.txt
python app_optimized.py     # or: npm run ml  (from the root)
```

`npm run dev:all` starts the API, website and ML service together. Details: [ML_MODELS_DOCUMENTATION.md](ML_MODELS_DOCUMENTATION.md).

## Optional: Sprout chatbot

```bash
cd sprout
docker compose up -d                         # Qdrant on 6333
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env                       # set OPENAI_API_KEY and ADMIN_API_KEY
python -m app.cli ../knowledge               # load the guides
uvicorn app.main:app --port 8001 --reload
```

Optional admin site (upload documents, test chat): `cd sprout/frontend && npm install && npm run dev` (http://localhost:5173).
The platform syncs products, listings, courses and schemes into Sprout, and admins can trigger a sync from the Admin Panel's **Chatbot** tab. See [sprout/README.md](sprout/README.md).

## Root scripts

| Script | Purpose |
|---|---|
| `npm run dev` | API + website |
| `npm run dev:all` | API + website + ML service |
| `npm run server` | API with nodemon |
| `npm run client` | Website on port 3001 |
| `npm run ml` | ML service |
| `npm run build` | Production build of the website |
| `npm start` | API in production mode |
| `npm run install-all` | Install all Node dependencies |
| `npm run db:migrate` | Create and apply a migration (development) |
| `npm run db:deploy` | Apply existing migrations (production) |
| `npm run db:push` | Sync the schema without a migration |
| `npm run db:seed` | Load demo data (safe to re-run) |
| `npm run db:studio` | Browse the database in Prisma Studio |
| `npm run db:reset` | Drop, re-migrate and re-seed |
| `npm run db:generate` | Regenerate the Prisma client |

## Branding

Logos live in `client/public/images/` (light, dark, square and icon variants, PNG and SVG). The app name and logo paths are set in `client/src/brand.js`.

<div align="center">
  <img src="client/public/images/haritha-bhoomi-square.png" alt="Haritha Bhoomi square logo" width="140">
  <img src="client/public/images/haritha-bhoomi-icon.png" alt="Haritha Bhoomi icon" width="140">
</div>

## Documentation

- [QUICKSTART.md](QUICKSTART.md) and [INSTALLATION.md](INSTALLATION.md): setup
- [RUN_LOCALLY.md](RUN_LOCALLY.md): run every part on Windows
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md): API reference
- [ML_MODELS_DOCUMENTATION.md](ML_MODELS_DOCUMENTATION.md): disease model
- [sprout/README.md](sprout/README.md): chatbot

## Troubleshooting

- **Port conflict:** close the other process or change the ports in `.env`.
- **CORS error:** `CLIENT_URL` must match the website URL (`http://localhost:3001`).
- **Website cannot reach the API:** check `REACT_APP_API_URL` in `client/.env`.
- **Database connection fails:** `DATABASE_URL` must use the pooled Neon host and end with `?sslmode=require`.
- **API crashes on start:** run `npx prisma generate`.

## License

MIT
