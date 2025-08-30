# Catered Savers - Project Context & AI Rules
*Master documentation for AI assistants and team members*

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

## 🏗️ **Current Architecture (As of August 2025)**

### **Technology Stack**
- **Backend**: Node.js + Express.js
- **Database**: SQLite (local dev) → PostgreSQL (production ready)
- **ORM**: Prisma
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Email**: Mailchimp API integration
- **Scraping**: Puppeteer + custom scrapers
- **Deployment**: GitHub + Railway (planned)

### **Key Features Implemented**
- ✅ User signup with category preferences
- ✅ Mailchimp email list integration
- ✅ Sponsored products monetization
- ✅ Admin dashboard
- ✅ Deal discovery automation system
- ✅ Database with Prisma ORM
- ✅ Web scraping infrastructure

---

## 📊 **Current System Status**

### **Database Schema (Prisma)**
```prisma
// Core entities implemented
- Category (14 categories)
- Retailer (verified retailers per category)
- User (email + preferences)
- SponsoredProduct (monetization)
- AnalyticsEvent (tracking)
- EmailCampaign (automation)
- AdminUser (admin access)
```

### **API Endpoints**
```
Frontend:
- GET / (landing page)
- GET /admin (admin dashboard)

API:
- POST /api/submit-savings (user signup)
- GET /api/categories (category data)
- GET /api/sponsored-products (monetization)
- POST /api/track-sponsored-click (analytics)

Deal Discovery:
- POST /api/deal-discovery/run (full discovery)
- POST /api/deal-discovery/test/:scraper (test scraper)
- GET /api/deal-discovery/status (system status)
- GET /api/deal-discovery/recent (recent deals)
- GET /api/deal-discovery/stats (statistics)

Admin:
- GET /api/admin/clicks (click analytics)
- GET /api/admin/analytics (dashboard data)
```

### **Deal Discovery System**
- **Scrapers**: Test, Fresh Test, Amazon, Best Buy
- **Analysis**: Validation, scoring, deduplication, categorization
- **Storage**: Automatic database integration
- **Status**: ✅ Fully functional with 60+ deals in database

---

## 🤖 **AI Assistant Rules & Context**

### **Project Context for AI Sessions**
When starting a new AI session, this document provides essential context:

1. **Current Phase**: Phase 2 (Automation Engine) - Deal Discovery System ✅ Complete
2. **Next Priority**: Email Automation or Analytics Dashboard
3. **Database**: SQLite local dev, PostgreSQL production-ready
4. **Key Files**: 
   - `server.js` (main backend)
   - `services/` (business logic)
   - `prisma/` (database)
   - `public/` (frontend)

### **Development Rules**
- **Always check server status** before making changes
- **Test deal discovery** with fresh test scraper to avoid duplicates
- **Use Prisma** for all database operations
- **Maintain backward compatibility** with existing API endpoints
- **Update this document** when making architectural changes
- **Git commit and push** after any significant changes
- **Capture user memories** when requested (see AI_RULES_ENGINE.md)

### **Testing Commands**
```bash
# Start server
node server.js

# Test deal discovery
curl -X POST http://localhost:3000/api/deal-discovery/test/fresh
curl -X POST http://localhost:3000/api/deal-discovery/run

# Check results
curl -s http://localhost:3000/api/deal-discovery/stats
```

---

## 📈 **Business Model & Monetization**

### **Revenue Streams**
1. **Sponsored Products**: Retailers pay for featured placement
2. **Affiliate Commissions**: Earn on deal clicks
3. **Premium Subscriptions**: Early access to deals
4. **Lead Generation**: Sell qualified leads to retailers

### **Current Monetization**
- 4 sponsored product slots on success page
- Click tracking and analytics
- Category-based targeting

---

## 🚀 **Technical Roadmap Status**

### **Phase 1: Database Foundation** ✅ COMPLETE
- [x] Prisma ORM setup
- [x] Database schema design
- [x] Migration system
- [x] Seed data
- [x] Enhanced admin dashboard

### **Phase 2: Automation Engine** 🔄 IN PROGRESS
- [x] Deal discovery system
- [x] Web scraping infrastructure
- [x] Deal analysis and validation
- [ ] Email automation system
- [ ] Real-time analytics dashboard
- [ ] Performance optimization

### **Phase 3: Scale & Intelligence** 📋 PLANNED
- [ ] Machine learning integration
- [ ] Advanced personalization
- [ ] Revenue optimization

### **Phase 4: Enterprise Features** 📋 PLANNED
- [ ] Multi-brand support
- [ ] Enterprise integrations
- [ ] Advanced analytics

---

## 🔧 **Development Environment**

### **Local Setup**
```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start development
node server.js
```

### **Environment Variables**
```bash
# Required for production
MAILCHIMP_API_KEY=your_key
MAILCHIMP_SERVER_PREFIX=us13
MAILCHIMP_LIST_ID=your_list_id

# Database (auto-configured for local dev)
DATABASE_URL="file:./dev.db"
```

### **Key Directories**
```
/
├── services/           # Business logic
│   ├── scrapers/      # Deal discovery
│   ├── analyzers/     # Deal analysis
│   └── database.js    # Database service
├── prisma/            # Database schema & migrations
├── public/            # Frontend files
├── templates/         # Email templates
└── data/              # Static data files
```

---

## 📝 **Recent Changes & Decisions**

### **August 2025**
- **Logo Redesign**: Implemented envelope + price tag SVG logo
- **Database Migration**: Moved from file-based to Prisma + SQLite
- **Deal Discovery**: Built complete scraping and analysis system
- **GitHub Integration**: Set up CI/CD workflows
- **Admin Dashboard**: Enhanced with real database integration

### **Key Technical Decisions**
1. **SQLite for Local Dev**: Faster iteration, no external dependencies
2. **Prisma ORM**: Type-safe database operations
3. **Modular Scraper Architecture**: Easy to add new retailers
4. **Test Scrapers**: Mock data for reliable testing

---

## 🎯 **Immediate Next Steps**

### **Priority 1: Email Automation**
- Smart email campaigns based on user preferences
- Automated weekly digest generation
- A/B testing for email content

### **Priority 2: Analytics Dashboard**
- Real-time performance metrics
- User engagement tracking
- Revenue analytics

### **Priority 3: Performance Optimization**
- Caching implementation
- Database query optimization
- Frontend performance improvements

---

## 🚨 **Important Notes for AI Assistants**

1. **Always check if server is running** before making changes
2. **Test with fresh test scraper** to avoid duplicate deal issues
3. **Update this document** when making architectural changes
4. **Maintain API backward compatibility**
5. **Use existing database service** (`services/database.js`) for all DB operations
6. **Follow established patterns** in scraper and analyzer implementations
7. **Git commit and push** after any significant changes
8. **Capture user memories** when requested (see AI_RULES_ENGINE.md)
9. **Follow the rules engine** for consistent development workflow

---

*Last Updated: August 30, 2025*
*Next Review: After Email Automation implementation*
