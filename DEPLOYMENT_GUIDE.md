# 🚀 Deployment Guide: Contact Form App

## 📋 Prerequisites

1. **GitHub Account**: Create account at https://github.com
2. **Vercel Account**: Sign up at https://vercel.com (use GitHub to sign in)
3. **MongoDB Atlas Account**: Create free account at https://mongodb.com/atlas

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster
1. Go to https://mongodb.com/atlas
2. Create a **Free M0 cluster**
3. Choose **AWS** and nearest region
4. Create cluster (takes 2-3 minutes)

### Step 2: Setup Database Access
1. **Database Access** → **Add New Database User**
   - Username: `contactform-user`
   - Password: Generate secure password (save it!)
   - Database User Privileges: `Read and write to any database`

2. **Network Access** → **Add IP Address**
   - Click `Allow Access from Anywhere` (for Vercel deployment)
   - Or add `0.0.0.0/0` manually

### Step 3: Get Connection String
1. **Clusters** → **Connect** → **Connect your application**
2. Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net/contactform`
3. Replace `<username>` and `<password>` with your credentials

## 📁 GitHub Repository Setup

### Step 1: Initialize Git Repository
```bash
# In your project root directory
git init
git add .
git commit -m "Initial commit: Contact form with MongoDB integration"
```

### Step 2: Create GitHub Repository
1. Go to https://github.com and click **"New repository"**
2. Repository name: `contact-form-mongodb`
3. Description: `Contact form application with MongoDB backend`
4. Set to **Public** (for free Vercel deployment)
5. Don't initialize with README (you already have files)
6. Click **Create repository**

### Step 3: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/contact-form-mongodb.git
git branch -M main
git push -u origin main
```

## 🌐 Vercel Deployment

### Option 1: Backend + Frontend (Monorepo Deployment)

1. **Import Project**:
   - Go to https://vercel.com/dashboard
   - Click **"New Project"**
   - Import your GitHub repository

2. **Configure Build Settings**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave empty)
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `cd frontend && npm install`

3. **Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/contactform
   FRONTEND_URL=https://your-app-name.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=10
   ```

4. **Deploy**: Click **Deploy**

### Option 2: Separate Backend Deployment

1. **Deploy Backend**:
   - Create new Vercel project
   - **Root Directory**: `backend`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - Add environment variables (same as above)

2. **Deploy Frontend**:
   - Create another Vercel project
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Environment Variables**:
     ```
     REACT_APP_API_URL=https://your-backend.vercel.app
     ```

## 🔧 Post-Deployment Configuration

### Update CORS in Backend
After frontend is deployed, update your backend environment variables:
```
FRONTEND_URL=https://your-frontend-app.vercel.app
```

### Verify Deployment
1. **Backend Health Check**: `https://your-backend.vercel.app/health`
2. **Frontend**: `https://your-frontend.vercel.app`
3. **Test Form Submission**: Fill and submit the contact form

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check Node.js version compatibility
   - Ensure all dependencies are in package.json
   - Check build logs in Vercel dashboard

2. **CORS Errors**:
   - Verify FRONTEND_URL environment variable
   - Check that both URLs are correct in environment variables

3. **Database Connection Issues**:
   - Verify MongoDB Atlas connection string
   - Check if IP whitelist includes 0.0.0.0/0
   - Ensure database user has correct permissions

4. **API Routes Not Working**:
   - Check vercel.json configuration
   - Verify API endpoints are accessible
   - Check Vercel function logs

### Environment Variables Checklist:
- ✅ `MONGODB_URI` - MongoDB Atlas connection string
- ✅ `FRONTEND_URL` - Your frontend Vercel URL
- ✅ `NODE_ENV=production`
- ✅ `REACT_APP_API_URL` (frontend only if separate deployment)

## 📱 Testing Production Deployment

1. **Form Submission**: Test contact form on live site
2. **Database Verification**: Check MongoDB Atlas for new documents
3. **Error Handling**: Test with invalid data
4. **Performance**: Check loading times and responsiveness

## 🔐 Security Notes

- Never commit `.env` files to GitHub
- Use environment variables for all sensitive data
- Keep MongoDB Atlas IP whitelist restricted in production
- Regularly update dependencies for security patches

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify MongoDB Atlas connection
3. Test API endpoints directly
4. Check browser console for errors

Your contact form is now deployed and ready for production use! 🎉
