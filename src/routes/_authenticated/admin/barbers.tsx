import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { adminListBarbers, adminUpsertBarber, adminDeleteBarber } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/barbers")({
  component: AdminBarbers,
});

type Row = { id?: string; name: string; role?: string | null; bio?: string | null; photo_url?: string | null; display_order: number; active: boolean };
const empty: Row = { name: "", role: "Master Barber", bio: "", photo_url: "", display_order: 0, active: true };

function AdminBarbers() {
  const qc = useQueryClient();
  const list = useServerFn(adminListBarbers);
  const upsert = useServerFn(adminUpsertBarber);
  const del = useServerFn(adminDeleteBarber);
  const { data, isLoading } = useQuery({ queryKey: ["admin-barbers"], queryFn: () => list() });
  const [edit, setEdit] = useState<Row | null>(null);

  const save = useMutation({
    mutationFn: (r: Row) => upsert({ data: { ...r, photo_url: r.photo_url || undefined } as any }),
    onSuccess: () => { setEdit(null); qc.invalidateQueries({ queryKey: ["admin-barbers"] }); },
  });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-barbers"] }),
  });

  if (isLoading || !data) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <button onClick={() => setEdit({ ...empty })} className="inline-flex items-center gap-2 h-10 rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground">
        <Plus className="h-4 w-4" /> New barber
      </button>

      {edit && (
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(edit); }} className="grid gap-3 sm:grid-cols-2 rounded-sm border border-border bg-card p-6">
          <input className="h-10 rounded-sm border border-border bg-background px-3 text-sm" placeholder="Name" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} required />
          <input className="h-10 rounded-sm border border-border bg-background px-3 text-sm" placeholder="Role" value={edit.role ?? ""} onChange={(e) => setEdit({ ...edit, role: e.target.value })} />
          <input type="number" min={0} className="h-10 rounded-sm border border-border bg-background px-3 text-sm" placeholder="Display order" value={edit.display_order} onChange={(e) => setEdit({ ...edit, display_order: Number(e.target.value) })} />
          <input className="h-10 rounded-sm border border-border bg-background px-3 text-sm" placeholder="Photo URL (https://…)" value={edit.photo_url ?? ""} onChange={(e) => setEdit({ ...edit, photo_url: e.target.value })} />
          <textarea className="sm:col-span-2 rounded-sm border border-border bg-background px-3 py-2 text-sm" placeholder="Bio" value={edit.bio ?? ""} onChange={(e) => setEdit({ ...edit, bio: e.target.value })} />
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
              <th className="px-4 py-3 font-mono-label text-muted-foreground">Role</th>
              <th className="px-4 py-3 font-mono-label text-muted-foreground">Order</th>
              <th className="px-4 py-3 font-mono-label text-muted-foreground">Active</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {data.barbers.map((b: any) => (
              <tr key={b.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{b.name}</td>
                <td className="px-4 py-3">{b.role ?? "—"}</td>
                <td className="px-4 py-3">{b.display_order}</td>
                <td className="px-4 py-3">{b.active ? "✓" : "—"}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => setEdit(b)} className="text-primary text-xs">Edit</button>
                  <button onClick={() => remove.mutate(b.id)} className="text-destructive text-xs inline-flex items-center gap-1"><Trash2 className="h-3 w-3" />Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}