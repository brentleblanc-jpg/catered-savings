# 🚀 Weekly Update System for Catered Savers

This system makes it super easy to update your deals weekly and generate fresh email templates for Mailchimp.

## 📅 Weekly Workflow

### **Step 1: Update Your Deals**
Edit `data/categories.js` with new URLs, companies, or deal descriptions:

```javascript
// Example: Add a new company or update existing one
{
  name: "Best Buy",
  url: "https://www.bestbuy.com/sale", // Update with new sale URL
  affiliate: true,
  description: "NEW: Labor Day Sale - 50% off appliances + extra $600 off!" // Update description
}
```

### **Step 2: Run Weekly Update**
```bash
npm run weekly
```

### **Step 3: Copy to Mailchimp**
- Generated templates are saved in `/templates` folder
- Copy HTML into Mailchimp campaigns
- Target subscribers by category tags

## 🛠️ What the Script Does

### **📊 Data Summary**
- Shows total companies per category
- Counts affiliate vs. non-affiliate
- Displays last update date

### **🔍 Change Detection**
- Identifies new/updated deals
- Highlights limited-time offers
- Shows what's changed from last week

### **📧 Template Generation**
- **Weekly Digest**: General template for all subscribers
- **Category Templates**: Specific templates for each category
- **Professional HTML**: Ready to copy into Mailchimp

### **🔄 Mailchimp Sync**
- Checks subscriber count
- Verifies category segments
- Ensures everything is synced

## 📁 Generated Files

After running `npm run weekly`, you'll get:

```
templates/
├── weekly-digest-template.html          # General weekly email
├── tech-electronics-template.html       # Tech deals
├── fashion-template.html                # Fashion deals
├── health-beauty-template.html          # Health & beauty deals
└── ... (one for each category)
```

## 🎯 Mailchimp Campaign Strategy

### **Campaign 1: Weekly Digest**
- **Template**: `weekly-digest-template.html`
- **Audience**: All subscribers
- **Content**: Mix of deals from all categories

### **Campaign 2: Category-Specific**
- **Template**: `[category]-template.html`
- **Audience**: Subscribers tagged with that category
- **Content**: Focused deals for specific interests

## 💡 Pro Tips

### **For New Deals:**
- Add "NEW:" or "This Week:" to descriptions
- The script will automatically highlight these

### **For Limited Time:**
- Add "Limited Time" or "Ends Soon" to descriptions
- Creates urgency in your emails

### **For Affiliate Tracking:**
- Set `affiliate: true` for companies you have partnerships with
- Shows gold badge in emails

## 🔄 Automation Evolution

### **Phase 1 (Now): Manual Updates**
- Edit `categories.js` weekly
- Run `npm run weekly`
- Copy templates to Mailchimp

### **Phase 2 (Future): External Data**
- Store deals in Google Sheets
- API fetches fresh data automatically
- Zero manual intervention

### **Phase 3 (Future): Full Automation**
- Scheduled weekly updates
- Automatic template generation
- Direct Mailchimp campaign creation

## 🚨 Quick Commands

```bash
# Run weekly update
npm run weekly

# Run initial automation
npm run automate

# Start your server
npm start
```

## 📊 Example Output

```
🚀 CATERED SAVERS - WEEKLY UPDATE TOOL
==================================================
📅 8/27/2024 - 2:30:45 PM

📊 WEEKLY UPDATE SUMMARY
==================================================
📁 Tech & Electronics: 6 companies (4 affiliate)
📁 Fashion & Style: 6 companies (6 affiliate)
📁 Health & Beauty: 6 companies (6 affiliate)
==================================================
📈 Total: 18 companies across 3 categories
💰 Affiliate: 16 companies
📅 Last Updated: 8/27/2024

🔍 CHECKING FOR DATA CHANGES
==================================================
🆕 Tech & Electronics: 2 new/updated deals
   • Best Buy: NEW: Labor Day Sale - 50% off appliances
   • Newegg: This Week: Shell Shocker deals up to 70% off

📧 GENERATING EMAIL TEMPLATES
==================================================
✅ Weekly Digest Template Generated
✅ Tech & Electronics Template Generated
✅ Fashion & Style Template Generated
✅ Health & Beauty Template Generated

📁 Templates saved to /templates folder
📋 Copy these HTML files into Mailchimp for your campaigns

🔄 SYNCING WITH MAILCHIMP
==================================================
📊 Audience: 2 subscribers
🏷️ Segments: 3 available
✅ Mailchimp sync completed

🎉 WEEKLY UPDATE COMPLETED!

📋 Next Steps:
1. Review the generated templates in /templates folder
2. Copy HTML to Mailchimp campaigns
3. Target subscribers by category tags
4. Send your weekly deals!
```

---

**Ready to automate your weekly deals? Run `npm run weekly` and see the magic happen!** 🚀
