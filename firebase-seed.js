// Firebase Database Seeding Script
// Run this with: node firebase-seed.js

// Disable SSL certificate verification for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';

// Firebase configuration
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

// Services data with your exact pricing
const services = [
  {
    name: "Taper Fade (Without Black Dye)",
    category: "Haircuts",
    description: "Clean taper fade with precision edges",
    duration_minutes: 30,
    price_maloti: 30,
    active: true
  },
  {
    name: "Taper Fade (With Black Dye)",
    category: "Haircuts",
    description: "Taper fade with black dye treatment",
    duration_minutes: 45,
    price_maloti: 50,
    active: true
  },
  {
    name: "Bald Haircut (Without Black Dye)",
    category: "Haircuts",
    description: "Complete bald haircut with head massage",
    duration_minutes: 25,
    price_maloti: 30,
    active: true
  },
  {
    name: "Bald Haircut (With Black Dye)",
    category: "Haircuts",
    description: "Bald haircut with black dye treatment",
    duration_minutes: 40,
    price_maloti: 50,
    active: true
  },
  {
    name: "Mohawk Haircut (Without Black Dye)",
    category: "Haircuts",
    description: "Bold mohawk with design",
    duration_minutes: 45,
    price_maloti: 30,
    active: true
  },
  {
    name: "Mohawk Haircut (With Black Dye)",
    category: "Haircuts",
    description: "Mohawk with black dye treatment",
    duration_minutes: 60,
    price_maloti: 50,
    active: true
  },
  {
    name: "Short Hair (Without Dye)",
    category: "Haircuts",
    description: "Short hair cut and style",
    duration_minutes: 20,
    price_maloti: 20,
    active: true
  },
  {
    name: "Short Hair (With Black Dye)",
    category: "Haircuts",
    description: "Short hair with black dye treatment",
    duration_minutes: 45,
    price_maloti: 60,
    active: true
  },
  {
    name: "Short Hair (With Colorful Dye)",
    category: "Haircuts",
    description: "Short hair with colorful dye treatment",
    duration_minutes: 75,
    price_maloti: 170,
    active: true
  },
  {
    name: "Haircut & Hairwash",
    category: "Haircuts",
    description: "Standard haircut with wash and style",
    duration_minutes: 35,
    price_maloti: 60,
    active: true
  },
  {
    name: "Haircut & Black Dye + Hairwash",
    category: "Haircuts",
    description: "Haircut with black dye treatment and wash",
    duration_minutes: 60,
    price_maloti: 80,
    active: true
  },
  {
    name: "Beard Trim",
    category: "Beards",
    description: "Beard trimming and shaping",
    duration_minutes: 15,
    price_maloti: 10,
    active: true
  },
  {
    name: "Hot Towel Shave",
    category: "Shaves",
    description: "Traditional hot towel straight razor shave",
    duration_minutes: 30,
    price_maloti: 50,
    active: true
  },
  {
    name: "Kids Haircut",
    category: "Kids",
    description: "Basic haircut for children under 12",
    duration_minutes: 25,
    price_maloti: 30,
    active: true
  },
  {
    name: "Ladies Haircut",
    category: "Ladies",
    description: "Professional ladies haircut and styling",
    duration_minutes: 45,
    price_maloti: 60,
    active: true
  },
  {
    name: "House Call",
    category: "Special Services",
    description: "We come to you - mobile haircut service at your location",
    duration_minutes: 45,
    price_maloti: 200,
    active: true
  },
  {
    name: "Chiz Kop",
    category: "Special Services",
    description: "Haircut followed by head massage and styling",
    duration_minutes: 20,
    price_maloti: 100,
    active: true
  }
];

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // Clear existing services
    const servicesSnapshot = await getDocs(collection(db, 'services'));
    console.log(`Found ${servicesSnapshot.size} existing services`);
    
    // Add services
    for (const service of services) {
      const serviceRef = doc(collection(db, 'services'));
      await setDoc(serviceRef, {
        ...service,
        id: serviceRef.id,
        created_at: new Date().toISOString()
      });
      console.log(`Added service: ${service.name}`);
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();
