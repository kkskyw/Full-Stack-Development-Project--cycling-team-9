const { db } = require('../firebaseAdmin');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const usersCol = db.collection('users');
const passwordResetCol = db.collection('passwordResets');

// Get user by ID
async function getUserById(id) {
  const doc = await usersCol.doc(String(id)).get();
  if (!doc.exists) return null;
  return { userId: doc.id, ...doc.data() };
}

// Create user - Use Firebase Auth UID as document ID
async function createUser(userData, firebaseUid = null) {
  // If firebaseUid provided, use it as document ID; otherwise generate one
  const ref = firebaseUid ? usersCol.doc(firebaseUid) : usersCol.doc();
  const userId = ref.id;
  
  // Store userId inside the document for consistency
  const userWithId = {
    ...userData,
    userId: userId,
    createdAt: new Date().toISOString()
  };
  
  await ref.set(userWithId);
  return { userId, ...userWithId };
}

// Update user
async function updateUserInfo(userId, updatedData) {
  const ref = usersCol.doc(String(userId));
  await ref.set(updatedData, { merge: true });
  const doc = await ref.get();
  return { userId: doc.id, ...doc.data() };
}

// Generate OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP in Firestore
async function storeOtp(email, otp, expiryMinutes = 10) {
  const expiryTime = new Date(Date.now() + expiryMinutes * 60000);
  const resetId = crypto.randomBytes(16).toString('hex');
  
  const otpData = {
    email,
    otp,
    expiryTime: expiryTime.toISOString(),
    createdAt: new Date().toISOString(),
    verified: false,
    attempts: 0,
    used: false
  };
  
  await passwordResetCol.doc(resetId).set(otpData);
  
  // Auto-delete after expiry
  setTimeout(async () => {
    const doc = await passwordResetCol.doc(resetId).get();
    if (doc.exists && !doc.data().used) {
      await passwordResetCol.doc(resetId).delete();
    }
  }, expiryMinutes * 60000);
  
  return { resetId, expiryTime };
}

// Get OTP data from Firestore
async function getOtpData(email, otp = null) {
  let query = passwordResetCol.where('email', '==', email);
  
  if (otp) {
    query = query.where('otp', '==', otp);
  }
  
  query = query.orderBy('createdAt', 'desc').limit(1);
  
  const snapshot = await query.get();
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

// Verify OTP
async function verifyOtp(email, otp) {
  const otpData = await getOtpData(email, otp);
  
  if (!otpData) {
    return { success: false, message: 'OTP not found or expired' };
  }
  
  if (otpData.used) {
    return { success: false, message: 'OTP has already been used' };
  }
  
  const expiryTime = new Date(otpData.expiryTime);
  if (new Date() > expiryTime) {
    await passwordResetCol.doc(otpData.id).delete();
    return { success: false, message: 'OTP expired' };
  }
  
  if (otpData.attempts >= 3) {
    await passwordResetCol.doc(otpData.id).update({ used: true });
    return { success: false, message: 'Too many attempts. Request new OTP' };
  }
  
  if (otpData.otp !== otp) {
    await passwordResetCol.doc(otpData.id).update({ 
      attempts: (otpData.attempts || 0) + 1 
    });
    return { success: false, message: 'Invalid OTP' };
  }
  
  // Mark as verified
  await passwordResetCol.doc(otpData.id).update({ 
    verified: true,
    verifiedAt: new Date().toISOString()
  });
  
  return { success: true, resetId: otpData.id };
}

// Mark OTP as used
async function markOtpAsUsed(resetId) {
  await passwordResetCol.doc(resetId).update({ 
    used: true,
    usedAt: new Date().toISOString()
  });
}

// Update user password
async function updateUserPassword(email, newPassword) {
  try {
    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password in Firestore
    await usersCol.doc(user.userId).update({
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    });
    
    // Also update Firebase Auth if using Firebase Auth
    try {
      const { admin } = require('../firebaseAdmin');
      await admin.auth().updateUser(user.userId, {
        password: newPassword
      });
    } catch (firebaseError) {
      console.log('Note: Firebase Auth update skipped', firebaseError.message);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating password:', error);
    return { success: false, message: 'Failed to update password' };
  }
}

// Delete expired OTPs (cleanup function)
async function cleanupExpiredOtps() {
  const now = new Date().toISOString();
  const snapshot = await passwordResetCol
    .where('expiryTime', '<', now)
    .where('used', '==', false)
    .get();
  
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  return snapshot.size;
}

// Find user by email
async function findUserByEmail(email) {
  const snap = await usersCol.where('email', '==', email).limit(1).get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { userId: d.id, ...d.data() };
}

// Find user by phone
async function findUserByPhone(phone) {
  const snap = await usersCol.where('phone', '==', phone).limit(1).get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { userId: d.id, ...d.data() };
}

async function updateUserInfo(userId, updatedData) {
  const ref = usersCol.doc(String(userId));
  await ref.set(updatedData, { merge: true });
  const doc = await ref.get();
  return { userId: doc.id, ...doc.data() };
}

module.exports = {
  getUserById,
  createUser,
  findUserByEmail,
  findUserByPhone,
  updateUserInfo,
  
  // Password reset methods
  generateOtp,
  storeOtp,
  getOtpData,
  verifyOtp,
  markOtpAsUsed,
  updateUserPassword,
  cleanupExpiredOtps
};