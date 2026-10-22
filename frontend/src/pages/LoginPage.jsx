import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Shield, LogIn, Loader2 } from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { token, loading, login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("admin@dh-mil.local");
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
    if (ok) navigate("/", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Shield size={40} className="text-cyan-400" />
          <h1 className="text-lg font-bold">DH_MIL</h1>
          <p className="text-xs text-slate-400">Poste de contrôle -- Drone Hybride</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-md"
        >
          <label className="mb-1 block text-xs text-slate-400">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-500"
            autoComplete="username"
          />

          <label className="mb-1 block text-xs text-slate-400">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-500"
            autoComplete="current-password"
          />

          {error && <p className="mb-4 text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 py-2 text-sm font-semibold transition hover:bg-cyan-500 disabled:opacity-60"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            Se connecter
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-slate-500">
          Identifiants par défaut après <code>python seed.py</code> :{" "}
          <code>admin@dh-mil.local</code> / <code>ChangeMe123!</code>
        </p>
      </div>
    </div>
  );
}
