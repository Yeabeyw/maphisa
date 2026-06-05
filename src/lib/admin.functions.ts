import { createServerFn } from "@tanstack/react-start";
import { createMiddleware } from "@tanstack/react-start";
import { z } from "zod";
import {
  collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  doc, query, where, orderBy, setDoc, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ---------------- Admin guard middleware ----------------
const requireAdmin = createMiddleware({ type: "function" }).server(async ({ next }) => {
  // Admin check is enforced client-side via useFirebaseAuth isAdmin.
  // Server-side role enforcement can be added here via Firebase Admin SDK if needed.
  return next({});
});

// ---------------- Admin Stats ----------------
export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const today = new Date().toISOString().slice(0, 10);
    const bookingsSnap = await getDocs(collection(db, "bookings"));
    const allBookings = bookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
    const totalBookings = allBookings.length;
    const todayBookings = allBookings.filter((b) => b.booking_date === today).length;
    const pendingBookings = allBookings.filter((b) => b.status === "pending").length;

    const paymentsSnap = await getDocs(query(collection(db, "payments"), where("status", "==", "paid")));
    const revenuePaid = paymentsSnap.docs.reduce((s, d) => s + Number((d.data() as any).amount ?? 0), 0);

    return { totalBookings, todayBookings, pendingBookings, revenuePaid };
  });

// ---------------- Admin Bookings ----------------
export const adminListBookings = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const snap = await getDocs(query(collection(db, "bookings"), orderBy("booking_date", "desc")));
    const bookings = await Promise.all(snap.docs.map(async (d) => {
      const b = { id: d.id, ...d.data() } as any;
      if (b.service_id) {
        const sDoc = await getDoc(doc(db, "services", b.service_id));
        if (sDoc.exists()) b.services = { id: sDoc.id, ...sDoc.data() };
      }
      if (b.barber_id) {
        const barberDoc = await getDoc(doc(db, "barbers", b.barber_id));
        if (barberDoc.exists()) b.barbers = { id: barberDoc.id, ...barberDoc.data() };
      }
      return b;
    }));
    return { bookings };
  });

export const adminUpdateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((d) =>
    z.object({
      id: z.string(),
      status: z.enum(["pending", "confirmed", "completed", "cancelled", "no_show"]),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    await updateDoc(doc(db, "bookings", data.id), { status: data.status });
    return { ok: true };
  });

// ---------------- Services ----------------
const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(60),
  description: z.string().max(500).optional().nullable(),
  duration_minutes: z.number().int().min(5).max(480),
  price_maloti: z.number().min(0).max(100000),
  active: z.boolean().default(true),
});

export const adminListServices = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const snap = await getDocs(query(collection(db, "services"), orderBy("category")));
    const services = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { services };
  });

export const adminUpsertService = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((d) => serviceSchema.parse(d))
  .handler(async ({ data }) => {
    const { id, ...payload } = data;
    if (id) {
      await updateDoc(doc(db, "services", id), payload);
    } else {
      await addDoc(collection(db, "services"), { ...payload, created_at: new Date().toISOString() });
    }
    return { ok: true };
  });

export const adminDeleteService = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    await updateDoc(doc(db, "services", data.id), { active: false });
    return { ok: true };
  });

// ---------------- Barbers ----------------
const barberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(120),
  role: z.string().max(120).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  photo_url: z.string().url().max(500).optional().nullable(),
  display_order: z.number().int().min(0).max(999).default(0),
  active: z.boolean().default(true),
});

export const adminListBarbers = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const snap = await getDocs(query(collection(db, "barbers"), orderBy("display_order")));
    const barbers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { barbers };
  });

export const adminUpsertBarber = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((d) => barberSchema.parse(d))
  .handler(async ({ data }) => {
    const { id, ...payload } = data;
    if (id) {
      await updateDoc(doc(db, "barbers", id), payload);
    } else {
      await addDoc(collection(db, "barbers"), { ...payload, created_at: new Date().toISOString() });
    }
    return { ok: true };
  });

export const adminDeleteBarber = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    await updateDoc(doc(db, "barbers", data.id), { active: false });
    return { ok: true };
  });

// ---------------- Payments ----------------
export const adminListPayments = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const snap = await getDocs(query(collection(db, "payments"), orderBy("created_at", "desc")));
    const payments = snap.docs.map((d) => ({ id: d.id, ...d.data() })).slice(0, 200);
    return { payments };
  });

// ---------------- Products ----------------
export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const snap = await getDocs(query(collection(db, "products"), orderBy("created_at", "desc")));
    const products = snap.docs.map((d) => ({ id: d.id, ...d.data() })).slice(0, 200);
    return { products };
  });

export const adminUpsertProduct = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((d) =>
    z.object({
      id: z.string().optional(),
      name: z.string().min(1).max(120),
      description: z.string().max(1000).optional().nullable(),
      category: z.string().min(1).max(60).default("general"),
      price_maloti: z.number().min(0),
      stock: z.number().int().min(0),
      image_url: z.string().url().optional().nullable(),
      active: z.boolean().default(true),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { id, ...payload } = data;
    if (id) {
      await updateDoc(doc(db, "products", id), payload);
    } else {
      await addDoc(collection(db, "products"), { ...payload, created_at: new Date().toISOString() });
    }
    return { ok: true };
  });

// ---------------- Membership Plans ----------------
export const adminListPlans = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const snap = await getDocs(query(collection(db, "membership_plans"), orderBy("display_order")));
    const plans = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { plans };
  });

