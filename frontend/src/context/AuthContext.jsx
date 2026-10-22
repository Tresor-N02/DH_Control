import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import * as api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => api.getToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On mount (and whenever the token changes), confirm it's still valid
  // and fetch the profile it belongs to -- a token left over from a
  // previous session that the backend no longer accepts shouldn't leave
  // the app stuck thinking it's logged in.
  useEffect(() => {
    let cancelled = false;

    async function checkToken() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const me = await api.fetchMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) {
          api.setToken(null);
          setTokenState(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    checkToken();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const { access_token } = await api.login(email, password);
      api.setToken(access_token);
      setTokenState(access_token);
      return true;
    } catch (err) {
      setError(
        err?.response?.status === 401
          ? "Email ou mot de passe incorrect."
          : "Impossible de contacter le serveur backend."
      );
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, loading, error, login, logout }),
    [token, user, loading, error, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
