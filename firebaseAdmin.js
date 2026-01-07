const admin = require('firebase-admin');
const path = require('path');

const keyPath = process.env.FIREBASE_SA_PATH || path.join(__dirname, 'serviceAccountKey.json');

let serviceAccount;
if (process.env.FIREBASE_SA) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SA);
} else {
  try {
    serviceAccount = require(keyPath);
  } catch (err) {
    console.error('Firebase service account not found. Set FIREBASE_SA or place serviceAccountKey.json in project root.');
    throw err;
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

module.exports = { admin, db }