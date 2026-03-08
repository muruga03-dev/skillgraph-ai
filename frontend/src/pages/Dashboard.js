import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { analysisAPI, communityAPI } from "../services/api";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [trends, setTrends] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    analysisAPI.trends().then(r => setTrends(r.data.data)).catch(() => {});
    analysisAPI.history().then(r => setHistory(r.data.history || [])).catch(() => {});
  }, []);

  const ACTIONS = [
    { icon:"🔍", label:"Skill Analysis",  sub:"Input skills or upload resume",     path:"/analysis",   color:"var(--blue)" },
    { icon:"🗺️", label:"Career Roadmap",  sub:"Step-by-step career guide",         path:"/roadmap",    color:"var(--purple)" },
    { icon:"📅", label:"Study Plan",       sub:"Generate weekly schedule",          path:"/study-plan", color:"var(--green)" },
    { icon:"💼", label:"Interview Prep",  sub:"Practice 5 interview rounds",       path:"/interview",  color:"var(--amber)" },
    { icon:"🤖", label:"AI Assistant",    sub:"Chat with career AI",               path:"/assistant",  color:"var(--blue)" },
    { icon:"👥", label:"Community",       sub:"Connect with students",             path:"/community",  color:"var(--purple)" },
    { icon:"🏢", label:"Jobs & Internships",sub:"AI-matched opportunities",        path:"/jobs",       color:"var(--green)" },
    { icon:"🏆", label:"Challenges",      sub:"Gamified learning challenges",      path:"/challenges", color:"var(--amber)" },
    { icon:"📜", label:"Certificates",    sub:"Upload & verify certificates",      path:"/certificates",color:"var(--blue)" },
    { icon:"📊", label:"Leaderboard",     sub:"Rank among your peers",             path:"/leaderboard",color:"var(--purple)" },
    { icon:"🎯", label:"Events",          sub:"Virtual career events",             path:"/events",     color:"var(--green)" },
    { icon:"🎓", label:"Mentors",         sub:"Get matched with mentors",          path:"/mentors",    color:"var(--amber)" },
  ];

  const STATS = [
    { icon:"🔍", label:"Analyses", value: user?.analysisCount || history.length, color:"var(--blue)" },
    { icon:"⚡", label:"Skills",   value: user?.skills?.length || 0,             color:"var(--purple)" },
    { icon:"⭐", label:"Points",   value: user?.points || 0,                     color:"var(--green)" },
    { icon:"🔥", label:"Streak",   value: `${user?.streak || 0}d`,              color:"var(--amber)" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", marginLeft:"220px" }}>
      <Sidebar/>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"2rem 1.5rem" }}>

        {/* Welcome */}
        <div style={{ marginBottom:"2rem" }}>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.8rem", marginBottom:".3rem" }}>
            Welcome back, <span style={{ color:"var(--blue)" }}>{user?.name?.split(" ")[0]}</span> 👋
          </h1>
          <p style={{ color:"var(--muted)", fontSize:".88rem" }}>
            {user?.level} · {user?.college || "Student"} · {user?.skills?.length || 0} skills
          </p>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"1rem", marginBottom:"2rem" }}>
          {STATS.map(s => (
            <div key={s.label} className="sg-card" style={{ textAlign:"center" }}>
              <div style={{ fontSize:"1.5rem", marginBottom:".4rem" }}>{s.icon}</div>
              <div style={{ fontSize:"2rem", fontWeight:900, color:s.color, fontFamily:"'Syne',sans-serif" }}>{s.value}</div>
              <div style={{ color:"var(--muted)", fontSize:".78rem" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="sg-card" style={{ marginBottom:"2rem" }}>
          <h2 style={{ fontWeight:700, fontSize:"1rem", marginBottom:"1.2rem", color:"var(--muted)", letterSpacing:".05em" }}>QUICK ACTIONS</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:".7rem" }}>
            {ACTIONS.map(a => (
              <button key={a.path} onClick={() => nav(a.path)} style={{ background:"var(--bg)", border:`1px solid ${a.color}20`, borderRadius:12, padding:"1rem", cursor:"pointer", textAlign:"left", transition:"all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.transform="translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = a.color+"20"; e.currentTarget.style.transform="translateY(0)"; }}>
                <div style={{ fontSize:"1.3rem", marginBottom:".5rem" }}>{a.icon}</div>
                <div style={{ fontWeight:700, fontSize:".88rem", marginBottom:".2rem" }}>{a.label}</div>
                <div style={{ color:"var(--muted)", fontSize:".74rem" }}>{a.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Two-col: History + Trends */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem" }}>

          {/* History */}
          <div className="sg-card">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
              <h2 style={{ fontWeight:700 }}>📋 Recent Analyses</h2>
              <button onClick={() => nav("/analysis")} className="sg-btn sg-btn-outline sg-btn-sm">+ New</button>
            </div>
            {history.length === 0 ? (
              <div style={{ textAlign:"center", padding:"2rem 0" }}>
                <div style={{ fontSize:"2.5rem", marginBottom:".5rem" }}>🔍</div>
                <p style={{ color:"var(--muted)", fontSize:".85rem", marginBottom:"1rem" }}>No analyses yet</p>
                <button onClick={() => nav("/analysis")} className="sg-btn sg-btn-primary sg-btn-sm">Run First Analysis</button>
              </div>
            ) : history.slice(0,6).map((h,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:".6rem 0", borderBottom: i<5 ? "1px solid var(--border)" : "none" }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:".88rem" }}>{h.topMatch?.job_role || "Analysis"}</div>
                  <div style={{ color:"var(--muted)", fontSize:".74rem" }}>{h.inputMethod} · {new Date(h.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:800, color:"var(--green)" }}>{h.topMatch?.match_percentage?.toFixed(0)}%</div>
                  <div style={{ fontSize:".7rem", color:"var(--muted)" }}>match</div>
                </div>
              </div>
            ))}
          </div>

          {/* Trends */}
          <div className="sg-card">
            <h2 style={{ fontWeight:700, marginBottom:"1rem" }}>📈 Career Trends 2025</h2>
            {trends ? (
              <>
                {trends.trending_roles?.slice(0,5).map((r,i) => (
                  <div key={i} style={{ marginBottom:".8rem" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".25rem" }}>
                      <span style={{ fontSize:".85rem", fontWeight:500 }}>{r.role}</span>
                      <span style={{ fontSize:".78rem", color:"var(--green)", fontWeight:600 }}>{r.demand}%</span>
                    </div>
                    <div className="sg-progress"><div className="sg-bar" style={{ width:`${r.demand}%` }}/></div>
                    <div style={{ fontSize:".72rem", color:"var(--muted)", marginTop:".15rem" }}>{r.growth} · {r.avg_salary}</div>
                  </div>
                ))}
                <div style={{ borderTop:"1px solid var(--border)", paddingTop:".8rem", marginTop:".8rem" }}>
                  <p style={{ color:"var(--muted)", fontSize:".75rem", marginBottom:".4rem" }}>🔥 Hot skills:</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:".3rem" }}>
                    {trends.trending_skills?.slice(0,6).map(s => <span key={s} className="sg-tag sg-tag-blue">{s}</span>)}
                  </div>
                </div>
              </>
            ) : <p style={{ color:"var(--muted)" }}>Loading trends...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
