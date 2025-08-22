const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send confirmation email after report is submitted
 */

exports.sendReportConfirmationEmail = async (email, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "AI Boat Report",
    html: `
      <p>Hi,</p>
      <p>Thank you for submitting your report. Here's what we received:</p>
      <blockquote>${message}</blockquote>
      <p>We'll review it and get back to you if needed.</p>
      <p>Regards,<br/>Support Team</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};
