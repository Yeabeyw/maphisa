// Complete Database Seeding Script
// Run this with: node seed-all-collections.js

// Disable SSL certificate verification for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCaJjcJH4uWOStmooosXSKPKCc839leEhU",
  authDomain: "maphisa-barbershop.firebaseapp.com",
  projectId: "maphisa-barbershop",
  storageBucket: "maphisa-barbershop.firebasestorage.app",
  messagingSenderId: "718491555614",
  appId: "1:718491555614:web:94e27bb0261ce375375b0f",
  measurementId: "G-6L3PBJXNTJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Barbers data
const barbers = [
  {
    name: "Maphisa",
    bio: "Master barber with 12+ years of experience. Trained in Johannesburg, sharpened in Leribe.",
    photo_url: "",
    active: true,
    display_order: 1,
    role: "barber"
  },
  {
    name: "Tsepang",
    bio: "Specialist in fades and line-ups. Precision cuts with attention to detail.",
    photo_url: "",
    active: true,
    display_order: 2,
    role: "barber"
  }
];

// Membership plans
const membershipPlans = [
  {
    name: "Basic",
    description: "1 haircut per month, priority booking",
    price_maloti: 100,
    interval: "monthly",
    perks: ["1 haircut per month", "Priority booking", "10% off products"],
    active: true,
    display_order: 1
  },
  {
    name: "Premium",
    description: "2 haircuts per month, priority booking, free beard trim",
    price_maloti: 200,
    interval: "monthly",
    perks: ["2 haircuts per month", "Priority booking", "Free beard trim", "15% off products"],
    active: true,
    display_order: 2
  },
  {
    name: "VIP",
    description: "Unlimited haircuts, priority booking, free services",
    price_maloti: 400,
    interval: "monthly",
    perks: ["Unlimited haircuts", "Priority booking", "Free beard trim", "Free hot towel shave", "20% off products"],
    active: true,
    display_order: 3
  }
];

// Products
const products = [
  {
    name: "Premium Hair Gel",
    category: "Styling",
    description: "Strong hold hair gel for all hair types",
    price_maloti: 80,
    stock: 50,
    image_url: "",
    active: true
  },
  {
    name: "Beard Oil",
    category: "Beard Care",
    description: "Nourishing beard oil for healthy growth",
    price_maloti: 120,
    stock: 30,
    image_url: "",
    active: true
  },
  {
    name: "Hair Pomade",
    category: "Styling",
    description: "Medium shine pomade for classic styles",
    price_maloti: 100,
    stock: 40,
    image_url: "",
    active: true
  },
  {
    name: "Shampoo",
    category: "Hair Care",
    description: "Gentle cleansing shampoo for daily use",
    price_maloti: 60,
    stock: 60,
    image_url: "",
    active: true
  }
];

async function seedCollection(collectionName, data) {
  console.log(`\nSeeding ${collectionName}...`);
  
  try {
    // Clear existing documents
    const snapshot = await getDocs(collection(db, collectionName));
    console.log(`  Found ${snapshot.size} existing ${collectionName}`);
    
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, collectionName, docSnap.id));
    }
    console.log(`  Cleared existing ${collectionName}`);
    
    // Add new documents
    for (const item of data) {
      const docRef = doc(collection(db, collectionName));
      await setDoc(docRef, {
        ...item,
        id: docRef.id,
        created_at: new Date().toISOString()
      });
      console.log(`  ✓ Added: ${item.name}`);
    }
    
    console.log(`✅ ${collectionName} seeded successfully!`);
  } catch (error) {
    console.error(`❌ Error seeding ${collectionName}:`, error.message);
    throw error;
  }
}

async function seedAllCollections() {
  console.log('=== Starting Complete Database Seeding ===\n');
  
  try {
    // Seed barbers
    await seedCollection('barbers', barbers);
    
    // Seed membership plans
    await seedCollection('membership_plans', membershipPlans);
    
    // Seed products
    await seedCollection('products', products);
    
    console.log('\n=== All Collections Seeded Successfully ===');
    console.log('\n📊 Summary:');
    console.log(`  - Barbers: ${barbers.length}`);
    console.log(`  - Membership Plans: ${membershipPlans.length}`);
    console.log(`  - Products: ${products.length}`);
    console.log(`  - Services: (already seeded)`);
    console.log('\n✅ Your system is now functional!');
    console.log('\nNext steps:');
    console.log('1. Test the app at http://localhost:3001/');
    console.log('2. Register a new user account');
    console.log('3. Try booking a service');
    console.log('4. Check the services page to see your pricing');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
  }
}

seedAllCollections();
