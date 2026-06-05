import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, Plus, LogOut, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getMyBookings, cancelBooking } from "@/lib/booking.functions";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My bookings — Maphisa's" }] }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const qc = useQueryClient();
  const fetchBookings = useServerFn(getMyBookings);
  const submitCancel = useServerFn(cancelBooking);

  const { data, isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: () => fetchBookings(),
    enabled: !!user?.uid
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => submitCancel({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });

  async function onSignOut() {
    await signOut(auth);
    navigate({ to: "/" });
  }

  return (
    <section className="mx-auto max-w-5xl px-6 pt-24 pb-24">
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="font-mono-label text-primary mb-3">— Your chair</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold">My bookings</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/book" className="inline-flex h-11 items-center gap-2 rounded-sm bg-primary px-5 text-sm font-semibold text-primary-foreground hover:shadow-[var(--shadow-emerald)]">
            <Plus className="h-4 w-4" /> New booking
          </Link>
          <button onClick={onSignOut} className="inline-flex h-11 items-center gap-2 rounded-sm border border-border px-5 text-sm font-medium hover:bg-accent">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : !data?.bookings?.length ? (
        <div className="rounded-sm border border-border bg-card p-12 text-center">
          <p className="font-display text-2xl mb-2">No bookings yet.</p>
          <p className="text-sm text-muted-foreground mb-6">Pull up a chair — your first cut is one tap away.</p>
          <Link to="/book" className="inline-flex h-11 items-center gap-2 rounded-sm bg-primary px-6 text-sm font-semibold text-primary-foreground">Book now</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.bookings.map((b: any) => (
            <li key={b.id} className="rounded-sm border border-border bg-card p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1.5">
                <p className="font-display text-xl font-semibold">{b.service?.name ?? "Service"}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {b.booking_date}</span>
                  <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {b.booking_time?.slice(0,5)}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {b.location}</span>
                  <span>with <span className="text-foreground">{b.barber?.name}</span></span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={b.status} />
                {b.payment_status !== "paid" && b.status !== "cancelled" && b.status !== "completed" && (
                  <Link
                    to="/pay/$bookingId"
                    params={{ bookingId: b.id }}
                    className="text-sm font-semibold text-primary hover:underline"
                  >Pay</Link>
                )}
                {b.status !== "cancelled" && b.status !== "completed" && (
                  <button
                    onClick={() => cancelMut.mutate(b.id)}
                    disabled={cancelMut.isPending}
                    className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                  >Cancel</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "border-yellow-500/40 text-yellow-500",
    confirmed: "border-primary text-primary",
    completed: "border-border text-muted-foreground",
    cancelled: "border-destructive/40 text-destructive",
  };
  return <span className={`text-xs font-mono-label px-2 py-1 border rounded-sm ${map[status] ?? ""}`}>{status}</span>;
}