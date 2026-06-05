import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  collection, getDocs, getDoc, addDoc, updateDoc,
  doc, query, where,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

const initSchema = z.object({
  booking_id: z.string(),
  method: z.enum(["ecocash", "onemoney"]),
  phone: z.string().min(7).max(20).regex(/^[0-9+]+$/),
});

export const initiateBookingPayment = createServerFn({ method: "POST" })
  .inputValidator((d) => initSchema.parse(d))
  .handler(async ({ data }) => {
    const { initiatePaynowMobile } = await import("./paynow.server");

    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");

    const bookingDoc = await getDoc(doc(db, "bookings", data.booking_id));
    if (!bookingDoc.exists()) throw new Error("Booking not found");
    const booking = { id: bookingDoc.id, ...bookingDoc.data() } as any;

    if (booking.user_id !== user.uid) throw new Error("Not your booking");
    if (booking.payment_status === "paid") throw new Error("Already paid");

    const serviceDoc = await getDoc(doc(db, "services", booking.service_id));
    const service = serviceDoc.exists() ? (serviceDoc.data() as any) : null;
    const amount = Number(service?.price_maloti ?? 0);
    if (!amount) throw new Error("Invalid service price");

    const email = user.email ?? "customer@maphisas.co.zw";
    const reference = `MAPHISA-${booking.id.slice(0, 8)}-${Date.now().toString(36)}`;
    const origin = process.env.PUBLIC_APP_URL ?? "https://maphisas.lovable.app";

    const result = await initiatePaynowMobile({
      reference,
      amount,
      email,
      phone: data.phone,
      method: data.method,
      additionalInfo: `${service?.name ?? "Service"} @ Maphisa's`,
      returnUrl: `${origin}/dashboard`,
      resultUrl: `${origin}/api/public/paynow-result`,
    });

    await addDoc(collection(db, "payments"), {
      booking_id: booking.id,
      user_id: user.uid,
      amount,
      method: data.method,
      phone: data.phone,
      reference,
      poll_url: result.pollurl ?? null,
      status: result.status === "Ok" ? "sent" : "failed",
      raw_response: result.raw,
      created_at: new Date().toISOString(),
    });

    if (result.status !== "Ok") {
      return { ok: false, error: result.error ?? "Payment initiation failed" };
    }

    await updateDoc(doc(db, "bookings", booking.id), {
      payment_method: data.method,
      payment_reference: reference,
      payment_status: "pending",
    });

    return {
      ok: true,
      reference,
      pollUrl: result.pollurl,
      instructions: result.instructions,
    };
  });

export const checkPaymentStatus = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ reference: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { pollPaynow, mapPaynowStatus } = await import("./paynow.server");

    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");

    const snap = await getDocs(
      query(collection(db, "payments"), where("reference", "==", data.reference)),
    );
    if (snap.empty) throw new Error("Payment not found");

    const paymentDoc = snap.docs[0];
    const payment = { id: paymentDoc.id, ...paymentDoc.data() } as any;
    if (payment.user_id !== user.uid) throw new Error("Not your payment");
    if (!payment.poll_url) return { status: payment.status };

    const polled = await pollPaynow(payment.poll_url);
    const mapped = mapPaynowStatus(polled.status);

    await updateDoc(doc(db, "payments", payment.id), {
      status: mapped,
      paynow_reference: polled.paynowreference ?? null,
      raw_response: polled,
      updated_at: new Date().toISOString(),
    });

    if (mapped === "paid") {
      await updateDoc(doc(db, "bookings", payment.booking_id), {
        payment_status: "paid",
        status: "confirmed",
      });
    } else if (mapped === "cancelled" || mapped === "failed") {
      await updateDoc(doc(db, "bookings", payment.booking_id), {
        payment_status: mapped,
      });
    }

    return { status: mapped, paynowStatus: polled.status };
  });
