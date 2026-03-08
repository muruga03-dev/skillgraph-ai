import React, { useState, useEffect } from "react";
import { analysisAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import Sidebar from "../components/Sidebar";

const DIFF_C = { Beginner:"var(--green)", Intermediate:"var(--amber)", Advanced:"var(--red)" };

export default function Challenges() {
  const { user, updateUser } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    analysisAPI.challenges()
      .then(r => { setChallenges(r.data.challenges||[]); setBadges(r.data.badges||[]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const complete = async (ch) => {
    setCompleting(ch.id);
    try {
      const r = await analysisAPI.completeChallenge(ch.id, ch.points);
      const profile = await authAPI.profile();
      updateUser(profile.data.user);
      alert(`🎉 Challenge completed! +${ch.points} points earned!`);
    } catch (e) {
      alert(e.response?.data?.message || "Error");
    } finally { setCompleting(null); }
  };

  const done = user?.challengesCompleted || [];

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", marginLeft:"220px" }}>
      <Sidebar/>
      <div style={{ maxWidth:950, margin:"0 auto", padding:"2rem 1.5rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <h1 className="sg-section-title" style={{ marginBottom:".3rem" }}>🏆 Weekly Challenges</h1>
            <p style={{ color:"var(--muted)", fontSize:".9rem" }}>Complete challenges to earn points, badges, and climb the leaderboard.</p>
          </div>
          <div style={{ background:"rgba(246,173,85,.1)", border:"1px solid rgba(246,173,85,.3)", borderRadius:12, padding:"1rem 1.5rem", textAlign:"center" }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.8rem", fontWeight:900, color:"var(--amber)" }}>⭐ {user?.points || 0}</div>
            <div style={{ color:"var(--muted)", fontSize:".75rem" }}>Total Points</div>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="sg-card" style={{ marginBottom:"1.5rem" }}>
            <h3 style={{ fontWeight:700, marginBottom:"1rem" }}>🎖️ All Badges</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:".6rem" }}>
              {badges.map(b => {
                const earned = user?.badges?.some(ub => ub.badgeId === b.id);
                return (
                  <div key={b.id} style={{ background:"var(--bg)", border:`1px solid ${earned?"var(--amber)":"var(--border)"}`, borderRadius:10, padding:".8rem", textAlign:"center", opacity: earned ? 1 : 0.4 }}>
                    <div style={{ fontSize:"1.6rem", marginBottom:".3rem" }}>{b.icon}</div>
                    <div style={{ fontWeight:600, fontSize:".82rem", marginBottom:".2rem" }}>{b.name}</div>
                    <div style={{ color:"var(--amber)", fontSize:".75rem" }}>+{b.points}pts</div>
                    {earned && <div style={{ color:"var(--green)", fontSize:".7rem", marginTop:".2rem" }}>✓ Earned</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Challenges */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"3rem" }}><div className="spinner" style={{ margin:"0 auto 1rem" }}/></div>
        ) : (
          <div style={{ display:"grid", gap:"1rem" }}>
            {challenges.map(ch => {
              const isCompleted = done.includes(ch.id);
              return (
                <div key={ch.id} className="sg-card" style={{ borderColor: isCompleted ? "rgba(56,226,154,.3)" : "var(--border)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:".6rem", marginBottom:".5rem" }}>
                        <h3 style={{ fontWeight:700, fontSize:"1rem" }}>{ch.title}</h3>
                        <span style={{ background: DIFF_C[ch.difficulty]+"15", color: DIFF_C[ch.difficulty], border:`1px solid ${DIFF_C[ch.difficulty]}30`, borderRadius:20, padding:".15rem .6rem", fontSize:".72rem", fontWeight:600 }}>{ch.difficulty}</span>
                        {isCompleted && <span style={{ color:"var(--green)", fontSize:".8rem", fontWeight:600 }}>✓ Completed</span>}
                      </div>
                      <p style={{ color:"var(--muted)", fontSize:".85rem", marginBottom:".6rem" }}>{ch.description}</p>
                      <div style={{ display:"flex", gap:".6rem", flexWrap:"wrap", marginBottom:".6rem" }}>
                        <span className="sg-tag sg-tag-blue">🛠 {ch.skill}</span>
                        <span className="sg-tag sg-tag-amber">📅 {ch.duration_days} days</span>
                        <span className="sg-tag sg-tag-green">⭐ +{ch.points} pts</span>
                        <span className="sg-tag sg-tag-purple">🎖 {ch.badge}</span>
                      </div>
                      <button onClick={()=>setExpanded(expanded===ch.id?null:ch.id)} style={{ background:"none", border:"none", color:"var(--blue)", cursor:"pointer", fontSize:".82rem", padding:0 }}>
                        {expanded===ch.id?"▲ Hide tasks":"▼ View tasks"}
                      </button>
                      {expanded === ch.id && (
                        <div style={{ marginTop:".7rem" }}>
                          {ch.tasks?.map((t,j) => (
                            <div key={j} style={{ display:"flex", gap:".5rem", marginBottom:".35rem" }}>
                              <span style={{ color:"var(--blue)" }}>→</span>
                              <span style={{ fontSize:".85rem", color:"var(--muted)" }}>{t}</span>
                            </div>
                          ))}
                          <div style={{ marginTop:".6rem" }}>
                            <p style={{ color:"var(--muted)", fontSize:".76rem", marginBottom:".3rem" }}>Resources:</p>
                            {ch.resources?.map((r,j) => (
                              <a key={j} href={r} target="_blank" rel="noreferrer" style={{ display:"block", color:"var(--blue)", fontSize:".8rem", marginBottom:".2rem" }}>{r}</a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ minWidth:120, textAlign:"center" }}>
                      {isCompleted ? (
                        <div style={{ background:"rgba(56,226,154,.1)", border:"1px solid rgba(56,226,154,.3)", borderRadius:10, padding:"1rem", color:"var(--green)" }}>
                          <div style={{ fontSize:"1.5rem" }}>✅</div>
                          <div style={{ fontSize:".8rem", fontWeight:600 }}>Done!</div>
                        </div>
                      ) : (
                        <button onClick={()=>complete(ch)} disabled={completing===ch.id} className="sg-btn sg-btn-primary" style={{ width:"100%" }}>
                          {completing===ch.id ? "..." : "Mark Done"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
