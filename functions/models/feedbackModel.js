const { db } = require("../firebaseAdmin");

async function createFeedback(data) {
  const docRef = await db.collection("feedback").add({
    name: data.name,
    email: data.email,
    message: data.message,
    createdAt: new Date().toISOString()
  });

  return { id: docRef.id };
}

// async function getAllFeedback() {
//   const snapshot = await db.collection("feedback")
//     .orderBy("createdAt", "desc")
//     .get();

//   return snapshot.docs.map(doc => ({
//     id: doc.id,
//     ...doc.data()
//   }));
// }
async function getAllFeedback() {
  const snapshot = await db.collection("feedback").get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

module.exports = {
  createFeedback,
  getAllFeedback
};
