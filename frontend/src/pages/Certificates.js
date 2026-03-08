import React, { useState } from "react";
import { analysisAPI, authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

export default function Certificates() {
  const { user, updateUser } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleOCR = async () => {
    if (!file) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await analysisAPI.certOCR(file);
      setResult(r.data);
    } catch (e) {
      setError(e.response?.data?.message || "OCR failed — make sure ML service is running with Tesseract installed.");
    } finally { setLoading(false); }
  };

  const saveCert = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await authAPI.addCert({
        title: result.certificate_title || file.name,
        skill: result.verified_skills?.[0] || "General",
        issuedBy: "Verified via AI OCR",
        points: result.points_awarded || 20,
      });
      const profile = await authAPI.profile();
      updateUser(profile.data.user);
      alert(`✅ Certificate saved! +${result.points_awarded || 20} points awarded!`);
      setResult(null); setFile(null);
    } catch { alert("Failed to save certificate."); }
    finally { setSaving(false); }
  };

  const certs = user?.certificates || [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <Sidebar/>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 className="sg-section-title" style={{ marginBottom: ".4rem" }}>📜 Certificate Verifier</h1>
        <p style={{ color: "var(--muted)", marginBottom: "2rem", fontSize: ".9rem" }}>
          Upload your course certificate (PDF or image). Our AI OCR reads it, extracts skills, and awards you points automatically.
        </p>

        {/* Upload Card */}
        <div className="sg-card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>Upload Certificate</h3>
          <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => setFile(e.target.files[0])} style={{ display: "none" }} id="cert-input" />
          <label htmlFor="cert-input" style={{ display: "block", padding: "2.5rem", border: "2px dashed var(--border)", borderRadius: 12, textAlign: "center", cursor: "pointer", marginBottom: "1rem", transition: "border-color .2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--purple)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
            {file ? (
              <><div style={{ fontSize: "2rem", marginBottom: ".4rem" }}>📄</div>
                <p style={{ color: "var(--green)", fontWeight: 600 }}>{file.name}</p>
                <p style={{ color: "var(--muted)", fontSize: ".8rem" }}>Click to change</p></>
            ) : (
              <><div style={{ fontSize: "2.5rem", marginBottom: ".6rem" }}>📜</div>
                <p style={{ fontWeight: 600, marginBottom: ".3rem" }}>Click to upload certificate</p>
                <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>Udemy, Coursera, Google, AWS, Infosys, NPTEL, etc.</p>
                <p style={{ color: "var(--muted)", fontSize: ".76rem", marginTop: ".3rem" }}>Supports PDF, PNG, JPG</p></>
            )}
          </label>
          {error && <div style={{ background: "rgba(252,129,129,.08)", border: "1px solid rgba(252,129,129,.3)", borderRadius: 8, padding: ".7rem 1rem", color: "var(--red)", fontSize: ".85rem", marginBottom: "1rem" }}>⚠️ {error}</div>}
          <button onClick={handleOCR} disabled={!file || loading} className="sg-btn sg-btn-purple" style={{ width: "100%", justifyContent: "center", padding: ".9rem" }}>
            {loading ? "🔍 Reading with AI OCR..." : "🔍 Verify Certificate"}
          </button>
        </div>

        {/* OCR Result */}
        {result && (
          <div className="sg-card fade-up" style={{ marginBottom: "1.5rem", borderColor: "rgba(159,122,234,.4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
              <h3 style={{ fontWeight: 700 }}>🔍 Verification Result</h3>
              <span style={{ background: "rgba(56,226,154,.1)", border: "1px solid rgba(56,226,154,.3)", borderRadius: 8, padding: ".3rem .8rem", color: "var(--green)", fontSize: ".8rem", fontWeight: 600 }}>
                Confidence: {result.confidence}
              </span>
            </div>
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "1rem", marginBottom: "1rem" }}>
              <p style={{ color: "var(--muted)", fontSize: ".75rem", marginBottom: ".3rem" }}>CERTIFICATE TITLE DETECTED</p>
              <p style={{ fontWeight: 600, fontSize: "1rem" }}>{result.certificate_title}</p>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: ".5rem", fontWeight: 500 }}>VERIFIED SKILLS EXTRACTED</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
                {result.verified_skills?.length
                  ? result.verified_skills.map(s => <span key={s} className="sg-tag sg-tag-green">✓ {s}</span>)
                  : <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>No recognizable skills detected — try a clearer image</span>}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
              <span style={{ color: "var(--amber)", fontWeight: 700, fontSize: "1rem" }}>⭐ +{result.points_awarded} points will be awarded</span>
              <button onClick={saveCert} disabled={saving} className="sg-btn sg-btn-green">
                {saving ? "Saving..." : "✅ Save to Profile"}
              </button>
            </div>
          </div>
        )}

        {/* My Certificates */}
        <div className="sg-card">
          <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>🗂 My Certificates ({certs.length})</h3>
          {certs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--muted)" }}>
              <div style={{ fontSize: "3rem", marginBottom: ".6rem" }}>📭</div>
              <p style={{ marginBottom: ".4rem" }}>No certificates yet.</p>
              <p style={{ fontSize: ".82rem" }}>Upload a Udemy, Coursera or any course certificate to get started!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: ".8rem" }}>
              {certs.map((c, i) => (
                <div key={i} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".6rem" }}>
                    <span style={{ fontSize: "1.5rem" }}>📜</span>
                    <span style={{ color: "var(--green)", fontSize: ".75rem", fontWeight: 600 }}>✓ Verified</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: ".9rem", marginBottom: ".3rem" }}>{c.title}</div>
                  <div style={{ color: "var(--blue)", fontSize: ".82rem", marginBottom: ".2rem" }}>🛠 Skill: {c.skill}</div>
                  <div style={{ color: "var(--muted)", fontSize: ".75rem", marginBottom: ".3rem" }}>Issued by: {c.issuedBy}</div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--amber)", fontSize: ".75rem" }}>+{c.points} pts</span>
                    <span style={{ color: "var(--muted)", fontSize: ".72rem" }}>{new Date(c.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div style={{ marginTop: "1.5rem", background: "rgba(61,142,240,.05)", border: "1px solid rgba(61,142,240,.2)", borderRadius: 12, padding: "1rem 1.2rem" }}>
          <p style={{ fontWeight: 600, marginBottom: ".5rem", color: "var(--blue)" }}>💡 Tips for best OCR results:</p>
          <p style={{ color: "var(--muted)", fontSize: ".82rem", lineHeight: 1.7 }}>
            • Upload the actual PDF from Udemy/Coursera (not a screenshot)<br />
            • Make sure text is clear and not blurry<br />
            • Each certificate earns you points which boost your leaderboard ranking
          </p>
        </div>
      </div>
    </div>
  );
}
