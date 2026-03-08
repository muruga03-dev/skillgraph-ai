import React, { useState } from "react";
import { analysisAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

const QUICK = ["JavaScript","Python","React","Node.js","Machine Learning","Docker","AWS","SQL","TypeScript","DSA","System Design","TensorFlow","Kubernetes","MongoDB","Git"];
const DIFF_C = { Beginner: "var(--green)", Intermediate: "var(--amber)", Advanced: "var(--red)" };

export default function StudyPlan() {
  const { user } = useAuth();
  const [skills, setSkills] = useState(user?.skills || []);
  const [input, setInput] = useState("");
  const [hpd, setHpd] = useState(2);
  const [dpw, setDpw] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeWeek, setActiveWeek] = useState(0);
  const [tab, setTab] = useState("plan"); // plan | path | courses

  const add = (s) => {
    const sk = s.trim();
    if (sk && !skills.map(x => x.toLowerCase()).includes(sk.toLowerCase())) setSkills([...skills, sk]);
    setInput("");
  };

  const generate = async () => {
    if (!skills.length) { setError("Add at least one skill to learn"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await analysisAPI.studyPlan(skills, hpd, dpw);
      setResult(r.data.data);
      setActiveWeek(0);
    } catch (e) {
      setError(e.response?.data?.message || "Failed — ensure ML service is running on port 8000");
    } finally { setLoading(false); }
  };

  const plan = result?.study_plan;
  const path = result?.learning_path || [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <Sidebar/>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 className="sg-section-title" style={{ marginBottom: ".4rem" }}>📅 Personalized Study Plan</h1>
        <p style={{ color: "var(--muted)", marginBottom: "2rem", fontSize: ".9rem" }}>
          Enter skills you want to learn. We use graph-based AI to generate a prerequisite-ordered learning path and weekly schedule.
        </p>

        {/* Config Card */}
        <div className="sg-card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: ".5rem", marginBottom: "1rem" }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(input); } }}
              placeholder='Add skills to learn (e.g. "React", "Machine Learning")...'
              className="sg-input" style={{ flex: 1 }} />
            <button onClick={() => add(input)} className="sg-btn sg-btn-primary sg-btn-sm">Add</button>
          </div>

          {/* Quick add */}
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ color: "var(--muted)", fontSize: ".76rem", marginBottom: ".4rem" }}>Quick add:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem" }}>
              {QUICK.filter(s => !skills.map(x => x.toLowerCase()).includes(s.toLowerCase())).map(s => (
                <button key={s} onClick={() => add(s)} style={{ background: "var(--bg3)", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: 20, padding: ".18rem .6rem", fontSize: ".76rem", cursor: "pointer" }}
                  onMouseEnter={e => { e.target.style.color = "var(--green)"; e.target.style.borderColor = "var(--green)"; }}
                  onMouseLeave={e => { e.target.style.color = "var(--muted)"; e.target.style.borderColor = "var(--border)"; }}>
                  +{s}
                </button>
              ))}
            </div>
          </div>

          {/* Selected skills */}
          {skills.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: ".35rem", padding: ".75rem", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: "1rem" }}>
              {skills.map(s => (
                <span key={s} className="sg-tag sg-tag-green">
                  {s}
                  <button onClick={() => setSkills(skills.filter(x => x !== s))} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", padding: 0, marginLeft: ".2rem" }}>×</button>
                </span>
              ))}
            </div>
          )}

          {/* Schedule options */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label className="sg-label">Hours per day: <strong style={{ color: "var(--blue)" }}>{hpd}h</strong></label>
              <input type="range" min={1} max={8} value={hpd} onChange={e => setHpd(+e.target.value)}
                style={{ width: "100%", accentColor: "var(--blue)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".72rem", color: "var(--muted)" }}><span>1h</span><span>8h</span></div>
            </div>
            <div>
              <label className="sg-label">Days per week: <strong style={{ color: "var(--purple)" }}>{dpw} days</strong></label>
              <input type="range" min={1} max={7} value={dpw} onChange={e => setDpw(+e.target.value)}
                style={{ width: "100%", accentColor: "var(--purple)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".72rem", color: "var(--muted)" }}><span>1d</span><span>7d</span></div>
            </div>
          </div>

          {/* Summary estimate */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: ".8rem 1rem", marginBottom: "1rem", fontSize: ".85rem", color: "var(--muted)" }}>
            📊 Schedule: <strong style={{ color: "var(--text)" }}>{hpd * dpw}h/week</strong> &nbsp;·&nbsp;
            Skills to learn: <strong style={{ color: "var(--blue)" }}>{skills.length}</strong>
          </div>

          {error && <div style={{ background: "rgba(252,129,129,.08)", border: "1px solid rgba(252,129,129,.3)", borderRadius: 8, padding: ".7rem 1rem", color: "var(--red)", fontSize: ".85rem", marginBottom: "1rem" }}>⚠️ {error}</div>}

          <button onClick={generate} disabled={loading || !skills.length} className="sg-btn sg-btn-primary" style={{ width: "100%", justifyContent: "center", padding: "1rem" }}>
            {loading ? "⏳ Generating AI Study Plan..." : "📅 Generate My Study Plan"}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="fade-up">
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              {[
                { l: "Total Hours", v: plan?.total_hours, c: "var(--blue)", icon: "⏱" },
                { l: "Total Weeks", v: plan?.total_weeks, c: "var(--purple)", icon: "📅" },
                { l: "Skills in Path", v: path.length, c: "var(--green)", icon: "🛠" },
                { l: "Hours/Day", v: `${hpd}h`, c: "var(--amber)", icon: "☀️" },
              ].map(s => (
                <div key={s.l} className="sg-card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.3rem" }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 900, color: s.c }}>{s.v}</div>
                  <div style={{ color: "var(--muted)", fontSize: ".75rem" }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: ".4rem", marginBottom: "1.2rem", background: "var(--bg2)", borderRadius: 10, padding: 4, border: "1px solid var(--border)" }}>
              {[["plan", "📅 Weekly Plan"], ["path", "🗺️ Learning Path"], ["courses", "📚 Courses"]].map(([t, l]) => (
                <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: ".5rem", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: ".84rem", transition: "all .2s",
                  background: tab === t ? "linear-gradient(135deg,var(--blue),var(--purple))" : "transparent",
                  color: tab === t ? "#fff" : "var(--muted)" }}>{l}</button>
              ))}
            </div>

            {/* Weekly Plan Tab */}
            {tab === "plan" && (
              <>
                {/* Week selector */}
                <div style={{ display: "flex", gap: ".35rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                  {plan?.weekly_plan?.map((_, i) => (
                    <button key={i} onClick={() => setActiveWeek(i)} style={{ padding: ".35rem .8rem", borderRadius: 20, border: "none", cursor: "pointer", fontSize: ".8rem", fontWeight: 600, fontFamily: "inherit", transition: "all .2s",
                      background: activeWeek === i ? "linear-gradient(135deg,var(--blue),var(--purple))" : "var(--bg3)",
                      color: activeWeek === i ? "#fff" : "var(--muted)",
                      border: activeWeek === i ? "none" : "1px solid var(--border)" }}>
                      Week {i + 1}
                    </button>
                  ))}
                </div>

                {plan?.weekly_plan?.[activeWeek] && (() => {
                  const w = plan.weekly_plan[activeWeek];
                  return (
                    <div className="sg-card fade-up">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", flexWrap: "wrap", gap: "1rem" }}>
                        <h3 style={{ fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Week {w.week}</h3>
                        <div style={{ display: "flex", gap: ".6rem" }}>
                          <span className="sg-tag sg-tag-blue">⏱ {w.hours}h total</span>
                          <span className="sg-tag sg-tag-purple">🛠 {w.skills?.length} skills</span>
                        </div>
                      </div>

                      <div style={{ marginBottom: "1.2rem" }}>
                        <p style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: ".5rem", fontWeight: 500 }}>SKILLS THIS WEEK</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
                          {w.skills?.map(s => <span key={s.skill} className="sg-tag sg-tag-green">{s.skill} · {s.estimated_hours}h</span>)}
                        </div>
                      </div>

                      <p style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: ".6rem", fontWeight: 500 }}>DAILY SCHEDULE</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: ".6rem" }}>
                        {w.daily_goals?.map((d, i) => (
                          <div key={i} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: ".8rem" }}>
                            <p style={{ color: "var(--blue)", fontWeight: 700, fontSize: ".82rem", marginBottom: ".3rem" }}>{d.day}</p>
                            <p style={{ fontSize: ".82rem", color: "var(--text)" }}>{d.task}</p>
                            <p style={{ color: "var(--muted)", fontSize: ".74rem", marginTop: ".2rem" }}>⏱ {d.hours}h</p>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.2rem" }}>
                        <button onClick={() => setActiveWeek(w => Math.max(0, w - 1))} disabled={activeWeek === 0} className="sg-btn sg-btn-outline sg-btn-sm">← Previous</button>
                        <button onClick={() => setActiveWeek(w => Math.min((plan.weekly_plan?.length || 1) - 1, w + 1))} disabled={activeWeek >= (plan.weekly_plan?.length || 1) - 1} className="sg-btn sg-btn-primary sg-btn-sm">Next Week →</button>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* Learning Path Tab */}
            {tab === "path" && (
              <div className="sg-card">
                <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>🗺️ Prerequisite-Ordered Learning Path ({path.length} skills)</h3>
                <div style={{ display: "grid", gap: ".5rem" }}>
                  {path.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: ".8rem", background: "var(--bg)", border: `1px solid ${s.is_prerequisite ? "var(--border)" : "rgba(61,142,240,.3)"}`, borderRadius: 10, padding: ".7rem 1rem" }}>
                      <span style={{ color: "var(--muted)", fontWeight: 700, minWidth: 28, fontSize: ".82rem" }}>#{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: ".9rem" }}>{s.skill}</div>
                        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginTop: ".2rem" }}>
                          <span style={{ fontSize: ".72rem", color: DIFF_C[s.difficulty] || "var(--muted)" }}>{s.difficulty}</span>
                          <span style={{ fontSize: ".72rem", color: "var(--muted)" }}>· {s.category}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: "var(--amber)", fontSize: ".85rem", fontWeight: 600 }}>{s.estimated_hours}h</div>
                        {s.is_prerequisite && <div style={{ fontSize: ".7rem", color: "var(--muted)" }}>prerequisite</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {tab === "courses" && (
              <div className="sg-card">
                <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>📚 Recommended Courses for Your Path</h3>
                {path.filter(s => s.resources?.length > 0).length === 0 ? (
                  <p style={{ color: "var(--muted)" }}>No curated courses found — visit Udemy or Coursera for these skills.</p>
                ) : (
                  path.filter(s => s.resources?.length > 0).map((s, i) => (
                    <div key={i} style={{ marginBottom: "1.2rem" }}>
                      <h4 style={{ fontWeight: 700, color: "var(--blue)", marginBottom: ".6rem", fontSize: ".9rem" }}>{s.skill}</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: ".6rem" }}>
                        {s.resources.map((r, j) => (
                          <a key={j} href={r.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: ".9rem", display: "block", transition: "border-color .2s" }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--blue)"}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".4rem" }}>
                              <span style={{ fontSize: ".72rem", color: "var(--muted)", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, padding: ".1rem .5rem" }}>{r.platform}</span>
                              <span style={{ fontSize: ".72rem", color: r.free ? "var(--green)" : "var(--amber)", fontWeight: 600 }}>{r.free ? "FREE" : "PAID"}</span>
                            </div>
                            <div style={{ fontWeight: 600, fontSize: ".85rem", color: "var(--text)" }}>{r.title}</div>
                            {r.duration && <div style={{ color: "var(--muted)", fontSize: ".74rem", marginTop: ".3rem" }}>⏱ {r.duration}</div>}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
