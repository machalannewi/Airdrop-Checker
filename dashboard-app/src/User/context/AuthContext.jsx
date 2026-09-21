import { createContext, useContext, useState, useCallback, useMemo } from "react";

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

  const login = useCallback(({ token, user, isSubscribed }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("subscribed", String(Boolean(isSubscribed)));
    setToken(token);
    setUser(user);
    setSubscribed(Boolean(isSubscribed));
  }, []);

  const setSubscription = useCallback((value) => {
    localStorage.setItem("subscribed", String(Boolean(value)));
    setSubscribed(Boolean(value));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("subscribed");
    setToken(null);
    setUser(null);
    setSubscribed(false);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      subscribed,
      isAuthenticated: Boolean(token),
      login,
      logout,
      setSubscription,
    }),
    [token, user, subscribed, login, logout, setSubscription]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
