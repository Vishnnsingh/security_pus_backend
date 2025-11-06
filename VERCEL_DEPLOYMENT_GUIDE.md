# Vercel Deployment Guide - GitHub से Deploy करें

## 📋 Requirements (जरूरी चीजें)

1. ✅ **GitHub Account** - Code GitHub पर push होना चाहिए
2. ✅ **Vercel Account** - [vercel.com](https://vercel.com) पर sign up करें
3. ✅ **MongoDB Atlas** - Database connection string तैयार हो
4. ✅ **Environment Variables** - सभी env vars की list तैयार हो

## 🚀 Step-by-Step Deployment (GitHub के जरिए)

### Step 1: Code को GitHub पर Push करें

```bash
# अगर पहले से git initialized नहीं है
git init
git add .
git commit -m "Ready for Vercel deployment"
git branch -M main
git remote add origin https://github.com/Bluparrot/security-plus-admin-BE.git
git push -u origin main
```

**Important**: 
- `.env` file को `.gitignore` में add करें
- Sensitive data commit न करें

### Step 2: Vercel में Login करें

1. https://vercel.com पर जाएं
2. **Sign Up** या **Log In** करें
3. GitHub account से connect करें (recommended)

### Step 3: New Project Create करें

1. Vercel Dashboard में **"New Project"** button click करें
2. **"Import Git Repository"** section में:
   - अपना GitHub repository select करें: `security-plus-admin-BE`
   - **"Import"** button click करें

### Step 4: Project Configuration

Vercel automatically detect करेगा:
- **Framework Preset**: Other (Express.js)
- **Root Directory**: `./` (current)
- **Build Command**: Leave empty (Vercel auto-detect करेगा)
- **Output Directory**: Leave empty
- **Install Command**: `npm install` (auto)

**Settings में:**
- **Node.js Version**: 18.x या 20.x select करें

### Step 5: Environment Variables Add करें

**Settings** → **Environment Variables** में ये add करें:

#### Required Variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

```
JWT_SECRET=your_very_strong_secret_key_minimum_32_characters_long
```

```
JWT_EXPIRE=7d
```

```
NODE_ENV=production
```

#### Optional Variables:

```
CORS_ORIGINS=https://your-frontend-domain.com,https://another-domain.com
```

```
VERCEL_CUSTOM_DOMAIN=your-custom-domain.com
```

**Important Notes:**
- सभी 3 environments में add करें: **Production**, **Preview**, **Development**
- `JWT_SECRET` strong होना चाहिए (कम से कम 32 characters)
- `MONGODB_URI` में username, password, और database name सही होना चाहिए

### Step 6: Deploy करें

1. **"Deploy"** button click करें
2. Vercel automatically:
   - Dependencies install करेगा
   - Build करेगा
   - Deploy करेगा
3. Deployment complete होने पर URL मिलेगा

### Step 7: Test करें

Deployment complete होने के बाद:

1. **Health Check**:
   ```
   https://your-app-name.vercel.app/api/health
   ```
   Response:
   ```json
   {
     "success": true,
     "message": "Security Plus Admin API is running",
     "timestamp": "..."
   }
   ```

2. **Root Endpoint**:
   ```
   https://your-app-name.vercel.app/
   ```

3. **API Endpoints Test करें**:
   - `POST /api/auth/signin`
   - `GET /api/products`
   - etc.

## 🔄 Automatic Deployment (Continuous Deployment)

GitHub से connect करने के बाद:
- ✅ **Main branch** में push → **Production** में auto-deploy
- ✅ **Pull Request** create करने पर → **Preview** deployment
- ✅ **Other branches** → **Preview** deployments

## 🔧 Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ]
}
```

### CORS Configuration
`src/index.js` में automatically configured:
- ✅ Localhost URLs
- ✅ Vercel deployment URLs (automatic)
- ✅ Custom domains (via env vars)
- ✅ Preview deployments

## 📝 Post-Deployment Checklist

- [ ] Health endpoint test किया
- [ ] Root endpoint test किया
- [ ] Authentication endpoints test किए
- [ ] MongoDB connection verify किया
- [ ] CORS frontend से test किया
- [ ] Frontend में API base URL update किया
- [ ] Environment variables verify किए

## 🐛 Troubleshooting (समस्याएं और Solutions)

### Problem 1: CORS Error
**Symptoms**: Frontend से request करने पर CORS error

**Solution**:
1. Vercel Dashboard → Project → Settings → Environment Variables
2. `CORS_ORIGINS` add करें: `https://your-frontend-domain.com`
3. **Redeploy** करें

