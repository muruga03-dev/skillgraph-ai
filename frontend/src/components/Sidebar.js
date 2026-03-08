import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_GROUPS = [
  {
    label: "Core",
    items: [
      { path: "/dashboard",    label: "Dashboard",   icon: "⚡" },
      { path: "/analysis",     label: "Analysis",    icon: "🧠" },
    
      { path: "/roadmap",      label: "Roadmap",     icon: "🗺️" },
    ],
  },
  {
    label: "Grow",
    items: [
      { path: "/study-plan",   label: "Study Plan",  icon: "📅" },
      { path: "/jobs",         label: "Jobs",        icon: "💼" },
      { path: "/challenges",   label: "Challenges",  icon: "🏆" },
      { path: "/interview",    label: "Interview",   icon: "💡" },
      { path: "/certificates", label: "Certificates",icon: "📜" },
    ],
  },
  {
    label: "Connect",
    items: [
      { path: "/community",    label: "Community",   icon: "👥" },
      { path: "/chat",         label: "Chat",        icon: "💬" },
      { path: "/leaderboard",  label: "Leaderboard", icon: "📊" },
      { path: "/events",       label: "Events",      icon: "🎯" },
      { path: "/mentors",      label: "Mentors",     icon: "🎓" },
      { path: "/departments",  label: "Departments", icon: "🏢" },
    ],
  },
  {
    label: "Tools",
    items: [
      { path: "/assistant",    label: "AI Assistant", icon: "🤖" },
      { path: "/profile",      label: "Profile",      icon: "👤" },
    ],
  },
];

