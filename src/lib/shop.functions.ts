import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { collection, getDocs, getDoc, addDoc, updateDoc, doc, query, where, orderBy } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const q = query(collection(db, "products"), where("active", "==", true), orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);
  const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return { products };
});

export type MembershipPlan = {
  id: string;
  name: string;
  price_maloti: number | string;
  interval: string;
  description?: string;
  perks?: string[];
  active?: boolean;
  display_order?: number;
};

export const listMembershipPlans = createServerFn({ method: "GET" }).handler(async () => {
  const q = query(collection(db, "membership_plans"), where("active", "==", true), orderBy("display_order"));
  const snapshot = await getDocs(q);
  const plans = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MembershipPlan));
  return { plans };
});

const cartItemSchema = z.object({
  product_id: z.string(),
  quantity: z.number().int().min(1).max(50),
});

const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(50),
  method: z.enum(["ecocash", "onemoney"]),
  phone: z.string().min(7).max(20).regex(/^[0-9+]+$/),
  shipping_notes: z.string().max(500).optional(),
});

export const checkoutCart = createServerFn({ method: "POST" })
  .inputValidator((d) => checkoutSchema.parse(d))
  .handler(async ({ data }) => {
    const { initiatePaynowMobile } = await import("./paynow.server");

    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");

    // Fetch products
    const products = await Promise.all(
      data.items.map(async (it) => {
        const d = await getDoc(doc(db, "products", it.product_id));
        if (!d.exists()) throw new Error("Product not found");
        return { id: d.id, ...(d.data() as any) };
      }),
    );

    let total = 0;
    const lineItems = data.items.map((it) => {
      const p = products.find((x) => x.id === it.product_id)!;
      if (!p.active) throw new Error(`${p.name} is unavailable`);
      if (p.stock < it.quantity) throw new Error(`${p.name} is out of stock`);
      const lineTotal = Number(p.price_maloti) * it.quantity;
      total += lineTotal;
      return {
        product_id: p.id,
        product_name: p.name,
        unit_price_maloti: Number(p.price_maloti),
        quantity: it.quantity,
      };
    });

    const orderRef = await addDoc(collection(db, "orders"), {
      user_id: user.uid,
      total_maloti: total,
      status: "pending",
      payment_status: "unpaid",
      contact_phone: data.phone,
      shipping_notes: data.shipping_notes ?? null,
      created_at: new Date().toISOString(),
    });

    await Promise.all(
      lineItems.map((li) =>
        addDoc(collection(db, "order_items"), { ...li, order_id: orderRef.id }),
      ),
    );

    const email = user.email ?? "shop@maphisas.co.zw";
    const reference = `SHOP-${orderRef.id.slice(0, 8)}-${Date.now().toString(36)}`;
    const origin = process.env.PUBLIC_APP_URL ?? "https://maphisas.lovable.app";

    const result = await initiatePaynowMobile({
      reference,
      amount: total,
      email,
      phone: data.phone,
      method: data.method,
      additionalInfo: `Maphisa's Shop order (${lineItems.length} item${lineItems.length === 1 ? "" : "s"})`,
      returnUrl: `${origin}/orders`,
      resultUrl: `${origin}/api/public/paynow-result`,
    });

    await addDoc(collection(db, "shop_payments"), {
      user_id: user.uid,
      kind: "order",
      order_id: orderRef.id,
      amount: total,
      method: data.method,
      phone: data.phone,
      reference,
      poll_url: result.pollurl ?? null,
      status: result.status === "Ok" ? "sent" : "failed",
      raw_response: result.raw,
      created_at: new Date().toISOString(),
    });

    if (result.status !== "Ok") {
      return { ok: false, error: result.error ?? "Payment initiation failed", orderId: orderRef.id };
    }

    await updateDoc(doc(db, "orders", orderRef.id), {
      payment_method: data.method,
      payment_reference: reference,
      payment_status: "pending",
    });

    return { ok: true, orderId: orderRef.id, reference, instructions: result.instructions };
  });

const subscribeSchema = z.object({
  plan_id: z.string(),
  method: z.enum(["ecocash", "onemoney"]),
  phone: z.string().min(7).max(20).regex(/^[0-9+]+$/),
});

export const subscribeMembership = createServerFn({ method: "POST" })
  .inputValidator((d) => subscribeSchema.parse(d))
  .handler(async ({ data }) => {
    const { initiatePaynowMobile } = await import("./paynow.server");

    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");

    const planDoc = await getDoc(doc(db, "membership_plans", data.plan_id));
    if (!planDoc.exists()) throw new Error("Plan not available");
    const plan = { id: planDoc.id, ...(planDoc.data() as any) };
    if (!plan.active) throw new Error("Plan not available");

    const membershipRef = await addDoc(collection(db, "user_memberships"), {
      user_id: user.uid,
      plan_id: plan.id,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    const email = user.email ?? "members@maphisas.co.zw";
    const reference = `MEM-${membershipRef.id.slice(0, 8)}-${Date.now().toString(36)}`;
    const origin = process.env.PUBLIC_APP_URL ?? "https://maphisas.lovable.app";

    const result = await initiatePaynowMobile({
      reference,
      amount: Number(plan.price_maloti),
      email,
      phone: data.phone,
      method: data.method,
      additionalInfo: `Maphisa's ${plan.name} membership`,
      returnUrl: `${origin}/dashboard`,
      resultUrl: `${origin}/api/public/paynow-result`,
    });

    await addDoc(collection(db, "shop_payments"), {
      user_id: user.uid,
      kind: "membership",
      membership_id: membershipRef.id,
      amount: Number(plan.price_maloti),
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

    await updateDoc(doc(db, "user_memberships", membershipRef.id), {
      payment_reference: reference,
    });

    return { ok: true, membershipId: membershipRef.id, reference, instructions: result.instructions };
  });

export const listMyOrders = createServerFn({ method: "GET" }).handler(async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Unauthorized");

  const snap = await getDocs(
    query(collection(db, "orders"), where("user_id", "==", user.uid), orderBy("created_at", "desc")),
  );

  const orders = await Promise.all(snap.docs.map(async (d) => {
    const order = { id: d.id, ...d.data() } as any;
    const itemsSnap = await getDocs(
      query(collection(db, "order_items"), where("order_id", "==", order.id)),
    );
    order.order_items = itemsSnap.docs.map((id) => id.data());
    return order;
  }));

  return { orders };
});

export const listMyMemberships = createServerFn({ method: "GET" }).handler(async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Unauthorized");

  const snap = await getDocs(
    query(collection(db, "user_memberships"), where("user_id", "==", user.uid), orderBy("created_at", "desc")),
  );

  const memberships = await Promise.all(snap.docs.map(async (d) => {
    const m = { id: d.id, ...d.data() } as any;
    if (m.plan_id) {
      const planDoc = await getDoc(doc(db, "membership_plans", m.plan_id));
      if (planDoc.exists()) m.membership_plans = { id: planDoc.id, ...planDoc.data() };
    }
    return m;
  }));

  return { memberships };
});
