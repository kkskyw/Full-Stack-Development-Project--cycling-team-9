const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

// Configure Brevo (Sendinblue) API
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Send OTP email using Brevo
/*
async function sendOtpEmail(toEmail, otp) {
  try {
    // Create email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #8dd4c3 0%, #7bc4b2 100%);
            padding: 30px 20px;
            text-align: center;
            color: white;
            border-radius: 10px 10px 0 0;
          }
          .content {
            padding: 30px;
            background-color: white;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          .otp-box {
            background-color: #f9f9f9;
            border: 2px dashed #8dd4c3;
            padding: 25px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 10px;
            margin: 30px 0;
            border-radius: 8px;
            color: #333;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
            border-top: 1px solid #eee;
          }
          .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #8dd4c3;
            padding: 15px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            background-color: #8dd4c3;
            color: #333;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          @media (max-width: 600px) {
            .otp-box {
              font-size: 24px;
              letter-spacing: 8px;
              padding: 20px;
            }
          }
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
            <p>You have requested to reset your password for your Cycling Without Age Singapore account.</p>
            
            <p>Please use the following One-Time Password (OTP) to reset your password:</p>
            
            <div class="otp-box">${otp}</div>
            
            <div class="info-box">
              <p><strong>Important Information:</strong></p>
              <ul>
                <li>This OTP is valid for 10 minutes</li>
                <li>Do not share this OTP with anyone</li>
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>For security reasons, this OTP will expire after 10 minutes</li>
              </ul>
            </div>
            
            <p>If you're having trouble with the OTP, you can request a new one from the reset password page.</p>
            
            <p>Best regards,<br>
            <strong>Cycling Without Age Singapore Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Cycling Without Age Singapore. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
            <p>If you need assistance, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create email send request
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = "Password Reset OTP - Cycling Without Age Singapore";
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || "Cycling Without Age Singapore",
      email: process.env.BREVO_SENDER_EMAIL || "no-reply@cyclingwithoutsingapore.com"
    };
    sendSmtpEmail.to = [{ email: toEmail }];
    
    // Send email via Brevo API
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('OTP email sent successfully via Brevo:', response);
    return { success: true, messageId: response.messageId };
    
  } catch (error) {
    console.error('Error sending email via Brevo:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to send OTP email',
      error
    };
  }
}
*/

// In emailService.js, modify sendOtpEmail function:

async function sendOtpEmail(toEmail, otp) {
  try {
    // ========== TEMPORARY FIX ==========
    // Log to console instead of sending email
    console.log('=================================');
    console.log(`📧 Would send OTP to: ${toEmail}`);
    console.log(`🔢 OTP Code: ${otp}`);
    console.log('=================================');
    
    // For testing, always return success
    return { 
      success: true, 
      messageId: 'test-' + Date.now() 
    };
    
    // Comment out the real email sending code below:
    /*
    const htmlContent = `
      ... your email HTML ...
    `;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = "Password Reset OTP - Cycling Without Age Singapore";
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || "Cycling Without Age Singapore",
      email: process.env.BREVO_SENDER_EMAIL || "no-reply@cyclingwithoutsingapore.com"
    };
    sendSmtpEmail.to = [{ email: toEmail }];
    
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('OTP email sent successfully via Brevo:', response);
    return { success: true, messageId: response.messageId };
    */
    
  } catch (error) {
    console.error('Error sending email via Brevo:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to send OTP email',
      error
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
            <p>For security reasons, we recommend:</p>
            <ul>
              <li>Using a strong, unique password</li>
              <li>Not sharing your password with anyone</li>
              <li>Enabling two-factor authentication if available</li>
            </ul>
            <p>Best regards,<br>
            Cycling Without Age Singapore Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Cycling Without Age Singapore</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = "Password Reset Successful - Cycling Without Age Singapore";
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || "Cycling Without Age Singapore",
      email: process.env.BREVO_SENDER_EMAIL || "no-reply@cyclingwithoutsingapore.com"
    };
    sendSmtpEmail.to = [{ email: toEmail }];
    
    await apiInstance.sendTransacEmail(sendSmtpEmail);
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