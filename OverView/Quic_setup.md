# 🚀 Quick Setup (Windows) — Prospera

This is the fastest path to get Prospera running locally on Windows using PowerShell.

## Prerequisites
- Node.js v18 or newer
- MongoDB (Local or Atlas)
- Git

## 1) Install Dependencies

```powershell
cd "D:\Projects\Academic Project\Semester 5\Software Project\Main\Prospera"
npm run install-all
```

## 2) Configure Environment

Create a `.env` file in the project root with at least:

```env
# Server
PORT=5000
NODE_ENV=development

# Database (choose one)
MONGODB_URI=mongodb://127.0.0.1:27017/prospera
# or Atlas SRV (ensure IP whitelisted)
# MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/prospera?retryWrites=true&w=majority

# Frontend URL (client runs on 3001)
CLIENT_URL=http://localhost:3001

# Auth
JWT_SECRET=change_this_to_a_strong_secret_min_32_chars
JWT_EXPIRE=30d

# Optional integrations (uncomment/config when needed)
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=...
# EMAIL_PASS=...
# STRIPE_SECRET_KEY=...
# STRIPE_PUBLISHABLE_KEY=...
# WEATHER_API_KEY=...
```

MongoDB Atlas users: if you get a connection/selection error, whitelist your IP per [docs/MONGODB_WHITELISTING.md](docs/MONGODB_WHITELISTING.md). Quick helper:

```powershell
node .\scripts\show-public-ip.js
```

## 3) (Optional) Seed Sample Data

```powershell
npm run seed
```

Creates test users, farms, listings, courses, products, schemes. Sample logins:
- Farmer: sunil@farmer.lk / password123
- Expert: nimal@expert.lk / password123
- Buyer: raj@buyer.lk / password123
- Admin: admin@prospera.lk / password123

## 4) Run Dev Servers

Start both backend and frontend together:

```powershell
npm run dev
```

- Backend API: http://localhost:5000
- Frontend: http://localhost:3001

Or run separately:

```powershell
# Backend only
npm run server

# Frontend only
npm run client
```

## 5) Verify
- API health: http://localhost:5000/api/health
- Open app: http://localhost:3001 (login page should load)

## Troubleshooting

### MongoDB connection
- Ensure `MONGODB_URI` is correct and MongoDB is running.
- Atlas: add your IP per [docs/MONGODB_WHITELISTING.md](docs/MONGODB_WHITELISTING.md).

### Start local MongoDB (if installed as a Windows service)
```powershell
Get-Service -Name MongoDB -ErrorAction SilentlyContinue
Start-Service -Name MongoDB
```

### Port in use
```powershell
# Kill process using port 5000
$pid = (Get-NetTCPConnection -LocalPort 5000 -State Listen).OwningProcess
if ($pid) { Stop-Process -Id $pid -Force }

# Kill process using port 3001
$pid = (Get-NetTCPConnection -LocalPort 3001 -State Listen).OwningProcess
if ($pid) { Stop-Process -Id $pid -Force }
```

### CORS mismatch
- Ensure `CLIENT_URL` in `.env` is `http://localhost:3001`.
- Restart `npm run server` after changes.

### Missing client packages
```powershell
cd .\client
npm install
```

## Production (basic)
```powershell
# Build frontend
npm run build

# Start server
npm start
```

Frontend build output lives in `client/build` and the backend serves APIs on port 5000.

---

For more details, see:
- [QUICKSTART.md](QUICKSTART.md)
- [INSTALLATION.md](INSTALLATION.md)
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
