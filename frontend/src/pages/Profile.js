import React, { useState, useRef } from "react";
import { authAPI, uploadAvatar } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

const SKILLS_ALL = [
  "JavaScript","Python","React","Node.js","TypeScript","MongoDB","SQL","Docker",
  "AWS","Machine Learning","TensorFlow","Git","DSA","System Design","CSS",
  "Express","PostgreSQL","Linux","Redis","Kubernetes","Flutter","React Native",
  "Figma","Django","FastAPI","C++","Java","Kotlin","Swift","Go"
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef(null);
  const [editing, setEditing]       = useState(false);
  const [form, setForm]             = useState({
    name: user?.name || "", bio: user?.bio || "", college: user?.college || "",
    year: user?.year || "", linkedin: user?.linkedin || "",
    github: user?.github || "", targetRole: user?.targetRole || ""
  });
  const [saving, setSaving]         = useState(false);
  const [activeTab, setActiveTab]   = useState("overview");
  const [updatingSkill, setUpdatingSkill] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Max file size is 2MB"); return; }
    setAvatarLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const r = await uploadAvatar(reader.result);
        updateUser(r.data.user);
      } catch { alert("Upload failed. Please try again."); }
      finally { setAvatarLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      const r = await authAPI.updateProfile(form);
      updateUser(r.data.user);
      setEditing(false);
    } catch (e) { alert(e.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const updateProgress = async (skill, status, progress) => {
    setUpdatingSkill(skill);
    try {
      const r = await authAPI.updateProgress({ skill, status, progress });
      updateUser({ ...user, skillProgress: r.data.skillProgress, points: r.data.points, level: r.data.level });
    } catch {}
    finally { setUpdatingSkill(null); }
  };

  const getProgress = (skill) => user?.skillProgress?.find(s => s.skill === skill);

  const generateResume = () => {
    const skills = user?.skills?.join(", ") || "Not specified";
    const certs  = user?.certificates?.map(c => `  - ${c.title} (${c.skill})`).join("\n") || "  None yet";
    const content = [
      "=".repeat(60),
      (user?.name || "YOUR NAME").toUpperCase(),
      "=".repeat(60),
      "",
      `College   : ${user?.college || "Your College"}`,
      `Year      : ${user?.year || "Final Year"}`,
      `Target    : ${user?.targetRole || "Software Engineer"}`,
      `LinkedIn  : ${user?.linkedin || "Add your LinkedIn"}`,
      `GitHub    : ${user?.github   || "Add your GitHub"}`,
      "",
      "-".repeat(60),
      "OBJECTIVE",
      "-".repeat(60),
      user?.bio || `Passionate CS student seeking opportunities in ${user?.targetRole || "software engineering"}.`,
      "",
      "-".repeat(60),
      "TECHNICAL SKILLS",
      "-".repeat(60),
      skills,
      "",
      "-".repeat(60),
      "CERTIFICATIONS",
      "-".repeat(60),
      certs,
      "",
      "-".repeat(60),
      `SKILLGRAPH AI STATS`,
      "-".repeat(60),
      `Points : ${user?.points || 0}  |  Level : ${user?.level || "Beginner"}  |  Streak : ${user?.streak || 0} days`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = `${(user?.name || "Resume").replace(/ /g, "_")}_Resume_Draft.txt`;
    a.click();
  };

  const LEVEL_C  = { Expert:"var(--amber)", Advanced:"var(--blue)", Intermediate:"var(--green)", Beginner:"var(--muted)" };
  const STATUS_C = { completed:"var(--green)", learning:"var(--blue)", planning:"var(--muted)" };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", marginLeft:"220px" }}>
      <Sidebar/>
      <div style={{ maxWidth:900, margin:"0 auto", padding:"2rem 1.5rem" }}>

        {/* ── Profile Header Card ── */}
        <div className="sg-card" style={{ marginBottom:"1.5rem", borderColor:"rgba(61,142,240,.3)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"1.5rem" }}>

            {/* Avatar + name */}
            <div style={{ display:"flex", gap:"1.2rem", alignItems:"center" }}>
              <div style={{ position:"relative", display:"inline-block" }}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar"
                    style={{ width:72, height:72, borderRadius:"50%", objectFit:"cover", border:"3px solid var(--blue)", display:"block" }} />
                ) : (
                  <div className="sg-avatar" style={{ width:72, height:72, fontSize:"1.8rem" }}>
                    {user?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <button
                  onClick={() => fileRef.current && fileRef.current.click()}
                  disabled={avatarLoading}
                  title="Upload profile photo"
                  style={{
                    position:"absolute", bottom:0, right:0,
                    width:24, height:24, borderRadius:"50%",
                    background:"var(--blue)", border:"2px solid var(--bg)",
                    cursor:"pointer", fontSize:".7rem",
                    display:"flex", alignItems:"center", justifyContent:"center", color:"#fff"
                  }}>
                  {avatarLoading ? "…" : "📷"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display:"none" }}
                  onChange={handleAvatarUpload}
                />
              </div>

              <div>
                {editing ? (
                  <input value={form.name} onChange={e => setForm({...form, name:e.target.value})}
                    className="sg-input" style={{ marginBottom:".4rem", fontWeight:700 }} placeholder="Full Name" />
                ) : (
                  <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.4rem", marginBottom:".2rem" }}>
                    {user?.name || "Your Name"}
                  </h2>
                )}
                <p style={{ color:"var(--blue)", fontSize:".88rem", marginBottom:".3rem" }}>
                  {user?.college || "Add your college"}
                </p>
                <div style={{ display:"flex", gap:".5rem", flexWrap:"wrap" }}>
                  <span style={{ color:LEVEL_C[user?.level] || "var(--muted)", fontWeight:600, fontSize:".78rem" }}>
                    ✦ {user?.level || "Beginner"}
                  </span>
                  <span style={{ color:"var(--muted)", fontSize:".78rem" }}>·</span>
                  <span style={{ color:"var(--muted)", fontSize:".78rem" }}>
                    {user?.authProvider === "google" ? "🔵 Google" : user?.authProvider === "linkedin" ? "🔗 LinkedIn" : "📧 Email"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display:"flex", gap:".6rem", flexWrap:"wrap", alignItems:"flex-start" }}>
              {editing ? (
                <>
                  <button onClick={save} disabled={saving} className="sg-btn sg-btn-primary">
                    {saving ? "Saving..." : "💾 Save"}
                  </button>
                  <button onClick={() => setEditing(false)} className="sg-btn sg-btn-outline">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditing(true)} className="sg-btn sg-btn-outline">✏️ Edit Profile</button>
                  <button onClick={generateResume} className="sg-btn sg-btn-green">📄 Export Resume</button>
                </>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display:"flex", gap:"1.5rem", flexWrap:"wrap", marginTop:"1.2rem", padding:"1rem", background:"var(--bg)", borderRadius:10, border:"1px solid var(--border)" }}>
            {[
              { l:"Points",   v:user?.points || 0,               c:"var(--amber)"  },
              { l:"Skills",   v:user?.skills?.length || 0,       c:"var(--blue)"   },
              { l:"Streak",   v:`${user?.streak || 0}d`,         c:"var(--red)"    },
              { l:"Analyses", v:user?.analysisCount || 0,        c:"var(--purple)" },
              { l:"Certs",    v:user?.certificates?.length || 0, c:"var(--green)"  },
            ].map(s => (
              <div key={s.l} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.5rem", fontWeight:900, color:s.c }}>{s.v}</div>
                <div style={{ color:"var(--muted)", fontSize:".72rem" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display:"flex", gap:".4rem", marginBottom:"1.2rem", background:"var(--bg2)", borderRadius:10, padding:4, border:"1px solid var(--border)" }}>
          {[["overview","👤 Overview"], ["progress","📈 Progress"], ["certs","📜 Certs"], ["badges","🎖 Badges"]].map(([t,l]) => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ flex:1, padding:".5rem", borderRadius:8, border:"none", cursor:"pointer",
                fontFamily:"inherit", fontWeight:600, fontSize:".84rem", transition:"all .2s",
                background: activeTab === t ? "linear-gradient(135deg,var(--blue),var(--purple))" : "transparent",
                color: activeTab === t ? "#fff" : "var(--muted)" }}>
              {l}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"1rem" }}>
            <div className="sg-card">
              <h4 style={{ fontWeight:700, marginBottom:"1rem" }}>Personal Info</h4>
              {editing ? (
                <div style={{ display:"grid", gap:".7rem" }}>
                  {[
                    ["bio","Bio","Student passionate about tech…","textarea"],
                    ["college","College","IIT Bombay / NIT Warangal"],
                    ["year","Year","3rd Year / Final Year"],
                    ["targetRole","Target Role","Full Stack Developer"],
                    ["linkedin","LinkedIn URL","https://linkedin.com/in/…"],
                    ["github","GitHub URL","https://github.com/…"],
                  ].map(([k,l,ph,type]) => (
                    <div key={k}>
                      <label className="sg-label">{l}</label>
                      {type === "textarea"
                        ? <textarea value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})}
                            placeholder={ph} className="sg-input" style={{ height:70, resize:"none" }} />
                        : <input value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})}
                            placeholder={ph} className="sg-input" />
                      }
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display:"grid", gap:".6rem" }}>
                  {[
                    ["🎓 College", user?.college],
                    ["📅 Year",    user?.year],
                    ["🎯 Target",  user?.targetRole],
                    ["🔗 LinkedIn",user?.linkedin],
                    ["💻 GitHub",  user?.github],
                  ].map(([l,v]) => v ? (
                    <div key={l} style={{ fontSize:".85rem" }}>
                      <span style={{ color:"var(--muted)" }}>{l}: </span>
                      <span>{v}</span>
                    </div>
                  ) : null)}
                  {user?.bio && (
                    <p style={{ color:"var(--muted)", fontSize:".85rem", lineHeight:1.6,
                      borderTop:"1px solid var(--border)", paddingTop:".6rem", marginTop:".2rem" }}>
                      {user.bio}
                    </p>
                  )}
                  {!user?.college && !user?.bio && (
                    <p style={{ color:"var(--muted)", fontSize:".85rem" }}>Click "Edit Profile" to add your details.</p>
                  )}
                </div>
              )}
            </div>

            <div className="sg-card">
              <h4 style={{ fontWeight:700, marginBottom:"1rem" }}>🛠 My Skills ({user?.skills?.length || 0})</h4>
              <div style={{ display:"flex", flexWrap:"wrap", gap:".35rem", marginBottom:"1rem" }}>
                {user?.skills?.length
                  ? user.skills.map(s => <span key={s} className="sg-tag sg-tag-blue">{s}</span>)
                  : <p style={{ color:"var(--muted)", fontSize:".85rem" }}>No skills yet. Run an analysis to detect them!</p>
                }
              </div>
              <div style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, padding:".6rem .8rem" }}>
                <p style={{ color:"var(--muted)", fontSize:".76rem" }}>
                  Skills are automatically detected when you run Analysis or upload your resume.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Progress Tab ── */}
        {activeTab === "progress" && (
          <div className="sg-card">
            <h4 style={{ fontWeight:700, marginBottom:".4rem" }}>📈 Skill Progress Tracker</h4>
            <p style={{ color:"var(--muted)", fontSize:".84rem", marginBottom:"1.2rem" }}>
              Mark skills as Learning or Done to track your journey and earn points.
            </p>
            {SKILLS_ALL.map(skill => {
              const prog = getProgress(skill);
              return (
                <div key={skill} style={{ display:"flex", alignItems:"center", gap:".8rem", padding:".6rem 0", borderBottom:"1px solid var(--border)" }}>
                  <span style={{ minWidth:140, fontWeight:600, fontSize:".85rem" }}>{skill}</span>
                  <div className="sg-progress" style={{ flex:1 }}>
                    <div className="sg-bar" style={{ width:`${prog?.progress || 0}%` }} />
                  </div>
                  <span style={{ minWidth:36, fontSize:".78rem", color:"var(--muted)", textAlign:"right" }}>{prog?.progress || 0}%</span>
                  <select
                    value={prog?.status || "planning"}
                    disabled={updatingSkill === skill}
                    onChange={e => updateProgress(skill, e.target.value, e.target.value === "completed" ? 100 : prog?.progress || 20)}
                    style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8,
                      padding:".3rem .5rem", color:STATUS_C[prog?.status || "planning"] || "var(--muted)",
                      fontSize:".76rem", cursor:"pointer" }}>
                    <option value="planning">📋 Plan</option>
                    <option value="learning">📖 Learning</option>
                    <option value="completed">✅ Done</option>
                  </select>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Certs Tab ── */}
        {activeTab === "certs" && (
          <div className="sg-card">
            <h4 style={{ fontWeight:700, marginBottom:"1rem" }}>📜 Certificates ({user?.certificates?.length || 0})</h4>
            {!user?.certificates?.length ? (
              <div style={{ textAlign:"center", padding:"3rem", color:"var(--muted)" }}>
                <div style={{ fontSize:"3rem", marginBottom:".7rem" }}>📭</div>
                <p style={{ marginBottom:".4rem", fontWeight:600 }}>No certificates yet</p>
                <p style={{ fontSize:".85rem" }}>Upload your Udemy / Coursera certificates to earn points!</p>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:".8rem" }}>
                {user.certificates.map((c, i) => (
                  <div key={i} style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:10, padding:"1rem" }}>
                    <div style={{ fontSize:"1.5rem", marginBottom:".4rem" }}>📜</div>
                    <p style={{ fontWeight:700, fontSize:".88rem" }}>{c.title}</p>
                    <p style={{ color:"var(--blue)", fontSize:".8rem" }}>{c.skill}</p>
                    <p style={{ color:"var(--amber)", fontSize:".76rem", marginTop:".3rem" }}>+{c.points} pts</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Badges Tab ── */}
        {activeTab === "badges" && (
          <div className="sg-card">
            <h4 style={{ fontWeight:700, marginBottom:"1rem" }}>🎖 Badges ({user?.badges?.length || 0})</h4>
            {!user?.badges?.length ? (
              <div style={{ textAlign:"center", padding:"3rem", color:"var(--muted)" }}>
                <div style={{ fontSize:"3rem", marginBottom:".7rem" }}>🎖</div>
                <p style={{ marginBottom:".4rem", fontWeight:600 }}>No badges yet</p>
                <p style={{ fontSize:".85rem" }}>Complete challenges to earn your first badge!</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexWrap:"wrap", gap:"1rem" }}>
                {user.badges.map((b, i) => (
                  <div key={i} style={{ textAlign:"center", background:"var(--bg)", border:"1px solid var(--amber)", borderRadius:12, padding:"1rem 1.5rem" }}>
                    <div style={{ fontSize:"2rem" }}>🏆</div>
                    <p style={{ fontWeight:600, fontSize:".82rem", marginTop:".3rem" }}>{b.badgeId || b}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
