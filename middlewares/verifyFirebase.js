const { admin } = require('../firebaseAdmin');

async function verifyFirebase(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.+)$/);
  const idToken = match ? match[1] : null;
  if (!idToken) return res.status(401).json({ error: 'Missing auth token' });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch (err) {
    console.error('Firebase token verify error', err);
    res.status(401).json({ error: 'Invalid auth token' });
  }
}

module.exports = verifyFirebase;