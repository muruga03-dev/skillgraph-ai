import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

const ML_BASE = "http://localhost:8000";
const DEPT_COLORS = {
  "Engineering":         "var(--blue)",
  "AI & Data":           "var(--purple)",
  "Cloud & Infrastructure":"var(--blue)",
  "Mobile":              "var(--green)",
  "Security":            "var(--red)",
  "Design":              "var(--amber)",
  "AI Research":         "var(--purple)",
  "Analytics":           "var(--blue)",
  "Database":            "var(--green)",
  "Gaming":              "var(--amber)",
  "Embedded & IoT":      "var(--muted)",
  "Architecture":        "var(--blue)",
  "Fintech":             "var(--green)",
  "Web3":                "var(--purple)",
  "QA & Testing":        "var(--amber)",
  "Management":          "var(--blue)",
  "Product":             "var(--green)",
  "Marketing":           "var(--amber)",
  "Networking":          "var(--muted)",
  "Emerging Tech":       "var(--purple)",
  "Content":             "var(--muted)",
  "Robotics":            "var(--red)",
  "Enterprise":          "var(--blue)",
};

export default function Departments() {
  const [depts, setDepts]     = useState({});
  const [deptList, setDeptList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [roles, setRoles]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [search, setSearch]   = useState("");
  const [totalRoles, setTotalRoles] = useState(0);

  useEffect(() => {
    fetch(`${ML_BASE}/departments`)
      .then(r => r.json())
      .then(d => {
        setDeptList(d.departments || []);
        setDepts(d.data || {});
        setTotalRoles(d.total_roles || 0);
      })
      .catch(() => {
        // Fallback static data if ML service not running
        const fallback = {
          "Engineering": { count: 4, roles: [{ job_role:"Full Stack Developer",avg_salary_usd:"$95k-$130k",avg_salary_inr:"Rs.12L-28L",demand_level:"High",months_to_learn:12 }] },
          "AI & Data":   { count: 5, roles: [{ job_role:"Data Scientist",avg_salary_usd:"$100k-$140k",avg_salary_inr:"Rs.14L-32L",demand_level:"High",months_to_learn:18 }] },
        };
        setDepts(fallback);
        setDeptList(Object.keys(fallback));
      })
      .finally(() => setLoading(false));
  }, []);

  const selectDept = async (dept) => {
    setSelected(dept);
    setRoleLoading(true);
    try {
      const r = await fetch(`${ML_BASE}/roles-by-dept/${encodeURIComponent(dept)}`);
      const d = await r.json();
      setRoles(d.roles || []);
    } catch {
      setRoles(depts[dept]?.roles || []);
    } finally { setRoleLoading(false); }
  };

  const DEMAND_C = { "Very High": "var(--red)", "High": "var(--amber)", "Medium": "var(--green)", "Low": "var(--muted)" };

  const filteredDepts = deptList.filter(d =>
    d.toLowerCase().includes(search.toLowerCase()) ||
    (depts[d]?.roles || []).some(r => r.job_role?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <Sidebar/>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>

        <h1 className="sg-section-title" style={{ marginBottom: ".4rem" }}>🏢 All Career Departments</h1>
        <p style={{ color: "var(--muted)", fontSize: ".9rem", marginBottom: "1.5rem" }}>
          Explore all <strong style={{ color: "var(--blue)" }}>{totalRoles}</strong> career roles across <strong style={{ color: "var(--purple)" }}>{deptList.length}</strong> departments.
          Trained on real-world ML dataset with salaries, skills, and demand levels.
        </p>

        {/* Search */}
        <div style={{ marginBottom: "1.5rem" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search departments or roles..."
            className="sg-input" style={{ maxWidth: 400 }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "300px 1fr" : "repeat(auto-fill,minmax(220px,1fr))", gap: "1rem", transition: "all .3s" }}>

          {/* Department cards */}
          <div style={selected ? { display:"grid",gap:".6rem",alignContent:"start" } : { display:"contents" }}>
            {loading ? (
              <div style={{ textAlign:"center",padding:"3rem",gridColumn:"1/-1" }}><div className="spinner" style={{ margin:"0 auto" }}/></div>
            ) : filteredDepts.map(dept => {
              const color = DEPT_COLORS[dept] || "var(--blue)";
              const count = depts[dept]?.count || 0;
              const isSelected = selected === dept;
              return (
                <div key={dept} onClick={() => selectDept(dept)} className="sg-card"
                  style={{ cursor:"pointer", borderColor: isSelected ? color : "var(--border)", background: isSelected ? `${color}08` : undefined, transition:"all .2s" }}
                  onMouseEnter={e => { if(!isSelected) e.currentTarget.style.borderColor = color; }}
                  onMouseLeave={e => { if(!isSelected) e.currentTarget.style.borderColor = "var(--border)"; }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:".4rem" }}>
                    <span style={{ fontWeight:700,fontSize:selected?".88rem":"1rem" }}>{dept}</span>
                    <span style={{ background:`${color}15`,color,border:`1px solid ${color}30`,borderRadius:20,padding:".12rem .5rem",fontSize:".75rem",fontWeight:700 }}>{count}</span>
                  </div>
                  {!selected && (
                    <p style={{ color:"var(--muted)",fontSize:".78rem" }}>
                      {(depts[dept]?.roles || []).slice(0,2).map(r=>r.job_role).join(", ")}
                      {count > 2 ? ` +${count-2} more` : ""}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Role detail panel */}
          {selected && (
            <div className="fade-up">
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem" }}>
                <h2 style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.3rem" }}>
                  {selected} <span style={{ color:"var(--muted)",fontWeight:400,fontSize:"1rem" }}>({roles.length} roles)</span>
                </h2>
                <button onClick={() => { setSelected(null); setRoles([]); }} className="sg-btn sg-btn-outline sg-btn-sm">✕ Close</button>
              </div>

              {roleLoading ? (
                <div style={{ textAlign:"center",padding:"2rem" }}><div className="spinner" style={{ margin:"0 auto" }}/></div>
              ) : (
                <div style={{ display:"grid",gap:".8rem" }}>
                  {roles.map((role, i) => {
                    const color = DEPT_COLORS[selected] || "var(--blue)";
                    const skills = typeof role.required_skills === "string"
                      ? role.required_skills.split(",").map(s=>s.trim())
                      : role.required_skills || [];
                    return (
                      <div key={i} className="sg-card" style={{ borderLeft:`3px solid ${color}` }}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:".8rem",marginBottom:".6rem" }}>
                          <div>
                            <h3 style={{ fontWeight:700,fontSize:"1rem",marginBottom:".2rem" }}>{role.job_role}</h3>
                            {role.description && <p style={{ color:"var(--muted)",fontSize:".82rem" }}>{role.description}</p>}
                          </div>
                          <span style={{ background:`rgba(56,226,154,.1)`,border:`1px solid rgba(56,226,154,.3)`,color:"var(--green)",borderRadius:8,padding:".2rem .7rem",fontSize:".78rem",fontWeight:600,whiteSpace:"nowrap" }}>
                            {role.months_to_learn} months to learn
                          </span>
                        </div>

                        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:".5rem",marginBottom:".7rem" }}>
                          {[
                            { l:"💵 Salary (USD)", v:role.avg_salary_usd },
                            { l:"₹ Salary (INR)",  v:role.avg_salary_inr },
                            { l:"📈 Demand",       v:role.demand_level, c:DEMAND_C[role.demand_level] },
                          ].map(s => s.v && (
                            <div key={s.l} style={{ background:"var(--bg)",border:"1px solid var(--border)",borderRadius:8,padding:".4rem .7rem" }}>
                              <p style={{ color:"var(--muted)",fontSize:".7rem" }}>{s.l}</p>
                              <p style={{ fontWeight:600,fontSize:".85rem",color:s.c||"var(--text)" }}>{s.v}</p>
                            </div>
                          ))}
                        </div>

                        <div>
                          <p style={{ color:"var(--muted)",fontSize:".75rem",marginBottom:".4rem",fontWeight:500 }}>REQUIRED SKILLS</p>
                          <div style={{ display:"flex",flexWrap:"wrap",gap:".3rem" }}>
                            {skills.map(s => <span key={s} className="sg-tag sg-tag-blue" style={{ fontSize:".74rem" }}>{s}</span>)}
                          </div>
                        </div>

                        {role.career_path && (
                          <div style={{ marginTop:".6rem",padding:".5rem .7rem",background:"var(--bg)",border:"1px solid var(--border)",borderRadius:8 }}>
                            <p style={{ color:"var(--muted)",fontSize:".7rem",marginBottom:".2rem" }}>CAREER PATH</p>
                            <p style={{ fontSize:".8rem",color:"var(--blue)" }}>{role.career_path}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
