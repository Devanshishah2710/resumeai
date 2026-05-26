# ResumeAI — AI-Powered Resume Builder SaaS

> Build resumes that get you hired. Powered by Claude AI, built with React + Node.js + MongoDB.

![Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Node](https://img.shields.io/badge/Node.js-20-339933?logo=node.js) ![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

- 🤖 **AI Writing** — Claude AI generates summaries, bullet points, and skill suggestions
- 📊 **ATS Optimizer** — Real-time ATS score + job description matching
- 🎨 **6 Pro Templates** — Modern, Executive, Creative, Minimal, Academic, Startup
- ⚡ **PDF Export** — Pixel-perfect PDF via Puppeteer
- 🔐 **JWT Auth** — Secure login with access + refresh tokens
- 📱 **Fully Responsive** — Works on all devices
- 🌙 **Dark UI** — Glassmorphism design system

---

## 🗂️ Project Structure

```
resumeai/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   │   ├── authController.js
│   │   │   ├── resumeController.js
│   │   │   ├── aiController.js
│   │   │   ├── pdfController.js
│   │   │   └── userController.js
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── User.js
│   │   │   └── Resume.js
│   │   ├── routes/             # Express routers
│   │   │   ├── auth.js
│   │   │   ├── resumes.js
│   │   │   ├── ai.js
│   │   │   ├── pdf.js
│   │   │   ├── templates.js
│   │   │   └── users.js
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT protect middleware
│   │   │   └── errorHandler.js
│   │   ├── utils/
│   │   │   ├── database.js     # MongoDB connection
│   │   │   └── jwt.js          # Token helpers
│   │   └── server.js           # Express app entry
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
│
├── frontend/                   # React 18 SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.js     # Landing page
│   │   │   ├── AuthPage.js     # Login / Register
│   │   │   ├── DashboardPage.js
│   │   │   ├── BuilderPage.js  # Full resume editor
│   │   │   ├── TemplatesPage.js
│   │   │   └── ProfilePage.js
│   │   ├── context/
│   │   │   ├── AuthContext.js  # Global auth state
│   │   │   └── ResumeContext.js # Builder state
│   │   ├── utils/
│   │   │   └── api.js          # Axios + interceptors
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── Navbar.js
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.js
│   │   └── index.js
│   ├── public/index.html
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .env.example
│   └── package.json
│
├── .github/workflows/deploy.yml  # CI/CD pipeline
├── docker-compose.yml
├── render.yaml
├── vercel.json
├── .gitignore
└── package.json
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Anthropic API key

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/resumeai.git
cd resumeai
npm run install:all
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/resumeai
JWT_SECRET=your_super_secret_32char_key_here
JWT_REFRESH_SECRET=another_super_secret_key_here
ANTHROPIC_API_KEY=sk-ant-api03-...
FRONTEND_URL=http://localhost:3000
```

### 3. Configure Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB (if local)

```bash
mongod
# or with brew: brew services start mongodb-community
```

### 5. Run

```bash
# From root — starts both frontend + backend
cd resumeai
npm run dev

# Backend  → http://localhost:5000
# Frontend → http://localhost:3000
# API docs → http://localhost:5000/api/health
```

---

## 🐳 Docker (Full Stack)

```bash
# Copy and fill environment
cp backend/.env.example backend/.env
# Edit backend/.env with your keys

# Start everything
docker-compose up --build

# Stop
docker-compose down
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET  | `/api/auth/me` | Get current user |

### Resumes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/resumes` | List all resumes |
| POST | `/api/resumes` | Create resume |
| GET  | `/api/resumes/:id` | Get resume |
| PUT  | `/api/resumes/:id` | Update resume |
| DELETE | `/api/resumes/:id` | Soft delete |
| POST | `/api/resumes/:id/duplicate` | Duplicate |

### AI
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/summary` | `{name, title, experience, skills}` | Generate summary |
| POST | `/api/ai/bullets` | `{role, company, description}` | Generate bullets |
| POST | `/api/ai/skills` | `{title, existingSkills}` | Suggest skills |
| POST | `/api/ai/ats-check` | `{resume, jobDescription}` | ATS analysis |
| POST | `/api/ai/cover-letter` | `{resume, jobTitle, company}` | Cover letter |

### PDF
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pdf/generate/:resumeId` | Download PDF |

---

## ☁️ Deployment Guide

### Option A: Render (Backend) + Vercel (Frontend) ← Recommended Free Tier

#### Step 1 — MongoDB Atlas (Free Database)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free cluster
2. Create a database user (remember username + password)
3. Whitelist IP: `0.0.0.0/0` (allow all for cloud deploy)
4. Copy connection string: `mongodb+srv://user:pass@cluster.mongodb.net/resumeai`

#### Step 2 — Deploy Backend to Render
1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Set these values:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=<generate 32 char random string>
   JWT_REFRESH_SECRET=<another random string>
   ANTHROPIC_API_KEY=sk-ant-api03-...
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Deploy → copy your Render URL (e.g. `https://resumeai-backend.onrender.com`)

#### Step 3 — Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Set:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
3. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://resumeai-backend.onrender.com/api
   ```
4. Deploy → your app is live!

#### Step 4 — Update CORS
Go back to Render → Environment Variables → update:
```
FRONTEND_URL=https://your-actual-vercel-url.vercel.app
```

---

### Option B: Railway (Full Stack, Easiest)
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Add MongoDB plugin
3. Set all env vars
4. Deploy — Railway handles everything automatically

---

## 🔧 GitHub Actions CI/CD Setup

After deploying, add these secrets to GitHub (Settings → Secrets → Actions):

```
REACT_APP_API_URL       → your Render backend URL
VERCEL_TOKEN            → from vercel.com/account/tokens
VERCEL_ORG_ID           → from .vercel/project.json
VERCEL_PROJECT_ID       → from .vercel/project.json
RENDER_API_KEY          → from render.com/u/settings#api-keys
RENDER_SERVICE_ID       → from your Render service URL
```

Every push to `main` will:
1. Build and verify the frontend
2. Lint the backend
3. Auto-deploy both to production

---

## 🔑 Generating Secure Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run twice — use first output for `JWT_SECRET`, second for `JWT_REFRESH_SECRET`.

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Framer Motion |
| Styling | Custom CSS, Glassmorphism, CSS animations |
| State | Context API (AuthContext + ResumeContext) |
| HTTP | Axios with token refresh interceptor |
| Backend | Node.js 20, Express 4 |
| Database | MongoDB 7 + Mongoose 8 |
| Auth | JWT (access + refresh tokens), bcryptjs |
| AI | Anthropic Claude API (claude-sonnet-4) |
| PDF | Puppeteer (headless Chromium) |
| Notifications | React Hot Toast |
| CI/CD | GitHub Actions |
| Deploy | Vercel (frontend) + Render (backend) |

---

## 📄 License

MIT — free to use, modify, and deploy.

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request
