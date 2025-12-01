# 🚀 Quick Start Guide - Prospera

## Prerequisites Checklist

- [x] Node.js v18+ installed
- [x] MongoDB installed or MongoDB Atlas account
- [x] Git installed

## 🔧 Initial Setup (First Time Only)

### 1. Install All Dependencies

```powershell
cd D:\Prospera
npm run install-all
```

This installs:
- Backend dependencies (~15 packages)
- Frontend dependencies (~50 packages)

**Expected time:** 2-3 minutes

### 2. Start MongoDB

**Option A - Local MongoDB (Recommended for development):**
```powershell
# Start MongoDB service
net start MongoDB

# Or if you installed MongoDB manually
mongod
```

**Option B - MongoDB Atlas (Cloud):**
- Your `.env` already has an Atlas connection string
- Make sure the cluster is running and network access is configured

### 3. Seed Test Data

```powershell
cd D:\Prospera
npm run seed
```

This creates:
- 5 test users (farmer, buyer, expert, admin)
- 2 farms with crops and financial data
- Market listings
- Social posts and groups
- 2 courses
- 3 marketplace products
- Government schemes

**Test login credentials:**
- Farmer: `sunil@farmer.lk` / `password123`
- Expert: `nimal@expert.lk` / `password123`
- Buyer: `raj@buyer.lk` / `password123`

## 🎯 Running the Application

### Start Both Backend & Frontend

```powershell
cd D:\Prospera
npm run dev
```

This starts:
- **Backend API:** http://localhost:5000
- **Frontend React:** http://localhost:3001

**Note:** Client runs on port 3001 (not 3000) to avoid conflicts.

### Or Run Separately

**Backend only:**
```powershell
npm run server
```

**Frontend only:**
```powershell
npm run client
```

## ✅ Verify Setup

1. **Check Backend Health:**
   ```powershell
   Invoke-WebRequest http://localhost:5000/api/health
   ```
   Should return: `{"status":"OK","message":"Prospera API is running"}`

2. **Open Frontend:**
   - Navigate to: http://localhost:3001
   - You should see the login page
   - Login with test credentials

3. **Test API:**
   - After login, check browser console (F12)
   - No errors should appear
   - JWT token should be stored in localStorage

## 🐛 Troubleshooting

### MongoDB Connection Error
```
❌ MongoDB Connection Error: connect ECONNREFUSED
```
**Solution:**
- Start MongoDB: `net start MongoDB`
- Or update `MONGODB_URI` in `.env` file

### Port Already in Use (5000)
```
Error: listen EADDRINUSE :::5000
```
**Solution:**
```powershell
# Find and kill process on port 5000
$pid = (Get-NetTCPConnection -LocalPort 5000 -State Listen).OwningProcess
Stop-Process -Id $pid -Force
```

### Port Already in Use (3001)
```
Something is already running on port 3001
```
**Solution:**
```powershell
# Find and kill process on port 3001
$pid = (Get-NetTCPConnection -LocalPort 3001 -State Listen).OwningProcess
Stop-Process -Id $pid -Force
```

### Client Dependencies Error
```
Module not found: Error: Can't resolve '@mui/material'
```
**Solution:**
```powershell
cd D:\Prospera\client
npm install
```

### CORS Error in Browser Console
**Solution:**
- Check `CLIENT_URL` in `.env` matches frontend port (3001)
- Restart backend server

## 📦 What's Working Now

### ✅ Backend (100% Complete)
- All 80+ API endpoints functional
- JWT authentication
- MongoDB connection
- Socket.io real-time features ready
- File upload configured (Cloudinary)
- Email service configured

### ✅ Frontend (Core Complete)
- Login/Register pages ✅
- Authentication flow ✅
- Protected routes ✅
- Navigation menu ✅
- Dashboard page ✅
- Material-UI theme ✅
- API service layer ✅

### 🚧 In Progress
- Farm Management UI
- Market Listings UI
- Social Network UI
- Learning Hub UI
- Remaining 6 modules

## 🔑 Key Features to Test

1. **Authentication:**
   - Register new account at http://localhost:3001/register
   - Login with test account
   - Navigate between pages
   - Logout and login again

2. **Role-Based Access:**
   - Login as farmer → see "Farm Management" in menu
   - Login as buyer → see "Wholesale Market" in menu
   - Login as expert → see "AI Tools Lab" in menu

3. **Dashboard:**
   - View user stats
   - See quick action cards
   - Click cards to navigate

## 📁 Project Structure

```
Prospera/
├── server/                    # Backend
│   ├── models/               # MongoDB schemas (9 files)
│   ├── routes/               # API endpoints (11 files)
│   ├── middleware/           # Auth middleware
│   ├── utils/                # Helpers, email, upload
│   ├── index.js              # Express server
│   └── seed.js               # Test data seeder
├── client/                   # Frontend
│   └── src/
│       ├── components/       # Navbar, ProtectedRoute
│       ├── pages/            # Login, Register, Dashboard
│       ├── services/         # API service, Auth service
│       ├── context/          # AuthContext
│       ├── App.js            # Main routing
│       └── theme.js          # Material-UI theme
├── .env                      # Environment variables
└── package.json              # Root package file
```

## 🎨 Next Steps for Development

1. **Build Farm Management Module:**
   ```
   - Farm dashboard with charts
   - Crop planner
   - Expense tracker
   - Disease reporting
   ```

2. **Build Wholesale Market Module:**
   ```
   - Product listings
   - Search and filters
   - Price tracking charts
   - Contract management
   ```

3. **Build Social Network:**
   ```
   - Newsfeed with posts
   - Groups
   - Knowledge articles
   - Expert sessions
   ```

## 📝 Development Commands

```powershell
# Install all dependencies
npm run install-all

# Seed database with test data
npm run seed

# Run backend and frontend together
npm run dev

# Run backend only
npm run server

# Run frontend only
npm run client

# Build production frontend
npm run build

# Start production server
npm start
```

## 🌐 URLs

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/api/health
- **API Docs:** See `API_DOCUMENTATION.md`

## 📧 Support

- Installation Guide: `INSTALLATION.md`
- API Documentation: `API_DOCUMENTATION.md`
- Project Summary: `PROJECT_SUMMARY.md`

---

**You're all set! Start building amazing features for Sri Lankan farmers! 🌾**
