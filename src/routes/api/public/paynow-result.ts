import { createFileRoute } from "@tanstack/react-router";
import {
  collection, getDocs, getDoc, updateDoc,
  doc, query, where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/api/public/paynow-result")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const text = await request.text();
        const payload: Record<string, string> = {};
        for (const pair of text.split("&")) {
          const [k, v] = pair.split("=");
          if (k) payload[decodeURIComponent(k)] = decodeURIComponent((v ?? "").replace(/\+/g, " "));
        }

        const key = process.env.PAYNOW_INTEGRATION_KEY;
        if (!key) return new Response("Server not configured", { status: 500 });

        const { verifyPaynowHash, mapPaynowStatus } = await import("@/lib/paynow.server");
        if (!verifyPaynowHash(payload, key)) {
          return new Response("Invalid hash", { status: 401 });
        }

        const reference = payload.reference;
        if (!reference) return new Response("Missing reference", { status: 400 });

        const mapped = mapPaynowStatus(payload.status);
        const now = new Date().toISOString();

        // Try bookings payment first
        const paySnap = await getDocs(
          query(collection(db, "payments"), where("reference", "==", reference)),
        );
        if (!paySnap.empty) {
          const payDoc = paySnap.docs[0];
          const payment = { id: payDoc.id, ...payDoc.data() } as any;
          await updateDoc(doc(db, "payments", payment.id), {
            status: mapped,
            paynow_reference: payload.paynowreference ?? null,
            raw_response: payload,
            updated_at: now,
          });
          if (payment.booking_id) {
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
          }
          return new Response("ok");
        }

        // Try shop/membership payments
        const shopSnap = await getDocs(
          query(collection(db, "shop_payments"), where("reference", "==", reference)),
        );
        if (shopSnap.empty) return new Response("Unknown payment", { status: 404 });

        const shopDoc = shopSnap.docs[0];
        const shopPayment = { id: shopDoc.id, ...shopDoc.data() } as any;

        await updateDoc(doc(db, "shop_payments", shopPayment.id), {
          status: mapped,
          paynow_reference: payload.paynowreference ?? null,
          raw_response: payload,
          updated_at: now,
        });

        if (shopPayment.kind === "order" && shopPayment.order_id) {
          if (mapped === "paid") {
            const itemsSnap = await getDocs(
              query(collection(db, "order_items"), where("order_id", "==", shopPayment.order_id)),
            );
            for (const itemDoc of itemsSnap.docs) {
              const it = itemDoc.data() as any;
              if (it.product_id) {
                const prodDoc = await getDoc(doc(db, "products", it.product_id));
                if (prodDoc.exists()) {
                  const prod = prodDoc.data() as any;
                  await updateDoc(doc(db, "products", it.product_id), {
                    stock: Math.max(0, (prod.stock ?? 0) - (it.quantity ?? 0)),
                  });
                }
              }
            }
            await updateDoc(doc(db, "orders", shopPayment.order_id), {
              payment_status: "paid",
              status: "paid",
            });
          } else if (mapped === "cancelled" || mapped === "failed") {
            await updateDoc(doc(db, "orders", shopPayment.order_id), {
              payment_status: mapped,
              status: "cancelled",
            });
          }
        } else if (shopPayment.kind === "membership" && shopPayment.membership_id) {
          if (mapped === "paid") {
            const nowDate = new Date();
            const renews = new Date(nowDate);
            renews.setMonth(renews.getMonth() + 1);
            await updateDoc(doc(db, "user_memberships", shopPayment.membership_id), {
              status: "active",
              started_at: nowDate.toISOString(),
              renews_at: renews.toISOString(),
            });
          } else if (mapped === "cancelled" || mapped === "failed") {
            await updateDoc(doc(db, "user_memberships", shopPayment.membership_id), {
              status: mapped,
            });
          }
        }

        return new Response("ok");
      },
    },
  },
});
