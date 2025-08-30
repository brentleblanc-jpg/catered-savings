# AI Rules Engine & Memory System
*Centralized rules, context, and memory for AI assistants*

## 🎯 **Core AI Rules**

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
2. **Update PROJECT_CONTEXT.md** if it's architectural
3. **Add to relevant section** based on content type
4. **Git commit** the memory update

**Memory Categories:**
- **Decisions**: Technical choices, business rules
- **Preferences**: UI/UX preferences, workflow preferences  
- **Context**: Project vision, goals, constraints
- **Rules**: Development rules, testing requirements

### **3. Session Management** 📋
**At start of each session:**
1. Read `AI_SESSION_STARTER.md` for quick context
2. Check `PROJECT_CONTEXT.md` for current status
3. Review this file for any new rules/memories
4. Check if server is running: `ps aux | grep "node server.js"`

**At end of each session:**
1. Update `PROJECT_CONTEXT.md` with any changes
2. Add new memories to this file
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

## 🧠 **User Memories**

### **UI/UX Preferences**
- **Logo Design**: User prefers sleek, professional logos that are memorable like Coca-Cola. Current envelope + price tag SVG logo is approved and working well.
- **Success Page**: User prefers "tightened up" appearance with reduced padding and font sizes for better visual hierarchy.
- **Sponsored Products**: User wants 4 total sponsored product slots on the success page for monetization.

### **Technical Preferences**
- **Database**: Prefer SQLite for local development (faster iteration), PostgreSQL for production
- **Testing**: Always use fresh test scraper to avoid duplicate deal issues when demonstrating functionality
- **Documentation**: Prefer centralized, clean documentation over scattered files

### **Business Rules**
- **Deal Threshold**: Only show deals that are 50%+ off
- **Categories**: 14 product categories are established and working
- **Monetization**: Sponsored products are primary revenue stream
- **Email**: Mailchimp integration is working and preferred
- **User Data**: When users enter email, name, and select categories, we save them in BOTH Mailchimp AND our internal database

### **Development Rules**
- **Server Management**: Always check if server is running before making changes
- **API Compatibility**: Maintain backward compatibility with existing endpoints
- **Error Handling**: Provide clear error messages and logging
- **Testing**: Test with real commands before claiming success

---

## 📋 **Project Context Memories**

### **Current Status (August 2025)**
- **Phase**: Phase 2 (Automation Engine) - Deal Discovery System ✅ Complete
- **Database**: 60+ deals stored, fully functional with Prisma + SQLite
- **Next Priority**: Email Automation or Analytics Dashboard
- **Architecture**: Node.js + Express + Prisma + Mailchimp + Puppeteer
- **User Data Flow**: Email + name + categories → Mailchimp + Internal DB (dual storage)

### **Key Technical Decisions**
- **Prisma ORM**: Chosen for type-safe database operations
- **Modular Scrapers**: Architecture allows easy addition of new retailers
- **Test Scrapers**: Mock data system for reliable testing and demonstration
- **Documentation**: Centralized system with PROJECT_CONTEXT.md as master document

### **Recent Achievements**
- **Logo Redesign**: Implemented envelope + price tag SVG logo
- **Database Migration**: Moved from file-based to robust database system
- **Deal Discovery**: Built complete scraping and analysis system
- **Documentation**: Consolidated scattered files into clean, organized system

---

## 🎯 **Business Context Memories**

### **Vision & Mission**
- **Goal**: Deliver personalized weekly deals (50%+ off) from verified retailers
- **Target**: Deal-seeking consumers (ages 25-45, middle to upper-middle income)
- **Revenue**: Sponsored placements, affiliate commissions, premium subscriptions

### **User Experience Flow**
1. User lands on homepage with clear value proposition
2. Selects categories of interest
3. Enters email for weekly deals
4. Gets confirmation and sees sponsored products
5. Receives personalized weekly email digests

### **Monetization Strategy**
- **Primary**: Sponsored product placements (4 slots on success page)
- **Secondary**: Affiliate commissions on deal clicks
- **Future**: Premium subscriptions, lead generation, advertising

---

## 🔧 **Technical Context Memories**

### **Architecture Decisions**
- **Frontend**: Vanilla HTML/CSS/JS (no framework complexity)
- **Backend**: Node.js + Express (proven, simple)
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- **Email**: Mailchimp API (established, reliable)
- **Scraping**: Puppeteer + custom scrapers (modular, expandable)

### **Key Files & Structure**
```
/
├── PROJECT_CONTEXT.md     ← Master documentation & AI rules
├── AI_RULES_ENGINE.md     ← This file (rules & memories)
├── server.js              ← Main backend server
├── services/              ← Business logic
│   ├── scrapers/         ← Deal discovery
│   ├── analyzers/        ← Deal analysis
│   └── database.js       ← Database service
├── prisma/               ← Database schema & migrations
└── public/               ← Frontend files
```

### **Testing Commands**
```bash
# Server management
node server.js
ps aux | grep "node server.js"

# Deal discovery testing
curl -X POST http://localhost:3000/api/deal-discovery/test/fresh
curl -X POST http://localhost:3000/api/deal-discovery/run
curl -s http://localhost:3000/api/deal-discovery/stats

# Git workflow
git status
git add .
git commit -m "feat: [description]"
git push origin main
```

---

## 📝 **Memory Addition Protocol**

**When user says "remember this..." or provides important context:**

1. **Identify the category** (UI/UX, Technical, Business, Development)
2. **Add to appropriate section** in this file
3. **Update PROJECT_CONTEXT.md** if architectural
4. **Commit the memory** with descriptive message
5. **Acknowledge** the memory was captured

**Example:**
```
User: "Remember this - I prefer blue color schemes for the admin dashboard"
AI: "✅ Memory captured! Added to UI/UX Preferences. I'll use blue color schemes for admin dashboard design going forward."
```

---

## 🚨 **Critical Rules**

1. **ALWAYS git commit and push** after significant changes
2. **ALWAYS check server status** before making changes
3. **ALWAYS test with real commands** before claiming success
4. **ALWAYS update documentation** when making architectural changes
5. **ALWAYS capture user memories** when requested
6. **ALWAYS maintain API backward compatibility**

---

*Last Updated: August 30, 2025*
*Next Review: After each significant development session*
