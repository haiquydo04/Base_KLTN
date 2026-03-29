/**
 * Send Email Utility
 * NODE_ENV = development | production
 * EMAIL_MODE = console | gmail
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  emailMode: process.env.EMAIL_MODE || 'console',
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS
};

let transporter = null;

if (config.emailMode === 'gmail' && config.emailUser && config.emailPass) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.emailUser,
      pass: config.emailPass
    }
  });
}

export const sendOTP = async (email, otp) => {
  if (config.nodeEnv === 'development' || config.emailMode === 'console') {
    console.log('========================================');
    console.log('EMAIL OTP (Development Mode)');
    console.log('========================================');
    console.log(`To: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log(`Expires in: 5 minutes`);
    console.log('========================================');
    return { success: true, message: 'OTP logged to console', mode: 'console' };
  }

  if (!transporter) {
    return { success: false, message: 'Email service not configured' };
  }

  const mailOptions = {
    from: `"Dating App" <${config.emailUser}>`,
    to: email,
    subject: 'Password Reset OTP - Dating App',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">We received a request to reset your password. Use the OTP below:</p>
          <div style="background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Your OTP Code:</p>
            <p style="font-size: 36px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 8px;">${otp}</p>
          </div>
          <p style="font-size: 14px; color: #666;">This code expires in <strong>5 minutes</strong>.</p>
          <p style="font-size: 14px; color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'OTP sent to email', mode: 'gmail' };
  } catch (error) {
    return { success: false, message: 'Failed to send email: ' + error.message };
  }
};

export default { sendOTP };
