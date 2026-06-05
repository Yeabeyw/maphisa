import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { auth } from "@/lib/firebase";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const user = auth.currentUser;
    if (!user) throw redirect({ to: "/auth" });
    // TODO: Implement Firebase admin role check
    // For now, allow all authenticated users to access admin
    // In production, check user_roles collection in Firestore
    return { user };
  },
  component: AdminLayout,
});

const tabs: { to: "/admin" | "/admin/bookings" | "/admin/services" | "/admin/barbers" | "/admin/products" | "/admin/plans" | "/admin/orders" | "/admin/payments"; label: string; exact?: boolean }[] = [
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/barbers", label: "Barbers" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/plans", label: "Plans" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/payments", label: "Payments" },
];

function AdminLayout() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-24 pb-24">
      <p className="font-mono-label text-primary mb-2">— Admin</p>
      <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">Maphisa's control room.</h1>
      <div className="flex flex-wrap gap-2 border-b border-border mb-10">
        {tabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            activeOptions={{ exact: t.exact }}
            className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent transition-colors"
            activeProps={{ className: "px-4 py-3 text-sm font-semibold text-primary border-b-2 border-primary" }}
          >{t.label}</Link>
        ))}
      </div>
      <Outlet />
    </div>
  );
}