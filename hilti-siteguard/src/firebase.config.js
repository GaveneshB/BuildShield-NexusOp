/* Firebase Configuration
 * Initializes both Firestore and Realtime Database
 */

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
import { getAnalytics, isSupported as analyticsIsSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

let app = null
let db = null
let rtdb = null
let analytics = null
let isFirebaseReady = false

// Initialize Firebase
if (firebaseConfig && firebaseConfig.projectId) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    
    // Initialize Firestore
    db = getFirestore(app)
    console.log('%c✅ Firestore Connected — Project: ' + firebaseConfig.projectId, 'color: #34d399; font-weight: bold;')
    
    // Initialize Realtime Database
    if (firebaseConfig.databaseURL) {
      rtdb = getDatabase(app)
      console.log('%c✅ Realtime Database Connected', 'color: #34d399; font-weight: bold;')
    }
    
    // Initialize Analytics
    analyticsIsSupported().then(supported => {
      if (supported) {
        analytics = getAnalytics(app)
        console.log('%c📊 Firebase Analytics active', 'color: #60a5fa; font-weight: bold;')
      }
    }).catch(() => {})
    
    isFirebaseReady = true
  } catch (error) {
    console.error('❌ Firebase initialization error:', error)
    isFirebaseReady = false
  }
} else {
  console.warn('⚠️ Firebase config incomplete. Using localStorage fallback.')
}

export { app, db, rtdb, analytics, isFirebaseReady }
