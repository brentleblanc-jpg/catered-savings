# Business Solutions Questionnaire System

A modern, responsive web application for collecting business information through a step-by-step questionnaire. Perfect for lead generation and data collection.

## Features

- **Multi-step Questionnaire**: 4 intuitive steps to collect comprehensive business information
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Real-time Validation**: Instant feedback on form inputs
- **Progress Tracking**: Visual progress bar showing completion status
- **Email Integration**: Automatic email notifications for both users and your team
- **Data Storage**: Collects and stores all questionnaire responses
- **Professional UI**: Modern, clean design with smooth animations

## Questionnaire Steps

1. **Company Information**
   - Company name, size, industry, website

2. **Business Needs & Goals**
   - Primary goals, challenges, implementation timeline

3. **Budget & Contact**
   - Budget range, decision maker role, contact details

4. **Review & Submit**
   - Summary of all responses with confirmation

## Data Collected

- Company demographics (size, industry)
- Business goals and challenges
- Budget and timeline information
- Contact information (email, phone)
- Additional notes and requirements

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   cd Catered_Sales
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your email credentials:
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

### Email Setup (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password":
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this app password in your `.env` file

## Usage

### For Users
1. Visit the questionnaire page
2. Complete each step with required information
3. Review responses before submission
4. Submit and receive confirmation email
5. Get personalized recommendations within 24-48 hours

### For Your Team
- Receive instant notifications for new submissions
- Access all responses via API endpoints
- Use collected data for lead qualification
- Send targeted follow-up communications

## API Endpoints

- `POST /api/submit-questionnaire` - Submit questionnaire data
- `GET /api/responses` - Get all questionnaire responses
- `GET /api/responses/:id` - Get specific response by ID

## Customization

### Adding New Questions
1. Edit `public/index.html` to add new form fields
2. Update `public/script.js` to handle new data
3. Modify `server.js` to process new fields
4. Update email templates as needed

### Styling Changes
- Modify `public/styles.css` for visual updates
- Update color schemes, fonts, and layouts
- Add custom animations and transitions

### Email Templates
- Customize confirmation emails in `server.js`
- Modify team notification formats
- Add branding and company information

## Production Deployment

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

## Security Considerations

- Input validation and sanitization
- CSRF protection
- Rate limiting
- Secure email transmission
- Data encryption at rest
- Regular security updates

## Support

For questions or customization requests, please contact your development team.

## License

MIT License - Feel free to modify and use for your business needs.
