import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { apiUrl } from "../../config.js";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(readStoredUser);
  const [subscribed, setSubscribed] = useState(
    () => localStorage.getItem("subscribed") === "true"
  );
  const [subscriptionExpiry, setSubscriptionExpiry] = useState(
    () => localStorage.getItem("subscriptionExpiry") || null
  );

  const login = useCallback(({ token, user, isSubscribed, subscriptionExpiry }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("subscribed", String(Boolean(isSubscribed)));
    if (subscriptionExpiry) localStorage.setItem("subscriptionExpiry", subscriptionExpiry);
    else localStorage.removeItem("subscriptionExpiry");
    setToken(token);
    setUser(user);
    setSubscribed(Boolean(isSubscribed));
    setSubscriptionExpiry(subscriptionExpiry || null);
  }, []);

  const setSubscription = useCallback((value, expiry) => {
    localStorage.setItem("subscribed", String(Boolean(value)));
    setSubscribed(Boolean(value));
    if (expiry !== undefined) {
      if (expiry) localStorage.setItem("subscriptionExpiry", expiry);
      else localStorage.removeItem("subscriptionExpiry");
      setSubscriptionExpiry(expiry || null);
    }
  }, []);

  // Re-fetches subscription status from the server. Called on dashboard
  // mount and after returning from a payment redirect, so every page shows
  // the same, up-to-date state instead of relying on stale local storage.
  const refreshSubscription = useCallback(async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) return;

    try {
      const res = await fetch(apiUrl("/api/users/status"), {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setSubscription(data.subscribed, data.subscriptionExpiry);
    } catch {
      // Silently keep whatever state we already have; not worth surfacing.
    }
  }, [setSubscription]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("subscribed");
    localStorage.removeItem("subscriptionExpiry");
    setToken(null);
    setUser(null);
    setSubscribed(false);
    setSubscriptionExpiry(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      subscribed,
      subscriptionExpiry,
      isAuthenticated: Boolean(token),
      login,
      logout,
      setSubscription,
      refreshSubscription,
    }),
    [token, user, subscribed, subscriptionExpiry, login, logout, setSubscription, refreshSubscription]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
