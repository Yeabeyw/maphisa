import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Crown, Check } from "lucide-react";
import { listMembershipPlans } from "@/lib/shop.functions";
// import { subscribeMembership } from "@/lib/shop.functions"; // TODO: Migrate to Firebase

export const Route = createFileRoute("/_authenticated/subscribe/$planId")({
  head: () => ({ meta: [{ title: "Subscribe — Maphisa's" }] }),
  component: SubscribePage,
});

function SubscribePage() {
  const { planId } = Route.useParams();
  const navigate = useNavigate();
  const fetchPlans = useServerFn(listMembershipPlans);
  // const subscribe = useServerFn(subscribeMembership); // TODO: Migrate to Firebase
  const { data, isLoading } = useQuery({ queryKey: ["membership:plans"], queryFn: () => fetchPlans() });
  const plan = data?.plans.find((p) => p.id === planId);

  const [method, setMethod] = useState<"ecocash" | "onemoney">("ecocash");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  type SubscribeResult = { ok: boolean; instructions?: string; error?: string };

  const mut = useMutation({
    mutationFn: async (): Promise<SubscribeResult> => {
      // TODO: Migrate subscription to Firebase
      throw new Error("Subscription temporarily unavailable during Firebase migration");
    },
    onSuccess: (res) => {
      if (res.ok) {
        setMsg(res.instructions ?? "Check your phone to approve the subscription payment.");
        setTimeout(() => navigate({ to: "/dashboard" }), 2500);
      } else {
        setMsg(res.error ?? "Payment failed");
      }
    },
    onError: (e: Error) => setMsg(e.message),
  });

  if (isLoading) return <div className="flex justify-center pt-40"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!plan) return <p className="pt-40 text-center text-muted-foreground">Plan not found.</p>;

  const perks = Array.isArray(plan.perks) ? (plan.perks as string[]) : [];

  return (
    <section className="mx-auto max-w-2xl px-6 pt-32 pb-24">
      <div className="rounded-sm border border-primary/40 bg-card p-8 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="h-5 w-5 text-primary" />
          <h1 className="font-display text-3xl font-bold">{plan.name}</h1>
        </div>
        <p className="text-4xl font-bold mb-1">M{Number(plan.price_maloti).toFixed(0)}<span className="text-base text-muted-foreground font-normal"> / {plan.interval}</span></p>
        {plan.description && <p className="text-muted-foreground mb-4">{plan.description}</p>}
        <ul className="space-y-2">
          {perks.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-primary mt-0.5" />{p}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-sm border border-border/60 bg-card p-6 space-y-4">
        <h2 className="font-semibold">Pay for your first month</h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setMethod("ecocash")} className={`h-12 rounded-sm border text-sm font-semibold ${method === "ecocash" ? "border-primary bg-primary/10" : "border-border"}`}>EcoCash</button>
          <button onClick={() => setMethod("onemoney")} className={`h-12 rounded-sm border text-sm font-semibold ${method === "onemoney" ? "border-primary bg-primary/10" : "border-border"}`}>OneMoney</button>
        </div>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile money phone" className="w-full h-12 rounded-sm border border-border bg-background px-4 text-sm" />
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        <button onClick={() => mut.mutate()} disabled={mut.isPending || !phone} className="w-full h-12 rounded-sm bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 inline-flex items-center justify-center gap-2">
          {mut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Subscribe — M{Number(plan.price_maloti).toFixed(0)}
        </button>
      </div>
    </section>
  );
}