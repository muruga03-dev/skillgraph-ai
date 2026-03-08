import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const params = new URLSearchParams(window.location.search);
  const oauthError = params.get("error");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Email and password required"); return; }
    setLoading(true); setError("");
    try {
      const r = await authAPI.login({ email: form.email, password: form.password });
      login(r.data.user, r.data.token);
      navigate("/dashboard");
    } catch (e) {
      setError(e.response?.data?.message || "Invalid email or password");
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#060d1a", color: "#e2eaf7",
      display: "flex", fontFamily: "'Inter',sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .oauth-btn { transition:all .2s; }
        .oauth-btn:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(0,0,0,.3) !important; }
        .sg-input-login { width:100%; padding:.75rem 1rem; background:rgba(11,21,40,.8); border:1px solid rgba(23,36,66,1); border-radius:10px; color:#e2eaf7; font-size:.9rem; outline:none; font-family:inherit; transition:border-color .2s; }
        .sg-input-login:focus { border-color:#3d8ef0; box-shadow:0 0 0 3px rgba(61,142,240,.12); }
        .sg-input-login::placeholder { color:#3a5275; }
      `}</style>

      {/* Left panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", overflow: "hidden" }}>
        {/* bg orb */}
        <div style={{ position: "absolute", top: -80, left: -80, width: 400, height: 400, background: "radial-gradient(circle,rgba(61,142,240,.08),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, right: -60, width: 300, height: 300, background: "radial-gradient(circle,rgba(159,122,234,.06),transparent 70%)", pointerEvents: "none" }} />

        <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: ".7rem", marginBottom: "2.5rem" }}>
            <img src="/skill.jpg" alt="SkillGraph AI" style={{ width: 42, height: 42, borderRadius: 11, objectFit: "cover" }} />
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: "1.3rem" }}>
              Skill<span style={{ background: "linear-gradient(90deg,#3d8ef0,#9f7aea)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Graph</span> AI
            </span>
          </div>

          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: "2rem", marginBottom: ".4rem" }}>Welcome back 👋</h1>
          <p style={{ color: "#4a6280", marginBottom: "2rem", fontSize: ".9rem" }}>Sign in to your career intelligence dashboard</p>

          {/* OAuth error */}
          {oauthError && (
            <div style={{ background: "rgba(252,129,129,.08)", border: "1px solid rgba(252,129,129,.25)", borderRadius: 10, padding: ".7rem 1rem", color: "#fc8181", fontSize: ".84rem", marginBottom: "1rem" }}>
              ⚠️ OAuth sign-in failed. Please try again or use email.
            </div>
          )}

          {/* Google button */}
          <a href="http://localhost:5000/api/auth/google" className="oauth-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".7rem", width: "100%", padding: ".85rem", borderRadius: 12, background: "#ffffff", color: "#1a1a1a", textDecoration: "none", fontWeight: 700, fontSize: ".9rem", marginBottom: ".7rem", boxShadow: "0 2px 12px rgba(0,0,0,.25)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>

          {/* LinkedIn button */}
          <a href="http://localhost:5000/api/auth/linkedin" className="oauth-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".7rem", width: "100%", padding: ".85rem", borderRadius: 12, background: "#0077B5", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: ".9rem", marginBottom: "1.5rem", boxShadow: "0 4px 16px rgba(0,119,181,.35)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Continue with LinkedIn
          </a>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(23,36,66,1)" }} />
            <span style={{ color: "#3a5275", fontSize: ".78rem" }}>or sign in with email</span>
            <div style={{ flex: 1, height: 1, background: "rgba(23,36,66,1)" }} />
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "rgba(252,129,129,.08)", border: "1px solid rgba(252,129,129,.25)", borderRadius: 10, padding: ".7rem 1rem", color: "#fc8181", fontSize: ".84rem", marginBottom: "1rem" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Email form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#4a6280", fontSize: ".8rem", fontWeight: 600, marginBottom: ".4rem" }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="sg-input-login" required />
            </div>
            <div style={{ marginBottom: "1.2rem" }}>
              <label style={{ display: "block", color: "#4a6280", fontSize: ".8rem", fontWeight: 600, marginBottom: ".4rem" }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="sg-input-login" required />
            </div>
            <button type="submit" disabled={loading} style={{ width: "100%", padding: ".85rem", borderRadius: 12, background: "linear-gradient(135deg,#3d8ef0,#6c63ff)", color: "#fff", border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: ".95rem", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1, transition: "all .2s", boxShadow: "0 4px 16px rgba(61,142,240,.35)" }}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#3a5275", fontSize: ".85rem" }}>
            No account?{" "}
            <Link to="/signup" style={{ color: "#3d8ef0", textDecoration: "none", fontWeight: 700 }}>Create free account</Link>
          </p>

          {/* Mentor portal link */}
          <div style={{ textAlign: "center", marginTop: "1.2rem", padding: ".9rem", background: "rgba(159,122,234,.05)", border: "1px solid rgba(159,122,234,.15)", borderRadius: 12 }}>
            <p style={{ color: "#4a6280", fontSize: ".8rem", marginBottom: ".35rem" }}>Are you a Mentor or Teacher?</p>
            <Link to="/mentor/login" style={{ color: "#9f7aea", fontWeight: 700, textDecoration: "none", fontSize: ".88rem" }}>🎓 Go to Mentor Portal →</Link>
          </div>
        </div>
      </div>

      {/* Right panel — visual */}
      <div style={{ width: 420, background: "linear-gradient(160deg,#0b1528,#0a1933)", borderLeft: "1px solid rgba(23,36,66,.8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 2rem", gap: "1.5rem" }}>
        {/* Floating logo */}
        <div style={{ animation: "float 4s ease-in-out infinite", position: "relative" }}>
          <div style={{ position: "absolute", inset: -16, background: "radial-gradient(circle,rgba(61,142,240,.18),transparent 70%)", borderRadius: "50%" }} />
          <img src="/skill.jpg" alt="SkillGraph AI" style={{ width: 130, height: 130, borderRadius: 24, objectFit: "cover", border: "2px solid rgba(61,142,240,.25)", position: "relative" }} />
        </div>

        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: "1.4rem", marginBottom: ".5rem" }}>Your Career Intelligence Platform</h2>
          <p style={{ color: "#3a5275", fontSize: ".84rem", lineHeight: 1.7 }}>Powered by Claude AI · TF-IDF ML · Graph algorithms</p>
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", flexDirection: "column", gap: ".7rem", width: "100%" }}>
          {[
            ["🧠", "AI Skill Analysis", "Match your profile to 40+ real roles"],
            ["🗺️", "Smart Roadmaps",    "BFS-powered learning paths"],
            ["💼", "Job Matching",       "Real internships & full-time roles"],
            ["🎓", "Mentor Portal",      "Separate mentor monitoring system"],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: "flex", gap: ".8rem", alignItems: "center", padding: ".75rem", background: "rgba(11,21,40,.6)", border: "1px solid rgba(23,36,66,.8)", borderRadius: 12 }}>
              <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{icon}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: ".84rem", marginBottom: ".1rem" }}>{title}</p>
                <p style={{ color: "#3a5275", fontSize: ".76rem" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
