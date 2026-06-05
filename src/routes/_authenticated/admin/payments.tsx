import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminListPayments } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  component: AdminPayments,
});

function AdminPayments() {
  const fn = useServerFn(adminListPayments);
  const { data, isLoading } = useQuery({ queryKey: ["admin-payments"], queryFn: () => fn() });
  if (isLoading || !data) return <p className="text-muted-foreground">Loading…</p>;
  if (data.payments.length === 0) return <p className="text-muted-foreground">No payments yet.</p>;
  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/30">
          <tr className="text-left">
            <th className="px-4 py-3 font-mono-label text-muted-foreground">When</th>
            <th className="px-4 py-3 font-mono-label text-muted-foreground">Reference</th>
            <th className="px-4 py-3 font-mono-label text-muted-foreground">Method</th>
            <th className="px-4 py-3 font-mono-label text-muted-foreground">Phone</th>
            <th className="px-4 py-3 font-mono-label text-muted-foreground">Amount</th>
            <th className="px-4 py-3 font-mono-label text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.payments.map((p: any) => (
            <tr key={p.id} className="border-t border-border">
              <td className="px-4 py-3">{new Date(p.created_at).toLocaleString()}</td>
              <td className="px-4 py-3 font-mono text-xs">{p.reference}</td>
              <td className="px-4 py-3">{p.method}</td>
              <td className="px-4 py-3">{p.phone}</td>
              <td className="px-4 py-3">M{Number(p.amount).toFixed(0)}</td>
              <td className="px-4 py-3">
                <span className={p.status === "paid" ? "text-primary font-semibold" : "text-muted-foreground"}>{p.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}