const userModel = require("../models/userModel");
const emailService = require("../emailService");
require('dotenv').config();

// Request OTP for password reset
/*
async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address"
      });
    }
    
    // Generate OTP
    const otp = userModel.generateOtp();
    
    // Store OTP in Firestore
    const { expiryTime } = await userModel.storeOtp(email, otp);
    
    // Send OTP via email (using Brevo)
    const emailResult = await emailService.sendOtpEmail(email, otp);
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again later."
      });
    }
    
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      expiryTime: expiryTime.toISOString()
    });
    
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}
*/

// Request OTP for password reset
async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address"
      });
    }
    
    // Generate OTP
    const otp = userModel.generateOtp();
    
    // Store OTP in Firestore
    const { expiryTime } = await userModel.storeOtp(email, otp);
    
    // ========== TEMPORARY FIX ==========
    // Log OTP to console instead of sending email
    console.log('=================================');
    console.log(`📧 OTP Request for: ${email}`);
    console.log(`🔢 OTP Code: ${otp}`);
    console.log(`⏰ Expires at: ${expiryTime.toLocaleTimeString()}`);
    console.log('=================================');
    
    // For testing only - comment out the email sending
    /*
    const emailResult = await emailService.sendOtpEmail(email, otp);
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again later."
      });
    }
    */
    
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      expiryTime: expiryTime.toISOString(),
      // For testing only - remove in production!
      testOtp: otp
    });
    
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

// Verify OTP
async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    
    // Verify OTP
    const verificationResult = await userModel.verifyOtp(email, otp);
    
    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message
      });
    }
    
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetId: verificationResult.resetId
    });
    
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

// Reset password with OTP
async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    
    // Verify OTP first
    const verificationResult = await userModel.verifyOtp(email, otp);
    
    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message
      });
    }
    
    // Update user password
    const updateResult = await userModel.updateUserPassword(email, newPassword);
    
    if (!updateResult.success) {
      return res.status(500).json({
        success: false,
        message: updateResult.message
      });
    }
    
    // Mark OTP as used
    await userModel.markOtpAsUsed(verificationResult.resetId);
    
    res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });
    
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

module.exports = {
  requestPasswordReset,
  verifyOtp,
  resetPassword
};