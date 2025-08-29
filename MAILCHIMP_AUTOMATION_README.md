# 🚀 Mailchimp Automation for Catered Savers

This automation system syncs your categories and companies with Mailchimp, creating targeted email campaigns automatically.

## ✨ What This Automation Does

### 🔄 **Automatic Category Sync**
- Creates Mailchimp tags for each of your product categories
- Syncs category names and descriptions
- Maintains consistent tagging across your audience

### 📧 **Email Template Generation**
- Generates professional HTML email templates
- Includes Mailchimp merge tags for personalization
- Creates both welcome emails and weekly digest templates

### 🎯 **Smart Segmentation**
- Groups subscribers by their category preferences
- Creates targeted audience segments
- Enables category-specific campaigns

### 📊 **Subscriber Analytics**
- Analyzes your audience by category
- Shows subscriber counts per category
- Helps plan targeted campaigns

## 🛠️ How to Use

### **1. Run the Automation**
```bash
npm run automate
```

Or run directly:
```bash
node run_automation.js
```

### **2. What Happens Automatically**
1. **Categories are synced** to Mailchimp as tags
2. **Email templates are generated** with your company data
3. **Audience segments are created** for each category
4. **Subscriber analysis** shows your audience breakdown

### **3. Copy Templates to Mailchimp**
The automation will output HTML templates. Copy these into Mailchimp:
- Go to **Templates** → **Create Template**
- Paste the HTML code
- Save and use for campaigns

## 📋 Generated Templates

### **Welcome Email Template**
- Personalized greeting using `*|FNAME|*`
- Dynamic content area for category-specific companies
- Professional styling with your branding

### **Weekly Digest Template**
- Weekly deal roundup format
- Merge tags for subscriber personalization
- Ready for scheduled sending

## 🎯 Campaign Automation Strategies

### **Strategy 1: Welcome Series**
1. **Immediate Welcome**: Send when someone subscribes
2. **Category Introduction**: Follow up with category-specific deals
3. **First Deal Alert**: Send their first personalized offer

### **Strategy 2: Weekly Digests**
1. **Monday**: Tech & Electronics deals
2. **Wednesday**: Fashion & Style deals
3. **Friday**: Health & Beauty deals
4. **Sunday**: Weekend clearance roundup

### **Strategy 3: Flash Sale Alerts**
1. **Category-Specific**: Target subscribers by interest
2. **Urgency-Based**: Time-sensitive offers
3. **Exclusive Deals**: Premium subscriber content

## 🔧 Mailchimp Setup Steps

### **1. Create Campaigns**
- **Audience**: Select your list (f269fbdfef)
- **Template**: Use the generated HTML templates
- **Segmentation**: Target by category tags

### **2. Set Up Automation**
- **Welcome Series**: Trigger on subscription
- **Weekly Digests**: Schedule recurring sends
- **Category Alerts**: Send based on new deals

### **3. Use Merge Tags**
- `*|FNAME|*` - Subscriber's first name
- `*|CATEGORIES|*` - Their selected categories
- `*|EXCLUSIVE_DEALS|*` - Exclusive deal preference

## 📊 Monitoring & Analytics

### **Track These Metrics**
- **Open Rates**: By category segment
- **Click Rates**: On company links
- **Conversion**: Deal purchases
- **Unsubscribe**: By category preference

### **Optimize Based On**
- Best performing categories
- Most clicked companies
- Optimal send times
- Content preferences

## 🚀 Advanced Automation Features

### **Dynamic Content Blocks**
```html
<!-- Mailchimp will show different content based on tags -->
<div mc:edit="personalized_content">
  <!-- Content changes based on subscriber preferences -->
</div>
```

### **Conditional Logic**
- Show different deals based on category tags
- Personalize subject lines by interest
- A/B test different content versions

### **Integration Possibilities**
- Connect with your CRM
- Sync with inventory systems
- Link to analytics platforms

## 🔄 Maintenance & Updates

### **Weekly Tasks**
- Run automation to sync new subscribers
- Review campaign performance
- Update company deals and URLs

### **Monthly Tasks**
- Analyze subscriber growth by category
- Review and update email templates
- Optimize send schedules

### **Quarterly Tasks**
- Review category performance
- Update company information
- Refresh email designs

## 🆘 Troubleshooting

### **Common Issues**
1. **API Key Errors**: Check your .env file
2. **Template Issues**: Verify HTML syntax
3. **Segment Problems**: Check category names match

### **Get Help**
- Check Mailchimp API documentation
- Review error logs in console
- Verify environment variables

## 📈 Success Metrics

### **Key Performance Indicators**
- **Subscriber Growth**: Monthly signup rate
- **Engagement**: Open and click rates
- **Conversion**: Deal purchases from emails
- **Retention**: Unsubscribe rates

### **Goals to Set**
- 25%+ open rates
- 5%+ click rates
- <2% unsubscribe rate
- 10%+ monthly subscriber growth

---

## 🎯 Ready to Automate?

Run this command to get started:
```bash
npm run automate
```

Your Mailchimp campaigns will never be the same! 🚀
