const nodemailer = require("nodemailer");

async function sendEmail(to, subject, text) {
  try {
    // Transporter setup (Gmail example, ya apne SMTP use karo)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"AI StudyPulse" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });

    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
}

module.exports = sendEmail;
