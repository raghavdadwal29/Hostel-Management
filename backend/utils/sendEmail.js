const nodemailer = require('nodemailer');

// Sends email via Nodemailer/SMTP. If SMTP env vars are not configured,
// falls back to logging the email to the console so the app remains fully
// functional in local/dev environments without real credentials.
const sendEmail = async ({ to, subject, html, text }) => {
  const isConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;

  if (!isConfigured) {
    console.log('--- [DEV MODE] Email not sent (SMTP not configured) ---');
    console.log(`To: ${to}\nSubject: ${subject}\n${text || html}`);
    console.log('--------------------------------------------------------');
    return { mocked: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  return transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
    text,
  });
};

module.exports = sendEmail;
