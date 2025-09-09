# Catered Savers - Rules & Requirements
*Complete consolidated documentation for AI assistants, team members, and project management*

---

## 🎯 **Project Vision & Mission**

**Catered Savers** is a deal aggregation platform that delivers personalized weekly deals (50%+ off) from verified retailers directly to users' inboxes.

### **Core Value Proposition**
- **For Users**: Curated, high-quality deals in their preferred categories
- **For Retailers**: Targeted exposure to engaged deal-seekers
- **For Business**: Revenue through sponsored placements and affiliate commissions

### **Target Market**
- Deal-seeking consumers (ages 25-45, middle to upper-middle income)
- E-commerce retailers seeking customer acquisition
- Affiliate marketers and deal aggregation businesses

---

## 🤖 **AI Assistant Rules & Workflow**

### **1. GitHub Sync Protocol** 🔄
**MANDATORY**: After any significant changes, always:
```bash
# Check git status
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: [brief description of changes]"

# Push to GitHub
git push origin main
```

**When to Sync:**
- ✅ After completing any feature or fix
- ✅ After updating documentation
- ✅ After making architectural changes
- ✅ At the end of each development session
- ✅ Before switching to a new task

**Commit Message Format:**
```
feat: add email automation system
fix: resolve deal scraper timeout issues
docs: update project context with new decisions
refactor: consolidate documentation files
test: add fresh test scraper for validation
```

### **2. Memory System** 🧠
**When user says "remember this..." or similar:**

1. **Capture the information** in this file under "User Memories"
2. **Update relevant section** based on content type
3. **Git commit** the memory update

**Memory Categories:**
- **Decisions**: Technical choices, business rules
- **Preferences**: UI/UX preferences, workflow preferences  
- **Context**: Project vision, goals, constraints
- **Rules**: Development rules, testing requirements

### **3. Session Management** 📋
**At start of each session:**
1. Read this document for quick context
2. Check current project status
3. Review any new rules/memories
4. Check if server is running: `ps aux | grep "node server.js"`

**At end of each session:**
1. Update this document with any changes
2. Add new memories if applicable
3. **Git commit and push** all changes
4. Update todos if applicable

### **4. Development Workflow** 🛠️
**Before making changes:**
- Check server status
- Test current functionality
- Plan the changes
- Update relevant documentation

**After making changes:**
- Test the changes
- Update documentation
- Add to memory if significant
- Git commit and push

---

## 🧠 **User Memories & Preferences**

### **UI/UX Preferences**
- **Logo Design**: User prefers sleek, professional logos that are memorable like Coca-Cola. Current envelope + price tag SVG logo is approved and working well.
- **Success Page**: User prefers "tightened up" appearance with reduced padding and font sizes for better visual hierarchy.
- **Sponsored Products**: User wants 4 total sponsored product slots on the success page for monetization.
- **Design Style**: User prefers modern, HubSpot-inspired design with clean, minimal aesthetics.

### **Technical Preferences**
- **Database**: PostgreSQL for all environments (local development and production)
- **Testing**: Always use fresh test scraper to avoid duplicate deal issues when demonstrating functionality
- **Documentation**: Prefer centralized, clean documentation over scattered files
- **Deployment**: Railway platform preferred for production deployment

### **Business Rules**
- **Deal Threshold**: Only show deals that are 50%+ off - NO EXCEPTIONS
- **Deal Quality**: All captured deals must be 50% off or more - we should not see deals lower than this threshold
- **Categories**: 14 product categories are established and working
- **Monetization**: Sponsored products are primary revenue stream
- **Email**: Mailchimp integration is working and preferred
- **User Data**: When users enter email, name, and select categories, we save them in BOTH Mailchimp AND our internal database
- **Domain**: Custom domain `cateredsavers.com` is active and preferred over Railway subdomains

### **Development Rules**
- **Weekly Automation**: Manual control preferred for MVP (no cron jobs)
- **Admin Interface**: Clean, organized admin panel with logical button ordering
- **Testing**: Step-by-step testing plan execution, one scenario at a time
- **Production**: Platform should be accessible to external testers

---

## 🏗️ **Current Architecture & Technology Stack**

### **Technology Stack**
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (all environments)
- **ORM**: Prisma
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Email**: Mailchimp API integration
- **Scraping**: Puppeteer + custom scrapers (removed for production)
- **Deployment**: GitHub + Railway
- **Domain**: `cateredsavers.com` (custom domain)

### **Key Features Implemented**
- ✅ User signup with category preferences
- ✅ Mailchimp email list integration
- ✅ Sponsored products monetization
- ✅ Admin dashboard with affiliate management
- ✅ Deal discovery automation system
- ✅ Database with Prisma ORM
- ✅ Web scraping infrastructure
- ✅ Personalized deals with token-based access
- ✅ SSL certificate and security headers
- ✅ Affiliate link system with admin interface

---

## 📊 **Current System Status**

### **Database Schema (Prisma)**
```prisma
// Core entities implemented
- Category (14 categories)
- Retailer (verified retailers per category)
- User (email + preferences + accessToken)
- SponsoredProduct (monetization + affiliate tracking)
- AnalyticsEvent (tracking)
- EmailCampaign (automation)
- AdminUser (admin access)
```

### **API Endpoints**
```
Frontend:
- GET / (landing page)
- GET /admin.html (admin dashboard)
- GET /deals (personalized deals page)

API:
- POST /api/submit-savings (user signup)
- GET /api/categories (category data)
- GET /api/sponsored-products (monetization)
- POST /api/track-sponsored-click (analytics)
- GET /api/deals/personalized/:token (personalized deals)

Admin:
- GET /api/admin/users (user management)
- GET /api/admin/analytics (dashboard data)
- GET /api/admin/clicks (click analytics)
- GET /api/admin/sponsored-products (product management)
- POST /api/admin/update-affiliate (affiliate ID updates)
- DELETE /api/admin/users/:userId (user deletion)

Mailchimp:
- GET /api/mailchimp/users (subscriber sync)
```

