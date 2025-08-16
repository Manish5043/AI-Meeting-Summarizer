# Deployment Guide - AI Meeting Summarizer

This guide will walk you through deploying both the backend and frontend of the AI Meeting Summarizer application.

## Prerequisites

- GitHub account
- Hugging Face API key from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
- MongoDB Atlas account (free tier available)
- Gmail account for email functionality

## Step 1: Backend Deployment (Railway - Recommended)

### 1.1 Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with your GitHub account

### 1.2 Deploy Backend
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Set the following environment variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meeting-summarizer
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   PORT=5000
   ```

### 1.3 Get Backend URL
- Railway will provide you with a URL like: `https://your-app-name.railway.app`
- Copy this URL for the next step

## Step 2: Frontend Deployment (Vercel)

### 2.1 Create Vercel Account
- Go to [vercel.com](https://vercel.com)
- Sign up with your GitHub account

### 2.2 Deploy Frontend
1. Click "New Project"
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/build`
4. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```
5. Click "Deploy"

## Step 3: Update Frontend API Configuration

After deployment, you need to update the frontend to use your deployed backend:

### 3.1 Update API Base URL
In `client/src/App.js`, update the axios calls to use the environment variable:

```javascript
// Add this at the top of the file
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Update all axios calls to use the base URL
const response = await axios.post(`${API_BASE_URL}/api/summarize`, {
  // ... rest of the code
});
```

### 3.2 Redeploy Frontend
- Commit and push your changes
- Vercel will automatically redeploy

## Alternative Deployment Options

### Backend Alternatives

#### Heroku
1. Create account at [heroku.com](https://heroku.com)
2. Install Heroku CLI
3. Run commands:
   ```bash
   heroku create your-app-name
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set HUGGINGFACE_API_KEY=your_huggingface_key
   heroku config:set EMAIL_USER=your_email
   heroku config:set EMAIL_PASS=your_password
   git push heroku main
   ```

#### Render
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repo
4. Set environment variables
5. Deploy

### Frontend Alternatives

#### Netlify
1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repo
3. Set build command: `cd client && npm install && npm run build`
4. Set publish directory: `client/build`
5. Deploy

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `HUGGINGFACE_API_KEY` | Your Hugging Face API key | Yes |
| `EMAIL_USER` | Gmail address | Yes |
| `EMAIL_PASS` | Gmail app password | Yes |
| `PORT` | Server port (usually set by platform) | No |

## MongoDB Atlas Setup

1. Create account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create new cluster (free tier available)
3. Create database user
4. Get connection string
5. Replace `username`, `password`, and `cluster` in the connection string

## Gmail App Password Setup

1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings
3. Security → App passwords
4. Generate new app password for "Mail"
5. Use this password in `EMAIL_PASS`

## Testing Deployment

1. **Backend Health Check**: Visit `https://your-backend.railway.app/api/health`
2. **Frontend**: Visit your Vercel URL
3. **Test Features**:
   - Generate a summary
   - Edit the summary
   - Send via email

## Troubleshooting

### Common Issues

1. **CORS Errors**: Backend should have CORS enabled (already configured)
2. **API Not Found**: Check if backend URL is correct in frontend
3. **MongoDB Connection**: Verify connection string and network access
4. **Email Not Sending**: Check Gmail app password and 2FA settings

### Debug Steps

1. Check Railway/Heroku logs for backend errors
2. Check Vercel/Netlify build logs for frontend issues
3. Verify environment variables are set correctly
4. Test API endpoints individually

## Cost Estimation

- **Railway**: Free tier available, then $5/month
- **Vercel**: Free tier available, then $20/month
- **MongoDB Atlas**: Free tier available, then $9/month
- **Hugging Face**: Free tier available, very affordable

## Security Notes

1. Never commit `.env` files
2. Use environment variables for all sensitive data
3. Enable CORS only for your frontend domain
4. Use HTTPS in production
5. Regularly rotate API keys

## Support

If you encounter issues:
1. Check the logs in your deployment platform
2. Verify all environment variables are set
3. Test locally first
4. Open an issue in the GitHub repository

