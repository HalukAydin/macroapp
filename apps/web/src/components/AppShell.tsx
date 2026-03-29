import { Link } from "react-router-dom";
import { useProfileStore } from "../store/useProfileStore";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const reset = useProfileStore((s) => s.reset);

  return (
    <div style={{ padding: 24 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Macro MVP</h2>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/log">Weight Log</Link>
        </nav>
        <div style={{ marginLeft: "auto" }}>
          <button onClick={reset}>Reset</button>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
