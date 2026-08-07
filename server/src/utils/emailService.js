const nodemailer = require('nodemailer');
const config = require('../config/env');

/**
 * Email notification service stub.
 * In development, logs to console. In production, sends via SMTP.
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this._init();
  }

  _init() {
    // Send emails even in development as long as credentials are provided
    if (config.email.user && config.email.pass) {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: parseInt(config.email.port, 10),
        secure: false,
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      });
    }
  }

  async _send(to, subject, html) {
    if (!this.transporter) {
      // Stub: log in development
      console.log(`\n📧 [EMAIL STUB] To: ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Body: ${html}\n`);
      return { stub: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        html,
      });
      return info;
    } catch (error) {
      console.error('Email send error:', error.message);
    }
  }

  /**
   * Send booking approved notification.
   */
  async sendBookingApproved(user, booking, space) {
    const subject = `✅ Booking Approved - ${space.name}`;
    const html = `
      <h2>Booking Approved!</h2>
      <p>Dear ${user.name},</p>
      <p>Your booking for <strong>${space.name}</strong> has been <strong>approved</strong>.</p>
      <ul>
        <li><strong>Date:</strong> ${new Date(booking.bookingDate).toDateString()}</li>
        <li><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</li>
      </ul>
      <p>Thank you for using CoWork!</p>
    `;
    return this._send(user.email, subject, html);
  }

  /**
   * Send booking rejected notification.
   */
  async sendBookingRejected(user, booking, space) {
    const subject = `❌ Booking Rejected - ${space.name}`;
    const html = `
      <h2>Booking Rejected</h2>
      <p>Dear ${user.name},</p>
      <p>Unfortunately your booking for <strong>${space.name}</strong> on 
      <strong>${new Date(booking.bookingDate).toDateString()}</strong> (${booking.startTime} - ${booking.endTime}) 
      has been <strong>rejected</strong>.</p>
      <p>Please contact support for more information.</p>
    `;
    return this._send(user.email, subject, html);
  }

  /**
   * Send booking cancelled notification.
   */
  async sendBookingCancelled(user, booking, space) {
    const subject = `🚫 Booking Cancelled - ${space.name}`;
    const html = `
      <h2>Booking Cancelled</h2>
      <p>Dear ${user.name},</p>
      <p>Your booking for <strong>${space.name}</strong> on 
      <strong>${new Date(booking.bookingDate).toDateString()}</strong> has been <strong>cancelled</strong>.</p>
    `;
    return this._send(user.email, subject, html);
    }
    
  /**
   * Send registration OTP notification.
   */
  async sendRegistrationOtp(email, name, otpCode) {
    const subject = `🔐 Your Verification Code for CoWork`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #111;">Verify Your Email Address</h2>
        <p style="color: #555; font-size: 16px;">Hi ${name},</p>
        <p style="color: #555; font-size: 16px;">Thank you for registering with CoWork! Please use the following One-Time Password (OTP) to verify your account and complete your registration. This code will expire in 10 minutes.</p>
        <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000;">${otpCode}</span>
        </div>
        <p style="color: #888; font-size: 14px;">If you did not request this, please ignore this email.</p>
      </div>
    `;
    return this._send(email, subject, html);
  }
}

module.exports = new EmailService();
