import { Navigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import Dashboard from "../components/Dashboard";
import { useProfileStore } from "../store/useProfileStore";

export default function DashboardPage() {
  const profile = useProfileStore((s) => s.profile);

  if (!profile) return <Navigate to="/profile" replace />;

  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
