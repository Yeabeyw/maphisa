import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { adminStats } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="rounded-sm border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono-label text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="font-display text-3xl font-bold">{value}</p>
    </div>
  );
}

function AdminOverview() {
  const fn = useServerFn(adminStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn() });
  if (isLoading || !data) return <p className="text-muted-foreground">Loading stats…</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat icon={Calendar} label="Total bookings" value={data.totalBookings} />
      <Stat icon={Clock} label="Today" value={data.todayBookings} />
      <Stat icon={CheckCircle2} label="Pending" value={data.pendingBookings} />
      <Stat icon={DollarSign} label="Revenue (paid)" value={`M${data.revenuePaid.toFixed(0)}`} />
    </div>
  );
}