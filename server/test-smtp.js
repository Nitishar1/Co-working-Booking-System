require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: false, // port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
  debug: true,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

console.log('Sending test email out from', process.env.EMAIL_FROM, 'on', process.env.EMAIL_HOST);

transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: process.env.EMAIL_FROM,
  subject: 'SMTP Debug Test',
  text: 'If you see this, SMTP is working.'
}, (err, info) => {
  if (err) {
    console.error('FAILED TO SEND:', err.message);
  } else {
    console.log('SUCCESS, messageId:', info.messageId);
  }
  process.exit(0);
});