### Problem 2: MongoDB Connection Failed
**Symptoms**: API calls fail, logs में connection error

**Solution**:
1. MongoDB Atlas → Network Access
2. **Add IP Address** → `0.0.0.0/0` (सभी IPs allow)
3. Connection string verify करें
4. Username/password सही होना चाहिए

### Problem 3: Function Timeout
**Symptoms**: Long requests timeout हो जाते हैं

**Solution**:
- Free tier: 10 seconds max timeout
- Database queries optimize करें
- Pro plan upgrade करें (अगर जरूरत हो)

### Problem 4: Environment Variables Not Working
**Symptoms**: Env vars read नहीं हो रहे

**Solution**:
1. Variables add करने के बाद **Redeploy** करना जरूरी है
2. Variable names case-sensitive हैं
3. All environments (Production/Preview/Development) में add करें

### Problem 5: Build Failed
**Symptoms**: Deployment fail हो जाता है

**Solution**:
1. Vercel Dashboard → Deployments → Failed deployment → Logs check करें
2. `package.json` में dependencies verify करें
3. Node.js version check करें (18.x या 20.x recommended)

## 🌐 Custom Domain Setup

1. Vercel Dashboard → Project → **Settings** → **Domains**
2. **Add Domain** button click करें
3. Domain name enter करें (e.g., `api.yourdomain.com`)
4. DNS records add करें (Vercel instructions देगा)
5. Environment variable add करें:
   ```
   VERCEL_CUSTOM_DOMAIN=api.yourdomain.com
   ```
6. `CORS_ORIGINS` में भी add करें
7. Redeploy करें

## 📊 Monitoring & Logs

### View Logs:
1. Vercel Dashboard → Project → **Deployments**
2. Specific deployment click करें
3. **Logs** tab में देखें

### Real-time Logs:
```bash
# Vercel CLI install करें
npm install -g vercel

# Login
vercel login

# Logs देखें
vercel logs
```

## 🔐 Security Best Practices

1. ✅ **Never commit `.env` files**
2. ✅ **Use strong JWT secrets** (32+ characters)
3. ✅ **Enable MongoDB authentication**
4. ✅ **Use HTTPS only** (Vercel automatically provides)
5. ✅ **Regularly rotate secrets**
6. ✅ **Monitor API usage**
7. ✅ **Set up rate limiting** (if needed)

## 📚 Useful Commands

```bash
# Vercel CLI install
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel remove
```

## 🎯 API Endpoints After Deployment

आपका API इन URLs पर available होगा:

- **Production**: `https://your-app-name.vercel.app`
- **Health**: `https://your-app-name.vercel.app/api/health`
- **Auth**: `https://your-app-name.vercel.app/api/auth/*`
- **Products**: `https://your-app-name.vercel.app/api/products/*`
- **Auto-Import**: `https://your-app-name.vercel.app/api/auto-import/*`

## ⚠️ Important Notes

1. **Serverless Functions**: Vercel आपके Express app को serverless functions के रूप में run करता है
2. **Cold Starts**: पहली request थोड़ी slow हो सकती है (cold start)
3. **File System**: Read-only है (except `/tmp` directory)
4. **Timeouts**:
   - Hobby (Free): 10 seconds
   - Pro: 60 seconds
   - Enterprise: Custom
5. **Database**: MongoDB connection pooling use करें serverless के लिए

## 📞 Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Community**: https://github.com/vercel/vercel/discussions
- **Project Logs**: Vercel Dashboard में available
- **Status Page**: https://vercel-status.com

---

## ✅ Quick Checklist

Deployment से पहले:
- [ ] Code GitHub पर push हो गया
- [ ] `.env` file `.gitignore` में है
- [ ] `vercel.json` file exists
- [ ] `src/index.js` में app export हो रहा है
- [ ] CORS configured है

Deployment के बाद:
- [ ] Environment variables add किए
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Health endpoint test किया
- [ ] Frontend API URL update किया
- [ ] All endpoints test किए

---

**Happy Deploying! 🚀**

अगर कोई problem हो तो Vercel Dashboard के Logs check करें या documentation देखें।

