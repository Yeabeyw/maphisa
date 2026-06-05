import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyCaJjcJH4uWOStmooosXSKPKCc839leEhU",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "maphisa-barbershop.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "maphisa-barbershop",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "maphisa-barbershop.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "718491555614",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:718491555614:web:94e27bb0261ce375375b0f",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-6L3PBJXNTJ"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
