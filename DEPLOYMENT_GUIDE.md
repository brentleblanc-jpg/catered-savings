# 🚀 Catered Savers Deployment Guide

## 📋 **Deployment Pipeline Overview**

### **Environment Structure:**
```
Local Development → Staging → Production
     ↓                ↓          ↓
   localhost:3000  staging.cateredsavers.com  cateredsavers.com
```

## 🔄 **Recommended Workflow**

### **1. Development Phase**
```bash
# Work on features locally
git checkout -b feature/your-feature-name
# Make changes, test locally
npm run dev  # or node server.js
```

### **2. Staging Deployment (Testing)**
```bash
# Merge feature to staging
git checkout staging
git merge feature/your-feature-name
git push origin staging

# Railway will auto-deploy to staging environment
# Test at: https://staging.cateredsavers.com
```

### **3. Production Deployment (Live)**
```bash
# After staging tests pass, merge to main
git checkout main
git merge staging
git push origin main

# Railway will auto-deploy to production
# Live at: https://cateredsavers.com
```

## 🛠️ **Railway Environment Setup**

### **Staging Environment:**
- **Branch**: `staging`
- **URL**: `staging.cateredsavers.com` (or Railway subdomain)
- **Purpose**: Test new features before production
- **Database**: Separate staging database

### **Production Environment:**
- **Branch**: `main`
- **URL**: `cateredsavers.com`
- **Purpose**: Live customer-facing site
- **Database**: Production database

## 📝 **Deployment Checklist**

### **Before Staging:**
- [ ] Code tested locally
- [ ] No console errors
- [ ] Database migrations ready
- [ ] Environment variables configured

### **Before Production:**
- [ ] Staging tests passed
- [ ] All features working in staging
- [ ] Performance acceptable
- [ ] No breaking changes
- [ ] Backup production database

## 🔧 **Environment Variables**

### **Staging (.env.staging):**
```env
NODE_ENV=staging
DATABASE_URL=postgresql://staging-db-url
MAILCHIMP_API_KEY=staging-key
MAILCHIMP_SERVER_PREFIX=us13
MAILCHIMP_LIST_ID=staging-list-id
```

### **Production (.env.production):**
```env
NODE_ENV=production
DATABASE_URL=postgresql://production-db-url
MAILCHIMP_API_KEY=production-key
MAILCHIMP_SERVER_PREFIX=us13
MAILCHIMP_LIST_ID=production-list-id
```

## 🚨 **Emergency Rollback**

### **Quick Rollback:**
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

### **Database Rollback:**
```bash
# Run previous migration
npx prisma migrate reset
npx prisma db push
```

## 📊 **Monitoring & Health Checks**

### **Health Check Endpoints:**
- Staging: `https://staging.cateredsavers.com/health`
- Production: `https://cateredsavers.com/health`

### **Key Metrics to Monitor:**
- Response times
- Error rates
- Database connections
- Memory usage
- Affiliate link functionality

## 🔐 **Security Considerations**

### **Staging:**
- Use test API keys
- Separate database
- No real customer data
- Can be less secure for testing

### **Production:**
- Use production API keys
- Secure database
- Real customer data
- SSL certificates required
- Security headers enabled

## 📞 **Support & Troubleshooting**

### **Common Issues:**
1. **Environment Variables**: Check Railway dashboard
2. **Database**: Verify connection strings
3. **Mailchimp**: Confirm API keys are active
4. **Affiliate Links**: Test with real Amazon IDs

### **Debug Commands:**
```bash
# Check environment
curl https://cateredsavers.com/health

# Test affiliate links
curl "https://cateredsavers.com/api/sponsored-products"

# Check database
npx prisma studio
```

---

## 🎯 **Quick Commands Reference**

```bash
# Start development
npm run dev

# Deploy to staging
git checkout staging && git merge main && git push origin staging

# Deploy to production
git checkout main && git push origin main

# Check deployment status
curl https://cateredsavers.com/health
```

---

*Last Updated: September 3, 2025*
*Version: 1.0 - Professional Deployment Pipeline*
