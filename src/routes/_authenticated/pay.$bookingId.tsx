import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Loader2, Smartphone, X } from "lucide-react";
import { getMyBookings } from "@/lib/booking.functions";
import { initiateBookingPayment, checkPaymentStatus } from "@/lib/payments.functions";

export const Route = createFileRoute("/_authenticated/pay/$bookingId")({
  head: () => ({ meta: [{ title: "Pay — Maphisa's Barber Shop" }] }),
  component: PayPage,
});

function PayPage() {
  const { bookingId } = Route.useParams();
  const navigate = useNavigate();
  const fetchBookings = useServerFn(getMyBookings);
  const initiate = useServerFn(initiateBookingPayment);
  const check = useServerFn(checkPaymentStatus);

  const { data, isLoading } = useQuery({ queryKey: ["my-bookings"], queryFn: () => fetchBookings() });
  const booking = data?.bookings.find((b: any) => b.id === bookingId);

  const [method, setMethod] = useState<"ecocash" | "onemoney">("ecocash");
  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [polledStatus, setPolledStatus] = useState<string | null>(null);

  const initMut = useMutation({
    mutationFn: () => initiate({ data: { booking_id: bookingId, method, phone } }),
    onSuccess: (r) => {
      if (!r.ok) return;
      setReference(r.reference!);
      setInstructions(r.instructions ?? null);
    },
  });

  // Poll while pending
  useEffect(() => {
    if (!reference || polledStatus === "paid" || polledStatus === "cancelled" || polledStatus === "failed") return;
    const id = setInterval(async () => {
      try {
        const r = await check({ data: { reference } });
        setPolledStatus(r.status);
        if (r.status === "paid") {
          setTimeout(() => navigate({ to: "/dashboard" }), 1500);
        }
      } catch {}
    }, 4000);
    return () => clearInterval(id);
  }, [reference, polledStatus, check, navigate]);

  if (isLoading) return <div className="flex justify-center py-32"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!booking) return <div className="mx-auto max-w-2xl px-6 py-32 text-center"><p className="text-muted-foreground">Booking not found.</p><Link to="/dashboard" className="text-primary mt-4 inline-block">Back to dashboard</Link></div>;

  const service = (booking as any).services;
  const amount = Number(service?.price_maloti ?? 0);

  return (
    <section className="mx-auto max-w-2xl px-6 pt-24 pb-24">
      <Link to="/dashboard" className="font-mono-label text-muted-foreground hover:text-primary inline-flex items-center gap-2 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>
      <p className="font-mono-label text-primary mb-3">— Payment</p>
      <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">Pay with mobile money.</h1>
      <p className="text-muted-foreground mb-10">Ecocash & OneMoney via Paynow. M{amount.toFixed(0)} for {service?.name}.</p>

      {!reference && (
        <div className="space-y-6 rounded-sm border border-border bg-card p-6">
          <div>
            <label className="font-mono-label text-muted-foreground block mb-2">Method</label>
            <div className="grid grid-cols-2 gap-3">
              {(["ecocash", "onemoney"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`h-14 rounded-sm border text-sm font-semibold uppercase tracking-wider transition-all ${method === m ? "border-primary bg-primary/5 text-primary" : "border-border bg-background hover:border-primary/50"}`}
                >{m === "ecocash" ? "Ecocash" : "OneMoney"}</button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">M-Pesa users: select Ecocash and use your registered Paynow mobile number.</p>
          </div>

          <div>
            <label className="font-mono-label text-muted-foreground block mb-2">Mobile number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ""))}
              placeholder="0771234567"
              className="w-full h-12 rounded-sm border border-border bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </div>

          {initMut.data && !initMut.data.ok && (
            <p className="text-sm text-destructive">{initMut.data.error}</p>
          )}
          {initMut.error && (
            <p className="text-sm text-destructive">{(initMut.error as Error).message}</p>
          )}

          <button
            disabled={!phone || initMut.isPending}
            onClick={() => initMut.mutate()}
            className="w-full h-14 inline-flex items-center justify-center gap-2 rounded-sm bg-primary text-base font-semibold text-primary-foreground hover:shadow-[var(--shadow-emerald)] transition-all disabled:opacity-40"
          >
            {initMut.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Smartphone className="h-5 w-5" /> Pay M{amount.toFixed(0)}</>}
          </button>
        </div>
      )}

      {reference && (
        <div className="rounded-sm border border-border bg-card p-8 text-center">
          {polledStatus === "paid" ? (
            <>
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Check className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Payment received.</h2>
              <p className="text-muted-foreground text-sm">Redirecting to your dashboard…</p>
            </>
          ) : polledStatus === "cancelled" || polledStatus === "failed" ? (
            <>
              <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <X className="h-7 w-7 text-destructive" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Payment {polledStatus}.</h2>
              <button onClick={() => { setReference(null); setPolledStatus(null); }} className="text-primary text-sm mt-2">Try again</button>
            </>
          ) : (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold mb-2">Check your phone.</h2>
              <p className="text-muted-foreground text-sm mb-3">{instructions ?? "Enter your mobile money PIN on the prompt that just appeared."}</p>
              <p className="font-mono-label text-xs text-muted-foreground">Ref · {reference}</p>
            </>
          )}
        </div>
      )}
    </section>
  );
}