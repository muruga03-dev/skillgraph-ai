import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { analysisAPI } from "../services/api";
import Sidebar from "../components/Sidebar";

const QUICK_GROUPS = {
  "💻 CSE / Web":    ["JavaScript","Python","React","Node.js","TypeScript","MongoDB","SQL","Git","Docker","GraphQL"],
  "🧠 AI / Data":    ["Machine Learning","TensorFlow","PyTorch","Pandas","NumPy","Deep Learning","NLP","Scikit-learn","Statistics","Computer Vision"],
  "☁️ Cloud/DevOps": ["AWS","Azure","GCP","Kubernetes","Terraform","CI/CD","Linux","Jenkins","Ansible","Helm"],
  "📱 Mobile":       ["Flutter","Dart","Kotlin","Swift","React Native","Firebase","Android","iOS","SwiftUI","Jetpack Compose"],
  "⚡ ECE / EE":     ["MATLAB","VHDL","Verilog","Embedded C","FPGA","PCB Design","RTOS","ARM","Signal Processing","PLC"],
  "🔧 Mech/Civil":   ["AutoCAD","SolidWorks","ANSYS","CATIA","Six Sigma","FEA","STAAD Pro","Civil 3D","GIS","MATLAB"],
};

const STEPS = [
  { id:1, icon:"📄", label:"Resume Upload"    },
  { id:2, icon:"🔬", label:"NLP Extraction"   },
  { id:3, icon:"📊", label:"Match % Calc"     },
  { id:4, icon:"🤖", label:"ML Prediction"    },
  { id:5, icon:"🔍", label:"Skill Analysis"   },
  { id:6, icon:"🚀", label:"Next Steps"       },
];

const STEP_MSGS = [
  "Uploading resume…",
  "Extracting skills with NLP…",
  "Calculating match percentages…",
  "Running ML job prediction…",
  "Analysing skill gaps…",
  "Generating recommendations…",
];

/* ── Animated counter ring ─────────────────────────────────────── */
function ScoreRing({ pct }) {
  const r = 44, circ = 2 * Math.PI * r, size = 118;
  const col = pct >= 70 ? "#38e29a" : pct >= 45 ? "#f6ad55" : "#fc8181";
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    let raf; let t0;
    const run = ts => { if (!t0) t0 = ts; const p = Math.min((ts-t0)/1000,1); setAnim(Math.round(p*pct)); if (p<1) raf=requestAnimationFrame(run); };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [pct]);
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg3)" strokeWidth={9}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={9}
          strokeDasharray={circ} strokeDashoffset={circ*(1-anim/100)} strokeLinecap="round"
          style={{ transition:"stroke-dashoffset .04s" }}/>
      </svg>
      <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
        <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:"1.5rem",color:col,lineHeight:1 }}>{anim}%</span>
        <span style={{ fontSize:".6rem",color:"var(--muted)" }}>match</span>
      </div>
    </div>
  );
}

