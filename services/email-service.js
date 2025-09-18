const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        // For development, we'll use a test account
        // In production, you'd use your actual email service credentials
        this.transporter = nodemailer.createTransporter({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER || 'brent@anuvenconsulting.com',
                pass: process.env.EMAIL_PASS || 'your-app-password' // Use app password for Gmail
            }
        });
    }

    async sendContactFormEmail(contactData) {
        try {
            const { name, email, subject, message } = contactData;
            
            const mailOptions = {
                from: `"Catered Savers Contact Form" <${process.env.EMAIL_USER || 'brent@anuvenconsulting.com'}>`,
                to: 'brent@anuvenconsulting.com',
                subject: `Contact Form: ${subject}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #ff7a59;">New Contact Form Submission</h2>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Subject:</strong> ${subject}</p>
                            <p><strong>Message:</strong></p>
                            <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
                                ${message.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                        <div style="background: #e9ecef; padding: 15px; border-radius: 4px; font-size: 12px; color: #6c757d;">
                            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                            <p><strong>IP:</strong> ${contactData.ip || 'Unknown'}</p>
                        </div>
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #dee2e6;">
                        <p style="color: #6c757d; font-size: 12px;">
                            This email was sent from the Catered Savers contact form.
                        </p>
                    </div>
                `,
                text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

Timestamp: ${new Date().toLocaleString()}
IP: ${contactData.ip || 'Unknown'}

---
This email was sent from the Catered Savers contact form.
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('📧 Contact form email sent successfully:', info.messageId);
            return { success: true, messageId: info.messageId };
            
        } catch (error) {
            console.error('❌ Error sending contact form email:', error);
            return { success: false, error: error.message };
        }
    }

    async sendAutoReplyEmail(userEmail, userName) {
        try {
            const mailOptions = {
                from: `"Catered Savers" <${process.env.EMAIL_USER || 'brent@anuvenconsulting.com'}>`,
                to: userEmail,
                subject: 'Thank you for contacting Catered Savers!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #ff7a59;">Thank you for reaching out!</h2>
                        <p>Hi ${userName},</p>
                        <p>Thank you for contacting Catered Savers. We've received your message and will get back to you within 24 hours.</p>
                        <p>In the meantime, feel free to check out our latest personalized deals!</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://cateredsavers.com" style="background: #ff7a59; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                View Our Deals
                            </a>
                        </div>
                        <p>Best regards,<br>The Catered Savers Team</p>
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #dee2e6;">
                        <p style="color: #6c757d; font-size: 12px;">
                            This is an automated response. Please do not reply to this email.
                        </p>
                    </div>
                `,
                text: `
Thank you for reaching out!

Hi ${userName},

Thank you for contacting Catered Savers. We've received your message and will get back to you within 24 hours.

In the meantime, feel free to check out our latest personalized deals at https://cateredsavers.com

Best regards,
The Catered Savers Team

---
This is an automated response. Please do not reply to this email.
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('📧 Auto-reply email sent successfully:', info.messageId);
            return { success: true, messageId: info.messageId };
            
        } catch (error) {
            console.error('❌ Error sending auto-reply email:', error);
            return { success: false, error: error.message };
        }
    }

    // Test email configuration
    async testEmailConfiguration() {
        try {
            await this.transporter.verify();
            console.log('✅ Email configuration is valid');
            return true;
        } catch (error) {
            console.error('❌ Email configuration error:', error.message);
            return false;
        }
    }
}

module.exports = new EmailService();
