import React, { createContext, useContext, useEffect, useState } from "react";
import type { AuthContextType, AuthUser } from "../interface/authContext";
import { fetchAPI, setUnauthorizedHandler } from "../services/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // When the API sees an expired or missing session it calls this; clearing the
  // user flips isAuthenticated and ProtectedRoute sends us back to /login.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  // The auth cookie is httpOnly, so the only way to know whether we have a live
  // session is to ask the API once on startup.
  useEffect(() => {
    let cancelled = false;

    fetchAPI("/auth/me")
      .then((data) => {
        if (!cancelled) setUser({ email: data.email });
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const data = await fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser({ email: data.email });
  };

  const logout = async () => {
    try {
      await fetchAPI("/auth/logout", { method: "POST" });
    } finally {
      // Drop the session locally even if the request failed, so the UI never
      // shows a logged-in state the server has already forgotten.
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};
