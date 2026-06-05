import { useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role: 'admin' | 'barber' | 'customer';
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
      console.log('User UID:', firebaseUser?.uid);
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile from Firestore
        try {
          console.log('Fetching profile for UID:', firebaseUser.uid);
          const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
          if (profileDoc.exists()) {
            console.log('Profile found:', profileDoc.data());
            setProfile(profileDoc.data() as UserProfile);
          } else {
            console.log('Profile not found, creating default');
            // Create default profile if it doesn't exist
            setProfile({
              id: firebaseUser.uid,
              full_name: firebaseUser.displayName || null,
              phone: null,
              email: firebaseUser.email || null,
              role: 'customer'
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = profile?.role === 'admin';
  const isBarber = profile?.role === 'barber';
  const isCustomer = profile?.role === 'customer';

  return {
    user,
    profile,
    loading,
    isAdmin,
    isBarber,
    isCustomer
  };
}
