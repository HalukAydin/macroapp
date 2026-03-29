import { Navigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import WeightLog from "../components/WeightLog";
import { useProfileStore } from "../store/useProfileStore";

export default function WeightLogPage() {
  const profile = useProfileStore((s) => s.profile);

  if (!profile) return <Navigate to="/profile" replace />;

  return (
    <AppShell>
      <WeightLog />
    </AppShell>
  );
}
