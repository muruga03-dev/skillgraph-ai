import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { analysisAPI } from "../services/api";
import Sidebar from "../components/Sidebar";

const ROLES = ["Full Stack Developer","Data Scientist","Machine Learning Engineer","DevOps Engineer","Mobile Developer","Backend Developer","Frontend Developer","Cloud Architect","Cybersecurity Engineer"];

export default function Roadmap() {
  const location = useLocation();
  const nav = useNavigate();
  const [role, setRole] = useState(location.state?.role || "Full Stack Developer");
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activePhase, setActivePhase] = useState(0);

  const load = async (r) => {
    setLoading(true);
    try {
      const res = await analysisAPI.roadmap(r);
      setRoadmap(res.data.roadmap);
    } catch { setRoadmap(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(role); }, [role]);

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", marginLeft:"220px" }}>
      <Sidebar/>
      <div style={{ maxWidth:950, margin:"0 auto", padding:"2rem 1.5rem" }}>
        <h1 className="sg-section-title" style={{ marginBottom:".4rem" }}>🗺️ Career Roadmap</h1>
        <p style={{ color:"var(--muted)", marginBottom:"1.5rem", fontSize:".9rem" }}>Step-by-step guide with courses, tools, and timeline for each career path.</p>

        {/* Role selector */}
        <div style={{ display:"flex", gap:".4rem", flexWrap:"wrap", marginBottom:"1.5rem" }}>
          {ROLES.map(r => (
            <button key={r} onClick={()=>setRole(r)} style={{ padding:".4rem .9rem", borderRadius:20, border:"none", cursor:"pointer", fontSize:".8rem", fontWeight:600, fontFamily:"inherit", transition:"all .2s",
              background: role===r ? "linear-gradient(135deg,var(--blue),#6c63ff)" : "var(--bg3)",
              color: role===r ? "#fff" : "var(--muted)",
              border: role===r ? "none" : "1px solid var(--border)"
            }}>{r}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"4rem", color:"var(--muted)" }}><div className="spinner" style={{ margin:"0 auto 1rem" }}/><p>Loading roadmap...</p></div>
        ) : roadmap ? (
          <>
            {/* Overview */}
            <div className="sg-card" style={{ marginBottom:"1.5rem", borderColor:"rgba(61,142,240,.3)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
                <div>
                  <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:"var(--blue)", marginBottom:".5rem" }}>{role}</h2>
                  <p style={{ color:"var(--muted)", maxWidth:550, lineHeight:1.6, fontSize:".88rem" }}>{roadmap.overview}</p>
                </div>
                <div style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:12, padding:"1rem 1.5rem", textAlign:"center" }}>
                  <div style={{ fontSize:"1.4rem", fontWeight:900, color:"var(--green)", fontFamily:"'Syne',sans-serif" }}>{roadmap.timeline}</div>
                  <div style={{ color:"var(--muted)", fontSize:".75rem" }}>to be job-ready</div>
                </div>
              </div>
            </div>

            {/* Phase tabs */}
            <div style={{ display:"flex", gap:".4rem", flexWrap:"wrap", marginBottom:"1.2rem" }}>
              {roadmap.phases?.map((ph,i) => (
                <button key={i} onClick={()=>setActivePhase(i)} style={{ padding:".45rem .9rem", borderRadius:20, border:"none", cursor:"pointer", fontSize:".8rem", fontFamily:"inherit", fontWeight:600, transition:"all .2s",
                  background: activePhase===i ? "linear-gradient(135deg,var(--purple),#6c63ff)" : "var(--bg3)",
                  color: activePhase===i ? "#fff" : "var(--muted)",
                  border: activePhase===i ? "none" : "1px solid var(--border)"
                }}>{ph.month}</button>
              ))}
            </div>

            {/* Active Phase Detail */}
            {roadmap.phases?.[activePhase] && (() => {
              const ph = roadmap.phases[activePhase];
              return (
                <div className="fade-up">
                  <div className="sg-card" style={{ marginBottom:"1rem", borderColor:"rgba(159,122,234,.3)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.2rem", flexWrap:"wrap", gap:"1rem" }}>
                      <div>
                        <span style={{ color:"var(--purple)", fontWeight:700, fontSize:".8rem" }}>{ph.month}</span>
                        <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.3rem" }}>{ph.title}</h3>
                      </div>
                      <div style={{ background:"rgba(56,226,154,.1)", border:"1px solid rgba(56,226,154,.3)", borderRadius:8, padding:".4rem .9rem", color:"var(--green)", fontSize:".82rem", fontWeight:600 }}>
                        🎯 {ph.milestone}
                      </div>
                    </div>

                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                      {/* Skills */}
                      <div>
                        <p style={{ color:"var(--muted)", fontSize:".78rem", marginBottom:".5rem", fontWeight:600 }}>SKILLS TO LEARN</p>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:".3rem" }}>
                          {ph.skills?.map(s => <span key={s} className="sg-tag sg-tag-blue">{s}</span>)}
                        </div>
                      </div>
                      {/* Tasks */}
                      <div>
                        <p style={{ color:"var(--muted)", fontSize:".78rem", marginBottom:".5rem", fontWeight:600 }}>TASKS & PROJECTS</p>
                        {ph.tasks?.map((t,j) => (
                          <div key={j} style={{ display:"flex", alignItems:"flex-start", gap:".5rem", marginBottom:".4rem" }}>
                            <span style={{ color:"var(--green)", marginTop:2 }}>✓</span>
                            <span style={{ fontSize:".85rem", color:"var(--muted)" }}>{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Courses */}
                  <div className="sg-card">
                    <h4 style={{ fontWeight:700, marginBottom:"1rem" }}>📚 Recommended Courses & Resources</h4>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:".7rem" }}>
                      {ph.courses?.map((c,j) => (
                        <a key={j} href={c.url} target="_blank" rel="noreferrer" style={{ textDecoration:"none", display:"block", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:12, padding:"1rem", transition:"all .2s" }}
                          onMouseEnter={e=>e.currentTarget.style.borderColor="var(--blue)"}
                          onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:".4rem" }}>
                            <span style={{ color:"var(--muted)", fontSize:".72rem", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:6, padding:".1rem .5rem" }}>{c.platform}</span>
                            <span style={{ fontSize:".72rem", color: c.free ? "var(--green)" : "var(--amber)", fontWeight:600 }}>{c.free ? "FREE" : "PAID"}</span>
                          </div>
                          <div style={{ fontWeight:600, fontSize:".88rem", color:"var(--text)", lineHeight:1.4, marginBottom:".3rem" }}>{c.title}</div>
                          {c.duration && <div style={{ color:"var(--muted)", fontSize:".75rem" }}>⏱ {c.duration}</div>}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Progress nav */}
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:"1.5rem" }}>
              <button onClick={()=>setActivePhase(p=>Math.max(0,p-1))} disabled={activePhase===0} className="sg-btn sg-btn-outline">← Previous</button>
              <span style={{ color:"var(--muted)", fontSize:".85rem", alignSelf:"center" }}>Phase {activePhase+1} of {roadmap.phases?.length}</span>
              <button onClick={()=>setActivePhase(p=>Math.min((roadmap.phases?.length||1)-1,p+1))} disabled={activePhase>=(roadmap.phases?.length||1)-1} className="sg-btn sg-btn-primary">Next →</button>
            </div>
          </>
        ) : (
          <div className="sg-card" style={{ textAlign:"center", padding:"3rem" }}>
            <p style={{ color:"var(--muted)" }}>Roadmap not available. Start the ML service to load roadmaps.</p>
          </div>
        )}
      </div>
    </div>
  );
}
