# Web Hosting Automation & CI/CD Pipeline
## Academic Project Evaluation Documentation
**Project:** Prospera (Haritha Bhoomi) Agriculture Platform  
**Component:** Web Hosting Automation, Windows Server Infrastructure & CI/CD Pipeline  
**Target Environment:** Windows Server (`WIN-8859K49DJ03`) | Self-Hosted GitHub Actions Runner  
**Public Host:** `http://harithabhoomi.ddns.net:8900`

---

## 1. Executive Summary

This documentation outlines the automated deployment pipeline and web hosting infrastructure implemented for the **Prospera Agriculture Platform**. The goal of this component is to provide a fully automated, continuous integration and continuous deployment (CI/CD) workflow that transitions source code changes from GitHub repository commits into a production-ready Windows Server environment with zero manual intervention.

The solution encompasses:
- **Continuous Deployment (CI/CD):** Automated multi-stage GitHub Actions pipeline running on a Windows self-hosted runner.
- **Production Server Management:** Windows Services orchestration for Node.js (`ProsperaAPI`) and Python FastAPI (`ProsperaML`).
- **Web Server & Reverse Proxy:** Internet Information Services (IIS) configured with URL Rewrite 2.0 for single-domain routing (`/` $\rightarrow$ React SPA, `/api` $\rightarrow$ Express backend, `/socket.io` $\rightarrow$ Real-time WebSocket engine).
- **Database Lifecycle Automation:** Automated Prisma ORM client generation and migration deployment to cloud PostgreSQL (Neon).
- **Post-Deploy Quality Assurance:** Automated health probes and failure recovery scripts with real-time log extraction.

---

## 2. Infrastructure & Hosting Architecture

```
                                  [ Internet / Users ]
                                           │
                         http://harithabhoomi.ddns.net:8900
                                           │
                                           ▼
                 ┌──────────────────────────────────────────────────┐
                 │       Windows Server (WIN-8859K49DJ03)           │
                 │                                                  │
                 │   Internet Information Services (IIS) : Port 8900 │
                 │   ┌──────────────────────────────────────────┐   │
                 │   │  URL Rewrite 2.0 Rules (web.config)      │   │
                 │   │   ├── /api/*       ──► localhost:5000     │   │
                 │   │   ├── /socket.io/* ──► localhost:5000     │   │
                 │   │   ├── /uploads/*   ──► localhost:5000     │   │
                 │   │   └── /* (SPA)     ──► React static build │   │
                 │   └──────────────────────────────────────────┘   │
                 │                          │                       │
                 │        ┌─────────────────┴─────────────────┐     │
                 │        ▼                                   ▼     │
                 │  ┌─────────────────────────┐   ┌───────────────┐ │
                 │  │ ProsperaAPI (Node.js)   │   │  ProsperaML   │ │
                 │  │ Port: 5000              │   │  Port: 8000   │ │
                 │  │ Managed: Windows Service│   │  Managed: Svc │ │
                 │  └───────────┬─────────────┘   └───────────────┘ │
                 │              │                                   │
                 └──────────────┼───────────────────────────────────┘
                                │ Neon Pooler (SSL)
                                ▼
                 ┌─────────────────────────────┐
                 │ Cloud PostgreSQL (Neon DB) │
                 └─────────────────────────────┘
```

### Component Breakdown:
| Component | Technology | Role & Configuration |
|---|---|---|
| **Web Server / Gateway** | IIS 10 + URL Rewrite 2.0 | Routes external traffic on port `8900` to static frontend files or backend services. |
| **Backend API** | Node.js v20+ / Express | Handles business logic, authentication, payments (Stripe), WebSockets. Runs on port `5000`. |
| **ML Engine** | Python 3.12 / FastAPI / Uvicorn | Plant disease inference and agricultural ML models. Runs on port `8000`. |
| **Frontend** | React 19 / Material-UI | Single Page Application (SPA) compiled to optimized static assets. |
| **Process Supervision** | Windows Service Manager / NSSM | Keeps Node and Python processes running as persistent background system daemons. |
| **CI/CD Agent** | GitHub Actions Runner (X64) | Self-hosted agent installed directly on the server executing automated deployments. |

---

## 3. Automated CI/CD Pipeline Workflow

The continuous deployment pipeline is defined in `.github/workflows/deploy-windows.yml` and is automatically triggered on every push to the `main` branch.

### 5-Stage Visual Workflow Pipeline (GitHub Actions UI Cards):

```
┌─────────────────────────┐     ┌─────────────────────┐     ┌───────────────────┐
│ 1. Prepare Environment  │ ──► │ 2. Sync Source Code │ ──► │ 3. Build Frontend │
│ (Stop services cleanly) │     │ (Robocopy Mirror)   │     │ (Compile React)   │
└─────────────────────────┘     └─────────────────────┘     └───────────────────┘
                                                                      │
                                ┌───────────────────────────┐         │
                                │ 5. Deploy & Verify Health │ ◄───────┴────────┐
                                │ (Health probes & logs)    │                  ▼
                                └───────────────────────────┘     ┌────────────────────────┐
                                                                  │ 4. Database & Backend  │
                                                                  │ (Prisma & Python ML)   │
                                                                  └────────────────────────┘
```

The pipeline is split into **5 distinct, dependent jobs** (`needs:`) to create a clear 5-stage visual progression graph in the GitHub Actions web interface:

1. **Card 1: `1. Prepare Environment` (`prepare_environment`)**
   - Checks out the latest commit into the runner's isolated workspace (`actions/checkout@v4`).
   - Uses native PowerShell Service Control Manager (`Stop-Service -Force`) to cleanly stop `ProsperaAPI` and `ProsperaML`.
   - Grants a 5-second cooldown for process termination and file lock release.

