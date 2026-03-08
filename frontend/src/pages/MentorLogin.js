import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { mentorAPI } from "../services/api";

export default function MentorLogin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name:"", email:"", password:"", confirmPassword:"", bio:"", college:"", company:"", designation:"", experience:0, skills:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError("Email and password required"); return; }
    setLoading(true); setError("");
    try {
      const r = await mentorAPI.login({ email: form.email, password: form.password });
      localStorage.setItem("sg_mentor_token", r.data.token);
      localStorage.setItem("sg_mentor", JSON.stringify(r.data.mentor));
      navigate("/mentor/dashboard");
    } catch (e) {
      setError(e.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { setError("Name, email, password required"); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      await mentorAPI.register({
        name: form.name, email: form.email, password: form.password,
        bio: form.bio, college: form.college, company: form.company,
        designation: form.designation, experience: Number(form.experience),
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
      });
      setSuccess("Account created! You can now log in.");
      setTab("login");
    } catch (e) {
      setError(e.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 460 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 56, height: 56, background: "linear-gradient(135deg,var(--purple),var(--blue))", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", margin: "0 auto .8rem" }}>🎓</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 900, marginBottom: ".3rem" }}>
            Mentor <span style={{ color: "var(--purple)" }}>Portal</span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: ".88rem" }}>Separate access for mentors — guide students to success</p>
        </div>

        <div className="sg-card">
          {/* Tabs */}
          <div style={{ display: "flex", gap: ".3rem", background: "var(--bg)", borderRadius: 10, padding: 4, marginBottom: "1.4rem" }}>
            {["login","register"].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                style={{ flex: 1, padding: ".5rem", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: ".84rem",
                  background: tab === t ? "linear-gradient(135deg,var(--purple),var(--blue))" : "transparent",
                  color: tab === t ? "#fff" : "var(--muted)" }}>
                {t === "login" ? "🔑 Sign In" : "✨ Register as Mentor"}
              </button>
            ))}
          </div>

          {error && <div style={{ background: "rgba(252,129,129,.1)", border: "1px solid rgba(252,129,129,.3)", borderRadius: 8, padding: ".7rem 1rem", color: "var(--red)", fontSize: ".85rem", marginBottom: "1rem" }}>⚠️ {error}</div>}
          {success && <div style={{ background: "rgba(56,226,154,.08)", border: "1px solid rgba(56,226,154,.3)", borderRadius: 8, padding: ".7rem 1rem", color: "var(--green)", fontSize: ".85rem", marginBottom: "1rem" }}>✅ {success}</div>}

          {tab === "login" ? (
            <div style={{ display: "grid", gap: ".9rem" }}>
              <div><label className="sg-label">Email</label>
                <input value={form.email} onChange={e => set("email", e.target.value)} placeholder="mentor@email.com" className="sg-input" type="email" /></div>
              <div><label className="sg-label">Password</label>
                <input value={form.password} onChange={e => set("password", e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Your password" className="sg-input" type="password" /></div>
              <button onClick={handleLogin} disabled={loading} className="sg-btn sg-btn-purple" style={{ width: "100%", justifyContent: "center", padding: "1rem", marginTop: ".3rem" }}>
                {loading ? "Signing in..." : "🎓 Sign In to Mentor Portal"}
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: ".8rem" }}>
              {[["name","Full Name","Dr. Priya Sharma"],["email","Email","mentor@gmail.com"],["password","Password","","password"],["confirmPassword","Confirm Password","","password"],
                ["company","Company / College","IIT Bombay / Google"],["designation","Designation","Senior Engineer / Professor"],].map(([k,l,ph,t])=>(
                <div key={k}><label className="sg-label">{l}</label>
                  <input value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={ph} className="sg-input" type={t||"text"}/></div>
              ))}
              <div><label className="sg-label">Experience (years)</label>
                <input value={form.experience} onChange={e=>set("experience",e.target.value)} type="number" min="0" className="sg-input"/></div>
              <div><label className="sg-label">Skills (comma separated)</label>
                <input value={form.skills} onChange={e=>set("skills",e.target.value)} placeholder="React, Node.js, Machine Learning" className="sg-input"/></div>
              <div><label className="sg-label">Bio</label>
                <textarea value={form.bio} onChange={e=>set("bio",e.target.value)} placeholder="Brief intro about yourself..." className="sg-input" style={{height:70,resize:"none"}}/></div>
              <button onClick={handleRegister} disabled={loading} className="sg-btn sg-btn-purple" style={{ width: "100%", justifyContent: "center", padding: "1rem" }}>
                {loading ? "Registering..." : "🎓 Apply as Mentor"}
              </button>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "1.2rem" }}>
          <Link to="/login" style={{ color: "var(--muted)", fontSize: ".84rem", textDecoration: "none" }}>
            ← Back to Student Login
          </Link>
        </div>
      </div>
    </div>
  );
}
