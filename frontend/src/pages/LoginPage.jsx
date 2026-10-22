import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Shield, LogIn, Loader2 } from "lucide-react";

import { useAuth } from "../context/useAuth";
import ThemeToggle from "../components/common/ThemeToggle";

export default function LoginPage() {
  const { token, loading, login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in -- don't show the login form again.
  if (!loading && token) {
    const redirectTo = location.state?.from || "/";
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    const ok = await login(email, password);
    setSubmitting(false);
    if (ok) navigate(location.state?.from || "/", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-4 text-ink">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Shield size={40} className="text-accent-ink" />
          <h1 className="text-lg font-bold">DH_MIL</h1>
          <p className="text-xs text-subtle">
            Poste de contrôle -- Drone Hybride
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-line bg-panel p-6 shadow-md"
        >
          <label htmlFor="email" className="mb-1 block text-xs text-subtle">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-lg border border-line bg-app px-3 py-2 text-sm outline-none focus:border-cyan-500"
            autoComplete="username"
          />

          <label htmlFor="password" className="mb-1 block text-xs text-subtle">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-lg border border-line bg-app px-3 py-2 text-sm outline-none focus:border-cyan-500"
            autoComplete="current-password"
          />

          {error && (
            <p role="alert" className="mb-4 text-sm text-error-ink">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 text-white py-2 text-sm font-semibold transition hover:bg-cyan-500 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogIn size={16} />
            )}
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
