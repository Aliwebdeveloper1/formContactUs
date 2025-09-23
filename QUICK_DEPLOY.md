# 🚀 Quick Deploy Guide

## Step 1: MongoDB Atlas Setup (5 minutes)
1. Go to https://mongodb.com/atlas
2. Create free account → Create free M0 cluster
3. **Database Access**: Add user with read/write permissions
4. **Network Access**: Add `0.0.0.0/0` (allow all IPs)
5. **Copy connection string**: `mongodb+srv://username:password@cluster.mongodb.net/contactform`

## Step 2: GitHub Setup (2 minutes)
1. Create new repository on GitHub
2. Run these commands:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
   git push -u origin main
   ```

## Step 3: Deploy to Vercel (3 minutes)
1. Go to https://vercel.com
2. **New Project** → Import your GitHub repo
3. **Framework**: Other
4. **Root Directory**: Leave empty
5. **Build Command**: `cd frontend && npm run build`
6. **Output Directory**: `frontend/build`
7. **Add Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://your-connection-string
   FRONTEND_URL=https://your-app.vercel.app
   ```
8. **Deploy**

## Step 4: Update CORS (1 minute)
1. After deployment, copy your Vercel URL
2. Update `FRONTEND_URL` environment variable in Vercel
3. Redeploy (automatic)

## ✅ Done!
Your contact form is now live and saving data to MongoDB! 🎉

**Test your deployment:**
- Visit your Vercel URL
- Submit the contact form
- Check MongoDB Atlas for new documents
