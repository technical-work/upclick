const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Parse .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    env[key] = value.replace(/\\n/g, '\n');
  }
});

console.log("Project ID:", env.FIREBASE_PROJECT_ID);
console.log("Client Email:", env.FIREBASE_CLIENT_EMAIL);

try {
  initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY
    })
  });
  
  const db = getFirestore();
  console.log("Attempting to fetch tenants/global...");
  db.collection('tenants').doc('global').get()
    .then(doc => {
      if (doc.exists) {
        console.log("Success! Document data:", doc.data());
      } else {
        console.log("Document does not exist, but connection was successful.");
      }
      process.exit(0);
    })
    .catch(err => {
      console.error("Firestore fetch error:", err);
      process.exit(1);
    });
} catch (err) {
  console.error("Initialization error:", err);
  process.exit(1);
}
