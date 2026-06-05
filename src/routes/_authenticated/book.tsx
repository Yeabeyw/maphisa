import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { getCatalog, getTakenSlots, createBooking } from "@/lib/booking.functions";

export const Route = createFileRoute("/_authenticated/book")({
  head: () => ({ meta: [{ title: "Book — Maphisa's Barber Shop" }] }),
  component: BookPage,
});

const TIME_SLOTS = [
  "08:00","08:45","09:30","10:15","11:00","11:45","12:30","13:15",
  "14:00","14:45","15:30","16:15","17:00","17:45","18:30",
];
const LOCATIONS = ["Leribe", "Maputsoe", "Mohalalitoe"] as const;

function todayISO(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function BookPage() {
  const navigate = useNavigate();
  const fetchCatalog = useServerFn(getCatalog);
  const fetchTaken = useServerFn(getTakenSlots);
  const submitBooking = useServerFn(createBooking);

  const { data: catalog, isLoading } = useQuery({ queryKey: ["catalog"], queryFn: () => fetchCatalog() });

  const [serviceId, setServiceId] = useState<string | null>(null);
  const [barberId, setBarberId] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO(1));
  const [time, setTime] = useState<string | null>(null);
  const [location, setLocation] = useState<typeof LOCATIONS[number]>("Leribe");
  const [notes, setNotes] = useState("");

  const taken = useQuery({
    queryKey: ["taken", barberId, date],
    queryFn: () => fetchTaken({ data: { barberId: barberId!, date } }),
    enabled: !!barberId && !!date,
  });

  const takenSet = useMemo(() => new Set((taken.data?.taken ?? []).map((t) => t.slice(0, 5))), [taken.data]);

  const mutation = useMutation({
    mutationFn: () => submitBooking({ data: {
      service_id: serviceId!,
      barber_id: barberId!,
      booking_date: date,
      booking_time: `${time}:00`,
      notes: notes || undefined,
      location,
    } }),
    onSuccess: (res) => navigate({ to: "/pay/$bookingId", params: { bookingId: res.id } }),
  });

  const canSubmit = serviceId && barberId && date && time && !mutation.isPending;

  if (isLoading) return <div className="flex justify-center py-32"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <section className="mx-auto max-w-5xl px-6 pt-24 pb-24">
      <p className="font-mono-label text-primary mb-3">— New booking</p>
      <h1 className="font-display text-4xl md:text-5xl font-bold mb-12">Pick your chair.</h1>

      <div className="space-y-12">
        <Step n={1} title="Choose a service">
          <div className="grid sm:grid-cols-2 gap-3">
            {catalog?.services.map((s: any) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setServiceId(s.id)}
                className={`text-left p-5 rounded-sm border transition-all ${serviceId === s.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"}`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-mono-label text-muted-foreground mb-1">{s.category}</p>
                    <p className="font-display text-lg font-semibold">{s.name}</p>
                    {s.description && <p className="text-xs text-muted-foreground mt-1">{s.description}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-lg font-bold">M{Number(s.price_maloti).toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">{s.duration_minutes} min</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Step>

        <Step n={2} title="Pick your barber">
          <div className="grid sm:grid-cols-3 gap-3">
            {catalog?.barbers.map((b: any) => (
              <button
                key={b.id}
                type="button"
                onClick={() => { setBarberId(b.id); setTime(null); }}
                className={`text-left p-5 rounded-sm border transition-all ${barberId === b.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"}`}
              >
                <p className="font-mono-label text-primary mb-1">{b.role}</p>
                <p className="font-display text-xl font-bold">{b.name}</p>
                {b.bio && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{b.bio}</p>}
              </button>
            ))}
          </div>
        </Step>

        <Step n={3} title="Date, location & time">
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="font-mono-label text-muted-foreground block mb-2">Date</label>
              <input
                type="date"
                value={date}
                min={todayISO()}
                onChange={(e) => { setDate(e.target.value); setTime(null); }}
                className="w-full h-11 rounded-sm border border-border bg-background px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="font-mono-label text-muted-foreground block mb-2">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as any)}
                className="w-full h-11 rounded-sm border border-border bg-background px-4 text-sm outline-none focus:border-primary"
              >
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {!barberId ? (
            <p className="text-sm text-muted-foreground">Pick a barber to see available times.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {TIME_SLOTS.map((t) => {
                const isTaken = takenSet.has(t);
                const isActive = time === t;
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={isTaken}
                    onClick={() => setTime(t)}
                    className={`h-11 rounded-sm border text-sm font-medium transition-all ${
                      isTaken ? "border-border bg-muted text-muted-foreground line-through cursor-not-allowed" :
                      isActive ? "border-primary bg-primary text-primary-foreground" :
                      "border-border bg-card hover:border-primary/50"
                    }`}
                  >{t}</button>
                );
              })}
            </div>
          )}
        </Step>

        <Step n={4} title="Anything we should know (optional)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Preferred style, allergies, parking..."
            className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </Step>

        {mutation.error && (
          <p className="text-sm text-destructive">{(mutation.error as Error).message}</p>
        )}

        <button
          disabled={!canSubmit}
          onClick={() => mutation.mutate()}
          className="w-full h-14 inline-flex items-center justify-center gap-2 rounded-sm bg-primary text-base font-semibold text-primary-foreground hover:shadow-[var(--shadow-emerald)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Check className="h-5 w-5" /> Confirm booking <ArrowRight className="h-4 w-4" /></>}
        </button>
        <p className="text-xs text-muted-foreground text-center">
          Next step: pay with Ecocash or OneMoney via Paynow.
        </p>
      </div>
    </section>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <span className="font-mono-label text-primary border border-primary rounded-sm px-2 py-1">0{n}</span>
        <h2 className="font-display text-2xl font-bold">{title}</h2>
      </div>
      {children}
    </div>
  );
}