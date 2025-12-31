const { db } = require('../firebaseAdmin');

const usersCol = db.collection('users');

// Get user by ID
async function getUserById(id) {
  const doc = await usersCol.doc(String(id)).get();
  if (!doc.exists) return null;
  return { userId: doc.id, ...doc.data() };
}

// Create user - FIX: Store userId in document
async function createUser(userData) {
  const ref = usersCol.doc(); // Let Firestore generate ID
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
  updateUserInfo
};