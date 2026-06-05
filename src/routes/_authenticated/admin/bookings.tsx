import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminListBookings, adminUpdateBookingStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  component: AdminBookings,
});

const STATUSES = ["pending", "confirmed", "completed", "cancelled", "no_show"] as const;

function AdminBookings() {
  const qc = useQueryClient();
  const list = useServerFn(adminListBookings);
  const update = useServerFn(adminUpdateBookingStatus);
  const { data, isLoading } = useQuery({ queryKey: ["admin-bookings"], queryFn: () => list() });
  const mut = useMutation({
    mutationFn: (v: { id: string; status: (typeof STATUSES)[number] }) => update({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-bookings"] }),
  });

  if (isLoading || !data) return <p className="text-muted-foreground">Loading…</p>;
  if (data.bookings.length === 0) return <p className="text-muted-foreground">No bookings yet.</p>;

  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/30">
          <tr className="text-left">
            <th className="px-4 py-3 font-mono-label text-muted-foreground">Date</th>
            <th className="px-4 py-3 font-mono-label text-muted-foreground">Time</th>
            <th className="px-4 py-3 font-mono-label text-muted-foreground">Service</th>
            <th className="px-4 py-3 font-mono-label text-muted-foreground">Barber</th>
            <th className="px-4 py-3 font-mono-label text-muted-foreground">Location</th>
            <th className="px-4 py-3 font-mono-label text-muted-foreground">Paid</th>
            <th className="px-4 py-3 font-mono-label text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.bookings.map((b: any) => (
            <tr key={b.id} className="border-t border-border">
              <td className="px-4 py-3">{b.booking_date}</td>
              <td className="px-4 py-3">{(b.booking_time as string)?.slice(0,5)}</td>
              <td className="px-4 py-3">{b.services?.name ?? "—"}</td>
              <td className="px-4 py-3">{b.barbers?.name ?? "—"}</td>
              <td className="px-4 py-3">{b.location}</td>
              <td className="px-4 py-3">
                <span className={b.payment_status === "paid" ? "text-primary font-semibold" : "text-muted-foreground"}>
                  {b.payment_status}
                </span>
              </td>
              <td className="px-4 py-3">
                <select
                  value={b.status}
                  disabled={mut.isPending}
                  onChange={(e) => mut.mutate({ id: b.id, status: e.target.value as any })}
                  className="rounded-sm border border-border bg-background px-2 py-1 text-xs"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}