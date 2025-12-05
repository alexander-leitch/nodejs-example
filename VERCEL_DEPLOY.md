# Vercel Deployment Instructions

Your frontend is ready to deploy to Vercel! Follow these quick steps:

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Sign Up / Log In
1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Find and select your `nodejs-example` repository
3. Click **"Import"**

### Step 3: Configure Project
Vercel will auto-detect Nuxt.js, but you need to configure these settings:

**Framework Preset:** Nuxt.js (auto-detected)

**Root Directory:** `frontend` ⚠️ **IMPORTANT!**

**Build Command:** `npm run build` (default, correct)

**Output Directory:** `.output/public` (default, correct)

**Install Command:** `npm install` (default, correct)

### Step 4: Environment Variables
Add this environment variable:

**Key:** `NUXT_PUBLIC_API_BASE`

**Value:** `https://nodejs-example-api.onrender.com`

(Or your actual Render API URL)

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Your app will be live! 🎉

### Step 6: Update Render CORS
After deployment, update your Render API to allow the Vercel frontend:

1. Go to Render dashboard
2. Open `nodejs-example-api` service
3. Go to **Environment**
4. Update `FRONTEND_URL` to your Vercel URL (e.g., `https://your-app.vercel.app`)
5. Save (service will auto-redeploy)

---

## Option 2: Deploy via CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy
```bash
cd frontend
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- What's your project's name? `nodejs-example-frontend` (or your choice)
- In which directory is your code located? `./` (press Enter)
- Want to override the settings? **Y**
- Build Command: `npm run build`
- Output Directory: `.output/public`
- Development Command: `npm run dev`

### Step 4: Set Environment Variable
```bash
vercel env add NUXT_PUBLIC_API_BASE production
# When prompted, enter: https://nodejs-example-api.onrender.com
```

### Step 5: Redeploy with Environment Variable
```bash
vercel --prod
```

---

## Verification

Once deployed:

1. **Visit your Vercel URL**
2. **Click "PostgreSQL Example"**
3. **Try creating a task**
4. **Verify it appears in the list**

If you get CORS errors, make sure `FRONTEND_URL` in Render matches your Vercel URL exactly.

---

## Your Deployment URLs

After deployment, you'll have:

- **Frontend:** `https://your-app.vercel.app` (assigned by Vercel)
- **Backend API:** `https://nodejs-example-api.onrender.com`
- **Database:** Managed by Render

All completely FREE! 🎉

---

## Troubleshooting

**Build fails:**
- Ensure `Root Directory` is set to `frontend`
- Check build logs in Vercel dashboard

**Can't connect to API:**
- Verify `NUXT_PUBLIC_API_BASE` environment variable
- Check Render API is online and healthy
- Ensure CORS is configured in Render

**CORS errors:**
- Update `FRONTEND_URL` in Render to match Vercel URL exactly
- Include protocol: `https://your-app.vercel.app` (no trailing slash)
