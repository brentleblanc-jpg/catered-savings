const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store questionnaire responses (in production, use a database)
let questionnaireResponses = [];

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred email service
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Submit questionnaire
app.post('/api/submit-questionnaire', async (req, res) => {
  try {
    const response = req.body;
    const timestamp = new Date().toISOString();
    
    // Store the response
    questionnaireResponses.push({
      ...response,
      timestamp,
      id: Date.now().toString()
    });

    // Send confirmation email
    if (response.email) {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: response.email,
        subject: 'Thank you for completing our questionnaire!',
        html: `
          <h2>Thank you for your responses!</h2>
          <p>We've received your questionnaire submission and will be in touch soon with personalized recommendations.</p>
          <p>Here's a summary of your responses:</p>
          <ul>
            <li><strong>Company Size:</strong> ${response.companySize || 'N/A'}</li>
            <li><strong>Industry:</strong> ${response.industry || 'N/A'}</li>
            <li><strong>Budget Range:</strong> ${response.budgetRange || 'N/A'}</li>
            <li><strong>Timeline:</strong> ${response.timeline || 'N/A'}</li>
            <li><strong>Primary Goal:</strong> ${response.primaryGoal || 'N/A'}</li>
          </ul>
          <p>We'll analyze your needs and send you customized solutions within 24-48 hours.</p>
          <p>Best regards,<br>Your Sales Team</p>
        `
      };

      await transporter.sendMail(mailOptions);
    }

    // Send notification to your team
    const teamNotification = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: process.env.TEAM_EMAIL || 'your-team@company.com',
      subject: 'New Questionnaire Submission - Lead Generated!',
      html: `
        <h2>New Lead Generated!</h2>
        <p><strong>Email:</strong> ${response.email}</p>
        <p><strong>Company Size:</strong> ${response.companySize || 'N/A'}</p>
        <p><strong>Industry:</strong> ${response.industry || 'N/A'}</p>
        <p><strong>Budget Range:</strong> ${response.budgetRange || 'N/A'}</p>
        <p><strong>Timeline:</strong> ${response.timeline || 'N/A'}</p>
        <p><strong>Primary Goal:</strong> ${response.primaryGoal || 'N/A'}</p>
        <p><strong>Additional Notes:</strong> ${response.additionalNotes || 'N/A'}</p>
        <p><strong>Submitted:</strong> ${timestamp}</p>
      `
    };

    await transporter.sendMail(teamNotification);

    res.json({ 
      success: true, 
      message: 'Questionnaire submitted successfully!',
      id: timestamp
    });

  } catch (error) {
    console.error('Error submitting questionnaire:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting questionnaire' 
    });
  }
});

// Get all responses (for admin purposes)
app.get('/api/responses', (req, res) => {
  res.json(questionnaireResponses);
});

// Get response by ID
app.get('/api/responses/:id', (req, res) => {
  const response = questionnaireResponses.find(r => r.id === req.params.id);
  if (response) {
    res.json(response);
  } else {
    res.status(404).json({ message: 'Response not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
