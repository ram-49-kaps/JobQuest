import User from '../models/Users.js';
import nodemailer from 'nodemailer';;
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// Create a nodemailer transporter with Gmail configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  }
});

// Verify SMTP connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
    console.error('Email configuration:', {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD ? '****' : 'not set'
    });
    if (error.code === 'EAUTH') {
      console.error('Authentication failed - check EMAIL_USER and EMAIL_PASSWORD');
    } else if (error.code === 'ESOCKET') {
      console.error('Network or firewall issue detected');
    } else {
      console.error('Unknown SMTP error:', error.message);
    }
  } else {
    console.log('SMTP connection is ready to take messages');
  }
});

// Log email attempts with detailed error information
const logEmailAttempt = (error, info) => {
  if (error) {
    console.error('Email sending failed:', {
      error: error.message,
      code: error.code,
      response: error.response,
      command: error.command,
      timestamp: new Date().toISOString()
    });
  } else {
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      response: info.response,
      timestamp: new Date().toISOString()
    });
  }
};

// Handle forgot password request
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    // Add resetTokenExpiry to user's password update
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }
    
    // Generate a temporary password with 10-minute expiry
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const resetExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    // Update user's password and expiry
    user.password = hashedPassword;
    user.resetPasswordExpiry = resetExpiry;
    await user.save();
    
    // Update email content to reflect 10-minute expiry
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'JobQuest - Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              font-family: Arial, sans-serif;
              color: #333333;
            }
            .header {
              background-color: #2557a7;
              padding: 20px;
              text-align: center;
              color: white;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #ffffff;
              padding: 20px;
              border: 1px solid #dddddd;
              border-radius: 0 0 5px 5px;
            }
            .password-box {
              background-color: #f5f5f5;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
              text-align: center;
              font-size: 18px;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #666666;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>JobQuest</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello ${user.fullName},</p>
              <p>We received a request to reset your password for your JobQuest account.</p>
              <div class="password-box">
                Your temporary password is: <strong>${tempPassword}</strong>
              </div>
              <p><strong>Important:</strong></p>
              <ul>
                <li>Please login with this temporary password</li>
                <li>This temporary password will expire in 10 minutes</li>
                <li>You must change your password immediately after logging in</li>
              </ul>
              <p>If you didn't request this password reset, please contact our support team immediately.</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} JobQuest. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send email
    try {
      await transporter.verify();
      const info = await transporter.sendMail(mailOptions);
      res.json({ 
        success: true,
        message: 'Temporary password has been sent to your email',
        redirectTo: '/login'  // Frontend can use this for redirection
      });
    } catch (emailError) {
      console.error('Email Error:', emailError);
      
      // Handle specific SMTP authentication errors
      if (emailError.code === 'EAUTH' || 
          (emailError.response && emailError.response.includes('Username and Password not accepted'))) {
        return res.status(500).json({ 
          message: 'Email service authentication failed. Please contact support.'
        });
      }
      
      return res.status(500).json({ 
        message: 'Failed to send reset email. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: 'An unexpected error occurred. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};