/* ── Step bar ───────────────────────────────────────────────────── */
function StepBar({ active }) {
  return (
    <div style={{ display:"flex",alignItems:"center",marginBottom:"1.8rem",overflowX:"auto",paddingBottom:4,gap:0 }}>
      {STEPS.map((s,i) => (
        <React.Fragment key={s.id}>
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:".3rem",flexShrink:0 }}>
            <div style={{
              width:46,height:46,borderRadius:"50%",display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:"1.05rem",fontWeight:700,transition:"all .4s",
              background: active>s.id ? "linear-gradient(135deg,#38e29a,#0891b2)"
                : active===s.id ? "linear-gradient(135deg,#3d8ef0,#9f7aea)"
                : "var(--bg3)",
              border: active>=s.id ? "none" : "1px solid var(--border)",
              boxShadow: active===s.id ? "0 0 18px rgba(61,142,240,.5)" : "none",
              animation: active===s.id ? "stepGlow 1.4s ease-in-out infinite" : "none",
            }}>
              {active>s.id ? "✓" : s.icon}
            </div>
            <span style={{ fontSize:".63rem",color:active>=s.id?"var(--text)":"var(--muted)",
              fontWeight:active===s.id?700:400,textAlign:"center",maxWidth:58,lineHeight:1.2 }}>
              {s.label}
            </span>
          </div>
          {i<STEPS.length-1 && (
            <div style={{ flex:1,height:2,minWidth:14,margin:"0 .25rem",marginBottom:18,borderRadius:2,
              background:active>s.id?"linear-gradient(90deg,#38e29a,#3d8ef0)":"var(--border)",
              transition:"background .5s" }}/>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── Skill pill ─────────────────────────────────────────────────── */
const PILL_STYLES = {
  blue:   ["rgba(61,142,240,.1)","rgba(61,142,240,.3)","var(--blue)"],
  green:  ["rgba(56,226,154,.08)","rgba(56,226,154,.3)","var(--green)"],
  red:    ["rgba(252,129,129,.08)","rgba(252,129,129,.3)","var(--red)"],
  amber:  ["rgba(246,173,85,.08)","rgba(246,173,85,.3)","var(--amber)"],
  purple: ["rgba(159,122,234,.1)","rgba(159,122,234,.3)","var(--purple)"],
};
function Pill({ label, variant="blue", onRemove, number }) {
  const [bg,bd,col] = PILL_STYLES[variant]||PILL_STYLES.blue;
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:".3rem",background:bg,
      border:`1px solid ${bd}`,borderRadius:20,padding:".22rem .7rem",fontSize:".8rem",color:col,fontWeight:600 }}>
      {number && <span style={{ opacity:.7 }}>{number}.</span>}
      {label}
      {onRemove && <button onClick={onRemove} style={{ background:"none",border:"none",cursor:"pointer",
        color:"var(--muted)",padding:0,lineHeight:1,fontSize:"1rem",marginLeft:2 }}>×</button>}
    </span>
  );
}

/* ── List row ───────────────────────────────────────────────────── */
function ListRow({ label, variant, index }) {
  const [bg,bd,col] = PILL_STYLES[variant]||PILL_STYLES.blue;
  return (
    <div style={{ display:"flex",alignItems:"center",gap:".55rem",padding:".38rem .7rem",
      background:bg,border:`1px solid ${bd}`,borderRadius:9,marginBottom:".3rem" }}>
      <span style={{ color:col,fontWeight:700,fontSize:".72rem",minWidth:14 }}>{index!=null?`${index+1}.`:"•"}</span>
      <span style={{ fontSize:".85rem",fontWeight:500 }}>{label}</span>
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────────────── */
export default function Analysis() {
  const nav = useNavigate();
  const fileRef = useRef(null);

  const [mode, setMode]         = useState("manual");
  const [input, setInput]       = useState("");
  const [skills, setSkills]     = useState([]);
  const [file, setFile]         = useState(null);
  const [group, setGroup]       = useState("💻 CSE / Web");
  const [activeStep, setStep]   = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [result, setResult]     = useState(null);

  const addSkill = s => {
    const sk = s.trim();
    if (sk && !skills.map(x=>x.toLowerCase()).includes(sk.toLowerCase())) setSkills(p=>[...p,sk]);
    setInput("");
  };

  const go = n => new Promise(r => setTimeout(()=>{setStep(n);r();}, 0));

  const runAnalysis = async () => {
    if (mode==="manual" && !skills.length) { setError("Add at least one skill."); return; }
    if (mode==="resume" && !file)          { setError("Upload a PDF resume first."); return; }
    setLoading(true); setError(""); setResult(null);

    try {
      await go(1);
      let finalSkills = [...skills];
      let mlData;

      if (mode==="resume") {
        await new Promise(r=>setTimeout(r,600)); await go(2);
        const r1 = await analysisAPI.resume(file);
        finalSkills = r1.data.extractedSkills || r1.data.skills || [];
        if (!finalSkills.length) { setError("No skills found in resume. Try a text-selectable PDF."); setLoading(false); setStep(0); return; }
        await new Promise(r=>setTimeout(r,400)); await go(3);
        mlData = r1.data.analysis;
      } else {
        await new Promise(r=>setTimeout(r,500)); await go(2);
        await new Promise(r=>setTimeout(r,500)); await go(3);
        const r1 = await analysisAPI.analyze(finalSkills);
        mlData = r1.data.analysis || r1.data;
      }

      await new Promise(r=>setTimeout(r,500)); await go(4);
      await new Promise(r=>setTimeout(r,600)); await go(5);
      await new Promise(r=>setTimeout(r,500)); await go(6);

      setResult({ ...mlData, _skills: finalSkills });
    } catch(e) {
      setError(e.response?.data?.message || "Analysis failed — ensure the ML service is running on port 8000.");
      setStep(0);
    } finally { setLoading(false); }
  };

  const reset = () => { setResult(null); setStep(0); setSkills([]); setFile(null); setError(""); };

  const top     = result?.top_match || result?.predictions?.[0];
  const pct     = Math.round(top?.match_percentage || (top?.match_score||0)*100 || 0);
  const preds   = result?.predictions || [];
  const matching= result?.analysis?.matching_skills || top?.matching_skills || [];
  const missing = result?.analysis?.missing_skills  || top?.missing_skills  || [];
  const nextSk  = (result?.learning_path||[]).slice(0,6).map(s=>s.skill||s);
  const altPaths= preds.slice(1,5).map(p=>p.job_role);
  const pctCol  = p => p>=70?"var(--green)":p>=45?"var(--amber)":"var(--red)";

  return (
    <div style={{ minHeight:"100vh",background:"var(--bg)",color:"var(--text)",marginLeft:"220px" }}>
      <style>{`
        @keyframes stepGlow{0%,100%{box-shadow:0 0 18px rgba(61,142,240,.5)}50%{box-shadow:0 0 32px rgba(61,142,240,.85)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .sec{animation:fadeUp .4s ease forwards}
        .sec:nth-child(1){animation-delay:.05s}
        .sec:nth-child(2){animation-delay:.12s}
        .sec:nth-child(3){animation-delay:.19s}
        .sec:nth-child(4){animation-delay:.26s}
        .sec:nth-child(5){animation-delay:.33s}
        .sec:nth-child(6){animation-delay:.40s}
        .sec:nth-child(7){animation-delay:.47s}
      `}</style>

      <Sidebar/>
      <div style={{ maxWidth:960,margin:"0 auto",padding:"2rem 1.5rem" }}>

        {/* Header */}
        <div style={{ marginBottom:"1.6rem" }}>
          <h1 className="sg-section-title">🔍 AI Skill Analyser</h1>
          <p style={{ color:"var(--muted)",fontSize:".9rem",marginTop:".3rem" }}>
            6-step AI pipeline · Resume upload or manual input · Predicts best job roles across all engineering branches
          </p>
        </div>

        {/* Step bar — always visible */}
        <StepBar active={activeStep}/>

        {/* ════════ INPUT PANEL (hidden when result shown) ════════ */}
        {!result && (
          <div className="sg-card" style={{ marginBottom:"1.5rem",borderColor:"rgba(61,142,240,.15)" }}>

            {/* Mode toggle */}
            <div style={{ display:"flex",gap:.4,marginBottom:"1.4rem",
              background:"var(--bg)",borderRadius:12,padding:4,border:"1px solid var(--border)" }}>
              {[["manual","✏️ Enter Skills Manually"],["resume","📄 Upload Resume PDF"]].map(([m,l])=>(
                <button key={m} onClick={()=>setMode(m)} style={{ flex:1,padding:".6rem",borderRadius:9,border:"none",
                  fontWeight:600,fontSize:".87rem",cursor:"pointer",fontFamily:"inherit",transition:"all .2s",
                  background:mode===m?"linear-gradient(135deg,var(--blue),var(--purple))":"transparent",
                  color:mode===m?"#fff":"var(--muted)" }}>{l}</button>
              ))}
            </div>

            {/* ── Manual ── */}
            {mode==="manual" && (
              <>
                <div style={{ display:"flex",gap:".5rem",marginBottom:"1rem" }}>
                  <input value={input} onChange={e=>setInput(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"||e.key===","){e.preventDefault();addSkill(input);}}}
                    placeholder='Type a skill and press Enter — e.g. "Python", "AutoCAD", "MATLAB"…'
                    className="sg-input" style={{ flex:1 }}/>
                  <button onClick={()=>addSkill(input)} className="sg-btn sg-btn-primary sg-btn-sm">Add</button>
                </div>

                {/* Branch quick-add */}
                <div style={{ marginBottom:"1rem" }}>
                  <div style={{ display:"flex",gap:".3rem",flexWrap:"wrap",marginBottom:".5rem" }}>
                    {Object.keys(QUICK_GROUPS).map(g=>(
                      <button key={g} onClick={()=>setGroup(g)} style={{ padding:".22rem .65rem",borderRadius:20,
                        border:"1px solid var(--border)",background:group===g?"rgba(61,142,240,.12)":"transparent",
                        color:group===g?"var(--blue)":"var(--muted)",fontSize:".73rem",fontWeight:600,
                        cursor:"pointer",transition:"all .15s",fontFamily:"inherit" }}>{g}</button>
                    ))}
                  </div>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:".3rem" }}>
                    {QUICK_GROUPS[group]
                      .filter(s=>!skills.map(x=>x.toLowerCase()).includes(s.toLowerCase()))
                      .map(s=>(
                        <button key={s} onClick={()=>addSkill(s)} style={{ background:"var(--bg3)",
                          color:"var(--muted)",border:"1px solid var(--border)",borderRadius:20,
                          padding:".18rem .6rem",fontSize:".76rem",cursor:"pointer",
                          transition:"all .15s",fontFamily:"inherit" }}
                          onMouseEnter={e=>{e.target.style.color="var(--blue)";e.target.style.borderColor="var(--blue)"}}
                          onMouseLeave={e=>{e.target.style.color="var(--muted)";e.target.style.borderColor="var(--border)"}}>
                          + {s}
                        </button>
                      ))}
                  </div>
                </div>

                {skills.length>0 && (
                  <div style={{ padding:".8rem 1rem",background:"var(--bg)",borderRadius:10,
                    border:"1px solid var(--border)",display:"flex",flexWrap:"wrap",gap:".4rem",minHeight:52,marginBottom:".6rem" }}>
                    {skills.map(s=><Pill key={s} label={s} variant="blue" onRemove={()=>setSkills(skills.filter(x=>x!==s))}/>)}
                  </div>
                )}
                {skills.length>0 && (
                  <p style={{ color:"var(--muted)",fontSize:".76rem",marginBottom:"1rem" }}>
                    {skills.length} skill{skills.length!==1?"s":""} added
                    <button onClick={()=>setSkills([])} style={{ color:"var(--red)",background:"none",border:"none",
                      cursor:"pointer",fontSize:".76rem",marginLeft:".6rem" }}>Clear all</button>
                  </p>
                )}
              </>
            )}

            {/* ── Resume upload ── */}
            {mode==="resume" && (
              <div onClick={()=>fileRef.current?.click()}
                style={{ border:`2px dashed ${file?"var(--green)":"rgba(61,142,240,.3)"}`,
                  borderRadius:14,padding:"2.5rem 1.5rem",textAlign:"center",cursor:"pointer",
                  background:file?"rgba(56,226,154,.04)":"rgba(61,142,240,.03)",
                  marginBottom:"1rem",transition:"all .2s" }}
                onDragOver={e=>e.preventDefault()}
                onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)setFile(f);}}>
                <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg"
                  style={{ display:"none" }} onChange={e=>setFile(e.target.files[0])}/>
                <div style={{ fontSize:"2.5rem",marginBottom:".8rem" }}>{file?"✅":"📤"}</div>
                {file?(
                  <><p style={{ fontWeight:700,color:"var(--green)",marginBottom:".3rem" }}>{file.name}</p>
                  <p style={{ color:"var(--muted)",fontSize:".82rem" }}>{(file.size/1024).toFixed(1)} KB · Click to change</p></>
                ):(
                  <><p style={{ fontWeight:600,marginBottom:".4rem" }}>Drop your resume or click to browse</p>
                  <p style={{ color:"var(--muted)",fontSize:".82rem" }}>PDF, PNG, JPG · NLP extracts all skills automatically</p></>
                )}
              </div>
            )}

            {error && (
              <div style={{ background:"rgba(252,129,129,.08)",border:"1px solid rgba(252,129,129,.25)",
                borderRadius:10,padding:".75rem 1rem",color:"var(--red)",fontSize:".85rem",marginBottom:"1rem" }}>
                ⚠️ {error}
              </div>
            )}

            {/* Analyse button */}
            <button onClick={runAnalysis} disabled={loading} className="sg-btn sg-btn-primary"
              style={{ width:"100%",justifyContent:"center",padding:"1rem",fontSize:".95rem" }}>
              {loading?(
                <span style={{ display:"flex",alignItems:"center",gap:".6rem" }}>
                  <div className="spinner" style={{ width:18,height:18,borderWidth:2 }}/>
                  {STEP_MSGS[Math.max(0,activeStep-1)]}
                </span>
              ):`🚀 Analyse${skills.length?` ${skills.length} Skills`:""}`}
            </button>
          </div>
        )}

        {/* ════════ RESULTS ════════ */}
        {result && top && (
          <>
            {/* Top bar */}
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
              marginBottom:"1.5rem",flexWrap:"wrap",gap:".8rem" }}>
              <button onClick={reset} className="sg-btn sg-btn-outline">← New Analysis</button>
              <span style={{ color:"var(--green)",fontWeight:600,fontSize:".88rem" }}>
                ✅ {result._skills?.length} skills processed · 6-step pipeline complete
              </span>
            </div>

            {/* ── STEP 1–2: Detected Skills ── */}
            <div className="sg-card sec" style={{ marginBottom:"1rem",borderColor:"rgba(61,142,240,.2)" }}>
              <div style={{ display:"flex",alignItems:"center",gap:".7rem",marginBottom:".9rem" }}>
                <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,var(--blue),var(--purple))",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem" }}>🔬</div>
                <div>
                  <p style={{ fontWeight:700,fontSize:".9rem" }}>
                    <span style={{ color:"var(--muted)",fontWeight:600 }}>Steps 1–2 · </span>Detected Skills
                  </p>
                  <p style={{ color:"var(--muted)",fontSize:".74rem" }}>
                    NLP extracted {result._skills?.length} technical skills from your {mode==="resume"?"resume":"input"}
                  </p>
                </div>
              </div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:".4rem" }}>
                {(result._skills||[]).map(s=><Pill key={s} label={s} variant="blue"/>)}
              </div>
            </div>

            {/* ── STEP 3–4: Top Prediction ── */}
            <div className="sg-card sec" style={{ marginBottom:"1rem",
              borderColor:"rgba(56,226,154,.25)",
              background:"linear-gradient(135deg,rgba(56,226,154,.04) 0%,rgba(61,142,240,.04) 100%)" }}>
              <div style={{ display:"flex",alignItems:"center",gap:".7rem",marginBottom:"1rem" }}>
                <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,var(--green),var(--blue))",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem" }}>🤖</div>
                <div>
                  <p style={{ fontWeight:700,fontSize:".9rem" }}>
                    <span style={{ color:"var(--muted)",fontWeight:600 }}>Steps 3–4 · </span>Top Job Role Prediction
                  </p>
                  <p style={{ color:"var(--muted)",fontSize:".74rem" }}>ML model trained on 67 roles · 25 departments</p>
                </div>
              </div>
              <div style={{ display:"flex",gap:"1.4rem",alignItems:"center",flexWrap:"wrap" }}>
                <ScoreRing pct={pct}/>
                <div style={{ flex:1 }}>
                  <h2 style={{ fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:"2rem",lineHeight:1.1,
                    background:"linear-gradient(135deg,var(--green),var(--blue))",
                    WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:".4rem" }}>
                    {top.job_role}
                  </h2>
                  {top.description&&<p style={{ color:"var(--muted)",fontSize:".85rem",marginBottom:".6rem",lineHeight:1.6 }}>{top.description}</p>}
                  <div style={{ display:"flex",gap:".5rem",flexWrap:"wrap",marginBottom:".4rem" }}>
                    {top.avg_salary_inr&&<span style={{ background:"rgba(246,173,85,.1)",border:"1px solid rgba(246,173,85,.3)",borderRadius:20,padding:".2rem .7rem",fontSize:".78rem",color:"var(--amber)" }}>💰 {top.avg_salary_inr}</span>}
                    {top.demand_level&&<span style={{ background:"rgba(56,226,154,.08)",border:"1px solid rgba(56,226,154,.3)",borderRadius:20,padding:".2rem .7rem",fontSize:".78rem",color:"var(--green)" }}>📈 {top.demand_level} demand</span>}
                    {top.department&&<span style={{ background:"rgba(61,142,240,.08)",border:"1px solid rgba(61,142,240,.3)",borderRadius:20,padding:".2rem .7rem",fontSize:".78rem",color:"var(--blue)" }}>🏢 {top.department}</span>}
                  </div>
                  {top.career_path&&<p style={{ color:"var(--muted)",fontSize:".77rem" }}>🗺️ {top.career_path}</p>}
                </div>
              </div>

              {/* Skill match % bar */}
              <div style={{ marginTop:"1rem",padding:".8rem 1rem",background:"rgba(0,0,0,.15)",borderRadius:10 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:".4rem" }}>
                  <span style={{ fontSize:".8rem",fontWeight:600 }}>Skill Match Percentage</span>
                  <span style={{ fontWeight:800,color:pctCol(pct),fontSize:".9rem" }}>{pct}%</span>
                </div>
                <div style={{ height:8,background:"var(--bg3)",borderRadius:4,overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${pct}%`,
                    background:`linear-gradient(90deg,${pctCol(pct)},var(--blue))`,
                    borderRadius:4,transition:"width 1.2s ease" }}/>
                </div>
              </div>
            </div>

            {/* ── All matches ── */}
            {preds.length>1&&(
              <div className="sg-card sec" style={{ marginBottom:"1rem" }}>
                <p style={{ fontWeight:700,marginBottom:"1rem",fontSize:".9rem" }}>📊 Skill Match % — All Predictions</p>
                {preds.map((p,i)=>{
                  const pc=Math.round(p.match_percentage||0);
                  return(
                    <div key={i} style={{ display:"flex",alignItems:"center",gap:".8rem",
                      padding:".5rem 0",borderBottom:"1px solid var(--border)" }}>
                      <span style={{ color:"var(--muted)",fontWeight:700,minWidth:22,fontSize:".8rem" }}>#{i+1}</span>
                      <span style={{ flex:1,fontWeight:600,fontSize:".87rem" }}>{p.job_role}</span>
                      {p.department&&<span style={{ color:"var(--muted)",fontSize:".72rem",minWidth:90,textAlign:"right" }}>{p.department}</span>}
                      <div style={{ width:110,height:6,background:"var(--bg3)",borderRadius:3,overflow:"hidden" }}>
                        <div style={{ height:"100%",width:`${pc}%`,background:`linear-gradient(90deg,${pctCol(pc)},var(--blue))`,borderRadius:3 }}/>
                      </div>
                      <span style={{ minWidth:36,textAlign:"right",fontWeight:700,color:pctCol(pc),fontSize:".9rem" }}>{pc}%</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── STEP 5: Relevant + Missing ── */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1rem" }}>
              <div className="sg-card sec" style={{ borderColor:"rgba(56,226,154,.2)" }}>
                <div style={{ display:"flex",alignItems:"center",gap:".6rem",marginBottom:".8rem" }}>
                  <div style={{ width:30,height:30,borderRadius:9,background:"rgba(56,226,154,.15)",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:".9rem" }}>✅</div>
                  <div>
                    <p style={{ fontWeight:700,fontSize:".88rem" }}>Relevant Skills</p>
                    <p style={{ color:"var(--muted)",fontSize:".72rem" }}>Skills you already have</p>
                  </div>
                </div>
                {matching.length?(
                  <div>{matching.map(s=><ListRow key={s} label={s} variant="green"/>)}</div>
                ):<p style={{ color:"var(--muted)",fontSize:".82rem" }}>Add more skills to see matches.</p>}
              </div>

              <div className="sg-card sec" style={{ borderColor:"rgba(252,129,129,.2)" }}>
                <div style={{ display:"flex",alignItems:"center",gap:".6rem",marginBottom:".8rem" }}>
                  <div style={{ width:30,height:30,borderRadius:9,background:"rgba(252,129,129,.12)",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:".9rem" }}>❌</div>
                  <div>
                    <p style={{ fontWeight:700,fontSize:".88rem" }}>Missing Skills</p>
                    <p style={{ color:"var(--muted)",fontSize:".72rem" }}>Required for this role</p>
                  </div>
                </div>
                {missing.length?(
                  <div>{missing.map(s=><ListRow key={s} label={s} variant="red"/>)}</div>
                ):<p style={{ color:"var(--muted)",fontSize:".82rem" }}>Great — no critical gaps!</p>}
              </div>
            </div>

            {/* ── STEP 6: Next Skills + Alt Paths ── */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1rem" }}>
              <div className="sg-card sec" style={{ borderColor:"rgba(246,173,85,.2)" }}>
                <div style={{ display:"flex",alignItems:"center",gap:".6rem",marginBottom:".8rem" }}>
                  <div style={{ width:30,height:30,borderRadius:9,background:"rgba(246,173,85,.12)",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:".9rem" }}>🚀</div>
                  <div>
                    <p style={{ fontWeight:700,fontSize:".88rem" }}>Next Skills to Learn</p>
                    <p style={{ color:"var(--muted)",fontSize:".72rem" }}>Prioritised learning path</p>
                  </div>
                </div>
                {(nextSk.length?nextSk:missing.slice(0,5)).map((s,i)=>(
                  <ListRow key={s} label={s} variant="amber" index={i}/>
                ))}
              </div>

              <div className="sg-card sec" style={{ borderColor:"rgba(159,122,234,.2)" }}>
                <div style={{ display:"flex",alignItems:"center",gap:".6rem",marginBottom:".8rem" }}>
                  <div style={{ width:30,height:30,borderRadius:9,background:"rgba(159,122,234,.12)",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:".9rem" }}>🌐</div>
                  <div>
                    <p style={{ fontWeight:700,fontSize:".88rem" }}>Alternative Career Paths</p>
                    <p style={{ color:"var(--muted)",fontSize:".72rem" }}>Other roles that suit your skills</p>
                  </div>
                </div>
                {altPaths.length?(
                  altPaths.map((role,i)=>(
                    <div key={role} onClick={()=>nav("/roadmap",{state:{role}})}
                      style={{ display:"flex",alignItems:"center",gap:".55rem",padding:".38rem .7rem",
                        background:"rgba(159,122,234,.05)",border:"1px solid rgba(159,122,234,.18)",
                        borderRadius:9,marginBottom:".3rem",cursor:"pointer",transition:"border-color .2s" }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(159,122,234,.45)"}
                      onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(159,122,234,.18)"}>
                      <span style={{ color:"var(--purple)",fontWeight:700,fontSize:".72rem",minWidth:14 }}>{i+1}.</span>
                      <span style={{ fontSize:".85rem",fontWeight:500,flex:1 }}>{role}</span>
                      <span style={{ color:"var(--muted)",fontSize:".8rem" }}>→</span>
                    </div>
                  ))
                ):<p style={{ color:"var(--muted)",fontSize:".82rem" }}>No alternates found.</p>}
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="sg-card sec" style={{ borderColor:"rgba(61,142,240,.15)" }}>
              <p style={{ fontWeight:700,marginBottom:"1rem",fontSize:".9rem" }}>🎯 What to do next?</p>
              <div style={{ display:"flex",gap:".7rem",flexWrap:"wrap" }}>
                <button onClick={()=>nav("/roadmap",{state:{role:top.job_role}})} className="sg-btn sg-btn-primary">
                  🗺️ View Roadmap
                </button>
                <button onClick={()=>nav("/study-plan")} className="sg-btn sg-btn-green">
                  📅 Study Plan
                </button>
                <button onClick={()=>nav("/jobs")} className="sg-btn sg-btn-outline">
                  💼 Browse Jobs
                </button>
                <button onClick={()=>nav("/interview")} className="sg-btn sg-btn-outline">
                  💡 Interview Prep
                </button>
                <button onClick={reset} className="sg-btn sg-btn-outline">
                  🔄 New Analysis
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
