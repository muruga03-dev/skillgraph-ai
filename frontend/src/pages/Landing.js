import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";

/* ─── Animated particle canvas background ─────────────────────────────────── */
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let w = c.width = window.innerWidth;
    let h = c.height = 700;
    const onResize = () => { w = c.width = window.innerWidth; h = c.height = 700; };
    window.addEventListener("resize", onResize);

    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
      r: Math.random() * 2 + 1,
    }));

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(61,142,240,.35)";
        ctx.fill();
      });
      // draw connecting lines
      pts.forEach((a, i) => {
        pts.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(61,142,240,${.18 * (1 - d / 120)})`;
            ctx.lineWidth = .8;
            ctx.stroke();
          }
        });
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

/* ─── Animated counter ─────────────────────────────────────────────────────── */
function Counter({ to, suffix = "", duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        setVal(Math.floor(p * to));
        if (p < 1) requestAnimationFrame(step);
        else setVal(to);
      };
      requestAnimationFrame(step);
    }, { threshold: .3 });
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─── Feature card ─────────────────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, color, delay }) {
  return (
    <div style={{
      background: "rgba(11,21,40,.8)", border: `1px solid ${color}25`,
      borderRadius: 18, padding: "1.6rem", backdropFilter: "blur(8px)",
      animation: `slideUp .6s ease forwards`, animationDelay: delay,
      opacity: 0, transition: "border-color .25s, transform .25s",
      cursor: "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color + "55"; e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = color + "25"; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: color + "15", border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: "1rem" }}>{icon}</div>
      <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1rem", marginBottom: ".4rem", color: "#e2eaf7" }}>{title}</h3>
      <p style={{ color: "#5a7196", fontSize: ".84rem", lineHeight: 1.65 }}>{desc}</p>
    </div>
  );
}

const FEATURES = [
  { icon: "🧠", color: "#3d8ef0", title: "AI Skill Analyser", desc: "Upload your resume or paste skills. TF-IDF + Cosine Similarity maps your profile to 40+ real career roles across 23 departments instantly." },
  { icon: "🗺️", color: "#9f7aea", title: "Visual Roadmaps", desc: "BFS graph traversal builds your personalised learning path. See prerequisites, timelines, and exact resources for every skill you need." },
  { icon: "💼", color: "#38e29a", title: "Job & Internship Board", desc: "Smart matching scores 12 internships and 15 full-time jobs from top companies like Google, NVIDIA, Zomato, and more against your profile." },
  { icon: "🏆", color: "#f6ad55", title: "Challenges & Badges", desc: "Daily coding challenges, project quests, and knowledge battles. Earn badges, level up, and climb the leaderboard." },
  { icon: "📅", color: "#fc8181", title: "AI Study Planner", desc: "Claude generates a week-by-week study plan tailored to your goals, free time, and current skill gaps." },
  { icon: "💡", color: "#3d8ef0", title: "Interview Simulator", desc: "5 interview rounds with 40+ real questions. Technical, DSA, HR, and system design rounds with model answers." },
  { icon: "📜", color: "#9f7aea", title: "Certificate Verifier", desc: "Upload your Udemy, Coursera, and NPTEL certificates. OCR + AI verification adds them to your profile and awards points." },
  { icon: "🎓", color: "#38e29a", title: "Mentor Portal", desc: "Separate mentor login. Mentors monitor student progress, log sessions, add notes, and track skill development over time." },
  { icon: "🤖", color: "#f6ad55", title: "AI Career Assistant", desc: "Powered by Claude. Ask anything about your career, get resume tips, compare roles, and plan your next 6 months." },
  { icon: "👥", color: "#fc8181", title: "Community Feed", desc: "Share achievements, ask questions, and post projects. Like, comment, and grow with 10K+ CS students." },
  { icon: "💬", color: "#3d8ef0", title: "Real-time Chat", desc: "Socket.io-powered chat rooms for DSA, Web Dev, AI/ML, Mobile, and more. Online presence indicators." },
  { icon: "🏢", color: "#9f7aea", title: "Departments Explorer", desc: "Explore all 40 roles across 23 departments — Engineering, AI, Security, Design, Fintech, Robotics and more — with INR salaries." },
];

const STATS = [
  { n: 40, s: "+", label: "Career Roles", color: "#3d8ef0" },
  { n: 23, s: "", label: "Departments", color: "#9f7aea" },
  { n: 200, s: "+", label: "Skills Tracked", color: "#38e29a" },
  { n: 27, s: "", label: "Total Pages", color: "#f6ad55" },
];

const STACK = [
  ["⚛️", "React.js", "#61dafb"], ["🟢", "Node.js", "#68a063"], ["🐍", "FastAPI", "#009688"],
  ["🍃", "MongoDB", "#4caf50"], ["🤖", "Claude AI", "#9f7aea"], ["📡", "Socket.io", "#3d8ef0"],
  ["🐳", "Docker", "#2496ed"], ["🧮", "TF-IDF ML", "#f6ad55"],
];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#060d1a", color: "#e2eaf7", fontFamily: "'Poppins', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        @keyframes slideUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100% { transform:translateY(0px) rotate(0deg); } 50% { transform:translateY(-12px) rotate(1deg); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes pulse { 0%,100% { opacity:.6; } 50% { opacity:1; } }
        @keyframes logoGlow { 0%,100% { filter: drop-shadow(0 0 20px rgba(61,142,240,.4)); } 50% { filter: drop-shadow(0 0 40px rgba(61,142,240,.8)); } }
        .hero-badge { background: linear-gradient(90deg,rgba(61,142,240,.15),rgba(159,122,234,.15),rgba(61,142,240,.15)); background-size:200% 100%; animation: shimmer 3s linear infinite; }
        .float-logo { animation: float 4s ease-in-out infinite, logoGlow 3s ease-in-out infinite; }
        .cta-btn { transition: all .25s; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(61,142,240,.45) !important; }
        .cta-btn-outline:hover { border-color: #3d8ef0 !important; color: #3d8ef0 !important; background: rgba(61,142,240,.06) !important; }
        .nav-link { color: #5a7196; text-decoration:none; font-size:.88rem; font-weight:600; transition:color .2s; }
        .nav-link:hover { color: #e2eaf7; }
        .stack-chip { transition: all .2s; }
        .stack-chip:hover { transform: translateY(-3px); }
        .scroll-reveal { opacity:0; transform:translateY(30px); transition: opacity .7s, transform .7s; }
        .scroll-reveal.visible { opacity:1; transform:translateY(0); }
      `}</style>

      {/* ── Sticky Nav ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 1000,
        background: scrolled ? "rgba(6,13,26,.94)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(23,36,66,.8)" : "1px solid transparent",
        padding: "0 2rem", transition: "all .35s",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
            <img src="/skill.jpg" alt="SkillGraph AI" style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover" }} />
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: "1.15rem" }}>
              Skill<span style={{ background: "linear-gradient(90deg,#3d8ef0,#9f7aea)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Graph</span>
              <span style={{ color: "#5a7196", fontWeight: 600, marginLeft: 3 }}>AI</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.8rem" }}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#stack" className="nav-link">Stack</a>
            <a href="#stats" className="nav-link">Stats</a>
            <Link to="/mentor/login" className="nav-link" style={{ color: "#9f7aea" }}>🎓 Mentors</Link>
          </div>
          <div style={{ display: "flex", gap: ".6rem" }}>
            <Link to="/login" className="cta-btn cta-btn-outline" style={{ padding: ".5rem 1.2rem", borderRadius: 10, border: "1px solid rgba(90,113,150,.5)", color: "#5a7196", textDecoration: "none", fontSize: ".85rem", fontWeight: 600, background: "transparent", display: "inline-flex", alignItems: "center" }}>
              Sign In
            </Link>
            <Link to="/signup" className="cta-btn" style={{ padding: ".5rem 1.2rem", borderRadius: 10, background: "linear-gradient(135deg,#3d8ef0,#6c63ff)", color: "#fff", textDecoration: "none", fontSize: ".85rem", fontWeight: 700, boxShadow: "0 4px 16px rgba(61,142,240,.35)", display: "inline-flex", alignItems: "center" }}>
              Get Started →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", minHeight: 700, display: "flex", alignItems: "center", overflow: "hidden", padding: "4rem 2rem" }}>
        <ParticleCanvas />
        {/* Gradient orbs */}
        <div style={{ position: "absolute", top: -100, left: -100, width: 500, height: 500, background: "radial-gradient(circle,rgba(61,142,240,.12) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: -80, right: -80, width: 400, height: 400, background: "radial-gradient(circle,rgba(159,122,234,.1) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr auto", gap: "3rem", alignItems: "center", position: "relative", zIndex: 1 }}>
          <div>
            {/* Badge */}
            <div className="hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", border: "1px solid rgba(61,142,240,.25)", borderRadius: 50, padding: ".3rem .9rem", fontSize: ".78rem", fontWeight: 600, marginBottom: "1.5rem", color: "#7eb8f7" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#38e29a", animation: "pulse 2s infinite", display: "inline-block" }} />
              IST Mini Project · React + FastAPI + MongoDB 
            </div>

            <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: "clamp(2.4rem,5vw,3.8rem)", lineHeight: 1.08, marginBottom: "1.2rem" }}>
              Your AI-Powered<br />
              <span style={{ background: "linear-gradient(135deg,#3d8ef0,#9f7aea,#38e29a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200%", animation: "shimmer 4s linear infinite" }}>
                Career Intelligence
              </span><br />
              Platform
            </h1>

            <p style={{ color: "#7a95bb", fontSize: "clamp(.95rem,2vw,1.1rem)", lineHeight: 1.75, marginBottom: "2rem", maxWidth: 540 }}>
              Upload your resume → get matched to <strong style={{ color: "#e2eaf7" }}>40+ real-world roles</strong> across <strong style={{ color: "#e2eaf7" }}>23 departments</strong>. 
              TF-IDF ML, graph-based roadmaps, live job matching, and a built-in mentor portal — all in one platform.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
              <Link to="/signup" className="cta-btn" style={{ padding: ".85rem 2rem", borderRadius: 14, background: "linear-gradient(135deg,#3d8ef0,#6c63ff)", color: "#fff", textDecoration: "none", fontSize: "1rem", fontWeight: 700, boxShadow: "0 6px 24px rgba(61,142,240,.4)", display: "inline-flex", alignItems: "center", gap: ".5rem" }}>
                🚀 Get Started Free
              </Link>
              <Link to="/login" className="cta-btn cta-btn-outline" style={{ padding: ".85rem 2rem", borderRadius: 14, border: "1px solid rgba(90,113,150,.4)", color: "#7a95bb", textDecoration: "none", fontSize: "1rem", fontWeight: 600, background: "transparent", display: "inline-flex", alignItems: "center", gap: ".5rem" }}>
                Sign In →
              </Link>
              <Link to="/mentor/login" className="cta-btn" style={{ padding: ".85rem 2rem", borderRadius: 14, background: "linear-gradient(135deg,#9f7aea,#6c63ff)", color: "#fff", textDecoration: "none", fontSize: "1rem", fontWeight: 700, boxShadow: "0 6px 24px rgba(159,122,234,.35)", display: "inline-flex", alignItems: "center", gap: ".5rem" }}>
                🎓 Mentor Portal
              </Link>
            </div>

            {/* Social proof */}
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              {[["✅","OAuth Ready","Google & LinkedIn"], ["🔒","JWT Auth","7-day tokens"], ["🧠","TF-IDF ML","Real-world dataset"]].map(([i,t,s]) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
                  <span>{i}</span>
                  <div>
                    <p style={{ fontSize: ".78rem", fontWeight: 700, color: "#c8d8ef" }}>{t}</p>
                    <p style={{ fontSize: ".72rem", color: "#4a6280" }}>{s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logo */}
          <div className="float-logo" style={{ flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", inset: -20, background: "radial-gradient(circle,rgba(61,142,240,.15),transparent 70%)", borderRadius: "50%", animation: "pulse 3s ease-in-out infinite" }} />
              <img src="/skill.jpg" alt="SkillGraph AI" style={{ width: 220, height: 220, borderRadius: 28, objectFit: "cover", border: "1px solid rgba(61,142,240,.2)", position: "relative" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section id="stats" style={{ padding: "3rem 2rem", borderTop: "1px solid rgba(23,36,66,.8)", borderBottom: "1px solid rgba(23,36,66,.8)", background: "rgba(11,21,40,.5)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "2rem", textAlign: "center" }}>
          {STATS.map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: "2.8rem", color: s.color, lineHeight: 1 }}>
                <Counter to={s.n} suffix={s.s} />
              </div>
              <div style={{ color: "#5a7196", fontSize: ".82rem", marginTop: ".4rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── OAuth section ──────────────────────────────────────────────────── */}
   <section style={{ padding: "3.5rem 2rem", background: "linear-gradient(135deg,rgba(61,142,240,.04),rgba(159,122,234,.04))" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.6rem", marginBottom: ".6rem" }}>One-Click Sign Up</h2>
          <p style={{ color: "#5a7196", fontSize: ".9rem", marginBottom: "1.8rem" }}>Create your account using your existing Google or LinkedIn account.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href={authAPI.googleURL()} className="cta-btn" style={{ padding: ".75rem 2rem", borderRadius: 12, background: "#fff", color: "#333", textDecoration: "none", fontSize: ".9rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: ".6rem", boxShadow: "0 4px 16px rgba(0,0,0,.3)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </a>
            <a href={authAPI.linkedinURL()} className="cta-btn" style={{ padding: ".75rem 2rem", borderRadius: 12, background: "#0077B5", color: "#fff", textDecoration: "none", fontSize: ".9rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: ".6rem", boxShadow: "0 4px 16px rgba(0,119,181,.4)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              Continue with LinkedIn
            </a>
          </div>
          <p style={{ color: "#3a5070", fontSize: ".78rem", marginTop: "1rem" }}>
            Or <Link to="/signup" style={{ color: "#3d8ef0", textDecoration: "none" }}>sign up with email</Link> · Takes 30 seconds
          </p>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: "5rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ color: "#3d8ef0", fontSize: ".78rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>Platform Features</span>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem,3.5vw,2.6rem)", marginTop: ".5rem", marginBottom: ".7rem" }}>
              Everything a CS student needs
            </h2>
            <p style={{ color: "#5a7196", maxWidth: 500, margin: "0 auto", fontSize: ".95rem", lineHeight: 1.7 }}>
              12 AI-powered modules working together to guide your career from campus to company.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1rem" }}>
            {FEATURES.map((f, i) => <FeatureCard key={f.title} {...f} delay={`${i * .05}s`} />)}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ─────────────────────────────────────────────────────── */}
      <section id="stack" style={{ padding: "4rem 2rem", background: "rgba(11,21,40,.6)", borderTop: "1px solid rgba(23,36,66,.8)", borderBottom: "1px solid rgba(23,36,66,.8)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: "1.8rem", marginBottom: ".6rem" }}>Built on Modern Stack</h2>
          <p style={{ color: "#5a7196", marginBottom: "2rem", fontSize: ".9rem" }}>Industry-standard technologies you'll actually use in your career</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
            {STACK.map(([icon, name, color]) => (
              <div key={name} className="stack-chip" style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: ".6rem 1.2rem", background: "rgba(11,21,40,.9)", border: `1px solid ${color}30`, borderRadius: 50, cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color + "70"; e.currentTarget.style.background = color + "10"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = color + "30"; e.currentTarget.style.background = "rgba(11,21,40,.9)"; }}>
                <span style={{ fontSize: "1.1rem" }}>{icon}</span>
                <span style={{ fontWeight: 700, fontSize: ".85rem", color }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Departments teaser ─────────────────────────────────────────────── */}
      <section style={{ padding: "4rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
            <div>
              <span style={{ color: "#9f7aea", fontSize: ".78rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>ML-Powered</span>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: "2rem", margin: ".5rem 0 1rem" }}>
                40 Roles Across<br /><span style={{ color: "#9f7aea" }}>23 Departments</span>
              </h2>
              <p style={{ color: "#5a7196", lineHeight: 1.75, marginBottom: "1.5rem" }}>
                Our dataset covers every major CS career path — from Engineering and AI & Data to Security, Fintech, Robotics, Gaming, and Embedded & IoT. 
                Each role comes with real salary data (USD + INR), demand levels, and a verified skills roadmap.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem", marginBottom: "1.5rem" }}>
                {["Engineering","AI & Data","Security","Cloud","Design","Fintech","Robotics","Web3","Gaming","Embedded & IoT"].map(d => (
                  <span key={d} style={{ padding: ".22rem .65rem", background: "rgba(159,122,234,.08)", border: "1px solid rgba(159,122,234,.25)", borderRadius: 50, fontSize: ".76rem", color: "#9f7aea", fontWeight: 600 }}>{d}</span>
                ))}
                <span style={{ padding: ".22rem .65rem", background: "rgba(90,113,150,.08)", border: "1px solid rgba(90,113,150,.25)", borderRadius: 50, fontSize: ".76rem", color: "#5a7196" }}>+13 more</span>
              </div>
              <Link to="/signup" className="cta-btn" style={{ padding: ".75rem 1.8rem", borderRadius: 12, background: "linear-gradient(135deg,#9f7aea,#6c63ff)", color: "#fff", textDecoration: "none", fontSize: ".9rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: ".5rem", boxShadow: "0 6px 20px rgba(159,122,234,.35)" }}>
                Explore Departments →
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".7rem" }}>
              {[
                ["🏢","Engineering","4 roles","#3d8ef0"],
                ["🧠","AI & Data","6 roles","#9f7aea"],
                ["☁️","Cloud","3 roles","#38e29a"],
                ["🔒","Security","2 roles","#fc8181"],
                ["📱","Mobile","3 roles","#f6ad55"],
                ["🎨","Design","1 role","#9f7aea"],
                ["🤖","Robotics","1 role","#38e29a"],
                ["💰","Fintech","1 role","#f6ad55"],
              ].map(([icon,name,count,color]) => (
                <div key={name} style={{ background: `${color}08`, border: `1px solid ${color}20`, borderRadius: 12, padding: ".75rem 1rem", display: "flex", alignItems: "center", gap: ".6rem" }}>
                  <span style={{ fontSize: "1.3rem" }}>{icon}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: ".85rem" }}>{name}</p>
                    <p style={{ color: "#5a7196", fontSize: ".74rem" }}>{count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "5rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, background: "radial-gradient(ellipse,rgba(61,142,240,.08) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <img src="/skill.jpg" alt="SkillGraph AI" style={{ width: 80, height: 80, borderRadius: 20, objectFit: "cover", marginBottom: "1.5rem", border: "2px solid rgba(61,142,240,.3)" }} />
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem,4vw,2.8rem)", marginBottom: "1rem", lineHeight: 1.15 }}>
            Start your AI-powered<br />career journey today
          </h2>
          <p style={{ color: "#5a7196", marginBottom: "2rem", fontSize: ".95rem" }}>Free forever for students. No credit card needed.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/signup" className="cta-btn" style={{ padding: "1rem 2.5rem", borderRadius: 14, background: "linear-gradient(135deg,#3d8ef0,#6c63ff)", color: "#fff", textDecoration: "none", fontSize: "1rem", fontWeight: 700, boxShadow: "0 8px 28px rgba(61,142,240,.45)", display: "inline-flex", alignItems: "center", gap: ".5rem" }}>
              🚀 Create Free Account
            </Link>
            <Link to="/mentor/login" className="cta-btn" style={{ padding: "1rem 2.5rem", borderRadius: 14, background: "linear-gradient(135deg,rgba(159,122,234,.15),rgba(61,142,240,.1))", color: "#9f7aea", border: "1px solid rgba(159,122,234,.3)", textDecoration: "none", fontSize: "1rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: ".5rem" }}>
              🎓 Mentor Portal
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(23,36,66,.8)", padding: "2rem", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem", marginBottom: ".6rem" }}>
          <img src="/skill.jpg" alt="SkillGraph AI" style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover" }} />
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: ".9rem" }}>SkillGraph <span style={{ color: "#3d8ef0" }}>AI</span></span>
        </div>
        <p style={{ color: "#2a3d58", fontSize: ".78rem" }}>
          Built with ⚡ React · FastAPI · MongoDB · Socket.io  &nbsp;·&nbsp; IST Mini Project 2025
        </p>
      </footer>
    </div>
  );
}
