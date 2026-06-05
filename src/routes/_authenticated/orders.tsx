import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Package } from "lucide-react";
// import { listMyOrders } from "@/lib/shop.functions"; // TODO: Migrate to Firebase

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "My orders — Maphisa's" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  // const fetch = useServerFn(listMyOrders); // TODO: Migrate to Firebase
  const { data, isLoading } = useQuery({ queryKey: ["my:orders"], queryFn: async () => ({ orders: [] }) });

  return (
    <section className="mx-auto max-w-4xl px-6 pt-32 pb-24">
      <h1 className="font-display text-4xl md:text-5xl font-bold mb-10">My Orders</h1>
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : !data?.orders.length ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.orders.map((o: any) => (
            <article key={o.id} className="rounded-sm border border-border/60 bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</span>
                <span className={`text-xs font-semibold uppercase px-2 py-1 rounded-sm ${o.payment_status === "paid" ? "bg-primary/15 text-primary" : o.payment_status === "pending" ? "bg-yellow-500/15 text-yellow-600" : "bg-muted text-muted-foreground"}`}>{o.payment_status}</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                {(o.order_items ?? []).map((it: any, i: number) => (
                  <li key={i}>{it.quantity}× {it.product_name} — M{(Number(it.unit_price_maloti) * it.quantity).toFixed(2)}</li>
                ))}
              </ul>
              <div className="flex justify-between font-semibold border-t border-border/60 pt-3">
                <span>Total</span>
                <span className="text-primary">M{Number(o.total_maloti).toFixed(2)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}