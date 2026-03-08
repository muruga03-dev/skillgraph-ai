import React, { useState, useEffect } from "react";
import { communityAPI } from "../services/api";
import Sidebar from "../components/Sidebar";

const TYPE_C = { webinar:"var(--blue)", career_talk:"var(--purple)", resume_review:"var(--green)", coding_session:"var(--amber)", qa:"var(--red)" };
const TYPE_L = { webinar:"🎙 Webinar", career_talk:"💼 Career Talk", resume_review:"📄 Resume Review", coding_session:"💻 Coding Session", qa:"❓ Q&A" };

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rsvped, setRsvped] = useState({});

  useEffect(() => {
    communityAPI.events()
      .then(r => setEvents(r.data.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const rsvp = async (id) => {
    setRsvped(prev => ({ ...prev, [id]: !prev[id] }));
    try { await communityAPI.rsvp(id); } catch {}
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { weekday:"short", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", marginLeft:"220px" }}>
      <Sidebar/>
      <div style={{ maxWidth:900, margin:"0 auto", padding:"2rem 1.5rem" }}>
        <h1 className="sg-section-title" style={{ marginBottom:".4rem" }}>🎯 Virtual Events</h1>
        <p style={{ color:"var(--muted)", marginBottom:"2rem", fontSize:".9rem" }}>Career talks, resume reviews, coding sessions, and live Q&A with industry professionals.</p>

        {loading ? (
          <div style={{ textAlign:"center", padding:"3rem" }}><div className="spinner" style={{ margin:"0 auto 1rem" }}/></div>
        ) : (
          <div style={{ display:"grid", gap:"1rem" }}>
            {events.map((e, i) => {
              const color = TYPE_C[e.type] || "var(--blue)";
              const joined = rsvped[e._id || i];
              return (
                <div key={e._id || i} className="sg-card" style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"1.5rem" }}
                  onMouseEnter={ev=>ev.currentTarget.style.borderColor=color}
                  onMouseLeave={ev=>ev.currentTarget.style.borderColor="var(--border)"}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:".5rem", marginBottom:".6rem", flexWrap:"wrap" }}>
                      <span style={{ background:color+"15", color, border:`1px solid ${color}30`, borderRadius:6, padding:".15rem .6rem", fontSize:".75rem", fontWeight:600 }}>
                        {TYPE_L[e.type] || e.type}
                      </span>
                      {new Date(e.date) < new Date(Date.now() + 48*3600000) && (
                        <span style={{ background:"rgba(252,129,129,.1)", color:"var(--red)", border:"1px solid rgba(252,129,129,.3)", borderRadius:6, padding:".15rem .6rem", fontSize:".75rem", fontWeight:600 }}>🔴 Soon</span>
                      )}
                    </div>
                    <h3 style={{ fontWeight:700, fontSize:"1.05rem", marginBottom:".4rem" }}>{e.title}</h3>
                    {e.description && <p style={{ color:"var(--muted)", fontSize:".85rem", marginBottom:".6rem", lineHeight:1.6 }}>{e.description}</p>}
                    <div style={{ display:"flex", flexWrap:"wrap", gap:".6rem" }}>
                      <span className="sg-tag" style={{ fontSize:".76rem" }}>📅 {fmtDate(e.date)}</span>
                      <span className="sg-tag" style={{ fontSize:".76rem" }}>⏱ {e.duration} min</span>
                      <span className="sg-tag" style={{ fontSize:".76rem" }}>👥 {e.maxAttendees || 100} max</span>
                    </div>
                    {e.skills?.length > 0 && (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:".3rem", marginTop:".5rem" }}>
                        {e.skills.map(s => <span key={s} className="sg-tag sg-tag-blue" style={{ fontSize:".74rem" }}>{s}</span>)}
                      </div>
                    )}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:".6rem", alignItems:"flex-end", minWidth:130 }}>
                    <button onClick={() => rsvp(e._id || String(i))} className={`sg-btn ${joined ? "sg-btn-outline" : "sg-btn-primary"}`} style={{ width:"100%", justifyContent:"center" }}>
                      {joined ? "✓ Registered" : "Register →"}
                    </button>
                    {e.meetLink && (
                      <a href={e.meetLink} target="_blank" rel="noreferrer" style={{ display:"block", width:"100%" }}>
                        <button className="sg-btn sg-btn-outline" style={{ width:"100%", justifyContent:"center", fontSize:".8rem" }}>📹 Join Link</button>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Host your own */}
        <div style={{ marginTop:"2rem", background:"rgba(159,122,234,.05)", border:"1px solid rgba(159,122,234,.2)", borderRadius:16, padding:"1.5rem", textAlign:"center" }}>
          <h3 style={{ fontWeight:700, marginBottom:".4rem", color:"var(--purple)" }}>🎤 Want to host an event?</h3>
          <p style={{ color:"var(--muted)", fontSize:".88rem", marginBottom:"1rem" }}>Share your knowledge with the community. Host a coding session, career talk, or study group.</p>
          <button className="sg-btn sg-btn-purple" onClick={() => alert("Event hosting coming soon! Contact us to host a community event.")}>Apply to Host</button>
        </div>
      </div>
    </div>
  );
}
