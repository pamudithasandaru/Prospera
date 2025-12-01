const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email
const sendEmail = async (options) => {
  const mailOptions = {
    from: `Prospera <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html || options.message
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};

// Email templates
const emailTemplates = {
  welcome: (userName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2E7D32;">Welcome to Prospera!</h1>
      <p>Dear ${userName},</p>
      <p>Thank you for joining Prospera, your comprehensive agriculture management platform.</p>
      <p>Get started by:</p>
      <ul>
        <li>Registering your farm</li>
        <li>Exploring our free courses</li>
        <li>Connecting with other farmers</li>
        <li>Checking market prices</li>
      </ul>
      <p>Best regards,<br>The Prospera Team</p>
    </div>
  `,

  diseaseAlert: (userName, disease, crop, region) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #D32F2F;">⚠️ Disease Alert</h1>
      <p>Dear ${userName},</p>
      <p>A case of <strong>${disease}</strong> has been reported in ${crop} crops in your region (${region}).</p>
      <p><strong>Recommended Actions:</strong></p>
      <ul>
        <li>Inspect your crops immediately</li>
        <li>Apply preventive measures</li>
        <li>Contact agricultural extension officer if you notice symptoms</li>
      </ul>
      <p>Stay safe,<br>Prospera Alert System</p>
    </div>
  `,

  priceAlert: (userName, product, newPrice, change) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1976D2;">📈 Price Alert</h1>
      <p>Dear ${userName},</p>
      <p>The market price for <strong>${product}</strong> has changed significantly:</p>
      <p style="font-size: 24px; color: ${change > 0 ? '#2E7D32' : '#D32F2F'};">
        LKR ${newPrice}/kg (${change > 0 ? '+' : ''}${change}%)
      </p>
      <p>This might be a good time to ${change > 0 ? 'sell' : 'buy'}!</p>
      <p>Best regards,<br>Prospera Market Intelligence</p>
    </div>
  `,

  courseCompletion: (userName, courseName, certificateUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2E7D32;">🎓 Congratulations!</h1>
      <p>Dear ${userName},</p>
      <p>You have successfully completed the course: <strong>${courseName}</strong></p>
      <p>Your certificate is ready! <a href="${certificateUrl}">Download Certificate</a></p>
      <p>Keep learning and growing,<br>Prospera Learning Team</p>
    </div>
  `
};

module.exports = { sendEmail, emailTemplates };
