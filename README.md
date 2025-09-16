# Catered Savers 🎯
*Personalized Deal Discovery Platform*

> **📋 For complete project context, AI rules, and technical details, see [RULES_AND_REQUIREMENTS.md](./RULES_AND_REQUIREMENTS.md)**
> 
> **🏗️ For clean project structure overview, see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start development server
node server.js

# Open http://localhost:3000
```

## 🎯 What It Does

**Catered Savers** delivers personalized weekly deals (50%+ off) from verified retailers directly to users' inboxes.

- **For Users**: Curated deals in their preferred categories
- **For Retailers**: Targeted exposure to engaged deal-seekers  
- **For Business**: Revenue through sponsored placements

## ✨ Current Features

- ✅ **User Signup**: Category-based preferences
- ✅ **Email Integration**: Mailchimp automation
- ✅ **Deal Discovery**: Automated web scraping system
- ✅ **Sponsored Products**: Monetization platform
- ✅ **Admin Dashboard**: Real-time analytics
- ✅ **Database**: Prisma + PostgreSQL

## 🏗️ Architecture

```
Frontend (HTML/CSS/JS) → Backend (Node.js/Express) → Database (Prisma)
                                    ↓
                            Deal Discovery System
                                    ↓
                            Email Automation (Mailchimp)
```

## 📊 System Status

- **Database**: 60+ deals discovered and stored
- **Categories**: 14 product categories
- **Scrapers**: Test, Amazon, Best Buy (expandable)
- **Analytics**: Click tracking and performance metrics

## 🧪 Testing

```bash
# Test deal discovery
curl -X POST http://localhost:3000/api/deal-discovery/test/fresh
curl -X POST http://localhost:3000/api/deal-discovery/run

# Check results
curl -s http://localhost:3000/api/deal-discovery/stats
```

## 📁 Key Files

- `PROJECT_CONTEXT.md` - **Master documentation & AI rules**
- `server.js` - Main backend server
- `services/` - Business logic (scrapers, analyzers, database)
- `prisma/` - Database schema and migrations
- `public/` - Frontend files
- `TECHNICAL_ROADMAP.md` - Development phases

## 🎯 Next Steps

1. **Email Automation** - Smart campaign system
2. **Analytics Dashboard** - Real-time metrics
3. **Performance Optimization** - Caching and speed

## 📞 Support

For detailed technical information, development rules, and AI context, see [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md).

---

**Ready to build the future of deal discovery!** 🚀💰# Test deployment
