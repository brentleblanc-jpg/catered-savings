# 🚀 Production Deployment Guide

## Overview
This guide will help you deploy Catered Sales to production with external access for testers.

## 🎯 Deployment Options

### Option 1: Railway (Recommended - Easy & Modern)
- **Free tier**: 500 hours/month
- **Automatic deployments** from GitHub
- **Built-in PostgreSQL** database
- **Custom domains** support
- **SSL certificates** included

### Option 2: Heroku (Classic Choice)
- **Free tier**: Discontinued (paid plans only)
- **Easy deployment** with Git
- **Add-ons** for database and services
- **Custom domains** available

### Option 3: Vercel (Frontend-focused)
- **Free tier**: Generous limits
- **Serverless functions** for API
- **Automatic deployments**
- **Global CDN**

## 🚀 Railway Deployment (Step-by-Step)

### Step 1: Prepare Repository
```bash
# Ensure all files are committed
git add .
git commit -m "feat: Add production deployment configuration"
git push origin main
```

### Step 2: Deploy to Railway
1. **Visit**: https://railway.app
2. **Sign up** with GitHub account
3. **Click**: "New Project"
4. **Select**: "Deploy from GitHub repo"
5. **Choose**: Your `catered-savings` repository
6. **Railway will automatically**:
   - Detect Node.js project
   - Install dependencies
   - Build the application
   - Deploy to production

### Step 3: Configure Environment Variables
In Railway dashboard, go to **Variables** tab and add:

```env
NODE_ENV=production
MAILCHIMP_API_KEY=your_production_api_key
MAILCHIMP_SERVER_PREFIX=us13
MAILCHIMP_LIST_ID=your_production_list_id
JWT_SECRET=your_super_secure_jwt_secret
```

### Step 4: Set Up Database
1. **Add PostgreSQL** service in Railway
2. **Copy DATABASE_URL** from PostgreSQL service
3. **Add to Variables**:
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

### Step 5: Run Database Migrations
Railway will automatically run `npx prisma generate` during build.

## 🌐 Custom Domain Setup

### Step 1: Get Domain
- **Purchase domain** (Namecheap, GoDaddy, etc.)
- **Or use Railway subdomain** (free)

### Step 2: Configure DNS
- **Add CNAME record**: `www` → `your-app.railway.app`
- **Add A record**: `@` → Railway IP (provided in dashboard)

### Step 3: Enable SSL
- **Railway automatically** provides SSL certificates
- **HTTPS enabled** by default

## 🧪 Tester Access Setup

### Step 1: Share Production URL
```
https://your-app.railway.app
```

### Step 2: Create Tester Accounts
1. **Visit production site**
2. **Sign up** with test email addresses
3. **Select categories** for testing
4. **Verify** email confirmation works

### Step 3: Test Weekly Automation
1. **Access admin panel**: `https://your-app.railway.app/admin`
2. **Run deal discovery**
3. **Update Mailchimp**
4. **Send test emails**

## 📊 Monitoring & Logs

### Railway Dashboard
- **Real-time logs**
- **Performance metrics**
- **Error tracking**
- **Deployment history**

### Health Checks
- **Endpoint**: `GET /`
- **Expected**: 200 OK response
- **Railway monitors** automatically

## 🔒 Security Checklist

### ✅ Environment Variables
- [ ] All secrets in Railway Variables (not in code)
- [ ] Production API keys configured
- [ ] Database credentials secure

### ✅ CORS Configuration
- [ ] Production domain allowed
- [ ] Development domains blocked in production

### ✅ Database Security
- [ ] PostgreSQL with SSL
- [ ] Strong passwords
- [ ] Regular backups

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check logs in Railway dashboard
# Common fixes:
npm ci --only=production
npx prisma generate
```

#### Database Connection
```bash
# Verify DATABASE_URL format
# Check PostgreSQL service is running
# Ensure migrations completed
```

#### Mailchimp Issues
```bash
# Verify API key is correct
# Check server prefix matches
# Confirm list ID exists
```

## 📈 Scaling Considerations

### Performance
- **Railway auto-scales** based on traffic
- **Database connection pooling** handled automatically
- **CDN** for static assets

### Cost Management
- **Monitor usage** in Railway dashboard
- **Upgrade plan** if needed
- **Optimize** database queries

## 🎉 Success Metrics

### Deployment Success
- [ ] Site loads at production URL
- [ ] User signup works
- [ ] Email automation functions
- [ ] Admin panel accessible
- [ ] Database operations work

### Tester Feedback
- [ ] External users can access site
- [ ] Signup process smooth
- [ ] Emails received correctly
- [ ] Personalized links work
- [ ] Mobile responsive

## 📞 Support

### Railway Support
- **Documentation**: https://docs.railway.app
- **Discord**: Railway Discord community
- **GitHub Issues**: For technical problems

### Project Support
- **GitHub Issues**: Report bugs
- **Documentation**: Check README.md
- **Testing Guide**: See TESTING_PLAN.md

---

## 🚀 Quick Start Commands

```bash
# Deploy to Railway
git push origin main

# Check deployment status
railway status

# View logs
railway logs

# Access production database
railway connect postgres
```

**Your production deployment will be live in minutes!** 🎉
