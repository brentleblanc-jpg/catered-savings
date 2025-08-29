# 🔧 Mailchimp Integration Setup Guide

## Why Emails Aren't Going to Mailchimp

Your Catered_Sales app is **not connected to Mailchimp** because the environment variables are missing. Here's how to fix it:

## 📋 Step-by-Step Setup

### 1. Get Your Mailchimp API Key
1. Log into your [Mailchimp account](https://mailchimp.com)
2. Go to **Account** → **Extras** → **API keys**
3. Click **Create A Key**
4. Copy the generated API key (looks like: `1234567890abcdef1234567890abcdef-us21`)

### 2. Get Your Server Prefix
- From your API key above, the server prefix is the part after the last dash
- Example: If your API key ends with `-us21`, then `us21` is your server prefix

### 3. Create/Get Your Audience List ID
1. In Mailchimp, go to **Audience** → **All contacts**
2. If you don't have an audience, click **Create Audience**
3. Once created, go to **Audience** → **Settings** → **Audience name and defaults**
4. Copy the **Audience ID** (looks like: `a1b2c3d4e5`)

### 4. Update Your .env File
Edit the `.env` file in your project root and replace these values:

```env
# Mailchimp Configuration
MAILCHIMP_API_KEY=your-actual-api-key-here
MAILCHIMP_SERVER_PREFIX=us21
MAILCHIMP_LIST_ID=your-actual-list-id-here
```

### 5. Restart Your Server
After updating the .env file:
```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm start
```

## 🧪 Test the Integration

1. Go to `http://localhost:3000`
2. Fill out the signup form
3. Submit it
4. Check your server logs - you should see:
   ```
   New Catered Savings Signup! 🎯
   Email: user@example.com
   ```
5. Check your Mailchimp audience - the email should appear there

## 🚨 Common Issues

### "Invalid API Key" Error
- Double-check your API key is copied completely
- Make sure there are no extra spaces
- Verify the server prefix matches your API key

### "List not found" Error
- Verify your List ID is correct
- Make sure the list exists in your Mailchimp account

### Still Not Working?
Check the server console logs for detailed error messages. The app will show specific Mailchimp errors to help troubleshoot.

## 💡 Current Status

Right now, your app is collecting signups but **not sending them to Mailchimp** because the API credentials are missing. Once you add the credentials above, all future signups will automatically:

1. ✅ Add the subscriber to your Mailchimp audience
2. ✅ Include their selected categories as tags
3. ✅ Set their name and preferences
4. ✅ Log the signup for your records

## 🎯 Example .env File

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
TEAM_EMAIL=your-team@company.com

# Server Configuration
PORT=3000

# Mailchimp Configuration (REPLACE THESE WITH YOUR ACTUAL VALUES)
MAILCHIMP_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6-us21
MAILCHIMP_SERVER_PREFIX=us21
MAILCHIMP_LIST_ID=a1b2c3d4e5

# Note: Never commit this file to version control!
```

---

**🔗 Need help?** Check the [Mailchimp API documentation](https://mailchimp.com/developer/marketing/api/) for more details.
