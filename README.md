# Prospera

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

From a new terminal:

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

---

If you want, I can next update `QUICKSTART.md` and `INSTALLATION.md` to match this README so all docs stay consistent.
