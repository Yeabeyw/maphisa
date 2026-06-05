import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { checkoutCart } from "@/lib/shop.functions";

export const Route = createFileRoute("/_authenticated/cart")({
  head: () => ({ meta: [{ title: "Cart — Maphisa's" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, total, clear } = useCart();
  const navigate = useNavigate();
  const checkout = useServerFn(checkoutCart);
  const [method, setMethod] = useState<"ecocash" | "onemoney">("ecocash");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: () => checkout({
      data: {
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        method,
        phone,
        shipping_notes: notes || undefined,
      },
    }),
    onSuccess: (res) => {
      if (res.ok) {
        clear();
        setMsg(res.instructions ?? "Check your phone to approve the payment.");
        setTimeout(() => navigate({ to: "/orders" }), 2500);
      } else {
        setMsg(res.error ?? "Payment failed");
      }
    },
    onError: (e: Error) => setMsg(e.message),
  });

  if (!items.length) {
    return (
      <section className="mx-auto max-w-3xl px-6 pt-32 pb-24 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-4xl font-bold mb-3">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Browse the shop and add some grooming goods.</p>
        <Link to="/services" className="inline-flex h-11 items-center rounded-sm bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Shop now</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 pt-32 pb-24">
      <h1 className="font-display text-4xl md:text-5xl font-bold mb-10">Your Cart</h1>
      <div className="space-y-3 mb-10">
        {items.map((i) => (
          <div key={i.product_id} className="flex items-center gap-4 p-4 rounded-sm border border-border/60 bg-card">
            <div className="w-16 h-16 bg-muted rounded-sm overflow-hidden shrink-0">
              {i.image_url && <img src={i.image_url} alt={i.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{i.name}</h3>
              <p className="text-sm text-muted-foreground">M{i.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setQty(i.product_id, i.quantity - 1)} className="h-8 w-8 rounded-sm border border-border flex items-center justify-center hover:bg-accent"><Minus className="h-3 w-3" /></button>
              <span className="w-8 text-center font-medium">{i.quantity}</span>
              <button onClick={() => setQty(i.product_id, i.quantity + 1)} className="h-8 w-8 rounded-sm border border-border flex items-center justify-center hover:bg-accent"><Plus className="h-3 w-3" /></button>
            </div>
            <div className="w-24 text-right font-semibold">M{(i.price * i.quantity).toFixed(2)}</div>
            <button onClick={() => remove(i.product_id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <div className="rounded-sm border border-border/60 bg-card p-6 space-y-5">
        <div className="flex justify-between text-xl font-display font-bold">
          <span>Total</span>
          <span className="text-primary">M{total.toFixed(2)}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setMethod("ecocash")} className={`h-12 rounded-sm border text-sm font-semibold ${method === "ecocash" ? "border-primary bg-primary/10" : "border-border"}`}>EcoCash</button>
          <button onClick={() => setMethod("onemoney")} className={`h-12 rounded-sm border text-sm font-semibold ${method === "onemoney" ? "border-primary bg-primary/10" : "border-border"}`}>OneMoney</button>
        </div>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile money phone (e.g. 0771234567)" className="w-full h-12 rounded-sm border border-border bg-background px-4 text-sm" />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery / pickup notes (optional)" rows={3} className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm" />
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        <button onClick={() => mut.mutate()} disabled={mut.isPending || !phone} className="w-full h-12 rounded-sm bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 inline-flex items-center justify-center gap-2">
          {mut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Pay M{total.toFixed(2)}
        </button>
      </div>
    </section>
  );
}