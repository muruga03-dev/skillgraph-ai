import React, { useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { analysisAPI } from "../services/api";

const DEPT_COLORS = {
  "Engineering":   "#3d8ef0", "AI & Data":    "#9f7aea", "Cloud":        "#38e29a",
  "Security":      "#fc8181", "Mobile":       "#f6ad55", "Design":       "#9f7aea",
  "Fintech":       "#38e29a", "Robotics":     "#3d8ef0", "DevOps":       "#f6ad55",
  "Management":    "#9f7aea", "Analytics":    "#38e29a", "Architecture": "#3d8ef0",
};

export default function ResumeMatch() {
  const fileRef  = useRef(null);
  const [file, setFile]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [skills, setSkills]       = useState([]);
  const [jobs, setJobs]           = useState([]);
  const [selected, setSelected]   = useState(null);
  const [step, setStep]           = useState("upload"); // upload | results

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setError("");
  };

  const analyze = async () => {
    if (!file) { setError("Please upload your resume first."); return; }
    setLoading(true); setError("");
    try {
      // Parse resume → extract skills
      const r = await analysisAPI.resume(file);
      const extractedSkills = r.data.extractedSkills || r.data.skills || [];
      setSkills(extractedSkills);

      if (!extractedSkills.length) {
        setError("Could not extract skills from your resume. Make sure it's a PDF or image with text.");
        setLoading(false); return;
      }

      // Match jobs with those exact skills
      const jRes = await analysisAPI.matchJobs(extractedSkills);
      const matched = jRes.data.matches || jRes.data.jobs || [];
      setJobs(matched);
      setStep("results");
    } catch (e) {
      setError(e.response?.data?.message || "Analysis failed — make sure all 3 services are running.");
    } finally { setLoading(false); }
  };

  const reset = () => { setFile(null); setSkills([]); setJobs([]); setSelected(null); setStep("upload"); setError(""); };

  const pct = (n) => Math.round(n * 100);
  const pctColor = (p) => p >= 70 ? "#38e29a" : p >= 45 ? "#f6ad55" : "#fc8181";
  const deptColor = (d) => DEPT_COLORS[d] || "#5a7196";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", marginLeft: "220px" }}>
      <Sidebar />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 className="sg-section-title">📄 Resume Job Match</h1>
          <p style={{ color: "var(--muted)", fontSize: ".92rem", marginTop: ".3rem" }}>
            Upload your resume → AI extracts your exact skills → matches to real-world job roles across all engineering branches.
          </p>
        </div>

        {step === "upload" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }}>

            {/* Upload card */}
            <div className="sg-card" style={{ borderColor: "rgba(61,142,240,.2)" }}>
              <h3 style={{ fontWeight: 700, marginBottom: "1.2rem", fontSize: "1.05rem" }}>Upload Your Resume</h3>

              {/* Drop zone */}
              <div onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${file ? "var(--green)" : "rgba(61,142,240,.3)"}`,
                  borderRadius: 14, padding: "2.5rem 1.5rem", textAlign: "center", cursor: "pointer",
                  background: file ? "rgba(56,226,154,.04)" : "rgba(61,142,240,.03)", transition: "all .2s",
                  marginBottom: "1.2rem" }}
                onDragOver={e => { e.preventDefault(); }}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}>
                <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display: "none" }} onChange={handleFile} />
                <div style={{ fontSize: "2.5rem", marginBottom: ".8rem" }}>{file ? "✅" : "📤"}</div>
                {file ? (
                  <>
                    <p style={{ fontWeight: 700, color: "var(--green)", marginBottom: ".3rem" }}>{file.name}</p>
                    <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                  </>
                ) : (
                  <>
                    <p style={{ fontWeight: 600, marginBottom: ".4rem" }}>Drop your resume here or click to browse</p>
                    <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>Supports PDF, PNG, JPG · Max 15MB</p>
                  </>
                )}
              </div>

              {error && (
                <div style={{ background: "rgba(252,129,129,.08)", border: "1px solid rgba(252,129,129,.25)", borderRadius: 10, padding: ".75rem 1rem", color: "var(--red)", fontSize: ".84rem", marginBottom: "1rem" }}>
                  ⚠️ {error}
                </div>
              )}

              <button onClick={analyze} disabled={loading || !file} className="sg-btn sg-btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: ".95rem", padding: ".8rem" }}>
                {loading ? (
                  <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, marginRight: ".5rem" }} />Analysing Resume…</>
                ) : "🔍 Match Jobs from My Resume"}
              </button>

              <p style={{ color: "var(--muted)", fontSize: ".78rem", marginTop: ".8rem", textAlign: "center" }}>
                Your resume is processed locally. Skills are extracted using NLP and matched via TF-IDF cosine similarity.
              </p>
            </div>

            {/* Supported branches */}
            <div className="sg-card">
              <h4 style={{ fontWeight: 700, marginBottom: "1rem", fontSize: ".9rem" }}>🎓 Works for ALL Branches</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                {[
                  ["💻", "CSE / IT", "Software, AI, Data, Web, Mobile"],
                  ["⚡", "ECE / EEE", "Embedded, IoT, VLSI, Signal Processing"],
                  ["🔧", "Mechanical", "CAD, FEA, Robotics, Manufacturing"],
                  ["🏗️", "Civil", "AutoCAD, Structural, GIS, Project Mgmt"],
                  ["🧪", "Chemical", "Process Simulation, Safety, Quality"],
                  ["📡", "Telecom", "Network, RF, Protocols, Cloud Comm"],
                  ["🤖", "Robotics", "ROS, Control Systems, Computer Vision"],
                  ["🎨", "Design", "UI/UX, Figma, Product Design, Research"],
                ].map(([icon, branch, roles]) => (
                  <div key={branch} style={{ display: "flex", gap: ".6rem", padding: ".5rem .7rem", background: "var(--bg)", borderRadius: 9, border: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "1rem", flexShrink: 0 }}>{icon}</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: ".8rem" }}>{branch}</p>
                      <p style={{ color: "var(--muted)", fontSize: ".72rem" }}>{roles}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "results" && (
          <>
            {/* Back + summary */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <button onClick={reset} className="sg-btn sg-btn-outline" style={{ marginRight: ".8rem" }}>← Upload New Resume</button>
                <span style={{ color: "var(--green)", fontWeight: 600, fontSize: ".9rem" }}>
                  ✅ Found {skills.length} skills · Matched {jobs.length} job roles
                </span>
              </div>
              <span style={{ color: "var(--muted)", fontSize: ".8rem" }}>📄 {file?.name}</span>
            </div>

            {/* Extracted skills */}
            <div className="sg-card" style={{ marginBottom: "1.5rem", borderColor: "rgba(56,226,154,.2)" }}>
              <h4 style={{ fontWeight: 700, marginBottom: ".8rem" }}>🎯 Skills Extracted from Your Resume ({skills.length})</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
                {skills.map(s => (
                  <span key={s} className="sg-tag sg-tag-green" style={{ fontSize: ".8rem" }}>{s}</span>
                ))}
              </div>
              <p style={{ color: "var(--muted)", fontSize: ".78rem", marginTop: ".8rem" }}>
                These are the skills our ML model identified from your resume text. Job matching is based on these exact skills.
              </p>
            </div>

            {/* Job matches grid + detail */}
            <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: "1.2rem" }}>

              {/* Job list */}
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "1rem" }}>💼 Best Matching Roles</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: ".7rem" }}>
                  {jobs.length === 0 ? (
                    <div className="sg-card" style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
                      <p style={{ fontSize: "2rem", marginBottom: ".5rem" }}>🔍</p>
                      <p>No job matches found. Try uploading a resume with more technical skills.</p>
                    </div>
                  ) : jobs.map((job, i) => {
                    const score = job.match_score || job.similarity || 0;
                    const pctVal = score > 1 ? score : pct(score);
                    const isSelected = selected?.job_role === job.job_role;
                    return (
                      <div key={i} onClick={() => setSelected(isSelected ? null : job)}
                        className="sg-card"
                        style={{ cursor: "pointer", borderColor: isSelected ? "var(--blue)" : pctVal >= 70 ? "rgba(56,226,154,.25)" : "var(--border)", transition: "all .2s" }}
                        onMouseEnter={e => !isSelected && (e.currentTarget.style.borderColor = "rgba(61,142,240,.35)")}
                        onMouseLeave={e => !isSelected && (e.currentTarget.style.borderColor = pctVal >= 70 ? "rgba(56,226,154,.25)" : "var(--border)")}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".7rem" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: ".6rem", flexWrap: "wrap", marginBottom: ".3rem" }}>
                              <span style={{ fontWeight: 700, fontSize: ".95rem" }}>#{i + 1} {job.job_role}</span>
                              {i === 0 && <span style={{ background: "rgba(56,226,154,.15)", border: "1px solid rgba(56,226,154,.3)", borderRadius: 50, padding: ".1rem .5rem", fontSize: ".68rem", color: "var(--green)", fontWeight: 700 }}>BEST MATCH</span>}
                            </div>
                            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                              <span style={{ fontSize: ".75rem", color: deptColor(job.department), fontWeight: 600 }}>🏢 {job.department}</span>
                              {job.avg_salary_inr && <span style={{ fontSize: ".75rem", color: "var(--amber)" }}>💰 {job.avg_salary_inr}</span>}
                            </div>
                          </div>
                          <div style={{ textAlign: "center", flexShrink: 0 }}>
                            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: pctColor(pctVal), lineHeight: 1 }}>{pctVal}%</div>
                            <div style={{ fontSize: ".65rem", color: "var(--muted)" }}>match</div>
                          </div>
                        </div>

                        {/* Match bar */}
                        <div style={{ height: 5, background: "var(--bg3)", borderRadius: 3, overflow: "hidden", marginBottom: ".6rem" }}>
                          <div style={{ height: "100%", width: `${pctVal}%`, background: `linear-gradient(90deg,${pctColor(pctVal)},var(--blue))`, borderRadius: 3, transition: "width 1s ease" }} />
                        </div>

                        {/* Matching skills preview */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem" }}>
                          {(job.matching_skills || []).slice(0, 5).map(s => (
                            <span key={s} className="sg-tag sg-tag-green" style={{ fontSize: ".7rem" }}>✓ {s}</span>
                          ))}
                          {(job.matching_skills || []).length > 5 && (
                            <span className="sg-tag" style={{ fontSize: ".7rem" }}>+{job.matching_skills.length - 5} more</span>
                          )}
                        </div>
                        <p style={{ color: "var(--muted)", fontSize: ".72rem", marginTop: ".5rem" }}>Click to see full breakdown →</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Job detail panel */}
              {selected && (
                <div>
                  <h3 style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "1rem" }}>📊 Match Breakdown</h3>
                  <div className="sg-card" style={{ borderColor: "rgba(61,142,240,.25)", position: "sticky", top: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                      <div>
                        <h3 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: ".3rem" }}>{selected.job_role}</h3>
                        <span style={{ color: deptColor(selected.department), fontSize: ".82rem", fontWeight: 600 }}>🏢 {selected.department}</span>
                      </div>
                      <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: "1.2rem" }}>✕</button>
                    </div>

                    {selected.description && (
                      <p style={{ color: "var(--muted)", fontSize: ".84rem", lineHeight: 1.65, marginBottom: "1rem", padding: ".7rem", background: "var(--bg)", borderRadius: 8 }}>
                        {selected.description}
                      </p>
                    )}

                    {/* Salary */}
                    {(selected.avg_salary_usd || selected.avg_salary_inr) && (
                      <div style={{ display: "flex", gap: ".8rem", marginBottom: "1rem" }}>
                        {selected.avg_salary_usd && (
                          <div style={{ flex: 1, padding: ".6rem", background: "rgba(246,173,85,.06)", border: "1px solid rgba(246,173,85,.2)", borderRadius: 9, textAlign: "center" }}>
                            <p style={{ color: "var(--amber)", fontWeight: 700, fontSize: ".95rem" }}>{selected.avg_salary_usd}</p>
                            <p style={{ color: "var(--muted)", fontSize: ".7rem" }}>USD / year</p>
                          </div>
                        )}
                        {selected.avg_salary_inr && (
                          <div style={{ flex: 1, padding: ".6rem", background: "rgba(56,226,154,.06)", border: "1px solid rgba(56,226,154,.2)", borderRadius: 9, textAlign: "center" }}>
                            <p style={{ color: "var(--green)", fontWeight: 700, fontSize: ".95rem" }}>{selected.avg_salary_inr}</p>
                            <p style={{ color: "var(--muted)", fontSize: ".7rem" }}>INR / year</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Matched skills */}
                    {(selected.matching_skills || []).length > 0 && (
                      <div style={{ marginBottom: "1rem" }}>
                        <p style={{ fontWeight: 700, fontSize: ".84rem", marginBottom: ".5rem" }}>
                          ✅ Your Matching Skills ({selected.matching_skills.length})
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem" }}>
                          {selected.matching_skills.map(s => (
                            <span key={s} className="sg-tag sg-tag-green" style={{ fontSize: ".75rem" }}>✓ {s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing skills */}
                    {(selected.missing_skills || []).length > 0 && (
                      <div style={{ marginBottom: "1rem" }}>
                        <p style={{ fontWeight: 700, fontSize: ".84rem", marginBottom: ".5rem" }}>
                          📚 Skills to Learn ({selected.missing_skills.length})
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem" }}>
                          {selected.missing_skills.slice(0, 8).map(s => (
                            <span key={s} className="sg-tag sg-tag-amber" style={{ fontSize: ".75rem" }}>+ {s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Career path */}
                    {selected.career_path && (
                      <div style={{ padding: ".7rem", background: "rgba(61,142,240,.05)", border: "1px solid rgba(61,142,240,.15)", borderRadius: 9 }}>
                        <p style={{ fontWeight: 700, fontSize: ".82rem", marginBottom: ".4rem", color: "var(--blue)" }}>🗺️ Career Path</p>
                        <p style={{ color: "var(--muted)", fontSize: ".8rem" }}>{selected.career_path}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