export default function Sidebar() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };
  const isActive = (path) => location.pathname === path;

  const sidebarWidth = collapsed ? 64 : 220;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800;900&display=swap');
        .sidebar-item { transition: background .15s, color .15s; }
        .sidebar-item:hover { background: var(--bg3) !important; color: var(--text) !important; }
        .sidebar-item.active { background: linear-gradient(135deg,var(--blue),var(--purple)) !important; color: #fff !important; }
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-mobile-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .sidebar-mobile-overlay { display: none !important; }
          .sidebar-mobile-btn { display: none !important; }
        }
      `}</style>

      {/* Mobile top bar */}
      <div className="sidebar-mobile-btn" style={{ display: "none", position: "fixed", top: 0, left: 0, right: 0, height: 56, zIndex: 999,
        background: "var(--bg2)", borderBottom: "1px solid var(--border)", padding: "0 1rem",
        alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: ".5rem" }}>
          <img src="/skill.jpg" alt="SkillGraph AI" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1rem", color: "var(--text)" }}>
            Skill<span style={{ color: "var(--blue)" }}>Graph</span>
          </span>
        </Link>
        <button onClick={() => setMobileOpen(o => !o)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: ".4rem .6rem", cursor: "pointer", color: "var(--text)", fontSize: "1.2rem" }}>
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-mobile-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 1001 }}
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className="sidebar-desktop" style={{
        position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 1002,
        width: sidebarWidth,
        background: "var(--bg2)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        transition: "width .25s ease",
        overflowX: "hidden",
        overflowY: "auto",
        scrollbarWidth: "thin",
        scrollbarColor: "var(--border) transparent",
      }}>
        {/* Logo + collapse btn */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "1.1rem .5rem" : "1.1rem 1rem", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          {!collapsed && (
            <Link to="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: ".5rem" }}>
              <img src="/skill.jpg" alt="SkillGraph AI" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover", border: "1px solid rgba(61,142,240,.4)", flexShrink: 0 }} />
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1rem", color: "var(--text)", whiteSpace: "nowrap" }}>
                Skill<span style={{ color: "var(--blue)" }}>Graph</span>
              </span>
            </Link>
          )}
          {collapsed && (
            <Link to="/dashboard" style={{ textDecoration: "none" }}>
              <img src="/logo.jpeg" alt="SkillGraph AI" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover", border: "1px solid rgba(61,142,240,.4)" }} />
            </Link>
          )}
          <button onClick={() => setCollapsed(c => !c)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: ".9rem", padding: ".2rem", flexShrink: 0 }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* User card */}
        <div style={{ padding: collapsed ? ".8rem .4rem" : ".8rem 1rem", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <Link to="/profile" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: ".6rem" }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--blue)", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,var(--blue),var(--purple))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: ".85rem", flexShrink: 0 }}>
                {user?.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            {!collapsed && (
              <div style={{ overflow: "hidden" }}>
                <p style={{ fontWeight: 600, fontSize: ".82rem", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name?.split(" ")[0]}</p>
                <p style={{ color: "var(--amber)", fontSize: ".7rem" }}>⭐ {user?.points || 0} pts · 🔥 {user?.streak || 0}d</p>
              </div>
            )}
          </Link>
        </div>

        {/* Nav groups */}
        <div style={{ flex: 1, padding: collapsed ? ".5rem .3rem" : ".5rem .6rem", overflowY: "auto" }}>
          {NAV_GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom: ".5rem" }}>
              {!collapsed && (
                <p style={{ color: "var(--muted)", fontSize: ".65rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", padding: ".4rem .5rem .2rem", margin: 0 }}>
                  {group.label}
                </p>
              )}
              {group.items.map(item => (
                <Link key={item.path} to={item.path} style={{ textDecoration: "none" }} title={collapsed ? item.label : ""}>
                  <div className={`sidebar-item${isActive(item.path) ? " active" : ""}`}
                    style={{
                      display: "flex", alignItems: "center", gap: ".6rem",
                      padding: collapsed ? ".55rem" : ".5rem .7rem",
                      borderRadius: 9, marginBottom: 2, cursor: "pointer",
                      color: isActive(item.path) ? "#fff" : "var(--muted)",
                      justifyContent: collapsed ? "center" : "flex-start",
                    }}>
                    <span style={{ fontSize: "1rem", flexShrink: 0 }}>{item.icon}</span>
                    {!collapsed && <span style={{ fontSize: ".83rem", fontWeight: 600, whiteSpace: "nowrap" }}>{item.label}</span>}
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom actions */}
        <div style={{ padding: collapsed ? ".6rem .3rem" : ".6rem .6rem", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
          {/* Theme toggle */}
          <button onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            style={{ display: "flex", alignItems: "center", gap: ".6rem", width: "100%", padding: collapsed ? ".5rem" : ".5rem .7rem", borderRadius: 9, background: "none", border: "none", cursor: "pointer", color: "var(--muted)", marginBottom: 2, justifyContent: collapsed ? "center" : "flex-start", fontFamily: "inherit" }}
            className="sidebar-item">
            <span style={{ fontSize: "1rem" }}>{theme === "dark" ? "☀️" : "🌙"}</span>
            {!collapsed && <span style={{ fontSize: ".83rem", fontWeight: 600 }}>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>
          {/* Logout */}
          <button onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: ".6rem", width: "100%", padding: collapsed ? ".5rem" : ".5rem .7rem", borderRadius: 9, background: "none", border: "none", cursor: "pointer", color: "var(--red)", justifyContent: collapsed ? "center" : "flex-start", fontFamily: "inherit" }}
            className="sidebar-item">
            <span style={{ fontSize: "1rem" }}>🚪</span>
            {!collapsed && <span style={{ fontSize: ".83rem", fontWeight: 600 }}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <aside style={{
        position: "fixed", top: 56, left: mobileOpen ? 0 : -260, height: "calc(100vh - 56px)",
        width: 250, background: "var(--bg2)", borderRight: "1px solid var(--border)",
        zIndex: 1002, transition: "left .25s ease", overflowY: "auto",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: ".5rem .6rem", flex: 1 }}>
          {NAV_GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom: ".5rem" }}>
              <p style={{ color: "var(--muted)", fontSize: ".65rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", padding: ".4rem .5rem .2rem", margin: 0 }}>
                {group.label}
              </p>
              {group.items.map(item => (
                <Link key={item.path} to={item.path} style={{ textDecoration: "none" }} onClick={() => setMobileOpen(false)}>
                  <div className={`sidebar-item${isActive(item.path) ? " active" : ""}`}
                    style={{ display: "flex", alignItems: "center", gap: ".6rem", padding: ".5rem .7rem", borderRadius: 9, marginBottom: 2, cursor: "pointer", color: isActive(item.path) ? "#fff" : "var(--muted)" }}>
                    <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                    <span style={{ fontSize: ".83rem", fontWeight: 600 }}>{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding: ".6rem .6rem", borderTop: "1px solid var(--border)" }}>
          <button onClick={() => { toggleTheme(); setMobileOpen(false); }}
            style={{ display: "flex", alignItems: "center", gap: ".6rem", width: "100%", padding: ".5rem .7rem", borderRadius: 9, background: "none", border: "none", cursor: "pointer", color: "var(--muted)", marginBottom: 2, fontFamily: "inherit" }}
            className="sidebar-item">
            <span style={{ fontSize: "1rem" }}>{theme === "dark" ? "☀️" : "🌙"}</span>
            <span style={{ fontSize: ".83rem", fontWeight: 600 }}>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button onClick={() => { handleLogout(); setMobileOpen(false); }}
            style={{ display: "flex", alignItems: "center", gap: ".6rem", width: "100%", padding: ".5rem .7rem", borderRadius: 9, background: "none", border: "none", cursor: "pointer", color: "var(--red)", fontFamily: "inherit" }}
            className="sidebar-item">
            <span style={{ fontSize: "1rem" }}>🚪</span>
            <span style={{ fontSize: ".83rem", fontWeight: 600 }}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
