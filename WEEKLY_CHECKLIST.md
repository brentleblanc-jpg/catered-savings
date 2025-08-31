# Weekly Email Checklist - MVP

## 🎯 **Every Week: Send Fresh Deals to Customers**

### **Step 1: Check System Status**
```bash
curl http://localhost:3000/api/weekly-automation/status
```
**Expected Result:**
- List members: [number of subscribers]
- Recent campaigns: [number]
- Status: "Ready for weekly automation"

### **Step 2: Refresh Deals (Find New 50%+ Off Deals)**
```bash
npm run refresh-deals
```
**What it does:**
- Runs deal discovery system
- Finds fresh deals from retailers
- Updates database with new deals
- Skips duplicates

### **Step 3: Update Mailchimp with Fresh Data**
```bash
npm run update-mailchimp
```
**What it does:**
- Updates Mailchimp with fresh deal data
- Updates user tokens for personalized links
- Refreshes email template content

### **Step 4: Send Weekly Campaign**
```bash
npm run weekly-automation
```
**What it does:**
- Creates new campaign in Mailchimp
- Sends to all active subscribers
- Tracks campaign performance

---

## 🚀 **Quick Commands**

### **All-in-One (Recommended)**
```bash
npm run weekly-automation
```
*This does steps 2, 3, and 4 automatically*

### **Individual Steps**
```bash
# Step 1: Refresh deals only
npm run refresh-deals

# Step 2: Update Mailchimp only  
npm run update-mailchimp

# Step 3: Send campaign only
curl -X POST http://localhost:3000/api/weekly-automation/run
```

---

## 📊 **Check Results**

### **After Running Weekly Automation:**
1. **Check Mailchimp Dashboard**
   - Campaign sent successfully
   - Delivery rate
   - Open rates
   - Click rates

2. **Check Our Analytics**
   ```bash
   curl http://localhost:3000/api/admin/analytics
   ```

3. **Check Personalized Links**
   - Test a user's personalized link
   - Verify deals are showing
   - Check sponsored products

---

## 🎯 **Weekly Schedule Suggestions**

### **Monday Morning (Recommended)**
- 9:00 AM: Run weekly automation
- 10:00 AM: Check Mailchimp dashboard
- 11:00 AM: Review performance metrics

### **Alternative Times**
- **Tuesday**: If you want to avoid Monday morning rush
- **Wednesday**: Mid-week deals
- **Friday**: End-of-week deals

---

## 🚨 **Troubleshooting**

### **If Deals Don't Refresh:**
```bash
# Check deal discovery status
curl -s http://localhost:3000/api/deal-discovery/stats

# Test individual scrapers
curl -X POST http://localhost:3000/api/deal-discovery/test/fresh
```

### **If Mailchimp Update Fails:**
```bash
# Check Mailchimp connection
curl -s http://localhost:3000/api/weekly-automation/status

# Check environment variables
echo $MAILCHIMP_API_KEY
echo $MAILCHIMP_LIST_ID
```

### **If Campaign Doesn't Send:**
- Check Mailchimp dashboard for errors
- Verify subscriber list is active
- Check email template formatting

---

## ✅ **Success Checklist**

After each weekly automation:
- [ ] Fresh deals found and updated
- [ ] Mailchimp updated with new data
- [ ] Campaign sent to all subscribers
- [ ] Personalized links working
- [ ] Analytics tracking active
- [ ] Performance metrics reviewed

---

## 📈 **Performance Targets**

### **Weekly Goals:**
- **Deals Found**: 20+ new deals
- **Email Delivery**: 95%+ success rate
- **Open Rate**: 25%+ (industry average)
- **Click Rate**: 5%+ (industry average)
- **User Engagement**: Growing subscriber base

---

**Remember**: You control when to send emails - perfect for MVP testing and optimization! 🎯
