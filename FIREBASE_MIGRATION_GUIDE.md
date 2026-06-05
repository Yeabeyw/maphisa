# Firebase Migration Guide for Maphisa's Barber Shop

## Current Database Tables (Supabase)

Your current Supabase database has these tables:

### 1. **services** - ✅ Updated with your pricing
- id, name, category, description, duration_minutes, price_maloti, active

### 2. **bookings** - Appointments
- id, user_id, barber_id, service_id, booking_date, booking_time, status, payment_status, location, notes

### 3. **barbers** - Staff members
- id, name, photo_url, bio, active, display_order, role

### 4. **profiles** - User profiles
- id, full_name, phone, created_at, updated_at

### 5. **membership_plans** - Subscription plans
- id, name, description, price_maloti, interval, perks, active, display_order

### 6. **user_memberships** - User subscriptions
- id, user_id, plan_id, status, started_at, renews_at, cancelled_at

### 7. **products** - Shop products
- id, name, category, description, price_maloti, stock, image_url, active

### 8. **orders** - Product orders
- id, user_id, total_maloti, status, payment_method, shipping_notes, contact_phone

### 9. **order_items** - Order line items
- id, order_id, product_id, product_name, quantity, unit_price_maloti

### 10. **payments** - Payment records
- id, user_id, booking_id, amount, method, reference, status, phone

### 11. **shop_payments** - Shop payments
- id, user_id, amount, method, kind, order_id, membership_id, reference, status

### 12. **user_roles** - User permissions
- id, user_id, role (admin/barber/customer)

---

## Firebase Migration Steps

### Option 1: Keep Supabase for Database, Use Firebase for Hosting Only
**RECOMMENDED** - Less work, your current code works

1. **Build your app:**
   ```bash
   npm run build
   ```

2. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

3. **Initialize Firebase:**
   ```bash
   firebase login
   firebase init
   ```
   - Select: Hosting
   - Use existing project: maphisa-barbershop
   - Public directory: `dist` (or your build output folder)
   - Configure as single-page app: Yes

4. **Deploy:**
   ```bash
   firebase deploy
   ```

### Option 2: Full Migration to Firebase (Database + Hosting)
**MORE WORK** - Requires rewriting all database code

#### Required Firebase Services:
1. **Firestore Database** - Replace Supabase PostgreSQL
2. **Firebase Authentication** - Replace Supabase Auth
3. **Firebase Hosting** - For your app
4. **Cloud Functions** - For server-side logic

#### What You Need to Change:

**1. Install Firebase SDK:**
```bash
npm install firebase
```

**2. Replace Supabase Client with Firebase:**
```typescript
// Current (Supabase)
import { supabase } from "@/integrations/supabase/client";
const { data } = await supabase.from('services').select('*');

// New (Firebase)
import { getFirestore, collection, getDocs } from 'firebase/firestore';
const db = getFirestore();
const snapshot = await getDocs(collection(db, 'services'));
const data = snapshot.docs.map(doc => doc.data());
```

**3. Replace Authentication:**
```typescript
// Current (Supabase)
await supabase.auth.signUp({ email, password });

// New (Firebase)
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
const auth = getAuth();
await createUserWithEmailAndPassword(auth, email, password);
```

**4. Rewrite All Server Functions:**
- admin.functions.ts → Cloud Functions
- booking.functions.ts → Cloud Functions
- payments.functions.ts → Cloud Functions

**5. Update All Database Queries:**
- Replace SQL with Firestore queries
- Update relationships (Firestore doesn't have joins like SQL)

---

## My Recommendation

**Keep Supabase for now, use Firebase for hosting only.**

### Why?
1. Your app already works with Supabase
2. Supabase has better SQL capabilities for complex queries
3. Less migration work
4. You can migrate to Firebase database later if needed

### Quick Start with Firebase Hosting:

1. **Build your app:**
   ```bash
   npm run build
   ```

2. **Install Firebase tools:**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

3. **Initialize in your project:**
   ```bash
   firebase init hosting
   ```

4. **Configure firebase.json:**
   ```json
   {
     "hosting": {
       "public": "dist",
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

5. **Deploy:**
   ```bash
   npm run build
   firebase deploy
   ```

---

## Next Steps

1. **Run the updated services SQL** in your Supabase dashboard to add your pricing
2. **Decide:** Firebase hosting only OR full Firebase migration
3. **Let me know** which option you prefer and I'll help you implement it
