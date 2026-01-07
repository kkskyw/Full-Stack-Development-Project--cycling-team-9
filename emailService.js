const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter with default Gmail settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendOtpEmail(toEmail, otp) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8dd4c3; padding: 30px; text-align: center; color: white; }
          .content { padding: 30px; background-color: white; }
          .otp-box { background-color: #f9f9f9; border: 2px dashed #8dd4c3; padding: 25px; text-align: center; font-size: 32px; font-weight: bold; margin: 30px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Cycling Without Age Singapore</h1>
            <p>Password Reset Request</p>
          </div>
          <div class="content">
            <h2>Hello,</h2>
            <p>Your OTP code is: <strong>${otp}</strong></p>
            <p>This OTP is valid for 10 minutes.</p>
            <p>Best regards,<br>Cycling Without Age Singapore Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'Password Reset OTP - Cycling Without Age Singapore',
      html: htmlContent,
    });

    console.log('✅ Email sent successfully to:', toEmail);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    return { 
      success: false, 
      message: 'Failed to send OTP email. Please try again later.',
      error: error.message 
    };
  }
}

// Send password reset confirmation email
async function sendPasswordResetConfirmation(toEmail) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8dd4c3 0%, #7bc4b2 100%); padding: 30px; text-align: center; color: white; }
          .content { padding: 30px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Cycling Without Age Singapore</h1>
            <p>Password Reset Successful</p>
          </div>
          <div class="content">
            <h2>Password Updated Successfully</h2>
            <p>Your password has been reset successfully.</p>
            <p>If you did not make this change, please contact our support team immediately.</p>
            <p>Best regards,<br>Cycling Without Age Singapore Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Cycling Without Age Singapore</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'Password Reset Successful - Cycling Without Age Singapore',
      html: htmlContent,
    });

    return { success: true };
    
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error };
  }
}

module.exports = {
  sendOtpEmail,
  sendPasswordResetConfirmation
};