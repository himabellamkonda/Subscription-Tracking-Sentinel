const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // sender email
        pass: process.env.EMAIL_PASS  // app password
      }
    });

    await transporter.sendMail({
      from: `"Subscription Sentinel" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log("📧 Email sent to:", to);
  } catch (error) {
    console.error("❌ Email Error:", error.message);
  }
};

module.exports = sendEmail;
