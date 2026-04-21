# 🚀 Scholarium Deployment Guide

> **Recommended Stack:** Vercel (Frontend) + Railway (Backend + MySQL) + MongoDB Atlas (Logs)
> This is the simplest path to production with free tiers available on all platforms.

---

## 📦 Pre-Deployment: Prepare Your Repo

Before deploying, make sure everything is clean.

### Step 1 — Run migrations locally first

```bash
# In backend/
python manage.py migrate
```

> [!IMPORTANT]
> The new `token_blacklist` app requires a migration. Run this locally first to confirm it works, then your production migration will succeed.

### Step 2 — Generate a strong SECRET_KEY

Run this in your terminal (Python):

```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**Copy and save this output.** You'll need it in Step 6.

---

## 🗄️ Part 1: MongoDB Atlas (Logs Database)

### Step 3 — Create a free MongoDB cluster

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → **Sign Up / Log In**
2. Click **"Build a Database"** → Choose **Free (M0 Sandbox)** → **AWS** → Any region
3. Create a username and password (save these!)
4. Under **"Network Access"** → Click **"Add IP Address"** → Select **"Allow Access From Anywhere"** (`0.0.0.0/0`)
5. Go to **"Database"** → Click **"Connect"** → **"Drivers"** → Copy the connection string

It will look like:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Replace `<username>` and `<password>` with your credentials. **Save this as your `MONGO_URI`.**

---

## 🖥️ Part 2: Backend Deployment (Railway)

Railway runs your Django app + MySQL database together.

### Step 4 — Sign up and create a project

1. Go to [railway.app](https://railway.app) → **Sign in with GitHub**
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your **`Scholarium`** repository

### Step 5 — Add MySQL Database

1. In your Railway project, click **"+ New"** → **"Database"** → **"MySQL"**
2. Railway will automatically create a MySQL instance. Click on it and go to **"Variables"** tab
3. You will see: `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_HOST`, `MYSQL_PORT`. **Note these down.**

### Step 6 — Configure Backend Environment Variables

In your Railway project, click on the **Django service** → **"Variables"** tab → Add each of these:

| Variable | Value |
|---|---|
| `SECRET_KEY` | (The key you generated in Step 2) |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `yourdomain.railway.app` (Railway gives you this URL) |
| `CORS_ALLOWED_ORIGINS` | `https://your-vercel-app.vercel.app` (from Part 3) |
| `CSRF_TRUSTED_ORIGINS` | `https://your-vercel-app.vercel.app` |
| `DB_NAME` | (from Railway MySQL `MYSQL_DATABASE`) |
| `DB_USER` | (from Railway MySQL `MYSQL_USER`) |
| `DB_PASSWORD` | (from Railway MySQL `MYSQL_PASSWORD`) |
| `DB_HOST` | (from Railway MySQL `MYSQL_HOST`) |
| `DB_PORT` | (from Railway MySQL `MYSQL_PORT`) |
| `MONGO_URI` | (from MongoDB Atlas Step 3) |
| `GEMINI_API_KEY` | (your Gemini API key) |

### Step 7 — Add Procfile for deployment

Create a file named exactly `Procfile` (no extension) in the `backend/` folder:

```bash
# Create: c:\Users\saivi\Downloads\Scholarium\backend\Procfile
web: gunicorn scholarium_project.wsgi --bind 0.0.0.0:$PORT
release: python manage.py migrate --no-input
```

This tells Railway to: **run migrations automatically** on every deploy, then start the web server.

> [!TIP]
> `gunicorn` is already in your `requirements.txt` ✅

### Step 8 — Set the root directory

In Railway → your Django service → **"Settings"** tab:
- **Root Directory:** `backend`
- **Start Command:** (Railway will read from `Procfile` automatically)

---

## 🌐 Part 3: Frontend Deployment (Vercel)

### Step 9 — Sign up and import project

1. Go to [vercel.com](https://vercel.com) → **Sign in with GitHub**
2. Click **"Add New Project"** → Import your `Scholarium` repo
3. Vercel will detect it's a Vite project automatically

### Step 10 — Configure Vercel build settings

In the Vercel setup screen:

| Setting | Value |
|---|---|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### Step 11 — Add Frontend Environment Variables

In Vercel → **"Environment Variables"** section before deploying:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-railway-backend.up.railway.app/api/` |

> [!IMPORTANT]
> Replace `your-railway-backend` with the actual URL Railway gave you in Step 6. Make sure it ends with `/api/`.

### Step 12 — Deploy!

Click **"Deploy"**. Vercel will build and deploy your frontend in ~2 minutes.

---

## ✅ Part 4: Final Configuration Sync

### Step 13 — Update CORS on Railway

Now that you have your Vercel URL (e.g., `https://scholarium.vercel.app`), go back to **Railway** and update:

```
CORS_ALLOWED_ORIGINS = https://scholarium.vercel.app
CSRF_TRUSTED_ORIGINS = https://scholarium.vercel.app
```

### Step 14 — Run database migrations on production

In Railway → your Django service → click **"Deploy"** once more (or it runs automatically via Procfile).

To verify, click on the deployment log and look for:
```
Running migrations...
No migrations to apply.
```

---

## 🔍 Post-Deployment Checklist

Test these URLs in your browser after deployment:

```
✅ Frontend: https://your-app.vercel.app               → Should show Login page
✅ Backend:  https://your-backend.up.railway.app       → Should show "Scholarium Backend is Running 🚀"
✅ API:      https://your-backend.up.railway.app/api/  → Should return JSON
```

### Create your first production user

Go to your deployed frontend and **register a new account**. This confirms:
- ✅ CORS is working
- ✅ Database is connected
- ✅ JWT auth is working
- ✅ API requests are reaching the backend

---

## 🆘 Common Issues & Fixes

| Problem | Fix |
|---|---|
| `CORS error` in browser | Double-check `CORS_ALLOWED_ORIGINS` matches your exact Vercel URL (no trailing slash) |
| `500 Server Error` on login | Check `ALLOWED_HOSTS` includes your Railway domain |
| Database connection failed | Verify all `DB_*` variables match Railway MySQL exactly |
| `ImportError: no module named...` | Ensure `requirements.txt` is up to date and Railway is using `backend/` as root |
| Migrations fail | SSH into Railway shell: `python manage.py migrate` manually |

---

> [!NOTE]
> **Custom Domain:** Both Vercel and Railway support adding a custom domain (e.g., `scholarium.io`) for free. Go to each platform's **Domains** settings and follow the DNS instructions from your domain registrar.
