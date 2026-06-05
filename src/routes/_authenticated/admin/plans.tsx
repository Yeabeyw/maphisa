import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { adminListPlans, adminUpsertPlan } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/plans")({
  component: AdminPlans,
});

interface Draft {
  id?: string;
  name: string;
  description: string;
  price_maloti: number;
  interval: string;
  perks: string; // newline-separated
  active: boolean;
  display_order: number;
}
const empty: Draft = { name: "", description: "", price_maloti: 0, interval: "monthly", perks: "", active: true, display_order: 0 };

function AdminPlans() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(adminListPlans);
  const upsert = useServerFn(adminUpsertPlan);
  const { data, isLoading } = useQuery({ queryKey: ["admin:plans"], queryFn: () => fetchAll() });
  const [draft, setDraft] = useState<Draft>(empty);

  const mut = useMutation({
    mutationFn: (r: Draft) =>
      upsert({
        data: {
          id: r.id,
          name: r.name,
          description: r.description || null,
          price_maloti: Number(r.price_maloti),
          interval: r.interval,
          perks: r.perks.split("\n").map((s) => s.trim()).filter(Boolean),
          active: r.active,
          display_order: Number(r.display_order),
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin:plans"] });
      setDraft(empty);
    },
  });

  return (
    <div className="space-y-8">
      <form onSubmit={(e) => { e.preventDefault(); mut.mutate(draft); }} className="rounded-sm border border-border/60 bg-card p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input className="h-10 px-3 rounded-sm border border-border bg-background text-sm md:col-span-2" placeholder="Plan name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
        <input type="number" step="0.01" className="h-10 px-3 rounded-sm border border-border bg-background text-sm" placeholder="Price (M)" value={draft.price_maloti} onChange={(e) => setDraft({ ...draft, price_maloti: Number(e.target.value) })} required />
        <input className="h-10 px-3 rounded-sm border border-border bg-background text-sm" placeholder="Interval" value={draft.interval} onChange={(e) => setDraft({ ...draft, interval: e.target.value })} />
        <input className="h-10 px-3 rounded-sm border border-border bg-background text-sm md:col-span-3" placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <input type="number" className="h-10 px-3 rounded-sm border border-border bg-background text-sm" placeholder="Order" value={draft.display_order} onChange={(e) => setDraft({ ...draft, display_order: Number(e.target.value) })} />
        <textarea className="md:col-span-3 px-3 py-2 rounded-sm border border-border bg-background text-sm" placeholder="Perks (one per line)" rows={3} value={draft.perks} onChange={(e) => setDraft({ ...draft, perks: e.target.value })} />
        <button type="submit" disabled={mut.isPending} className="h-10 rounded-sm bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-1.5 disabled:opacity-50">
          {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {draft.id ? "Save" : "Add"}
        </button>
      </form>

      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(data?.plans ?? []).map((p: any) => (
            <div key={p.id} className="rounded-sm border border-border/60 bg-card p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                <button onClick={() => setDraft({ id: p.id, name: p.name, description: p.description ?? "", price_maloti: Number(p.price_maloti), interval: p.interval, perks: (p.perks ?? []).join("\n"), active: p.active, display_order: p.display_order })} className="text-primary text-xs font-semibold">Edit</button>
              </div>
              <p className="text-sm text-muted-foreground mb-2">M{Number(p.price_maloti).toFixed(0)} / {p.interval}</p>
              <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                {(p.perks ?? []).map((x: string, i: number) => <li key={i}>{x}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}