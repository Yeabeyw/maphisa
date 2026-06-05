import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Plus, Save } from "lucide-react";
import { adminListProducts, adminUpsertProduct } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

interface Row {
  id?: string;
  name: string;
  description: string;
  category: string;
  price_maloti: number;
  stock: number;
  image_url: string;
  active: boolean;
}

const empty: Row = { name: "", description: "", category: "general", price_maloti: 0, stock: 0, image_url: "", active: true };

function AdminProducts() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(adminListProducts);
  const upsert = useServerFn(adminUpsertProduct);
  const { data, isLoading } = useQuery({ queryKey: ["admin:products"], queryFn: () => fetchAll() });
  const [draft, setDraft] = useState<Row>(empty);

  const mut = useMutation({
    mutationFn: (r: Row) =>
      upsert({
        data: {
          id: r.id,
          name: r.name,
          description: r.description || null,
          category: r.category,
          price_maloti: Number(r.price_maloti),
          stock: Number(r.stock),
          image_url: r.image_url || null,
          active: r.active,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin:products"] });
      setDraft(empty);
    },
  });

  return (
    <div className="space-y-8">
      <form
        onSubmit={(e) => { e.preventDefault(); mut.mutate(draft); }}
        className="rounded-sm border border-border/60 bg-card p-5 grid grid-cols-1 md:grid-cols-6 gap-3"
      >
        <input className="md:col-span-2 h-10 px-3 rounded-sm border border-border bg-background text-sm" placeholder="Product name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
        <input className="h-10 px-3 rounded-sm border border-border bg-background text-sm" placeholder="Category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
        <input type="number" step="0.01" className="h-10 px-3 rounded-sm border border-border bg-background text-sm" placeholder="Price (M)" value={draft.price_maloti} onChange={(e) => setDraft({ ...draft, price_maloti: Number(e.target.value) })} required />
        <input type="number" className="h-10 px-3 rounded-sm border border-border bg-background text-sm" placeholder="Stock" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })} required />
        <button type="submit" disabled={mut.isPending} className="h-10 rounded-sm bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-1.5 disabled:opacity-50">
          {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {draft.id ? "Save" : "Add"}
        </button>
        <input className="md:col-span-4 h-10 px-3 rounded-sm border border-border bg-background text-sm" placeholder="Image URL (optional)" value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} />
        <input className="md:col-span-2 h-10 px-3 rounded-sm border border-border bg-background text-sm" placeholder="Short description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
      </form>

      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : (
        <div className="rounded-sm border border-border/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase">
              <tr><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Active</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {(data?.products ?? []).map((p: any) => (
                <tr key={p.id} className="border-t border-border/60">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 text-muted-foreground">{p.category}</td>
                  <td className="p-3">M{Number(p.price_maloti).toFixed(2)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">{p.active ? "Yes" : "No"}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => setDraft({ id: p.id, name: p.name, description: p.description ?? "", category: p.category, price_maloti: Number(p.price_maloti), stock: p.stock, image_url: p.image_url ?? "", active: p.active })} className="text-primary text-xs font-semibold">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}