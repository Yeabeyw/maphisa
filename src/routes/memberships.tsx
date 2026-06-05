import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Crown, Loader2 } from "lucide-react";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

interface MembershipPlan {
  id: string;
  name: string;
  description?: string;
  price_maloti: number;
  interval: string;
  perks?: string[];
}

export const Route = createFileRoute("/memberships")({
  head: () => ({
    meta: [
      { title: "Memberships — Maphisa's Barber" },
      { name: "description", content: "Monthly grooming memberships with discounted cuts, priority booking and product perks." },
      { property: "og:title", content: "Memberships — Maphisa's Barber" },
      { property: "og:description", content: "Monthly grooming memberships at Maphisa's." },
    ],
  }),
  component: MembershipsPage,
});

function MembershipsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["membership:plans"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'membership_plans'));
      const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MembershipPlan));
      return { plans };
    }
  });
  const { user } = useFirebaseAuth();

  return (
    <section className="mx-auto max-w-7xl px-6 pt-32 pb-24">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <p className="text-sm uppercase tracking-[0.3em] text-primary mb-3">Membership</p>
        <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">Join the Club</h1>
        <p className="text-muted-foreground text-lg">Lock in a monthly rate, skip the queue, and look your best year-round.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : !data?.plans.length ? (
        <p className="text-center text-muted-foreground">No membership plans available right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.plans.map((plan, idx) => {
            const perks = Array.isArray(plan.perks) ? (plan.perks as string[]) : [];
            const featured = idx === 1;
            return (
              <article key={plan.id} className={`relative rounded-sm border bg-card p-8 flex flex-col ${featured ? "border-primary shadow-[var(--shadow-emerald)]" : "border-border/60"}`}>
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-sm uppercase tracking-wider">Most popular</span>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-2xl font-bold">{plan.name}</h2>
                </div>
                {plan.description && <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>}
                <div className="mb-6">
                  <span className="text-5xl font-bold">M{Number(plan.price_maloti).toFixed(0)}</span>
                  <span className="text-muted-foreground"> / {plan.interval}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={user ? "/subscribe/$planId" : "/auth"}
                  params={{ planId: plan.id }}
                  className={`inline-flex h-11 items-center justify-center rounded-sm px-6 text-sm font-semibold transition-colors ${featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border hover:bg-accent"}`}
                >
                  {user ? "Subscribe" : "Sign in to join"}
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}