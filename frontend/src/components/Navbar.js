import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { path: "/dashboard",   label: "Dashboard",  icon: "⚡" },
  { path: "/analysis",    label: "Analysis",   icon: "🧠" },
  { path: "/roadmap",     label: "Roadmap",    icon: "🗺️" },
  { path: "/study-plan",  label: "Study Plan", icon: "📅" },
  { path: "/jobs",        label: "Jobs",       icon: "💼" },
  { path: "/challenges",  label: "Challenges", icon: "🏆" },
  { path: "/interview",   label: "Interview",  icon: "💡" },
  { path: "/community",   label: "Community",  icon: "👥" },
  { path: "/chat",        label: "Chat",       icon: "💬" },
  { path: "/leaderboard", label: "Leaderboard",icon: "📊" },
  { path: "/events",      label: "Events",     icon: "🎯" },
  { path: "/mentors",     label: "Mentors",    icon: "🎓" },
  { path: "/assistant",   label: "AI Bot",     icon: "🤖" },
];

export default function Navbar() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 1000,
      background: theme === "light" ? "rgba(240,244,251,.95)" : "rgba(6,13,26,.95)",
      backdropFilter: "blur(12px)",
      borderBottom: `1px solid var(--border)`,
      padding: "0 1.5rem",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
        
        {/* Logo */}
        <Link to="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: ".5rem" }}>
          <img src="/skill.jpg" alt="SkillGraph AI" style={{ width:30, height:30, borderRadius:8, objectFit:"cover", border:"1px solid rgba(61,142,240,.4)" }} />
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--text)" }}>
            Skill<span style={{ color: "var(--blue)" }}>Graph</span>
          </span>
        </Link>

        {/* Desktop nav — scrollable */}
        <div style={{ display: "flex", gap: ".15rem", overflowX: "auto", flex: 1, margin: "0 1rem", scrollbarWidth: "none" }}
          className="hide-scrollbar">
          {NAV.map(n => (
            <Link key={n.path} to={n.path} style={{ textDecoration: "none" }}>
              <div style={{
                padding: ".35rem .65rem", borderRadius: 8, fontSize: ".78rem", fontWeight: 600, whiteSpace: "nowrap",
                background: location.pathname === n.path ? "linear-gradient(135deg,var(--blue),var(--purple))" : "transparent",
                color: location.pathname === n.path ? "#fff" : "var(--muted)",
                transition: "all .15s",
              }}
              onMouseEnter={e => { if (location.pathname !== n.path) { e.target.style.color = "var(--text)"; e.target.style.background = "var(--bg3)"; }}}
              onMouseLeave={e => { if (location.pathname !== n.path) { e.target.style.color = "var(--muted)"; e.target.style.background = "transparent"; }}}>
                {n.icon} {n.label}
              </div>
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: ".6rem", flexShrink: 0 }}>
          {/* Theme toggle */}
          <button onClick={toggleTheme} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: ".35rem .5rem", cursor: "pointer", fontSize: "1rem", lineHeight: 1 }}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* User avatar + dropdown */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setDdOpen(d => !d)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: ".4rem" }}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--blue)" }} />
              ) : (
                <div className="sg-avatar" style={{ width: 32, height: 32, fontSize: ".85rem" }}>{user?.name?.[0]?.toUpperCase()}</div>
              )}
              <span style={{ fontSize: ".82rem", color: "var(--text)", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name?.split(" ")[0]}</span>
              <span style={{ color: "var(--muted)", fontSize: ".7rem" }}>▼</span>
            </button>

            {ddOpen && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)", background: "var(--bg2)",
                border: "1px solid var(--border)", borderRadius: 12, padding: ".5rem", minWidth: 180,
                boxShadow: "0 8px 32px rgba(0,0,0,.3)", zIndex: 100,
              }} onMouseLeave={() => setDdOpen(false)}>
                <div style={{ padding: ".5rem .8rem .6rem", borderBottom: "1px solid var(--border)", marginBottom: ".3rem" }}>
                  <p style={{ fontWeight: 700, fontSize: ".88rem" }}>{user?.name}</p>
                  <p style={{ color: "var(--muted)", fontSize: ".74rem" }}>{user?.email}</p>
                  <p style={{ color: "var(--amber)", fontSize: ".74rem", marginTop: ".2rem" }}>⭐ {user?.points || 0} pts · {user?.level}</p>
                </div>
                {[
                  ["/profile", "👤", "My Profile"],
                  ["/certificates", "📜", "Certificates"],
                  ["/challenges", "🏆", "Challenges"],
                ].map(([path, icon, label]) => (
                  <Link key={path} to={path} onClick={() => setDdOpen(false)} style={{ textDecoration: "none" }}>
                    <div style={{ padding: ".45rem .8rem", borderRadius: 8, fontSize: ".84rem", color: "var(--muted)", display: "flex", gap: ".4rem", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      {icon} {label}
                    </div>
                  </Link>
                ))}
                <div style={{ borderTop: "1px solid var(--border)", marginTop: ".3rem", paddingTop: ".3rem" }}>
                  <button onClick={handleLogout} style={{ width: "100%", padding: ".45rem .8rem", borderRadius: 8, background: "none", border: "none", color: "var(--red)", cursor: "pointer", textAlign: "left", fontSize: ".84rem", fontFamily: "inherit" }}
                    onMouseEnter={e => e.target.style.background = "rgba(252,129,129,.08)"}
                    onMouseLeave={e => e.target.style.background = "none"}>
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
