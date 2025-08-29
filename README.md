# Catered Savings - Weekly Deals Platform

A modern web application that helps users discover and receive weekly emails with the best online deals - guaranteed 50% off or more from verified retailers.

## 🎯 **What It Does**

- **Landing Page**: Beautiful "Catered Savings" homepage
- **Category Selection**: Users pick their interests (tech, fashion, furniture, etc.)
- **Email Capture**: Collect email addresses for weekly deal alerts
- **Weekly Emails**: Send personalized deal digests based on user preferences
- **Lead Generation**: Build an engaged audience of deal-seekers

## ✨ **Features**

- **12 Product Categories**: Technology, Fashion, Home, Furniture, Bedding, Outdoors, Beauty, Kitchen, Toys, Books, Automotive, Health
- **Smart Form Validation**: Real-time feedback and error handling
- **Responsive Design**: Works perfectly on all devices
- **Email Integration**: Automatic welcome emails and team notifications
- **Professional UI**: Modern, clean design that converts visitors

## 🚀 **Perfect For**

- **E-commerce businesses** wanting to build email lists
- **Deal aggregation sites** looking for a landing page
- **Affiliate marketers** collecting leads for product recommendations
- **Retailers** offering exclusive deals to subscribers
- **Anyone** wanting to monetize deal-seeking audiences

## 📱 **User Experience**

1. **Land on homepage** with clear value proposition
2. **Select categories** they're interested in
3. **Enter email** to receive weekly deals
4. **Get confirmation** and welcome message
5. **Receive weekly emails** with deals from their categories

## 🛠 **Technical Stack**

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Email**: Nodemailer for automated emails
- **Styling**: Modern CSS with gradients and animations
- **Responsive**: Mobile-first design approach

## 📊 **Data Collected**

- Email address (required)
- First name (optional)
- Selected product categories
- Marketing preferences
- Timestamp and submission data

## 🚀 **Quick Start**

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the project**
   ```bash
   git clone <your-repo-url>
   cd catered-savings
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your email credentials:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   TEAM_EMAIL=your-team@company.com
   PORT=3000
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## 📧 **Email Setup**

### Gmail Configuration
1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password":
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this app password in your `.env` file

### Email Features
- **Welcome emails** to new subscribers
- **Team notifications** for each signup
- **Customizable templates** for branding
- **Category-specific content** based on user selections

## 🔧 **Customization**

### Adding New Categories
1. Edit `public/index.html` to add new category checkboxes
2. Update `public/script.js` to handle new data
3. Modify `server.js` to process new categories
4. Update email templates as needed

### Styling Changes
- Modify `public/styles.css` for visual updates
- Update color schemes, fonts, and layouts
- Add custom animations and transitions

### Email Templates
- Customize welcome emails in `server.js`
- Modify team notification formats
- Add branding and company information

## 📈 **Business Model Ideas**

- **Affiliate Marketing**: Earn commissions on deal clicks
- **Premium Subscriptions**: Offer exclusive early access
- **Sponsored Deals**: Charge retailers for featured placement
- **Lead Generation**: Sell qualified leads to businesses
- **Advertising**: Display ads to engaged audience

## 🌐 **Production Deployment**

### Recommended Changes
1. **Database Integration**: Replace in-memory storage with MongoDB, PostgreSQL, or similar
2. **Email Service**: Use SendGrid, Mailgun, or AWS SES for production email
3. **Environment Variables**: Use proper secret management
4. **HTTPS**: Enable SSL/TLS encryption
5. **Rate Limiting**: Add protection against spam submissions
6. **Data Validation**: Implement server-side validation
7. **Logging**: Add comprehensive logging and monitoring

### Deployment Options
- **Heroku**: Easy deployment with add-ons
- **Vercel**: Great for frontend deployment
- **AWS/GCP**: Full control and scalability
- **DigitalOcean**: Simple VPS deployment

## 🔒 **Security Features**

- Input validation and sanitization
- CSRF protection
- Rate limiting
- Secure email transmission
- Data encryption at rest
- Regular security updates

## 📊 **Analytics & Tracking**

- Track signup conversions
- Monitor category popularity
- Email open and click rates
- User engagement metrics
- A/B testing capabilities

## 🎨 **Design Features**

- **Modern UI**: Clean, professional appearance
- **Mobile-First**: Responsive design for all devices
- **Smooth Animations**: CSS transitions and hover effects
- **Accessibility**: Screen reader friendly
- **Fast Loading**: Optimized for performance

## 📝 **API Endpoints**

- `POST /api/submit-savings` - Submit user preferences
- `GET /api/savings-responses` - Get all responses (admin)
- `GET /api/savings-responses/:id` - Get specific response

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

MIT License - Feel free to modify and use for your business needs.

## 🆘 **Support**

For questions or customization requests, please contact your development team.

---

**Start building your deal aggregation empire today!** 🚀💰
