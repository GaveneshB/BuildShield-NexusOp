/* Firebase Configuration
 * Initializes both Firestore and Realtime Database
 */

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
import { getAnalytics, isSupported as analyticsIsSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyBokWWQjxm6IhTF5abYUBd9O-cNYhQDX9E",
  authDomain: "buildshield-nexusop.firebaseapp.com",
  databaseURL: "https://buildshield-nexusop-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "buildshield-nexusop",
  storageBucket: "buildshield-nexusop.firebasestorage.app",
  messagingSenderId: "741198865988",
  appId: "1:741198865988:web:4bc35a82871af1e9b4be11",
  measurementId: "G-CE7KW9KPZQ",
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
