# AI Session Starter Guide
*Quick context for new AI sessions*

## 🚀 **Quick Context Check**

**Project**: Catered Savers - Deal aggregation platform  
**Current Phase**: Phase 2 (Automation Engine) - Deal Discovery ✅ Complete  
**Next Priority**: Email Automation or Analytics Dashboard  
**Database**: 60+ deals stored, fully functional  

## 📋 **Essential Commands**

```bash
# Check if server is running
ps aux | grep "node server.js"

# Start server if needed
node server.js

# Test deal discovery system
curl -X POST http://localhost:3000/api/deal-discovery/test/fresh
curl -X POST http://localhost:3000/api/deal-discovery/run

# Check system status
curl -s http://localhost:3000/api/deal-discovery/stats
```

## 🎯 **Current System Status**

- ✅ **Deal Discovery**: Fully functional with test scrapers
- ✅ **Database**: Prisma + SQLite with 60+ deals
- ✅ **Admin Dashboard**: Real-time analytics
- ✅ **API Endpoints**: All working correctly
- 🔄 **Next**: Email automation or analytics dashboard

## 📁 **Key Files to Know**

- `PROJECT_CONTEXT.md` - **Master documentation & AI rules**
- `AI_RULES_ENGINE.md` - **Rules, memories, and GitHub sync protocol**
- `server.js` - Main backend server
- `services/deal-discovery-manager.js` - Deal discovery orchestration
- `services/scrapers/` - Web scraping infrastructure
- `prisma/schema.prisma` - Database schema

## 🤖 **AI Assistant Rules**

1. **Always check server status** before making changes
2. **Use fresh test scraper** to avoid duplicate deal issues
3. **Update PROJECT_CONTEXT.md** for architectural changes
4. **Maintain API backward compatibility**
5. **Test with real commands** before claiming success
6. **Git commit and push** after significant changes
7. **Capture user memories** when requested (see AI_RULES_ENGINE.md)
8. **Follow the rules engine** for consistent workflow

## 🎯 **Ready for Next Phase**

The deal discovery system is complete and working. Ready to move to:
- **Email Automation** - Smart campaign system
- **Analytics Dashboard** - Real-time performance metrics
- **Performance Optimization** - Caching and speed improvements

---

*For complete technical details, see [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)*
