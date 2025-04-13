import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { connect } from '@/lib/dbConfig';
import mongoose from 'mongoose';

// Define the verification token schema
const verificationTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true },
  type: { type: String, required: true }, // 'verification', 'password-reset', etc.
  createdAt: { type: Date, default: Date.now, expires: '24h' }, // Auto-expire after 24 hours
});

const VerificationToken = mongoose.models.VerificationToken || 
  mongoose.model('VerificationToken', verificationTokenSchema);

const createTransporter = () => {
  console.log('Creating email transporter');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

export const generateToken = async (email, type = 'verification') => {
  try {
    await connect();
    console.log(`Generating ${type} token for ${email}`);
    
    await VerificationToken.deleteMany({ email, type });
    
    const token = crypto.randomBytes(32).toString('hex');
    
    await new VerificationToken({
      email,
      token,
      type
    }).save();
    
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
};

export const verifyToken = async (token, type = 'verification') => {
  try {
    await connect();
    
    const tokenDoc = await VerificationToken.findOne({ token, type });
    if (!tokenDoc) return { valid: false };
    
    return {
      valid: true,
      email: tokenDoc.email,
      createdAt: tokenDoc.createdAt
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return { valid: false };
  }
};

export const deleteToken = async (token) => {
  try {
    await connect();
    await VerificationToken.deleteOne({ token });
  } catch (error) {
    console.error('Error deleting token:', error);
  }
};

export const sendVerificationEmail = async (email, token, name) => {
  try {
    console.log(`Sending verification email to ${email}`);
    const transporter = createTransporter();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationLink = `${appUrl}/verify/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your TeamSync account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a5568;">Welcome to TeamSync${name ? ', ' + name : ''}!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
          <a href="${verificationLink}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Verify Email
          </a>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not register for TeamSync, please ignore this email.</p>
          <p>Best regards,<br>TeamSync Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export { VerificationToken };
