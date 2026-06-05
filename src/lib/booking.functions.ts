import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { collection, getDocs, query, where, addDoc, doc, updateDoc, orderBy, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const [servicesSnapshot, barbersSnapshot] = await Promise.all([
    getDocs(query(collection(db, 'services'), where('active', '==', true))),
    getDocs(query(collection(db, 'barbers'), where('active', '==', true))),
  ]);

  const services = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const barbers = barbersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Sort by category and display_order in JavaScript
  services.sort((a: any, b: any) => (a.category || '').localeCompare(b.category || ''));
  barbers.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));

  return { services, barbers };
});

export const getTakenSlots = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ barberId: z.string(), date: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const q = query(
      collection(db, 'bookings'),
      where('barber_id', '==', data.barberId),
      where('booking_date', '==', data.date),
      where('status', '!=', 'cancelled')
    );
    const snapshot = await getDocs(q);
    const taken = snapshot.docs.map(doc => doc.data().booking_time as string);
    return { taken };
  });

const bookingSchema = z.object({
  service_id: z.string(),
  barber_id: z.string(),
  booking_date: z.string(),
  booking_time: z.string(),
  notes: z.string().max(500).optional(),
  location: z.enum(["Leribe", "Maputsoe", "Mohalalitoe"]),
});

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((d) => bookingSchema.parse(d))
  .handler(async ({ data }) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const docRef = await addDoc(collection(db, 'bookings'), {
      ...data,
      user_id: user.uid,
      status: 'pending',
      payment_status: 'pending',
      created_at: new Date().toISOString(),
    });

    return { id: docRef.id };
  });

export const getMyBookings = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const q = query(
      collection(db, 'bookings'),
      where('user_id', '==', user.uid),
      orderBy('booking_date', 'desc')
    );
    const snapshot = await getDocs(q);

    const bookings = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
      const booking = { id: docSnapshot.id, ...docSnapshot.data() } as any;

      // Fetch service details
      if (booking.service_id) {
        const serviceDoc = await getDoc(doc(db, 'services', booking.service_id));
        if (serviceDoc.exists()) {
          booking.service = { id: serviceDoc.id, ...serviceDoc.data() };
        }
      }

      // Fetch barber details
      if (booking.barber_id) {
        const barberDoc = await getDoc(doc(db, 'barbers', booking.barber_id));
        if (barberDoc.exists()) {
          booking.barber = { id: barberDoc.id, ...barberDoc.data() };
        }
      }

      return booking;
    }));

    return { bookings };
  });

export const cancelBooking = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    await updateDoc(doc(db, 'bookings', data.id), { status: 'cancelled' });
    return { ok: true };
  });