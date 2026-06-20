const admin = require('firebase-admin');

// Note: Ensure GOOGLE_APPLICATION_CREDENTIALS environment variable is set
// or pass credentials directly if needed for local testing without the env var.
admin.initializeApp({ 
  credential: admin.credential.applicationDefault() 
});

const db = admin.firestore();

module.exports = { db, admin };
