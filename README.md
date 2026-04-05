# Prospera
<img width="1024" height="289" alt="logo" src="https://github.com/user-attachments/assets/dcefe31b-895f-4b2b-9114-9e1134efdc7b" />


Comprehensive agriculture platform with a MERN-based web app and optional Python ML service for plant disease prediction.

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
- Data: MongoDB (+ Firebase/Firestore fallback support in server)
- Optional ML: FastAPI + TensorFlow (`ml-service`)

## Repository Structure

```text
Prospera/
├── client/                 # React frontend
├── server/                 # Express API
├── ml-service/             # Optional Python ML service
├── scripts/                # Utility scripts (Firebase, diagnostics)
├── docs/                   # Additional setup docs
├── API_DOCUMENTATION.md
├── INSTALLATION.md
├── QUICKSTART.md
└── README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or Atlas)
- Python 3.10+ (only if using `ml-service`)

## Environment Setup

1. Create `.env` in the project root from `.env.example`.
2. Set safe values for your local environment (do not commit secrets).
3. Recommended local defaults:
   - `PORT=5000`
   - `CLIENT_URL=http://localhost:3001`
   - `MONGODB_URI=mongodb://127.0.0.1:27017/prospera`
4. If using Firestore features, keep a Firebase Admin SDK JSON file in root or configure `FIREBASE_SERVICE_ACCOUNT_B64`.

## Install Dependencies

From the project root:

```bash
npm run install-all
```

This installs both root and `client` dependencies.

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
- `npm run setup:firebase` - Firebase credential helper
- `npm run test:firebase` - test Firestore connection

## Notes

- `npm run seed` is defined in `package.json` but currently points to a missing file (`server/seed.js`). Update or remove it before using.
- Keep `.env` and credential files private.
- For API details, see `API_DOCUMENTATION.md`.

## Quick Troubleshooting

- Port conflict: close conflicting process or change ports in `.env`
- CORS issue: ensure `CLIENT_URL` matches frontend URL (`http://localhost:3001`)
- API connection issue: verify frontend API base URL (`REACT_APP_API_URL`) if you changed backend port

## Hosting Guide

If you deploy the app, the clean setup is:

- Frontend on Vercel
- Backend on Render
- ML service on Render or another Python host
- `.keras` model stored outside GitHub in private object storage or a private file URL

### 1) Host the backend on Render

Use the repository root as the service root and start it with `npm start`.

Set these environment variables on Render:

- `NODE_ENV=production`
- `PORT=5000`
- `MONGODB_URI=...`
- `JWT_SECRET=...`
- `CLIENT_URL=https://your-vercel-app.vercel.app`
- `FRONTEND_URL=https://your-vercel-app.vercel.app`
- `CORS_ORIGINS=https://your-vercel-app.vercel.app`
- `ML_SERVICE_URL=https://your-ml-service.onrender.com`
- `FIREBASE_SERVICE_ACCOUNT_PATH=...` or `FIREBASE_SERVICE_ACCOUNT_B64=...`

If you use Vercel preview deployments, add the preview URL to `CORS_ORIGINS` as well.

### 2) Host the frontend on Vercel

Set the Vercel project root to `client/` and use:

- Build command: `npm run build`
- Output directory: `build`

Set this environment variable in Vercel:

- `REACT_APP_API_URL=https://your-backend.onrender.com/api`

The frontend calls the backend through this URL, and the backend calls the ML service.

### 3) Host the ML service separately

The Python service should not depend on a manually started local process in production.

Set these environment variables on the ML host:

- `MODEL_PATH=/tmp/plant_disease_model.keras` or another writable path
- `MODEL_URL=https://private-storage.example.com/plant_disease_model.keras`

On startup, the ML service downloads the `.keras` file from `MODEL_URL` if it is not already present at `MODEL_PATH`.

Suggested start command:

- `uvicorn app:app --host 0.0.0.0 --port $PORT`

### 4) Storage for the model file

Do not commit `plant_disease_model.keras` to GitHub.

Use one of these instead:

- Private S3 bucket
- Cloudflare R2 private bucket
- Private Azure Blob container
- Private file URL in your hosting provider

The ML service can download the file at startup using `MODEL_URL`.

### 5) End-to-end request flow

1. User uploads an image in the Vercel frontend.
2. Frontend sends it to the Render backend using `REACT_APP_API_URL`.
3. Backend forwards the file to the hosted ML service using `ML_SERVICE_URL`.
4. ML service loads the `.keras` model and returns the prediction.
5. Backend sends the prediction back to the frontend.

### 6) What stays out of GitHub

- `.env`
- Firebase service account file
- `.keras` model file
- Any private storage credentials

### 7) Recommended production checks

- Verify backend health: `/api/health`
- Verify ML health: `/health`
- Confirm Vercel env vars are set before deploy
- Confirm Render env vars are set before deploy

---

If you want, I can next update `QUICKSTART.md` and `INSTALLATION.md` to match this README so all docs stay consistent.
