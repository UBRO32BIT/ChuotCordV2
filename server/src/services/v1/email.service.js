const formData = require("form-data");
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const config = require('../../config/config');

const SMTP_HOST = config.email.smtp.host;
const SMTP_PORT = config.email.smtp.port;
const SMTP_USERNAME = config.email.smtp.auth.user;
const SMTP_PASSWORD = config.email.smtp.auth.pass;
const EMAIL_FROM = config.email.from;

class EmailService {
    async SendRecoveryEmail(email, username, token) {
        try {
            // Read the HTML template file
            const templatePath = path.join(__dirname, '..', '..', 'templates', 'passwordReset.html');
            const htmlTemplate = fs.readFileSync(templatePath, 'utf8');

            // Replace placeholders with actual values
            const customizedHtml = htmlTemplate
                .replace('{{username}}', username)
                .replace('{{token}}', token);

            
            // Send the email
            await this.SendEmail(
                email,
                'Password Recovery',
                customizedHtml
            );
        } catch (error) {
            console.error('Error sending recovery email:', error);
            throw error;
        }
    }

    async SendEmail(toEmail, subject, htmlMessage) {
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            auth: {
                user: SMTP_USERNAME,
                pass: SMTP_PASSWORD
            }
        });

        // send email
        await transporter.sendMail({
            from: EMAIL_FROM,
            to: toEmail,
            subject: subject,
            html: htmlMessage
        });
    }
}

module.exports = new EmailService;