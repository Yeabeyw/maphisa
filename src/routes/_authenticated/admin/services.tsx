import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { adminListServices, adminUpsertService, adminDeleteService } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/services")({
  component: AdminServices,
});

type Row = { id?: string; name: string; category: string; description?: string | null; duration_minutes: number; price_maloti: number; active: boolean };
const empty: Row = { name: "", category: "Cuts", description: "", duration_minutes: 30, price_maloti: 100, active: true };

function AdminServices() {
  const qc = useQueryClient();
  const list = useServerFn(adminListServices);
  const upsert = useServerFn(adminUpsertService);
  const del = useServerFn(adminDeleteService);
  const { data, isLoading } = useQuery({ queryKey: ["admin-services"], queryFn: () => list() });
  const [edit, setEdit] = useState<Row | null>(null);

  const save = useMutation({
    mutationFn: (r: Row) => upsert({ data: r as any }),
    onSuccess: () => { setEdit(null); qc.invalidateQueries({ queryKey: ["admin-services"] }); },
  });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-services"] }),
  });

  if (isLoading || !data) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <button onClick={() => setEdit({ ...empty })} className="inline-flex items-center gap-2 h-10 rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground">
        <Plus className="h-4 w-4" /> New service
      </button>

      {edit && (
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(edit); }} className="grid gap-3 sm:grid-cols-2 rounded-sm border border-border bg-card p-6">
          <input className="h-10 rounded-sm border border-border bg-background px-3 text-sm" placeholder="Name" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} required />
          <input className="h-10 rounded-sm border border-border bg-background px-3 text-sm" placeholder="Category" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} required />
          <input type="number" min={5} className="h-10 rounded-sm border border-border bg-background px-3 text-sm" placeholder="Minutes" value={edit.duration_minutes} onChange={(e) => setEdit({ ...edit, duration_minutes: Number(e.target.value) })} required />
          <input type="number" min={0} step="0.01" className="h-10 rounded-sm border border-border bg-background px-3 text-sm" placeholder="Price (M)" value={edit.price_maloti} onChange={(e) => setEdit({ ...edit, price_maloti: Number(e.target.value) })} required />
          <textarea className="sm:col-span-2 rounded-sm border border-border bg-background px-3 py-2 text-sm" placeholder="Description" value={edit.description ?? ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> Active</label>
          <div className="flex gap-2 sm:col-span-2">
            <button disabled={save.isPending} className="h-10 rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground">Save</button>
            <button type="button" onClick={() => setEdit(null)} className="h-10 rounded-sm border border-border px-4 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr className="text-left">
              <th className="px-4 py-3 font-mono-label text-muted-foreground">Name</th>
              <th className="px-4 py-3 font-mono-label text-muted-foreground">Category</th>
              <th className="px-4 py-3 font-mono-label text-muted-foreground">Min</th>
              <th className="px-4 py-3 font-mono-label text-muted-foreground">Price</th>
              <th className="px-4 py-3 font-mono-label text-muted-foreground">Active</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {data.services.map((s: any) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.category}</td>
                <td className="px-4 py-3">{s.duration_minutes}</td>
                <td className="px-4 py-3">M{Number(s.price_maloti).toFixed(0)}</td>
                <td className="px-4 py-3">{s.active ? "✓" : "—"}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => setEdit(s)} className="text-primary text-xs">Edit</button>
                  <button onClick={() => remove.mutate(s.id)} className="text-destructive text-xs inline-flex items-center gap-1"><Trash2 className="h-3 w-3" />Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}