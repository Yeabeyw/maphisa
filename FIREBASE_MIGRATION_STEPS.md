# Firebase Migration Steps - Maphisa's Barber Shop

## ✅ Completed Steps

1. ✅ Installed Firebase SDK
2. ✅ Created Firebase configuration file (`src/lib/firebase.ts`)
3. ✅ Created Firebase auth hook (`src/hooks/useFirebaseAuth.ts`)
4. ✅ Created database seeding script (`firebase-seed.js`)
5. ✅ Updated .env with Firebase variables

---

## 🔧 Next Steps - Follow in Order

### Step 1: Get Firebase Configuration

1. Go to Firebase Console: https://console.firebase.google.com/project/maphisa-barbershop/overview
2. Click **Settings** (gear icon) → **Project Settings**
3. Scroll down to **Your Apps** section
4. Click **Web App** (or create one if it doesn't exist)
5. Copy the configuration values:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

6. Update your `.env` file with these values:
   ```
   VITE_FIREBASE_API_KEY=your-actual-api-key
   VITE_FIREBASE_AUTH_DOMAIN=maphisa-barbershop.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=maphisa-barbershop
   VITE_FIREBASE_STORAGE_BUCKET=maphisa-barbershop.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
   VITE_FIREBASE_APP_ID=your-actual-app-id
   ```

7. Update `src/lib/firebase.ts` with the same values (fallbacks)

---

### Step 2: Enable Firebase Services

1. **Authentication:**
   - Go to Firebase Console → **Authentication**
   - Click **Get Started**
   - Enable **Email/Password** sign-in method
   - Enable **Google** sign-in (optional)

2. **Firestore Database:**
   - Go to Firebase Console → **Firestore Database**
   - Click **Create Database**
   - Choose a location (closest to your users)
   - Start in **Test Mode** (we'll add rules later)
   - Click **Enable**

3. **Hosting:**
   - Go to Firebase Console → **Hosting**
   - Click **Get Started**

---

### Step 3: Seed Firestore Database

1. Update `firebase-seed.js` with your actual Firebase config
2. Run the seeding script:
   ```bash
   node firebase-seed.js
   ```
3. Verify in Firebase Console → Firestore Database that services were added

---

### Step 4: Migrate Authentication Pages

#### Update Register Page (`src/routes/register.tsx`)

Replace Supabase auth with Firebase:

```typescript
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// In the mutation function:
const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);
await updateProfile(user, { displayName: data.name });

// Create user profile in Firestore
await setDoc(doc(db, 'profiles', user.uid), {
  id: user.uid,
  full_name: data.name,
  phone: data.phone,
  email: data.email,
  role: 'customer',
  created_at: new Date().toISOString()
});
```

#### Update Auth Page (`src/routes/auth.tsx`)

Replace with Firebase sign-in:

```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Sign in function:
await signInWithEmailAndPassword(auth, email, password);
```

---

### Step 5: Update Auth Hook Usage

Replace all uses of `useAuth` with `useFirebaseAuth`:

```typescript
// Before
import { useAuth } from "@/hooks/useAuth";
const { user, isAdmin } = useAuth();

// After
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
const { user, isAdmin } = useFirebaseAuth();
```

Files to update:
- `src/components/site/Header.tsx`
- `src/routes/auth.tsx`
- `src/routes/_authenticated/dashboard.tsx`
- Any other component using `useAuth`

---

### Step 6: Migrate Services Page

Update `src/routes/services.tsx` to use Firestore:

```typescript
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Replace the useQuery with:
const { data, isLoading } = useQuery({
  queryKey: ["services"],
  queryFn: async () => {
    const q = query(
      collection(db, 'services'),
      where('active', '==', true),
      orderBy('category')
    );
    const snapshot = await getDocs(q);
    const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { services };
  }
});
```

---

### Step 7: Set Up Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select: **Hosting**
   - Use existing project: **maphisa-barbershop**
   - Public directory: **dist**
   - Configure as single-page app: **Yes**

3. Create `firebase.json`:
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

---

### Step 8: Update Server Functions

This is the most complex part. Server functions need to be converted to Firebase Cloud Functions.

Create `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.createBooking = functions.https.onCall(async (data, context) => {
  // Your booking logic here
  // Use admin.firestore() for admin operations
});

exports.listServices = functions.https.onCall(async (data, context) => {
  const snapshot = await admin.firestore().collection('services').get();
  return { services: snapshot.docs.map(doc => doc.data()) };
});
```

---

### Step 9: Update All Components

Go through all components and replace:
- Supabase client imports → Firebase imports
- SQL queries → Firestore queries
- Supabase auth → Firebase auth

Key files to update:
- `src/routes/bookings.tsx`
- `src/routes/contact.tsx`
- `src/routes/gallery.tsx`
- `src/routes/about.tsx`
- All admin pages

---

### Step 10: Test Thoroughly

1. Test authentication (register, login, logout)
2. Test services page
3. Test booking flow
4. Test admin functions
5. Test on mobile devices

---

### Step 11: Set Firestore Security Rules

In Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Profiles: users can read/write their own
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Services: public read, admin write
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Bookings: users can read/write their own
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.user_id;
    }
  }
}
```

---

## 📋 Migration Checklist

- [ ] Get Firebase config and update .env
- [ ] Enable Authentication (Email/Password)
- [ ] Enable Firestore Database
- [ ] Enable Hosting
- [ ] Seed Firestore with services data
- [ ] Migrate register.tsx to Firebase Auth
- [ ] Migrate auth.tsx to Firebase Auth
- [ ] Update all useAuth hooks to useFirebaseAuth
- [ ] Migrate services.tsx to Firestore
- [ ] Migrate bookings functionality
- [ ] Update Header component
- [ ] Set up Firebase Hosting
- [ ] Convert server functions to Cloud Functions
- [ ] Update all remaining components
- [ ] Set Firestore security rules
- [ ] Test all functionality
- [ ] Deploy to Firebase

---

## ⚠️ Important Notes

1. **Backup your Supabase data** before migration
2. **Test in development first** before deploying
3. **This is a major change** - expect some bugs
4. **Firestore has different query patterns** than SQL
5. **Cloud Functions have different pricing** than server functions
6. **Consider keeping Supabase as backup** initially

---

## 🆘 Need Help?

If you get stuck on any step, let me know which step and I'll provide detailed assistance.
