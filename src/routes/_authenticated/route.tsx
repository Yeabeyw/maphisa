import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { auth } from '@/lib/firebase';

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const user = auth.currentUser;
    if (!user) throw redirect({ to: "/auth" });
    return { user };
  },
  component: () => <Outlet />,
});