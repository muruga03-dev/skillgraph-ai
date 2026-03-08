import React, { useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

const MOCK = [
  { _id:"l1", name:"Priya Sharma",    college:"IIT Bombay",       points:4200, level:"Expert",       streak:45, skills:["React","Node.js","AWS","ML"] },
  { _id:"l2", name:"Arjun Patel",     college:"IISc Bangalore",   points:3800, level:"Expert",       streak:38, skills:["Python","TensorFlow","NLP","Docker"] },
  { _id:"l3", name:"Sneha Reddy",     college:"NIT Warangal",     points:3100, level:"Expert",       streak:29, skills:["JavaScript","React","MongoDB"] },
  { _id:"l4", name:"Rahul Kumar",     college:"VIT Vellore",      points:2700, level:"Advanced",     streak:22, skills:["Java","Spring Boot","Kubernetes"] },
  { _id:"l5", name:"Ananya Iyer",     college:"BITS Pilani",      points:2300, level:"Advanced",     streak:18, skills:["ML","Python","SQL","Tableau"] },
  { _id:"l6", name:"Vikram Singh",    college:"IIT Delhi",        points:1900, level:"Advanced",     streak:15, skills:["Go","Docker","Kubernetes","AWS"] },
  { _id:"l7", name:"Meera Krishnan",  college:"Anna University",  points:1500, level:"Intermediate", streak:12, skills:["React","Python","MongoDB"] },
  { _id:"l8", name:"Karan Sharma",    college:"Manipal University",points:1200,level:"Intermediate", streak:9,  skills:["JavaScript","Node.js","MySQL"] },
  { _id:"l9", name:"Divya Nair",      college:"NSIT Delhi",       points:900,  level:"Intermediate", streak:7,  skills:["Python","Pandas","SQL"] },
  { _id:"l10",name:"Rohan Gupta",     college:"DTU Delhi",        points:650,  level:"Beginner",     streak:4,  skills:["HTML","CSS","JavaScript"] },
];

const MEDAL = ["🥇","🥈","🥉"];
const LEVEL_C = { Expert:"var(--amber)", Advanced:"var(--blue)", Intermediate:"var(--green)", Beginner:"var(--muted)" };

export default function Leaderboard() {
  const { user } = useAuth();
  const [board, setBoard] = useState(MOCK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.leaderboard()
      .then(r => { if (r.data.leaderboard?.length) setBoard([...r.data.leaderboard, ...MOCK].slice(0, 20)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const myRank = board.findIndex(u => u.name === user?.name) + 1;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", marginLeft:"220px" }}>
      <Sidebar/>
      <div style={{ maxWidth:800, margin:"0 auto", padding:"2rem 1.5rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <h1 className="sg-section-title" style={{ marginBottom:".3rem" }}>📊 Leaderboard</h1>
            <p style={{ color:"var(--muted)", fontSize:".9rem" }}>Top students ranked by points earned through skill analysis, challenges, and certificates.</p>
          </div>
          {myRank > 0 && (
            <div style={{ background:"rgba(61,142,240,.1)", border:"1px solid rgba(61,142,240,.3)", borderRadius:12, padding:"1rem 1.4rem", textAlign:"center" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.6rem", fontWeight:900, color:"var(--blue)" }}>#{myRank}</div>
              <div style={{ color:"var(--muted)", fontSize:".75rem" }}>Your Rank</div>
            </div>
          )}
        </div>

        {/* How to earn points */}
        <div style={{ background:"rgba(246,173,85,.05)", border:"1px solid rgba(246,173,85,.2)", borderRadius:12, padding:".9rem 1.2rem", marginBottom:"1.5rem", display:"flex", flexWrap:"wrap", gap:"1rem" }}>
          <p style={{ color:"var(--amber)", fontWeight:600, fontSize:".85rem" }}>⭐ Earn points:</p>
          {[["Run analysis","+10"],["Complete challenge","+100-500"],["Upload cert","+20"],["Post in community","+5"],["Complete skill","+50"]].map(([a,p])=>(
            <span key={a} style={{ fontSize:".78rem", color:"var(--muted)" }}>{a} <strong style={{ color:"var(--amber)" }}>{p}</strong></span>
          ))}
        </div>

        {/* Top 3 podium */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1.1fr 1fr", gap:"1rem", marginBottom:"1.5rem" }}>
          {[board[1], board[0], board[2]].map((u, i) => u && (
            <div key={u._id} className="sg-card" style={{ textAlign:"center", padding:"1.5rem 1rem", borderColor: i===1?"rgba(246,173,85,.4)":"var(--border)", transform: i===1?"scale(1.05)":"none", background: i===1?"linear-gradient(135deg,rgba(246,173,85,.1),rgba(246,173,85,.05))":"var(--card-bg)" }}>
              <div style={{ fontSize:"2rem", marginBottom:".4rem" }}>{[MEDAL[1],MEDAL[0],MEDAL[2]][i]}</div>
              <div className="sg-avatar" style={{ width:44, height:44, fontSize:"1.1rem", margin:"0 auto .6rem" }}>{u.name?.[0]}</div>
              <div style={{ fontWeight:700, fontSize:".88rem", marginBottom:".2rem" }}>{u.name.split(" ")[0]}</div>
              <div style={{ color:"var(--muted)", fontSize:".74rem", marginBottom:".4rem" }}>{u.college?.split(" ")[0]}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.4rem", fontWeight:900, color:"var(--amber)" }}>{u.points?.toLocaleString()}</div>
              <div style={{ color:"var(--muted)", fontSize:".72rem" }}>points</div>
            </div>
          ))}
        </div>

        {/* Full Table */}
        <div className="sg-card" style={{ overflow:"auto" }}>
          <table className="sg-table" style={{ width:"100%" }}>
            <thead>
              <tr><th>#</th><th>Student</th><th>Level</th><th>Skills</th><th style={{ textAlign:"right" }}>🔥 Streak</th><th style={{ textAlign:"right" }}>⭐ Points</th></tr>
            </thead>
            <tbody>
              {board.map((u, i) => {
                const isMe = u.name === user?.name;
                return (
                  <tr key={u._id} style={{ background: isMe ? "rgba(61,142,240,.05)" : "transparent" }}>
                    <td><span style={{ fontWeight:700, color: i<3?"var(--amber)":"var(--muted)" }}>{i < 3 ? MEDAL[i] : i+1}</span></td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:".5rem" }}>
                        <div className="sg-avatar" style={{ width:28, height:28, fontSize:".75rem" }}>{u.name?.[0]}</div>
                        <div>
                          <p style={{ fontWeight: isMe?700:500, fontSize:".88rem" }}>{u.name}{isMe?" (you)":""}</p>
                          <p style={{ color:"var(--muted)", fontSize:".73rem" }}>{u.college}</p>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ color:LEVEL_C[u.level], fontWeight:600, fontSize:".8rem" }}>{u.level}</span></td>
                    <td>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:".2rem" }}>
                        {u.skills?.slice(0,3).map(s => <span key={s} className="sg-tag" style={{ fontSize:".7rem", padding:".1rem .4rem" }}>{s}</span>)}
                      </div>
                    </td>
                    <td style={{ textAlign:"right", color:"var(--amber)", fontWeight:600 }}>{u.streak}d</td>
                    <td style={{ textAlign:"right", fontFamily:"'Syne',sans-serif", fontWeight:800, color:"var(--green)" }}>{u.points?.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
