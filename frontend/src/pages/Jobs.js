import React, { useState, useEffect } from "react";
import { analysisAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

export default function Jobs() {
  const { user } = useAuth();
  const [tab, setTab] = useState("internships");
  const [data, setData] = useState({ internships:[], jobs:[] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const skills = user?.skills?.length ? user.skills : ["JavaScript","Python","React"];
    analysisAPI.matchJobs(skills)
      .then(r => setData({ internships: r.data.internships||[], jobs: r.data.jobs||[] }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const list = (tab === "internships" ? data.internships : data.jobs)
    .filter(j => !filter || j.role?.toLowerCase().includes(filter.toLowerCase()) || j.skills_required?.some(s=>s.toLowerCase().includes(filter.toLowerCase())));

  const matchColor = m => m>=70 ? "var(--green)" : m>=40 ? "var(--amber)" : "var(--muted)";

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", marginLeft:"220px" }}>
      <Sidebar/>
      <div style={{ maxWidth:1000, margin:"0 auto", padding:"2rem 1.5rem" }}>
        <h1 className="sg-section-title" style={{ marginBottom:".4rem" }}>🏢 Jobs & Internships</h1>
        <p style={{ color:"var(--muted)", marginBottom:"1.5rem", fontSize:".9rem" }}>AI-matched opportunities based on your current skills. Update your skills in Analysis for better matches.</p>

        <div style={{ display:"flex", gap:".5rem", marginBottom:"1.2rem", flexWrap:"wrap" }}>
          <div style={{ display:"flex", background:"var(--bg3)", borderRadius:10, padding:3, gap:3, border:"1px solid var(--border)" }}>
            {["internships","jobs"].map(t => (
              <button key={t} onClick={()=>setTab(t)} style={{ padding:".45rem 1.1rem", borderRadius:8, border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600, fontSize:".85rem", transition:"all .2s",
                background: tab===t ? "linear-gradient(135deg,var(--blue),#6c63ff)" : "transparent",
                color: tab===t ? "#fff" : "var(--muted)"
              }}>{t === "internships" ? "🎓 Internships" : "💼 Full-Time Jobs"}</button>
            ))}
          </div>
          <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter by role or skill..." className="sg-input" style={{ flex:1, minWidth:200 }}/>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"3rem" }}><div className="spinner" style={{ margin:"0 auto 1rem" }}/><p style={{ color:"var(--muted)" }}>Finding matches...</p></div>
        ) : (
          <div style={{ display:"grid", gap:"1rem" }}>
            {list.length === 0 && <div className="sg-card" style={{ textAlign:"center", padding:"2rem", color:"var(--muted)" }}>No matches found. Try different filters or add more skills.</div>}
            {list.map((j,i) => (
              <div key={i} className="sg-card" style={{ transition:"all .2s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="var(--blue)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:".6rem", marginBottom:".5rem" }}>
                      <span style={{ fontSize:"1.5rem" }}>{j.logo || "🏢"}</span>
                      <div>
                        <h3 style={{ fontWeight:700, fontSize:"1rem" }}>{j.role}</h3>
                        <p style={{ color:"var(--blue)", fontSize:".85rem" }}>{j.company}</p>
                      </div>
                    </div>
                    <p style={{ color:"var(--muted)", fontSize:".82rem", marginBottom:".6rem" }}>{j.description}</p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:".4rem", marginBottom:".6rem" }}>
                      <span className="sg-tag" style={{ fontSize:".74rem" }}>📍 {j.location}</span>
                      {"duration" in j && <span className="sg-tag" style={{ fontSize:".74rem" }}>⏱ {j.duration}</span>}
                      <span className="sg-tag sg-tag-green" style={{ fontSize:".74rem" }}>💰 {j.stipend || j.salary}</span>
                      {"experience" in j && <span className="sg-tag" style={{ fontSize:".74rem" }}>{j.experience}</span>}
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:".3rem" }}>
                      {j.skills_required?.slice(0,6).map(s => <span key={s} className="sg-tag" style={{ fontSize:".72rem" }}>{s}</span>)}
                    </div>
                  </div>
                  <div style={{ textAlign:"center", minWidth:120 }}>
                    {j.match !== undefined && (
                      <div style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:12, padding:".8rem", marginBottom:".6rem" }}>
                        <div style={{ fontSize:"1.5rem", fontWeight:900, color:matchColor(j.match), fontFamily:"'Syne',sans-serif" }}>{j.match}%</div>
                        <div style={{ color:"var(--muted)", fontSize:".72rem" }}>match</div>
                      </div>
                    )}
                    {j.apply_by && <div style={{ color:"var(--amber)", fontSize:".72rem", marginBottom:".5rem" }}>Apply by: {new Date(j.apply_by).toLocaleDateString()}</div>}
                    <a href={j.url} target="_blank" rel="noreferrer">
                      <button className="sg-btn sg-btn-primary sg-btn-sm" style={{ width:"100%" }}>Apply →</button>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {user?.skills?.length === 0 && (
          <div className="sg-card" style={{ marginTop:"1.5rem", textAlign:"center", borderColor:"rgba(246,173,85,.3)" }}>
            <p style={{ color:"var(--amber)", marginBottom:".5rem" }}>💡 Tip: Run a Skill Analysis first to get personalized job matches!</p>
          </div>
        )}
      </div>
    </div>
  );
}
