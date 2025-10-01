import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const emailConfigGuide = {
  title: "Gmail SMTP Configuration Guide",
  steps: [
    "Enable 2-Step Verification for your Google account",
    "Generate an App Password from Google Account settings",
    "Use the App Password instead of your regular password",
    "Configure your server's environment variables with these credentials"
  ],
  environmentVariables: [
    { name: "EMAIL_USER", description: "Your Gmail address" },
    { name: "EMAIL_APP_PASSWORD", description: "Your generated App Password" }
  ],
  resources: {
    appPasswordGuide: "https://support.google.com/accounts/answer/185833",
    gmailSettings: "https://myaccount.google.com/security"
  }
};

// Create and export the nodemailer transport configuration
export const createNodemailerTransport = () => {
  // Create reusable transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Using APP PASSWORD instead of regular password
    },
    tls: {
      rejectUnauthorized: false // Accept self-signed certificates
    }
  });

  return transporter;
};

export default createNodemailerTransport;