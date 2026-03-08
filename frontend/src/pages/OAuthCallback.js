import { apiFetch } from "../services/api";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthCallback() {
  const [params]  = useSearchParams();
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [status, setStatus] = useState("Completing sign-in…");
  const [error, setError]   = useState("");

  useEffect(() => {
    const token = params.get("token");
    const err   = params.get("error");

    if (err) {
      const msg = err === "oauth_not_configured"
        ? "OAuth credentials not configured on server."
        : "Please try again or use email/password.";
      setError("OAuth sign-in failed. " + msg);
      setTimeout(() => navigate("/login"), 3500);
      return;
    }
    if (!token) {
      setError("No token received. Redirecting to login…");
      setTimeout(() => navigate("/login"), 2500);
      return;
    }

    setStatus("Fetching your profile…");

    // Pass token explicitly in header — localStorage is empty until login() is called
    apiFetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (data.user) {
          login(data.user, token);   // now save token + user to localStorage
          setStatus("Success! Redirecting…");
          setTimeout(() => navigate("/dashboard"), 600);
        } else {
          throw new Error("No user data");
        }
      })
      .catch(e => {
        console.error("OAuth callback error:", e);
        setError("Sign-in failed. Please try again.");
        setTimeout(() => navigate("/login"), 2500);
      });
  }, []); // eslint-disable-line

  return (
    <div style={{ minHeight:"100vh", background:"#060d1a", display:"flex",
      alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign:"center", maxWidth:360, padding:"2rem" }}>
        <img src="/logo.jpeg" alt="SkillGraph AI" style={{ width:72, height:72,
          borderRadius:18, objectFit:"cover", marginBottom:"1.5rem",
          border:"2px solid rgba(61,142,240,.4)", display:"block", margin:"0 auto 1.5rem" }} />
        {error ? (
          <>
            <div style={{ fontSize:"2.5rem", marginBottom:".8rem" }}>⚠️</div>
            <h2 style={{ fontWeight:700, marginBottom:".6rem", color:"#fc8181" }}>Sign-in Failed</h2>
            <p style={{ color:"#5a7196", fontSize:".88rem", lineHeight:1.65 }}>{error}</p>
          </>
        ) : (
          <>
            <div style={{ width:44, height:44, border:"3px solid rgba(23,36,66,.9)",
              borderTopColor:"#3d8ef0", borderRadius:"50%",
              animation:"spin .8s linear infinite", margin:"0 auto 1.4rem" }} />
            <h2 style={{ fontWeight:700, marginBottom:".5rem", color:"#e2eaf7" }}>Signing you in…</h2>
            <p style={{ color:"#5a7196", fontSize:".88rem" }}>{status}</p>
          </>
        )}
      </div>
    </div>
  );
}
