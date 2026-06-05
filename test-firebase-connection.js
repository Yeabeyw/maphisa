// Test Firebase Connection

// Disable SSL certificate verification for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCaJjcJH4uWOStmooosXSKPKCc839leEhU",
  authDomain: "maphisa-barbershop.firebaseapp.com",
  projectId: "maphisa-barbershop",
  storageBucket: "maphisa-barbershop.firebasestorage.app",
  messagingSenderId: "718491555614",
  appId: "1:718491555614:web:94e27bb0261ce375375b0f",
  measurementId: "G-6L3PBJXNTJ"
};

console.log('Testing Firebase connection...');

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');

  // Test Firestore
  const db = getFirestore(app);
  console.log('✅ Firestore initialized');

  // Test Auth
  const auth = getAuth(app);
  console.log('✅ Auth initialized');

  // Try to read from services collection
  const servicesSnapshot = await getDocs(collection(db, 'services'));
  console.log(`✅ Successfully connected to Firestore`);
  console.log(`📊 Found ${servicesSnapshot.size} services in database`);

  if (servicesSnapshot.size === 0) {
    console.log('⚠️  No services found. Run: node firebase-seed.js to populate the database');
  } else {
    console.log('📋 Services:');
    servicesSnapshot.forEach(doc => {
      console.log(`   - ${doc.data().name} (M${doc.data().price_maloti})`);
    });
  }

  console.log('\n✅ All Firebase services are working correctly!');
} catch (error) {
  console.error('❌ Firebase connection failed:', error.message);
  console.error('\nPossible issues:');
  console.error('1. Firestore Database not enabled in Firebase Console');
  console.error('2. Firebase project ID is incorrect');
  console.error('3. Network connectivity issues');
  console.error('4. Firebase rules blocking access');
  console.error('\nTo fix:');
  console.error('- Go to Firebase Console → Firestore Database → Create Database');
  console.error('- Enable Authentication in Firebase Console');
}
