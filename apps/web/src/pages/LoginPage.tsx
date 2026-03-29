import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import PageContainer from "../components/ui/PageContainer";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError(null);
  };

  return (
    <PageContainer>
      <div style={{ maxWidth: 400, margin: "80px auto" }}>
        <div className="page-stack">
          <h1 className="section-title">
            {mode === "login" ? "Sign In" : "Create Account"}
          </h1>

          <form onSubmit={onSubmit} className="card-stack">
            <label className="field-label">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </label>

            <label className="field-label">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </label>

            {error ? (
              <p className="feedback feedback-warn" role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" disabled={loading}>
              {loading ? "…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>

            <p className="muted-text">
              {mode === "login" ? "No account yet? " : "Already have an account? "}
              <button type="button" className="button-quiet" onClick={toggleMode}>
                {mode === "login" ? "Register" : "Sign In"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </PageContainer>
  );
}
