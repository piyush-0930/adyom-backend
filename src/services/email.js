const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: options.to,
            subject: options.subject,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        // Log the preview URL for Ethereal test emails
        if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
        return info;
    } catch (error) {
        console.error('Email error:', error);
        throw error;
    }
};

const sendWelcomeEmail = async (user, password) => {
    return sendEmail({
        to: user.email,
        subject: 'Welcome to the Adyom Webinar Workshop!',
        html: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
      <div style="font-family: Arial, sans-serif; background: #F4E8D8; padding: 40px; text-align: center;">
        <h1 style="color: #6B0000; font-family: Arial, sans-serif;">Welcome to Adyom Foundation</h1>
        <p style="color: #8B0000; font-family: Arial, sans-serif;">Awakening with Art. Rooted in Heritage. Inspired by Creativity.</p>
        <p style="font-family: Arial, sans-serif;">Hello ${user.name},</p>
        <p style="font-family: Arial, sans-serif;">Thank you for registering for our Webinar Workshop! We're excited to have you join us to explore India's folk and tribal art traditions.</p>
        <p style="font-family: Arial, sans-serif;">Your account has been automatically created. If you wish to access the learning dashboard later, you can use the following credentials:</p>
        <p style="font-family: Arial, sans-serif; font-weight: bold; font-size: 16px; background: #FFFDF5; padding: 10px; display: inline-block; border-radius: 4px;">
           Email: ${user.email}<br>
           Password: ${password}
        </p>
        <p style="font-family: Arial, sans-serif;">Please join our WhatsApp group to stay updated with the webinar details, schedules, and live session links:</p>
        <a href="https://chat.whatsapp.com/JHI0jltrPyTEZl3uZwvNWA?s=cl&p=a&ilr=2" style="font-family: Arial, sans-serif; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 10px; font-weight: bold;">Join WhatsApp Group</a>
        <br><br>
        <a href="${process.env.CLIENT_URL}/dashboard" style="font-family: Arial, sans-serif; background: #D9A441; color: #6B0000; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 20px;">Go to Dashboard</a>
      </div>
</body>
</html>`
    });
};

const sendContactReply = async (contact) => {
    return sendEmail({
        to: contact.email,
        subject: 'Thank you for contacting Adyom Foundation',
        html: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
      <div style="font-family: Arial, sans-serif; background: #F4E8D8; padding: 40px; text-align: center;">
        <h1 style="color: #6B0000; font-family: Arial, sans-serif;">Adyom Foundation</h1>
        <p style="font-family: Arial, sans-serif;">Dear ${contact.name},</p>
        <p style="font-family: Arial, sans-serif;">Thank you for reaching out! We've received your message and will respond within 48 hours.</p>
        <p style="font-family: Arial, sans-serif;">Your inquiry: "${contact.message}"</p>
      </div>
</body>
</html>`
    });
};

const sendCorporateLeadReply = async (lead) => {
    return sendEmail({
        to: lead.email,
        subject: 'Adyom Foundation - Corporate Inquiry Received',
        html: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
      <div style="font-family: Arial, sans-serif; background: #F4E8D8; padding: 40px; text-align: center;">
        <h1 style="color: #6B0000; font-family: Arial, sans-serif;">Adyom Foundation - Samanvaya</h1>
        <p style="font-family: Arial, sans-serif;">Dear ${lead.name},</p>
        <p style="font-family: Arial, sans-serif;">Thank you for your interest in our Corporate & CSR programs. Our team will connect with you shortly.</p>
        <p style="font-family: Arial, sans-serif;">Organization: ${lead.organization}</p>
      </div>
</body>
</html>`
    });
};

const sendArtworkStatusEmail = async (user, artwork, status) => {
    const statusMessages = {
        approved: 'Your artwork has been approved and is now visible in the community gallery!',
        rejected: 'Your artwork submission was not approved. Please review our guidelines and try again.'
    };

    return sendEmail({
        to: user.email,
        subject: `Artwork Submission Update - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        html: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
      <div style="font-family: Arial, sans-serif; background: #F4E8D8; padding: 40px; text-align: center;">
        <h1 style="color: #6B0000; font-family: Arial, sans-serif;">Adyom Foundation</h1>
        <p style="font-family: Arial, sans-serif;">Dear ${user.name},</p>
        <p style="font-family: Arial, sans-serif;">${statusMessages[status]}</p>
        <p style="font-family: Arial, sans-serif;">Artwork: "${artwork.title}"</p>
      </div>
</body>
</html>`
    });
};

module.exports = { sendEmail, sendWelcomeEmail, sendContactReply, sendCorporateLeadReply, sendArtworkStatusEmail };