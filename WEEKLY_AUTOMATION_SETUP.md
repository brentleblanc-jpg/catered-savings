# Weekly Email Automation Setup Guide

## 🎯 **Core Requirement: Weekly Emails to Existing Customers**

This system ensures that **Mailchimp sends weekly emails** with fresh deals to all existing customers automatically.

## 🚀 **How It Works**

### **1. Weekly Automation Process**
```
Every Week:
1. 🔄 Refresh deals in database (find new 50%+ off deals)
2. 📧 Update Mailchimp with fresh deal data
3. 🎯 Trigger weekly campaign to all subscribers
4. 📊 Track performance and analytics
```

### **2. Mailchimp Integration**
- **Mailchimp sends the emails** (not our server)
- **Our system feeds Mailchimp** fresh deal data
- **Personalized links** for each user
- **Automated campaigns** triggered weekly

## 🛠️ **Setup Instructions**

### **Step 1: Environment Variables**
Add to your `.env` file:
```bash
# Mailchimp Configuration
MAILCHIMP_API_KEY=your_mailchimp_api_key
MAILCHIMP_SERVER_PREFIX=us13
MAILCHIMP_LIST_ID=your_list_id

# Base URL for personalized links
BASE_URL=https://yourdomain.com
```

### **Step 2: Test the System**
```bash
# Check automation status
curl http://localhost:3000/api/weekly-automation/status

# Refresh deals only (test)
curl -X POST http://localhost:3000/api/weekly-automation/refresh-deals

# Update Mailchimp with fresh data (test)
curl -X POST http://localhost:3000/api/weekly-automation/update-mailchimp

# Run full weekly automation (test)
curl -X POST http://localhost:3000/api/weekly-automation/run
```

### **Step 3: Schedule Weekly Automation**

#### **Option A: Cron Job (Recommended)**
```bash
# Edit crontab
crontab -e

# Add this line to run every Monday at 9 AM
0 9 * * 1 cd /path/to/Catered_Sales && npm run weekly-automation
```

#### **Option B: Manual Trigger**
```bash
# Run weekly automation manually
npm run weekly-automation
```

#### **Option C: API Endpoint**
```bash
# Trigger via API (for external scheduling)
curl -X POST https://yourdomain.com/api/weekly-automation/run
```

## 📧 **Mailchimp Email Template**

The system creates a weekly email template with:
- **Personalized greeting** (Hi {{USER_NAME}}!)
- **Fresh deal highlights** from user's categories
- **Personalized deals link** ({{PERSONALIZED_DEALS_URL}})
- **Sponsored products** section
- **Mobile-responsive** design

### **Email Content Structure**
```html
Subject: Your Weekly Deals - Fresh 50%+ Off Savings!

Hi {{USER_NAME}}!

🔥 This Week's Featured Deals
Based on your preferences, we've found these amazing deals:

[Fresh deals from user's selected categories]

🎁 View All Your Deals
[Personalized link to /deals/[token]]

⭐ Sponsored Products
[Hand-picked products from retail partners]

---
Catered Savers - Your personalized deal source
```

## 🔄 **Weekly Automation Flow**

### **Step 1: Deal Refresh**
- Runs deal discovery system
- Finds new 50%+ off deals
- Updates database with fresh deals
- Marks old deals as inactive

### **Step 2: Mailchimp Update**
- Updates Mailchimp merge fields with fresh deal data
- Updates user tokens for personalized links
- Refreshes email template with new content

### **Step 3: Campaign Trigger**
- Creates new weekly campaign in Mailchimp
- Sends to all active subscribers
- Tracks campaign performance

## 📊 **Monitoring & Analytics**

### **Check Automation Status**
```bash
curl http://localhost:3000/api/weekly-automation/status
```

**Response:**
```json
{
  "success": true,
  "status": {
    "listMembers": 150,
    "recentCampaigns": 5,
    "lastCampaign": "2025-08-30T21:00:00+00:00",
    "status": "Ready for weekly automation"
  }
}
```

### **Track Performance**
- **Mailchimp Dashboard**: Campaign performance, open rates, click rates
- **Our Analytics**: Deal click tracking, user engagement
- **Database**: User activity, deal performance

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Mailchimp API Errors**
   - Check API key and server prefix
   - Verify list ID is correct
   - Ensure sufficient API quota

2. **Deal Discovery Issues**
   - Check if scrapers are working
   - Verify database connectivity
   - Review deal discovery logs

3. **Email Delivery Issues**
   - Check Mailchimp campaign status
   - Verify subscriber list is active
   - Review email template formatting

### **Debug Commands**
```bash
# Check server status
ps aux | grep "node server.js"

# Check Mailchimp connection
curl -s http://localhost:3000/api/weekly-automation/status

# Test deal discovery
curl -X POST http://localhost:3000/api/deal-discovery/run

# Check user data
curl -s http://localhost:3000/api/admin/analytics
```

## 🎯 **Success Metrics**

### **Weekly Automation Success**
- ✅ Fresh deals found and updated
- ✅ Mailchimp updated with new data
- ✅ Campaign sent to all subscribers
- ✅ Personalized links working
- ✅ Analytics tracking active

### **Performance Targets**
- **Deal Refresh**: 50+ new deals weekly
- **Email Delivery**: 95%+ delivery rate
- **Open Rate**: 25%+ (industry average)
- **Click Rate**: 5%+ (industry average)
- **User Engagement**: Growing subscriber base

## 🔧 **Advanced Configuration**

### **Customize Email Frequency**
```javascript
// In weekly-automation.js, modify the cron schedule
// Daily: 0 9 * * *
// Weekly: 0 9 * * 1 (Monday)
// Bi-weekly: 0 9 * * 1,3 (Monday & Wednesday)
```

### **Segment Users by Categories**
```javascript
// Create separate campaigns for different user segments
// Fashion users, Tech users, Home & Garden users, etc.
```

### **A/B Testing**
```javascript
// Test different email templates
// Test different send times
// Test different subject lines
```

---

## ✅ **System Ready for Weekly Automation**

Your system is now configured to:
1. **Automatically refresh deals** weekly
2. **Update Mailchimp** with fresh data
3. **Send personalized emails** to all subscribers
4. **Track performance** and analytics
5. **Scale with your subscriber base**

**Next Steps:**
1. Set up cron job for weekly automation
2. Monitor first few weekly campaigns
3. Optimize based on performance data
4. Scale as subscriber base grows

**Remember**: Mailchimp handles the actual email sending - our system just feeds it fresh data and triggers the campaigns! 🚀
