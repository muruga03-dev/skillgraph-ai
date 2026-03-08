import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState("dark");

  // Apply theme to body
  const applyTheme = useCallback((t) => {
    document.body.classList.toggle("light", t === "light");
    setThemeState(t);
    localStorage.setItem("sg_theme", t);
  }, []);

  useEffect(() => {
    const t  = localStorage.getItem("sg_token");
    const u  = localStorage.getItem("sg_user");
    const th = localStorage.getItem("sg_theme") || "dark";
    applyTheme(th);
    if (t && u) { try { setUser(JSON.parse(u)); } catch {} }
    setLoading(false);
  }, [applyTheme]);

  const toggleTheme = () => applyTheme(theme === "dark" ? "light" : "dark");

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("sg_token", token);
    localStorage.setItem("sg_user", JSON.stringify(userData));
    if (userData.theme) applyTheme(userData.theme);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sg_token");
    localStorage.removeItem("sg_user");
  };

  const updateUser = (u) => {
    setUser(u);
    localStorage.setItem("sg_user", JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAuth: !!user, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
};
