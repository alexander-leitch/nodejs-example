# Deployment Guide

This guide walks you through deploying the Node.js Database Example to free hosting services.

## 🌐 Deployment Architecture

**Frontend:** Vercel (Free tier)
- Static site hosting with serverless functions
- Automatic HTTPS
- Global CDN
- Zero configuration

**Backend API:** Render.com (Free tier)
- Container hosting
- Managed PostgreSQL database
- Automatic HTTPS
- Health checks

> **Note:** MySQL is not available on free tiers. The deployed version uses PostgreSQL only, but local development still supports both databases.

## 📋 Prerequisites

1. GitHub account with your code repository
2. Render.com account (free) - [Sign up](https://render.com)
3. Vercel account (free) - [Sign up](https://vercel.com)

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Render

#### A. Create Render Account
1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub account

#### B. Deploy from Dashboard
1. Click **New +** → **Blueprint**
2. Connect your repository
3. Render will detect `render.yaml` automatically
4. Click **Apply**
5. Wait for deployment (~3-5 minutes)

#### C. Get API URL
1. Go to your deployed service
2. Copy the URL (e.g., `https://nodejs-example-api.onrender.com`)
3. Test it: Visit `https://your-api-url.onrender.com/health`

### Step 2: Deploy Frontend to Vercel

#### A. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

#### B. Deploy via Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Vercel will auto-detect Nuxt.js
5. Configure settings:
   - **Framework Preset:** Nuxt.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.output`
6. Add environment variable:
   - **Key:** `NUXT_PUBLIC_API_BASE`
   - **Value:** Your Render API URL (from Step 1C)
7. Click **Deploy**
8. Wait for deployment (~2-3 minutes)

#### C. Update Render CORS
1. Go back to Render dashboard
2. Open your API service
3. Go to **Environment**
4. Update `FRONTEND_URL` to your Vercel URL
5. Save changes (service will redeploy)

### Step 3: Setup GitHub Actions (Optional)

For automatic deployments on every push:

#### A. Get Render API Key
1. Go to Render dashboard → Account Settings
2. Click **API Keys** → **Create API Key**
3. Copy the key

#### B. Get Vercel Credentials
```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login and link project
cd frontend
vercel login
vercel link

# Get credentials
cat .vercel/project.json
```

You'll need:
- `orgId` → `VERCEL_ORG_ID`
- `projectId` → `VERCEL_PROJECT_ID`

For token:
- Go to Vercel dashboard → Settings → Tokens
- Create new token

#### C. Add GitHub Secrets
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click **New repository secret**
4. Add these secrets:
   - `RENDER_API_KEY` - Your Render API key
   - `VERCEL_TOKEN` - Your Vercel token
   - `VERCEL_ORG_ID` - From .vercel/project.json
   - `VERCEL_PROJECT_ID` - From .vercel/project.json

Now every push to `main` will:
1. Run tests
2. Deploy API to Render
3. Deploy Frontend to Vercel

## 🔧 Environment Variables Reference

### Render (Backend API)

| Variable | Value | Source |
|----------|-------|--------|
| `NODE_ENV` | `production` | Manual |
| `PORT` | `3001` | Manual |
| `POSTGRES_HOST` | Auto | From database service |
| `POSTGRES_PORT` | Auto | From database service |
| `POSTGRES_USER` | Auto | From database service |
| `POSTGRES_PASSWORD` | Auto | From database service |
| `POSTGRES_DB` | Auto | From database service |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Manual |

### Vercel (Frontend)

| Variable | Value |
|----------|-------|
| `NUXT_PUBLIC_API_BASE` | `https://your-api.onrender.com` |

## 🔍 Verifying Deployment

### Backend Health Check
```bash
curl https://your-api.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "databases": {
    "mysql": "disconnected",
    "postgresql": "connected"
  }
}
```

### Frontend Check
1. Visit your Vercel URL
2. Click on "PostgreSQL Example"
3. Create a new task
4. Verify it appears in the list

## ⚠️ Known Limitations

### Free Tier Constraints

**Render.com:**
- Services sleep after 15 minutes of inactivity
- Cold start takes ~30 seconds on first request
- 750 free hours per month (one service can run continuously)
- 1GB PostgreSQL storage

**Vercel:**
- 100GB bandwidth per month
- 100 hours build time per month
- Serverless function timeout: 10 seconds

### Database Differences

**Local Development:**
- ✅ MySQL support
- ✅ PostgreSQL support
- Runs on Docker

**Production (Deployed):**
- ❌ MySQL not available (free tier limitation)
- ✅ PostgreSQL only
- Managed database

The MySQL example page will show a notice on the deployed version explaining it's only available locally.

## 📊 Cost Breakdown

Both services are **completely free** for this project:

| Service | Plan | Cost |
|---------|------|------|
| Render.com | Free | $0/month |
| Vercel | Hobby | $0/month |
| **Total** | | **$0/month** |

## 🐛 Troubleshooting

### API Returns 503
- **Cause:** Service is sleeping (cold start)
- **Solution:** Wait 30 seconds and retry

### Frontend Can't Connect to API
- **Cause:** CORS not configured or wrong API URL
- **Solution:** 
  1. Check `NUXT_PUBLIC_API_BASE` in Vercel
  2. Check `FRONTEND_URL` in Render
  3. Ensure both are HTTPS URLs

### Database Connection Failed
- **Cause:** PostgreSQL not provisioned or wrong credentials
- **Solution:** Check Render dashboard → Database service is running

### Build Failed on Vercel
- **Cause:** Wrong build configuration or missing dependencies
- **Solution:** 
  1. Check build logs in Vercel dashboard
  2. Ensure `Root Directory` is set to `frontend`
  3. Verify `package.json` has correct scripts

### GitHub Actions Skipping Deployment
- **Cause:** Secrets not configured
- **Solution:** Add required secrets to GitHub repository settings

## 🔄 Updating After Code Changes

### Manual Updates

**Render:**
1. Push code to GitHub
2. Render auto-deploys (if auto-deploy enabled)
3. Or click "Manual Deploy" in dashboard

**Vercel:**
1. Push code to GitHub
2. Vercel auto-deploys automatically
3. Or run `vercel --prod` locally

### Automatic Updates (with GitHub Actions)

Just push to main:
```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

GitHub Actions will:
1. Run tests
2. Deploy to Render
3. Deploy to Vercel

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nuxt Deployment Guide](https://nuxt.com/docs/getting-started/deployment)

## 🎯 Next Steps

After deployment:

1. **Custom Domain:** Add your own domain to Vercel (free)
2. **Monitoring:** Set up uptime monitoring (e.g., UptimeRobot)
3. **Analytics:** Add Vercel Analytics
4. **Error Tracking:** Integrate Sentry or similar
5. **Performance:** Optimize with caching and CDN

---

**Congratulations! Your app is now live! 🚀**
