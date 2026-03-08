import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { mentorAPI } from "../services/api";

const LEVEL_C = { Expert:"var(--amber)", Advanced:"var(--blue)", Intermediate:"var(--green)", Beginner:"var(--muted)" };

function MentorNavbar({ mentor, onLogout, theme, toggleTheme }) {
  return (
    <nav style={{ position:"sticky",top:0,zIndex:1000,background:"rgba(115, 141, 187, 0.95)",backdropFilter:"blur(12px)",borderBottom:"1px solid var(--border)",padding:"0 1.5rem" }}>
      <div style={{ maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:58 }}>
        <div style={{ display:"flex",alignItems:"center",gap:".5rem" }}>
          <div style={{ width:30,height:30,background:"linear-gradient(135deg,var(--purple),var(--blue))",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center" }}>🎓</div>
          <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.1rem" }}>Mentor <span style={{ color:"var(--white)" }}>Portal</span></span>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:".8rem" }}>
          <button onClick={toggleTheme} style={{ background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:".35rem .5rem",cursor:"pointer",fontSize:"1rem" }}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <div style={{ display:"flex",alignItems:"center",gap:".4rem" }}>
            <div className="sg-avatar" style={{ width:30,height:30,fontSize:".8rem" }}>{mentor?.name?.[0]}</div>
            <span style={{ fontSize:".82rem" }}>{mentor?.name?.split(" ")[0]}</span>
          </div>
          <Link to="/mentor/login"><button className="sg-btn sg-btn-outline sg-btn-sm" onClick={onLogout}>Sign Out</button></Link>
        </div>
      </div>
    </nav>
  );
}

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [theme, setTheme] = useState(localStorage.getItem("sg_theme")||"dark");

  // Add student modal
  const [addEmail, setAddEmail] = useState("");
  const [addNotes, setAddNotes] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  // Session modal
  const [showSession, setShowSession] = useState(false);
  const [session, setSession] = useState({ studentName:"", topic:"", duration:60, rating:5, feedback:"" });

  useEffect(() => {
    const token = localStorage.getItem("sg_mentor_token");
    if (!token) { navigate("/mentor/login"); return; }
    const cached = localStorage.getItem("sg_mentor");
    if (cached) try { setMentor(JSON.parse(cached)); } catch {}
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [profRes, studRes, statsRes] = await Promise.allSettled([
        mentorAPI.profile(), mentorAPI.students(), mentorAPI.stats()
      ]);
      if (profRes.status === "fulfilled")  { setMentor(profRes.value.data.mentor); localStorage.setItem("sg_mentor", JSON.stringify(profRes.value.data.mentor)); }
      if (studRes.status === "fulfilled")  setStudents(studRes.value.data.students || []);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
    } catch {}
    finally { setLoading(false); }
  };

  const toggleTheme = () => {
    const t = theme === "dark" ? "light" : "dark";
    setTheme(t);
    document.body.classList.toggle("light", t === "light");
    localStorage.setItem("sg_theme", t);
  };

  const handleLogout = () => {
    localStorage.removeItem("sg_mentor_token");
    localStorage.removeItem("sg_mentor");
    navigate("/mentor/login");
  };

  const toggleAvailability = async () => {
    try {
      const r = await mentorAPI.updateProfile({ isAvailable: !mentor.isAvailable });
      setMentor(r.data.mentor);
    } catch {}
  };

  const addStudent = async () => {
    if (!addEmail.trim()) return;
    setAddLoading(true); setAddError("");
    try {
      await mentorAPI.addStudent({ studentEmail: addEmail, notes: addNotes });
      setShowAdd(false); setAddEmail(""); setAddNotes("");
      loadAll();
    } catch (e) { setAddError(e.response?.data?.message || "Failed"); }
    finally { setAddLoading(false); }
  };

  const logSession = async () => {
    try {
      await mentorAPI.logSession(session);
      setShowSession(false);
      setSession({ studentName:"", topic:"", duration:60, rating:5, feedback:"" });
      loadAll();
    } catch {}
  };

  const updateStatus = async (studentId, status) => {
    try {
      await mentorAPI.updateStudent(studentId, { status });
      loadAll();
    } catch {}
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div><div className="spinner" style={{ margin:"0 auto 1rem" }}/><p style={{ color:"var(--muted)",textAlign:"center" }}>Loading mentor dashboard...</p></div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh",background:"var(--bg)",color:"var(--text)" }}>
      <MentorNavbar mentor={mentor} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />

      <div style={{ maxWidth:1200,margin:"0 auto",padding:"2rem 1.5rem" }}>
        {/* Header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1.5rem",flexWrap:"wrap",gap:"1rem" }}>
          <div>
            <h1 style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.6rem",marginBottom:".2rem" }}>
              Welcome back, {mentor?.name?.split(" ")[0]} 👋
            </h1>
            <p style={{ color:"var(--muted)",fontSize:".9rem" }}>{mentor?.designation} · {mentor?.company || mentor?.college}</p>
            {!mentor?.isApproved && (
              <span style={{ background:"rgba(246,173,85,.1)",border:"1px solid rgba(246,173,85,.3)",borderRadius:8,padding:".2rem .7rem",color:"var(--amber)",fontSize:".78rem",display:"inline-block",marginTop:".4rem" }}>
                ⏳ Account pending admin approval — you can still use all features
              </span>
            )}
          </div>
          <div style={{ display:"flex",gap:".6rem",flexWrap:"wrap" }}>
            <button onClick={toggleAvailability} className={`sg-btn ${mentor?.isAvailable?"sg-btn-green":"sg-btn-outline"}`} style={{ fontSize:".82rem" }}>
              {mentor?.isAvailable ? "● Available" : "○ Set Available"}
            </button>
            <button onClick={() => setShowAdd(true)} className="sg-btn sg-btn-primary">+ Add Student</button>
            <button onClick={() => setShowSession(true)} className="sg-btn sg-btn-purple">📝 Log Session</button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"1rem",marginBottom:"1.5rem" }}>
          {[
            { l:"Total Mentees",  v:stats?.stats?.totalMentees||0,  c:"var(--blue)",   icon:"👥" },
            { l:"Active Mentees", v:stats?.stats?.activeMentees||0,  c:"var(--green)",  icon:"✅" },
            { l:"Sessions Done",  v:stats?.stats?.totalSessions||0,  c:"var(--purple)", icon:"📝" },
            { l:"Avg Rating",     v:(stats?.stats?.avgRating||0)+"★", c:"var(--amber)",  icon:"⭐" },
            { l:"Mentor Points",  v:stats?.stats?.points||0,         c:"var(--amber)",  icon:"🏆" },
          ].map(s => (
            <div key={s.l} className="sg-card" style={{ textAlign:"center" }}>
              <div style={{ fontSize:"1.4rem",marginBottom:".3rem" }}>{s.icon}</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"1.8rem",fontWeight:900,color:s.c }}>{s.v}</div>
              <div style={{ color:"var(--muted)",fontSize:".76rem" }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex",gap:".4rem",marginBottom:"1.2rem",background:"var(--bg2)",borderRadius:10,padding:4,border:"1px solid var(--border)" }}>
          {[["overview","📊 Overview"],["students","👥 My Students"],["sessions","📝 Sessions"],["profile","👤 Profile"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{ flex:1,padding:".5rem",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:".84rem",
              background:tab===t?"linear-gradient(135deg,var(--purple),var(--blue))":"transparent",
              color:tab===t?"#fff":"var(--muted)" }}>{l}</button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem" }}>
            {/* Top students */}
            <div className="sg-card">
              <h3 style={{ fontWeight:700,marginBottom:"1rem" }}>🏆 Top Performing Students</h3>
              {stats?.topStudents?.length ? stats.topStudents.map((s,i) => (
                <div key={i} style={{ display:"flex",alignItems:"center",gap:".7rem",padding:".6rem 0",borderBottom:"1px solid var(--border)" }}>
                  <span style={{ color:"var(--amber)",fontWeight:700,minWidth:24 }}>#{i+1}</span>
                  <div className="sg-avatar" style={{ width:32,height:32,fontSize:".8rem" }}>{s.name?.[0]}</div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:600,fontSize:".88rem" }}>{s.name}</p>
                    <p style={{ color:"var(--muted)",fontSize:".76rem" }}>{s.skills?.slice(0,3).join(", ")}</p>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ color:"var(--amber)",fontWeight:700,fontSize:".85rem" }}>{s.points} pts</p>
                    <p style={{ color:LEVEL_C[s.level],fontSize:".74rem" }}>{s.level}</p>
                  </div>
                </div>
              )) : <p style={{ color:"var(--muted)",fontSize:".85rem" }}>No students assigned yet. Click "Add Student" to get started.</p>}
            </div>

            {/* Recent sessions */}
            <div className="sg-card">
              <h3 style={{ fontWeight:700,marginBottom:"1rem" }}>📝 Recent Sessions</h3>
              {stats?.recentSessions?.length ? stats.recentSessions.map((s,i) => (
                <div key={i} style={{ padding:".6rem 0",borderBottom:"1px solid var(--border)" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:".2rem" }}>
                    <span style={{ fontWeight:600,fontSize:".88rem" }}>{s.studentName}</span>
                    <span style={{ color:"var(--amber)",fontSize:".8rem" }}>{"★".repeat(s.rating||0)}</span>
                  </div>
                  <p style={{ color:"var(--blue)",fontSize:".8rem" }}>{s.topic}</p>
                  <p style={{ color:"var(--muted)",fontSize:".76rem" }}>{new Date(s.date).toLocaleDateString()} · {s.duration} min</p>
                </div>
              )) : <p style={{ color:"var(--muted)",fontSize:".85rem" }}>No sessions logged yet. Use "Log Session" above.</p>}
            </div>

            {/* Quick guide */}
            <div className="sg-card" style={{ gridColumn:"1/-1",background:"linear-gradient(135deg,rgba(159,122,234,.08),rgba(61,142,240,.08))" }}>
              <h3 style={{ fontWeight:700,marginBottom:".8rem",color:"var(--purple)" }}>🚀 Mentor Guide</h3>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"1rem" }}>
                {[
                  ["1. Add Students","Enter their email to add them to your mentee list. Each student earns you 10 points."],
                  ["2. Monitor Progress","Go to 'My Students' tab to see their skill level, points, and completion status."],
                  ["3. Log Sessions","After each session, log it with topic, duration, and rating to earn 20 points."],
                  ["4. Update Status","Mark students as 'active', 'completed', or 'dropped' and add private notes."],
                ].map(([t,d])=>(
                  <div key={t} style={{ background:"var(--bg2)",borderRadius:10,padding:".8rem" }}>
                    <p style={{ fontWeight:700,fontSize:".84rem",marginBottom:".3rem",color:"var(--blue)" }}>{t}</p>
                    <p style={{ color:"var(--muted)",fontSize:".8rem",lineHeight:1.5 }}>{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Students tab */}
        {tab === "students" && (
          <div>
            {students.length === 0 ? (
              <div className="sg-card" style={{ textAlign:"center",padding:"3rem" }}>
                <div style={{ fontSize:"3rem",marginBottom:".7rem" }}>👥</div>
                <p style={{ fontWeight:600,marginBottom:".4rem" }}>No students yet</p>
                <p style={{ color:"var(--muted)",marginBottom:"1rem",fontSize:".88rem" }}>Add students by their registered email address</p>
                <button onClick={()=>setShowAdd(true)} className="sg-btn sg-btn-primary">+ Add First Student</button>
              </div>
            ) : (
              <div style={{ display:"grid",gap:"1rem" }}>
                {students.map((s,i) => (
                  <div key={i} className="sg-card" style={{ display:"flex",gap:"1.2rem",flexWrap:"wrap",alignItems:"flex-start" }}>
                    <div className="sg-avatar" style={{ width:48,height:48,fontSize:"1.2rem",flexShrink:0 }}>{s.name?.[0]}</div>
                    <div style={{ flex:1,minWidth:200 }}>
                      <div style={{ display:"flex",gap:".5rem",alignItems:"center",flexWrap:"wrap",marginBottom:".4rem" }}>
                        <span style={{ fontWeight:700,fontSize:"1rem" }}>{s.name}</span>
                        <span style={{ color:LEVEL_C[s.level],fontSize:".78rem",fontWeight:600 }}>{s.level}</span>
                        <span className={`sg-tag sg-tag-${s.menteeStatus==="completed"?"green":s.menteeStatus==="dropped"?"red":"blue"}`} style={{ fontSize:".72rem" }}>
                          {s.menteeStatus}
                        </span>
                      </div>
                      <p style={{ color:"var(--muted)",fontSize:".82rem",marginBottom:".5rem" }}>{s.email} · {s.college}</p>
                      <div style={{ display:"flex",flexWrap:"wrap",gap:".3rem",marginBottom:".5rem" }}>
                        {s.skills?.slice(0,6).map(sk => <span key={sk} className="sg-tag sg-tag-blue" style={{ fontSize:".72rem" }}>{sk}</span>)}
                      </div>
                      {s.notes && <p style={{ color:"var(--muted)",fontSize:".8rem",fontStyle:"italic" }}>📝 {s.notes}</p>}
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:".5rem",minWidth:200 }}>
                      {[
                        ["Points",s.points||0,"var(--amber)"],
                        ["Streak",`${s.streak||0}d`,"var(--red)"],
                        ["Skills",s.skills?.length||0,"var(--blue)"],
                        ["Certs",s.certificates?.length||0,"var(--green)"],
                      ].map(([l,v,c])=>(
                        <div key={l} style={{ background:"var(--bg)",border:"1px solid var(--border)",borderRadius:8,padding:".4rem .6rem",textAlign:"center" }}>
                          <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,color:c,fontSize:"1.1rem" }}>{v}</div>
                          <div style={{ color:"var(--muted)",fontSize:".7rem" }}>{l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"flex",flexDirection:"column",gap:".4rem" }}>
                      <select value={s.menteeStatus} onChange={e=>updateStatus(s._id,e.target.value)}
                        style={{ background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:".35rem .6rem",color:"var(--text)",fontSize:".8rem",cursor:"pointer" }}>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="dropped">Dropped</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sessions tab */}
        {tab === "sessions" && (
          <div className="sg-card">
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:"1rem" }}>
              <h3 style={{ fontWeight:700 }}>📝 All Sessions ({mentor?.sessions?.length||0})</h3>
              <button onClick={()=>setShowSession(true)} className="sg-btn sg-btn-purple sg-btn-sm">+ Log Session</button>
            </div>
            {!mentor?.sessions?.length ? (
              <p style={{ color:"var(--muted)",textAlign:"center",padding:"2rem" }}>No sessions logged yet.</p>
            ) : (
              <div style={{ overflowX:"auto" }}>
                <table className="sg-table">
                  <thead><tr><th>Student</th><th>Topic</th><th>Date</th><th>Duration</th><th>Rating</th><th>Feedback</th></tr></thead>
                  <tbody>
                    {[...(mentor.sessions||[])].sort((a,b)=>new Date(b.date)-new Date(a.date)).map((s,i)=>(
                      <tr key={i}>
                        <td style={{ fontWeight:600 }}>{s.studentName}</td>
                        <td style={{ color:"var(--blue)" }}>{s.topic}</td>
                        <td style={{ color:"var(--muted)" }}>{new Date(s.date).toLocaleDateString()}</td>
                        <td>{s.duration} min</td>
                        <td style={{ color:"var(--amber)" }}>{"★".repeat(s.rating||0)}</td>
                        <td style={{ color:"var(--muted)",fontSize:".82rem" }}>{s.feedback||"—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Profile tab */}
        {tab === "profile" && <MentorProfile mentor={mentor} onUpdate={(m)=>{setMentor(m);localStorage.setItem("sg_mentor",JSON.stringify(m));}} />}
      </div>

      {/* Add Student Modal */}
      {showAdd && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:"1rem" }}>
          <div className="sg-card" style={{ width:"100%",maxWidth:420 }}>
            <h3 style={{ fontWeight:700,marginBottom:"1rem" }}>+ Add Student</h3>
            {addError && <div style={{ color:"var(--red)",fontSize:".85rem",marginBottom:".8rem" }}>⚠️ {addError}</div>}
            <label className="sg-label">Student's Registered Email</label>
            <input value={addEmail} onChange={e=>setAddEmail(e.target.value)} placeholder="student@email.com" className="sg-input" style={{ marginBottom:".8rem" }} />
            <label className="sg-label">Private Notes (optional)</label>
            <textarea value={addNotes} onChange={e=>setAddNotes(e.target.value)} placeholder="Notes about this student..." className="sg-input" style={{ height:70,resize:"none",marginBottom:"1rem" }} />
            <div style={{ display:"flex",gap:".6rem",justifyContent:"flex-end" }}>
              <button onClick={()=>{setShowAdd(false);setAddError("");}} className="sg-btn sg-btn-outline">Cancel</button>
              <button onClick={addStudent} disabled={addLoading} className="sg-btn sg-btn-primary">{addLoading?"Adding...":"Add Student"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Log Session Modal */}
      {showSession && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:"1rem" }}>
          <div className="sg-card" style={{ width:"100%",maxWidth:420 }}>
            <h3 style={{ fontWeight:700,marginBottom:"1rem" }}>📝 Log Mentorship Session</h3>
            <label className="sg-label">Student Name</label>
            <input value={session.studentName} onChange={e=>setSession(s=>({...s,studentName:e.target.value}))} placeholder="Student's name" className="sg-input" style={{ marginBottom:".8rem" }} />
            <label className="sg-label">Topic Discussed</label>
            <input value={session.topic} onChange={e=>setSession(s=>({...s,topic:e.target.value}))} placeholder="e.g. Resume Review, DSA practice" className="sg-input" style={{ marginBottom:".8rem" }} />
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:".8rem",marginBottom:".8rem" }}>
              <div><label className="sg-label">Duration (min)</label>
                <input value={session.duration} onChange={e=>setSession(s=>({...s,duration:+e.target.value}))} type="number" className="sg-input" /></div>
              <div><label className="sg-label">Rating (1-5)</label>
                <select value={session.rating} onChange={e=>setSession(s=>({...s,rating:+e.target.value}))} style={{ width:"100%",background:"var(--bg)",border:"1px solid var(--border)",borderRadius:10,padding:".7rem",color:"var(--text)" }}>
                  {[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}</select></div>
            </div>
            <label className="sg-label">Feedback (optional)</label>
            <textarea value={session.feedback} onChange={e=>setSession(s=>({...s,feedback:e.target.value}))} placeholder="Notes on the session..." className="sg-input" style={{ height:70,resize:"none",marginBottom:"1rem" }} />
            <div style={{ display:"flex",gap:".6rem",justifyContent:"flex-end" }}>
              <button onClick={()=>setShowSession(false)} className="sg-btn sg-btn-outline">Cancel</button>
              <button onClick={logSession} className="sg-btn sg-btn-primary">Save Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MentorProfile({ mentor, onUpdate }) {
  const [form, setForm] = useState({ bio:mentor?.bio||"",company:mentor?.company||"",designation:mentor?.designation||"",skills:(mentor?.skills||[]).join(", "),linkedin:mentor?.linkedin||"",github:mentor?.github||"",sessionDays:(mentor?.sessionDays||[]).join(", "),sessionTime:mentor?.sessionTime||"" });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const save = async () => {
    setSaving(true);
    try {
      const r = await mentorAPI.updateProfile({ ...form, skills: form.skills.split(",").map(s=>s.trim()).filter(Boolean), sessionDays: form.sessionDays.split(",").map(s=>s.trim()).filter(Boolean) });
      onUpdate(r.data.mentor);
      alert("✅ Profile updated!");
    } catch { alert("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await mentorAPI.updateProfile({ avatar: reader.result });
        onUpdate({ ...mentor, avatar: reader.result });
      } catch {}
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display:"grid",gridTemplateColumns:"280px 1fr",gap:"1.5rem" }}>
      <div className="sg-card" style={{ textAlign:"center" }}>
        <div style={{ position:"relative",display:"inline-block",marginBottom:"1rem" }}>
          {mentor?.avatar ? (
            <img src={mentor.avatar} alt="avatar" style={{ width:90,height:90,borderRadius:"50%",objectFit:"cover",border:"3px solid var(--purple)" }} />
          ) : (
            <div className="sg-avatar" style={{ width:90,height:90,fontSize:"2rem",margin:"0 auto" }}>{mentor?.name?.[0]}</div>
          )}
          <button onClick={()=>fileRef.current?.click()} style={{ position:"absolute",bottom:0,right:0,background:"var(--purple)",border:"none",borderRadius:"50%",width:26,height:26,cursor:"pointer",fontSize:".8rem" }}>✏️</button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatar} />
        <p style={{ fontWeight:700,marginBottom:".3rem" }}>{mentor?.name}</p>
        <p style={{ color:"var(--muted)",fontSize:".82rem",marginBottom:".4rem" }}>{mentor?.email}</p>
        <div style={{ marginTop:"1rem",display:"grid",gap:".4rem" }}>
          {[["🏆 Sessions",mentor?.totalSessions||0,"var(--purple)"],["👥 Mentees",mentor?.totalMentees||0,"var(--blue)"],["⭐ Avg Rating",(mentor?.avgRating||0)+"★","var(--amber)"],["🎯 Points",mentor?.points||0,"var(--green)"]].map(([l,v,c])=>(
            <div key={l} style={{ display:"flex",justifyContent:"space-between",padding:".3rem .6rem",background:"var(--bg)",borderRadius:8,fontSize:".82rem" }}>
              <span style={{ color:"var(--muted)" }}>{l}</span>
              <span style={{ color:c,fontWeight:700 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sg-card">
        <h3 style={{ fontWeight:700,marginBottom:"1rem" }}>Edit Profile</h3>
        <div style={{ display:"grid",gap:".8rem" }}>
          {[["bio","Bio","","textarea"],["company","Company / Institution","Google / IIT Bombay"],["designation","Designation","Senior Engineer / Professor"],["skills","Skills (comma separated)","React, Node.js, ML"],["linkedin","LinkedIn URL","https://linkedin.com/in/..."],["github","GitHub URL","https://github.com/..."],["sessionDays","Available Days (comma separated)","Monday, Wednesday, Friday"],["sessionTime","Session Time","6PM-8PM IST"]].map(([k,l,ph,t])=>(
            <div key={k}><label className="sg-label">{l}</label>
              {t==="textarea"
                ? <textarea value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} className="sg-input" style={{ height:80,resize:"none" }} />
                : <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} className="sg-input" />}
            </div>
          ))}
          <button onClick={save} disabled={saving} className="sg-btn sg-btn-purple" style={{ width:"100%",justifyContent:"center",padding:"1rem" }}>
            {saving ? "Saving..." : "💾 Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
