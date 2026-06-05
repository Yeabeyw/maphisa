import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { adminListOrders, adminUpdateOrderStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

const STATUSES = ["pending", "paid", "fulfilled", "cancelled", "refunded"] as const;

function AdminOrders() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(adminListOrders);
  const update = useServerFn(adminUpdateOrderStatus);
  const { data, isLoading } = useQuery({ queryKey: ["admin:orders"], queryFn: () => fetchAll() });

  const mut = useMutation({
    mutationFn: (v: { id: string; status: (typeof STATUSES)[number] }) => update({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin:orders"] }),
  });

  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

  return (
    <div className="space-y-3">
      {(data?.orders ?? []).map((o: any) => (
        <article key={o.id} className="rounded-sm border border-border/60 bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()} · {o.contact_phone ?? "—"}</p>
              <p className="font-semibold">M{Number(o.total_maloti).toFixed(2)} · payment: {o.payment_status}</p>
            </div>
            <select
              value={o.status}
              onChange={(e) => mut.mutate({ id: o.id, status: e.target.value as any })}
              className="h-9 px-2 rounded-sm border border-border bg-background text-sm"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <ul className="text-sm text-muted-foreground">
            {(o.order_items ?? []).map((it: any, i: number) => (
              <li key={i}>{it.quantity}× {it.product_name} (M{Number(it.unit_price_maloti).toFixed(2)})</li>
            ))}
          </ul>
        </article>
      ))}
      {!data?.orders.length && <p className="text-muted-foreground">No orders yet.</p>}
    </div>
  );
}