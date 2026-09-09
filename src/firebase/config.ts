import { initializeApp, getApps } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCIZ28ER_oE781ZFwt6GvMiy1CEztXv-Z0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "banglabox.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://banglabox-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "banglabox",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "banglabox.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "892622323528",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:892622323528:web:e6c81bd7fd4624e4147d7d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PXYZD7HY59",
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const db = getDatabase(app)
export const auth = getAuth(app)
export const isDemo = false
