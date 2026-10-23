# Prospera - Installation & Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **A Neon PostgreSQL database** - free tier at [neon.tech](https://neon.tech) (nothing to install locally)
- **Git** - [Download](https://git-scm.com/)
- **npm** or **yarn** package manager

## Step 1: Clone the Repository

```bash
git clone https://github.com/pamudithasandaru/Prospera.git
cd Prospera
```

## Step 2: Install Dependencies

### Install Backend Dependencies
```bash
npm install
```

### Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

Or use the convenient script:
```bash
npm run install-all
```

## Step 3: Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database - Neon PostgreSQL
# DATABASE_URL = pooled endpoint (host contains "-pooler"), used at runtime
# DIRECT_URL   = direct endpoint, used by Prisma Migrate for DDL
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxxx.REGION.aws.neon.tech/neondb?sslmode=require"

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRE=30d

# Cloudinary (for image uploads) - Get free account at cloudinary.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Payment Gateway (Stripe) - Get keys from stripe.com
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# Weather API - Get free key from openweathermap.org
WEATHER_API_KEY=your_openweather_api_key

# Frontend URL
CLIENT_URL=http://localhost:3001
```

## Step 4: Database Setup

### Create a Neon project

1. Sign in at [console.neon.tech](https://console.neon.tech) and create a project.
2. Open **Connection Details** and copy both the **pooled** connection string
   (host contains `-pooler`) and the **direct** one.
3. Put them in `.env` as `DATABASE_URL` and `DIRECT_URL`.

### Create the tables

```bash
npm run db:migrate
```

This applies the Prisma schema in `prisma/schema.prisma`. Migrations run over
`DIRECT_URL` — they will fail against the pooled endpoint.

### Verify the connection

```bash
npm run db:studio
```

Prisma Studio opens at http://localhost:5555 and lists every table.

## Step 5: Seed Initial Data (Optional)

If you want to start with sample data:

```bash
npm run db:seed
```

This is idempotent — re-run it any time to restore the demo data. It creates:
- 6 users (farmers and an expert)
- 3 social posts with likes and comments, plus 3 groups
- 1 farm with crops, expenses and revenue
- 4 courses, 4 market listings, 4 marketplace products
- 3 government schemes, 3 loans, 3 support tickets

Demo login: `demo@prospera.lk` / `Prospera123!` (see `QUICKSTART.md` for the
full list of accounts).

## Step 6: Run the Application

### Development Mode (Recommended)

Run both frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- Backend API: `http://localhost:5000`
- Frontend: `http://localhost:3000`

### Production Mode

1. Build the frontend:
```bash
cd client
npm run build
cd ..
```

2. Start the server:
```bash
npm start
```

## Step 7: Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:3000
- **API Health Check:** http://localhost:5000/api/health

## Default Admin Account (After Seeding)

```
Email: admin@prospera.lk
Password: admin123456
```

**⚠️ IMPORTANT:** Change these credentials immediately in production!

## API Endpoints

All API endpoints are prefixed with `/api/`

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updateprofile` - Update profile
- `PUT /api/auth/updatepassword` - Change password

### Farm Management
- `POST /api/farm/register` - Register farm
- `GET /api/farm/my-farms` - Get user's farms
- `POST /api/farm/:id/crop` - Add crop
- `POST /api/farm/:id/expense` - Add expense
- `GET /api/farm/:id/dashboard` - Get dashboard data

### Market
- `POST /api/market/listing` - Create listing
- `GET /api/market/listings` - Get all listings
- `GET /api/market/prices` - Get price tracking
- `POST /api/market/contract` - Create export contract

### Social Network
- `POST /api/social/post` - Create post
- `GET /api/social/posts` - Get newsfeed
- `POST /api/social/group` - Create group
- `GET /api/social/articles` - Get articles

### Learning
- `GET /api/learning/courses` - Get courses
- `POST /api/learning/course/:id/enroll` - Enroll in course
- `GET /api/learning/skill-tests` - Get skill tests

### AI Tools
- `POST /api/ai-tools/disease-detection` - Detect crop disease
- `POST /api/ai-tools/yield-prediction` - Predict yield
- `POST /api/ai-tools/fertilizer-optimizer` - Get fertilizer recommendations
- `POST /api/ai-tools/market-prediction` - Predict market prices

### Marketplace
- `GET /api/marketplace/products` - Get products
- `POST /api/marketplace/product` - List product
- `POST /api/marketplace/order` - Create order

### Government
- `GET /api/government/schemes` - Get schemes
- `POST /api/government/scheme/:id/apply` - Apply for scheme
- `POST /api/government/insurance-claim` - Submit claim

### Weather
- `GET /api/weather/current` - Get current weather
- `GET /api/weather/forecast` - Get forecast
- `GET /api/weather/agricultural` - Get agricultural insights

### Support
- `POST /api/support/ticket` - Create ticket
- `GET /api/support/faqs` - Get FAQs
- `POST /api/support/chatbot/message` - Chat with bot

### FinTech
- `POST /api/fintech/loan/apply` - Apply for loan
- `GET /api/fintech/credit-score` - Get credit score
- `POST /api/fintech/lease/apply` - Apply for equipment lease

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Database Connection Error
- Check `DATABASE_URL` is the pooled Neon host and ends with `?sslmode=require`
- Neon free-tier projects suspend when idle; the first query wakes them
- Migration errors about pooling mean `DIRECT_URL` is missing or wrong
- Check MONGODB_URI in .env
- Verify firewall settings

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Clear React Cache
```bash
cd client
rm -rf node_modules/.cache
npm start
```

## Production Deployment

### Environment Variables
Set NODE_ENV=production and update all API keys and secrets

### Security Checklist
- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (minimum 32 characters)
- [ ] Enable HTTPS
- [ ] Set up CORS properly
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting
- [ ] Confirm Neon backups / point-in-time restore for the project
- [ ] Configure Cloudinary for production
- [ ] Set up monitoring and logging

### Deployment Platforms

**Heroku:**
```bash
heroku create prospera-app
git push heroku main
```

**Railway:**
```bash
railway login
railway init
railway up
```

**DigitalOcean/AWS/Azure:**
- Neon is already hosted; use a separate project or branch for production
- Deploy backend on App Platform/EC2/App Service
- Deploy frontend on CDN/Static hosting

## Support

For issues or questions:
- Create an issue on GitHub
- Email: support@prospera.lk
- Join our community Discord

## License

MIT License - See LICENSE file for details