2. **Card 2: `2. Sync Source Code` (`sync_source`)**
   - High-performance Robocopy differential mirroring (`/MIR /R:2 /W:5`) from runner workspace to live directory `C:\Prospera`.
   - Protects critical stateful folders and secrets: `/XD .git node_modules build .venv logs` and `/XF .env`.

3. **Card 3: `3. Build Frontend` (`build_frontend`)**
   - Navigates to `C:\Prospera\client` and installs clean dependencies via `npm ci`.
   - Compiles production React bundle (`npm run build`) with injected build-time environment variables (`REACT_APP_API_URL="/api"`, `REACT_APP_SOCKET_URL="/"`, `CI="false"`).

4. **Card 4: `4. Database & Backend` (`database_and_backend`)**
   - Installs root Node.js dependencies (`npm ci` in `C:\Prospera`).
   - Generates Prisma ORM Client (`npx prisma generate`).
   - Applies database migrations to PostgreSQL/Neon (`npx prisma migrate deploy`).
   - Synchronizes Python ML virtual environment dependencies (`pip install -r requirements.txt --quiet`).

5. **Card 5: `5. Deploy & Verify Health` (`deploy_and_verify`)**
   - Starts `ProsperaML` and `ProsperaAPI` via `Start-Service`.
   - Executes automated smoke testing against `http://localhost:5000/api/health` and `http://localhost:8000/health`.
   - Automatically dumps error logs (`api-error.log` / `ml-error.log`) into the workflow console if health probes do not return HTTP 200.

---

## 4. Key Engineering Challenges & Solutions Implemented

### 1. Privilege Separation in GitHub Actions Service Runner
- **Challenge:** The runner runs under a standard service account. Attempting to manage services via `nssm.exe stop/restart` resulted in `OpenService(): Access is denied (Win32 Error 5)`.
- **Solution:** Replaced external NSSM CLI calls with native Windows PowerShell service cmdlets (`Get-Service`, `Stop-Service`, `Start-Service`) which operate through standard Windows Service Control Manager permissions.

### 2. Elimination of Windows File Locking Errors during Deployment
- **Challenge:** Python ML services lock compiled native extensions (`numpy\linalg\_umath_linalg.cp312-win_amd64.pyd`). When Robocopy attempted to mirror files, it aborted with `ERROR 5 (Access is Denied)`.
- **Solution:** Implemented structured `/XD` directory name exclusions (`/XD .git node_modules build .venv logs`) coupled with a mandatory 5-second graceful process drain period before file synchronization begins.

### 3. Remote Access vs. "Localhost" Anti-Pattern Resolution
- **Challenge:** The React frontend was hardcoded to call `http://localhost:5000/api`. When accessed remotely from mobile devices or other computers at `http://harithabhoomi.ddns.net:8900`, browsers attempted to connect to port 5000 on the *client's own device*, resulting in `net::ERR_CONNECTION_REFUSED` / `Network Error`.
- **Solution:** 
  1. Configured the React app in production to use relative URLs (`baseURL: '/api'` and Socket.IO `/`).
  2. Implemented IIS URL Rewrite rules in `web.config` to reverse proxy `/api/*` and `/socket.io/*` internally to `localhost:5000`. This completely eliminated CORS constraints and enabled universal remote access from any internet connection.

### 4. Reverse Proxy IP Resolution Behind IIS (Rate Limiter Fix)
- **Challenge:** When running behind IIS as a reverse proxy, Express rate limiters crashed with `ERR_ERL_INVALID_IP_ADDRESS` on login/register routes because incoming proxy headers produced non-standard IP formats.
- **Solution:** Configured `app.set('trust proxy', 1)` in Express and implemented an IPv4/IPv6 sanitizing `clientKey` key generator across all rate limiters (`authLimiter`, `generalLimiter`, `writeLimiter`).

---

## 5. Security & Configuration Best Practices

- **Zero-Secret Codebase:** Database credentials, JWT secrets, Cloudinary tokens, and Stripe secret keys reside strictly inside the host machine's `C:\Prospera\.env` and are never committed to version control.
- **Environment Isolation:** Clean split between development (`client/.env.development`) and production (`client/.env.production`).
- **HTTP Security Headers:** Integrated `helmet` middleware enforcing strict referrer policies, DNS prefetch controls, and frameguard protections.
- **Multi-Tier Rate Limiting:**
  - `authLimiter`: 50 attempts per 15 minutes to eliminate credential brute-forcing.
  - `writeLimiter`: 100 write operations per minute.
  - `generalLimiter`: 2000 requests per 15 minutes.

---

## 6. Operational & Maintenance Guide

For maintenance on the Windows Server host, the following PowerShell commands can be executed:

```powershell
# Check service status
Get-Service ProsperaAPI, ProsperaML

# Inspect real-time server output logs
Get-Content C:\Prospera\logs\api-output.log -Tail 30 -Wait

# Inspect backend error logs
Get-Content C:\Prospera\logs\api-error.log -Tail 30

# Manually restart services
Restart-Service -Name ProsperaAPI
Restart-Service -Name ProsperaML

# Verify API health via terminal
Invoke-RestMethod -Uri "http://localhost:5000/api/health"
```

---

## 7. Conclusion & Academic Value

This project component delivers a production-grade DevOps implementation for an enterprise agriculture platform. By uniting GitHub Actions self-hosted automation, Windows Service orchestration, IIS reverse proxying, and cloud database migrations, the deployment pipeline achieves continuous delivery, zero configuration drift, and robust fault resilience suitable for real-world production evaluation.
