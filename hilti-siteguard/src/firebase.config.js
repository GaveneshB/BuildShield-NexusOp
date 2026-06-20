/* Firebase Configuration
 * Initializes both Firestore and Realtime Database
 */

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
import { getAnalytics, isSupported as analyticsIsSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBokWWQjxm6IhTF5abYUBd9O-cNYhQDX9E",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "buildshield-nexusop.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://buildshield-nexusop-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "buildshield-nexusop",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "buildshield-nexusop.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "741198865988",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:741198865988:web:4bc35a82871af1e9b4be11",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-CE7KW9KPZQ",
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