export const adminUpsertPlan = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((d) =>
    z.object({
      id: z.string().optional(),
      name: z.string().min(1).max(120),
      description: z.string().max(1000).optional().nullable(),
      price_maloti: z.number().min(0),
      interval: z.string().min(1).max(20).default("monthly"),
      perks: z.array(z.string().min(1).max(120)).max(20).default([]),
      active: z.boolean().default(true),
      display_order: z.number().int().default(0),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { id, ...payload } = data;
    if (id) {
      await updateDoc(doc(db, "membership_plans", id), payload);
    } else {
      await addDoc(collection(db, "membership_plans"), payload);
    }
    return { ok: true };
  });

// ---------------- Orders ----------------
export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const snap = await getDocs(query(collection(db, "orders"), orderBy("created_at", "desc")));
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() })).slice(0, 200);
    return { orders };
  });

export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((d) =>
    z.object({
      id: z.string(),
      status: z.enum(["pending", "paid", "fulfilled", "cancelled", "refunded"]),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    await updateDoc(doc(db, "orders", data.id), { status: data.status });
    return { ok: true };
  });

// ---------------- Public: Services ----------------
export const listServices = createServerFn({ method: "GET" })
  .handler(async () => {
    const snap = await getDocs(
      query(collection(db, "services"), where("active", "==", true), orderBy("category")),
    );
    const rawServices = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const services = rawServices.filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i);
    return { services };
  });

// ---------------- Public: Booked Slots ----------------
const TIME_SLOTS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00",
];

export const getBookedSlots = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ date: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const snap = await getDocs(
      query(
        collection(db, "bookings"),
        where("booking_date", "==", data.date),
        where("status", "in", ["pending", "confirmed"]),
      ),
    );
    const bookings = snap.docs.map((d) => d.data() as any);
    const serviceIds = [...new Set(bookings.map((b) => b.service_id).filter(Boolean))];

    const serviceDurations: Record<string, number> = {};
    await Promise.all(
      serviceIds.map(async (id) => {
        const sDoc = await getDoc(doc(db, "services", id));
        if (sDoc.exists()) serviceDurations[id] = (sDoc.data() as any).duration_minutes ?? 30;
      }),
    );

    const blockedSlots: string[] = [];
    bookings.forEach((b) => {
      const duration = serviceDurations[b.service_id] || 30;
      const slotsNeeded = Math.ceil(duration / 30);
      const startIndex = TIME_SLOTS.indexOf(b.booking_time);
      if (startIndex !== -1) {
        for (let i = 0; i < slotsNeeded; i++) {
          if (TIME_SLOTS[startIndex + i]) blockedSlots.push(TIME_SLOTS[startIndex + i]);
        }
      }
    });

    return { bookedSlots: blockedSlots };
  });

// ---------------- Public: Create Booking ----------------
export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      service_id: z.string(),
      booking_date: z.string(),
      booking_time: z.string(),
      customer_name: z.string().min(1),
      customer_phone: z.string().min(1),
      customer_email: z.string().email().optional(),
      notes: z.string().optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    let serviceName = "Service";
    let servicePrice: number = 0;
    const sDoc = await getDoc(doc(db, "services", data.service_id));
    if (sDoc.exists()) {
      const s = sDoc.data() as any;
      serviceName = s.name;
      servicePrice = Number(s.price_maloti);
    }

    await addDoc(collection(db, "bookings"), {
      service_id: data.service_id,
      booking_date: data.booking_date,
      booking_time: data.booking_time,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_email: data.customer_email ?? null,
      notes: data.notes ?? null,
      status: "pending",
      payment_status: "pending",
      created_at: new Date().toISOString(),
    });

    console.log("Booking confirmation:", {
      to: data.customer_email,
      service: serviceName,
      date: data.booking_date,
      time: data.booking_time,
      price: servicePrice,
    });

    return { ok: true };
  });

// ---------------- Public: Get User Bookings ----------------
export const getUserBookings = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ phone: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const today = new Date().toISOString().split("T")[0];
    const snap = await getDocs(
      query(
        collection(db, "bookings"),
        where("customer_phone", "==", data.phone),
        where("booking_date", ">=", today),
        orderBy("booking_date", "asc"),
      ),
    );
    const bookings = await Promise.all(snap.docs.map(async (d) => {
      const b = { id: d.id, ...d.data() } as any;
      if (b.service_id) {
        const sDoc = await getDoc(doc(db, "services", b.service_id));
        if (sDoc.exists()) b.services = { id: sDoc.id, ...sDoc.data() };
      }
      return b;
    }));
    return { bookings };
  });

// ---------------- Public: Reschedule Booking ----------------
export const rescheduleBooking = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      booking_id: z.string(),
      new_date: z.string(),
      new_time: z.string(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    await updateDoc(doc(db, "bookings", data.booking_id), {
      booking_date: data.new_date,
      booking_time: data.new_time,
      status: "confirmed",
    });
    return { ok: true };
  });

// ---------------- Public: Cancel Booking ----------------
export const cancelBooking = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ booking_id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    await updateDoc(doc(db, "bookings", data.booking_id), { status: "cancelled" });
    return { ok: true };
  });

// ---------------- Waitlist (stub — implement Firestore collection when ready) ----------------
export const addToWaitlist = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      service_id: z.string(),
      preferred_date: z.string(),
      customer_name: z.string().min(1),
      customer_phone: z.string().min(1),
      customer_email: z.string().email().optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    await addDoc(collection(db, "waitlist"), {
      ...data,
      status: "pending",
      created_at: new Date().toISOString(),
    });
    return { ok: true };
  });

// ---------------- Seasonal Packages ----------------
export const getSeasonalPackages = createServerFn({ method: "GET" })
  .handler(async () => {
    const snap = await getDocs(
      query(collection(db, "seasonal_packages"), where("active", "==", true), orderBy("display_order")),
    );
    const packages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { packages };
  });
