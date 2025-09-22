# Quick Start Guide

## Prerequisites Installation

### 1. Install Node.js
Download and install Node.js from: https://nodejs.org/

### 2. Install MongoDB

**Option A: MongoDB Community Server (Local)**
1. Download from: https://www.mongodb.com/try/download/community
2. Install and start the MongoDB service
3. Default connection: `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Sign up at: https://www.mongodb.com/atlas
2. Create a free cluster
3. Get your connection string
4. Update `backend/.env` with your connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/contactform
   ```

## Running the Application

### Method 1: Automatic Installation (Windows)
```cmd
# Run the installation script
install.bat
```

### Method 2: Manual Installation

**Step 1: Install Dependencies**
```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

**Step 2: Start the Application**

Open **TWO** separate terminals:

**Terminal 1 - Backend Server:**
```bash
cd backend
npm start
```
Server runs on: http://localhost:5000

**Terminal 2 - Frontend Application:**
```bash
cd frontend
npm start
```
Application runs on: http://localhost:3000

## Verification

1. **Backend Health Check**: Visit http://localhost:5000/api/health
2. **Frontend**: Visit http://localhost:3000
3. **Test Form**: Fill out and submit the contact form
4. **Check Database**: Use MongoDB Compass or your database tool to verify data is saved

## Troubleshooting

### Port Already in Use
- Change `PORT=5001` in `backend/.env`
- Update proxy in `frontend/package.json` to `"proxy": "http://localhost:5001"`

### MongoDB Connection Issues
- Ensure MongoDB is running: `net start MongoDB` (Windows)
- Check connection string in `backend/.env`
- For Atlas: Verify IP whitelist and credentials

### CORS Errors
- Ensure both servers are running
- Check `FRONTEND_URL` in `backend/.env`

## Features Overview

✅ **Single-page contact form** with name, email, subject, message  
✅ **Math captcha** for spam protection  
✅ **Form validation** (client and server-side)  
✅ **MongoDB integration** - saves all form submissions  
✅ **Rate limiting** - prevents spam (10 requests per 15 minutes)  
✅ **Responsive design** - works on mobile and desktop  
✅ **Error handling** - user-friendly error messages  
✅ **Security features** - input sanitization, CORS, helmet  

## Next Steps

- Customize the styling in `frontend/src/index.css`
- Add email notifications (using nodemailer)
- Add admin dashboard to view submissions
- Deploy to production (Heroku, Vercel, etc.)
- Add more form fields as needed
- Implement Google reCAPTCHA for better security