import React, { useState, useEffect } from "react";
import { communityAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

const SKILLS_FILTER = ["All","React","Python","Machine Learning","Node.js","AWS","DSA","System Design","Flutter","Docker"];

export default function Mentors() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState("All");
  const [requested, setRequested] = useState({});

  useEffect(() => {
    communityAPI.mentors({ skill: skillFilter !== "All" ? skillFilter : undefined })
      .then(r => setMentors(r.data.mentors || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [skillFilter]);

  const request = (id) => {
    setRequested(p => ({ ...p, [id]: true }));
    alert("✅ Mentorship request sent! The mentor will contact you via chat.");
  };

  const matchScore = (mentor) => {
    if (!user?.skills?.length) return 0;
    const mSkills = mentor.skills?.map(s => s.toLowerCase()) || [];
    const uSkills = user.skills.map(s => s.toLowerCase());
    const matched = uSkills.filter(s => mSkills.includes(s)).length;
    return Math.round((matched / Math.max(mSkills.length, 1)) * 100);
  };

  const LEVEL_C = { Expert:"var(--amber)", Advanced:"var(--blue)", Intermediate:"var(--green)" };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", marginLeft:"220px" }}>
      <Sidebar/>
      <div style={{ maxWidth:1000, margin:"0 auto", padding:"2rem 1.5rem" }}>
        <h1 className="sg-section-title" style={{ marginBottom:".4rem" }}>🎓 Mentor Matching</h1>
        <p style={{ color:"var(--muted)", marginBottom:"1.5rem", fontSize:".9rem" }}>
          Connect with senior students and professionals who will guide your learning journey. Matched by your skills.
        </p>

        {/* Filter */}
        <div style={{ display:"flex", gap:".4rem", flexWrap:"wrap", marginBottom:"1.5rem" }}>
          {SKILLS_FILTER.map(s => (
            <button key={s} onClick={() => setSkillFilter(s)} style={{ padding:".35rem .8rem", borderRadius:20, border:"none", cursor:"pointer", fontSize:".8rem", fontFamily:"inherit", fontWeight:500, transition:"all .2s",
              background: skillFilter===s ? "linear-gradient(135deg,var(--blue),var(--purple))" : "var(--bg3)",
              color: skillFilter===s ? "#fff" : "var(--muted)",
              border: skillFilter===s ? "none" : "1px solid var(--border)" }}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"3rem" }}><div className="spinner" style={{ margin:"0 auto 1rem" }}/></div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1rem" }}>
            {mentors.map((m, i) => {
              const score = matchScore(m);
              return (
                <div key={m._id || i} className="sg-card" style={{ transition:"all .25s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--blue)";e.currentTarget.style.transform="translateY(-2px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="translateY(0)";}}>
                  <div style={{ display:"flex", alignItems:"center", gap:".8rem", marginBottom:"1rem" }}>
                    <div className="sg-avatar" style={{ width:48, height:48, fontSize:"1.2rem" }}>{m.name?.[0]}</div>
                    <div>
                      <p style={{ fontWeight:700, fontSize:".95rem" }}>{m.name}</p>
                      <p style={{ color:"var(--muted)", fontSize:".78rem" }}>{m.college}</p>
                      {m.level && <span style={{ color:LEVEL_C[m.level]||"var(--muted)", fontSize:".74rem", fontWeight:600 }}>✦ {m.level}</span>}
                    </div>
                  </div>

                  {m.bio && <p style={{ color:"var(--muted)", fontSize:".83rem", marginBottom:".8rem", lineHeight:1.6 }}>{m.bio}</p>}

                  <div style={{ display:"flex", flexWrap:"wrap", gap:".3rem", marginBottom:".8rem" }}>
                    {m.skills?.slice(0,5).map(s => <span key={s} className="sg-tag sg-tag-blue" style={{ fontSize:".74rem" }}>{s}</span>)}
                  </div>

                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".8rem" }}>
                    <span style={{ color:"var(--amber)", fontSize:".8rem" }}>⭐ {m.points?.toLocaleString()} pts</span>
                    {score > 0 && (
                      <span style={{ background:"rgba(56,226,154,.1)", border:"1px solid rgba(56,226,154,.3)", borderRadius:6, padding:".15rem .6rem", color:"var(--green)", fontSize:".75rem", fontWeight:600 }}>
                        {score}% match
                      </span>
                    )}
                  </div>

                  <button onClick={() => request(m._id || String(i))} disabled={requested[m._id || String(i)]} className={`sg-btn ${requested[m._id||String(i)]?"sg-btn-outline":"sg-btn-primary"}`} style={{ width:"100%", justifyContent:"center" }}>
                    {requested[m._id||String(i)] ? "✓ Requested" : "Request Mentorship"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Become a mentor CTA */}
        <div style={{ marginTop:"2rem", background:"linear-gradient(135deg,rgba(61,142,240,.1),rgba(159,122,234,.1))", border:"1px solid rgba(61,142,240,.2)", borderRadius:16, padding:"1.5rem", textAlign:"center" }}>
          <h3 style={{ fontWeight:700, marginBottom:".4rem" }}>🤝 Become a Mentor</h3>
          <p style={{ color:"var(--muted)", fontSize:".88rem", marginBottom:"1rem" }}>Help junior students navigate their career. Share knowledge and earn recognition as a community mentor.</p>
          <button className="sg-btn sg-btn-primary" onClick={() => alert("Mentor applications opening soon! We'll notify you.")}>Apply to Mentor</button>
        </div>
      </div>
    </div>
  );
}