### **Deal Discovery System**
- **Scrapers**: Test, Fresh Test, Amazon, Best Buy
- **Analysis**: Validation, scoring, deduplication, categorization
- **Storage**: Automatic database integration
- **Status**: ✅ Fully functional with 60+ deals in database

---

## 🔗 **Affiliate System & Monetization**

### **Affiliate Programs Supported**
- **Amazon Associates**: `?tag=YOUR_ID` format
- **Best Buy**: `?affiliate=YOUR_ID` format
- **Nike**: `?affiliate=YOUR_ID` format
- **Williams Sonoma**: `?affiliate=YOUR_ID` format
- **Carter's**: `?affiliate=YOUR_ID` format

### **Admin Management**
- **Affiliate ID Editor**: Modal interface for updating affiliate IDs
- **URL Builder**: Automatic affiliate URL generation
- **Click Tracking**: Analytics for affiliate performance
- **Product Management**: Easy affiliate ID assignment

### **Revenue Streams**
1. **Sponsored Products**: Monthly fees from retailers
2. **Affiliate Commissions**: Percentage of sales from affiliate links
3. **Premium Features**: Future expansion opportunities

---

## 🧪 **Testing & Quality Assurance**

### **Testing Plan**
1. **User Signup Flow**: Email submission, category selection, database storage
2. **Mailchimp Integration**: User sync, email sending, merge fields
3. **Personalized Deals**: Token generation, page access, content display
4. **Admin Panel**: User management, analytics, affiliate management
5. **Affiliate System**: URL generation, click tracking, commission tracking

### **Quality Standards**
- **Deal Threshold**: 50%+ off only
- **User Experience**: Smooth, professional interface
- **Performance**: Fast loading, responsive design
- **Security**: SSL encryption, secure tokens
- **Data Integrity**: Consistent database state

---

## 🚀 **Production & Deployment**

### **Current Deployment**
- **Platform**: Railway
- **Domain**: `cateredsavers.com`
- **SSL**: Let's Encrypt certificate active
- **Database**: PostgreSQL
- **Environment**: Production-ready

### **Deployment Checklist**
- ✅ Custom domain configured
- ✅ SSL certificate active
- ✅ Database migrations complete
- ✅ Environment variables set
- ✅ Mailchimp integration working
- ✅ Affiliate system functional

### **Monitoring & Maintenance**
- **Health Check**: `/health` endpoint for system status
- **Error Logging**: Comprehensive error tracking
- **Performance**: Response time monitoring
- **Security**: Regular security updates

---

## 📅 **Weekly Automation & Workflow**

### **Manual Weekly Process (MVP)**
1. **Run Deal Discovery**: Execute deal discovery system
2. **Update Mailchimp**: Sync user data and preferences
3. **Send Weekly Emails**: Create and send personalized campaigns
4. **Monitor Performance**: Track opens, clicks, and conversions

### **Admin Interface**
- **Weekly Automation Tab**: Centralized control panel
- **Step-by-Step Process**: Logical button ordering
- **Status Monitoring**: Real-time system status
- **Error Handling**: Clear error messages and solutions

---

## 🎯 **Current Phase & Next Steps**

### **Current Phase**: Phase 3 (Production & Monetization) ✅
- **Custom Domain**: Active and secure
- **Affiliate System**: Built and ready for affiliate IDs
- **Production Deployment**: Live and accessible
- **SSL Security**: Properly configured

### **Next Priorities**
1. **Add Affiliate IDs**: Apply to affiliate programs and add IDs
2. **User Testing**: Test complete user flow with real users
3. **Email Campaigns**: Launch weekly automated campaigns
4. **Performance Optimization**: Monitor and improve system performance
5. **Scale Up**: Expand to more retailers and categories

---

## 📚 **File Structure & Key Locations**

### **Core Application Files**
- `server-production.js` - Main production server
- `public/` - Frontend files (HTML, CSS, JS)
- `services/` - Business logic and database services
- `prisma/` - Database schema and migrations
- `data/` - Static data (categories, sponsored products)

### **Documentation Files**
- `RULES_AND_REQUIREMENTS.md` - This consolidated document
- `README.md` - Quick start guide
- `LICENSE` - Project license

### **Configuration Files**
- `package.json` - Dependencies and scripts
- `railway.json` - Railway deployment config
- `Procfile` - Railway process definition
- `.env.example` - Environment variables template

---

## 🔄 **Maintenance & Updates**

### **Regular Tasks**
- **Weekly**: Run deal discovery and send emails
- **Monthly**: Review affiliate performance and update IDs
- **Quarterly**: Update documentation and review architecture
- **As Needed**: Security updates and bug fixes

### **Backup & Recovery**
- **Database**: Regular backups via Railway
- **Code**: GitHub version control
- **Configuration**: Environment variables documented
- **Deployment**: Railway automatic deployments

---

## 📞 **Support & Contact**

### **For AI Assistants**
- **Context**: Read this document for complete project understanding
- **Rules**: Follow AI workflow and memory system
- **Updates**: Keep this document current with changes
- **GitHub**: Always commit and push changes

### **For Team Members**
- **Onboarding**: Read this document for project overview
- **Development**: Follow established workflow and rules
- **Testing**: Use testing plan for quality assurance
- **Deployment**: Follow production checklist

---

*Last Updated: September 1, 2025*
*Version: 1.0 - Consolidated Documentation*
