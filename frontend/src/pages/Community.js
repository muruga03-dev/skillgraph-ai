import React, { useState, useEffect } from "react";
import { communityAPI, authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

const MOCK_POSTS = [
  { _id: "p1", author: { name: "Priya S.", level: "Expert", college: "IIT Bombay" }, type: "achievement", content: "🎉 Just got placed at Google as SDE! After 6 months of preparation using this platform's roadmap and daily DSA practice. Thank you all for the support! Key: 150+ LeetCode problems + system design prep.", tags: ["placement", "google", "dsa"], likes: ["u1","u2","u3"], comments: [{author:{name:"Arjun"},text:"Congratulations!! Inspiring 🎉"}], createdAt: new Date(Date.now()-3600000) },
  { _id: "p2", author: { name: "Rahul K.", level: "Intermediate", college: "NIT Warangal" }, type: "question", content: "Anyone have tips for cracking Razorpay backend interview? I have React + Node.js background but worried about system design. What topics should I focus on for a backend role?", tags: ["razorpay", "interview", "backend"], likes: ["u1"], comments: [{author:{name:"Sneha"},text:"Focus on databases, caching (Redis), and API design!"}], createdAt: new Date(Date.now()-7200000) },
  { _id: "p3", author: { name: "Sneha R.", level: "Advanced", college: "BITS Pilani" }, type: "resource", content: "Sharing my ML interview preparation checklist for 2025:\n✅ Statistics & Probability basics\n✅ ML algorithms (Random Forest, XGBoost, Neural Nets)\n✅ Python + Pandas + scikit-learn\n✅ SQL for data analysis\n✅ 2-3 Kaggle competition notebooks\nGood luck everyone! 🚀", tags: ["machine-learning", "interview", "checklist"], likes: ["u1","u2","u3","u4","u5"], comments: [], createdAt: new Date(Date.now()-86400000) },
  { _id: "p4", author: { name: "Arjun P.", level: "Expert", college: "IISc Bangalore" }, type: "update", content: "Just completed the Deep Learning Specialization by Andrew Ng! 4 months, 5 courses, 50+ programming assignments. Highly recommend it for anyone wanting to get into AI/ML. Next goal: publish my first ML research paper 🎯", tags: ["deeplearning", "coursera", "achievement"], likes: ["u1","u2"], comments: [{author:{name:"Ravi"},text:"Great work! What was the hardest course?"}], createdAt: new Date(Date.now()-172800000) },
];

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("update");
  const [posting, setPosting] = useState(false);
  const [commentText, setCommentText] = useState({});
  const [showComment, setShowComment] = useState({});
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    communityAPI.feed()
      .then(r => { if (r.data.posts?.length) setPosts([...r.data.posts, ...MOCK_POSTS]); })
      .catch(() => {});
  }, []);

  const createPost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    try {
      const r = await communityAPI.post({ content, type: postType });
      setPosts(prev => [r.data.post, ...prev]);
      setContent("");
    } catch {
      const mock = { _id: "m" + Date.now(), author: { name: user?.name, level: user?.level, college: user?.college }, type: postType, content, tags: [], likes: [], comments: [], createdAt: new Date() };
      setPosts(prev => [mock, ...prev]);
      setContent("");
    } finally { setPosting(false); }
  };

  const like = async (postId) => {
    setPosts(prev => prev.map(p => p._id === postId
      ? { ...p, likes: p.likes?.includes("me") ? p.likes.filter(l => l !== "me") : [...(p.likes||[]), "me"] }
      : p));
    try { await communityAPI.like(postId); } catch {}
  };

  const addComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    setPosts(prev => prev.map(p => p._id === postId
      ? { ...p, comments: [...(p.comments||[]), { author: { name: user?.name }, text, createdAt: new Date() }] }
      : p));
    setCommentText(prev => ({ ...prev, [postId]: "" }));
    try { await communityAPI.comment(postId, text); } catch {}
  };

  const TYPE_COLORS = { achievement: "var(--amber)", question: "var(--blue)", resource: "var(--green)", update: "var(--purple)", job: "var(--red)" };
  const TYPE_ICONS  = { achievement: "🏆", question: "❓", resource: "📚", update: "💬", job: "💼" };

  const filteredPosts = filter === "all" ? posts : posts.filter(p => p.type === filter);
  const timeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return "just now"; if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`;
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <Sidebar/>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 className="sg-section-title" style={{ marginBottom: ".3rem" }}>👥 Student Community</h1>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem", fontSize: ".9rem" }}>Share achievements, ask questions, help peers. Like LinkedIn — but for students 🎓</p>

        {/* Post composer */}
        <div className="sg-card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: ".5rem", marginBottom: ".8rem", flexWrap: "wrap" }}>
            {Object.entries(TYPE_ICONS).map(([t, icon]) => (
              <button key={t} onClick={() => setPostType(t)} style={{ padding: ".3rem .7rem", borderRadius: 20, border: "none", cursor: "pointer", fontSize: ".78rem", fontFamily: "inherit", fontWeight: postType === t ? 700 : 400, transition: "all .2s",
                background: postType === t ? TYPE_COLORS[t] + "20" : "var(--bg3)",
                color: postType === t ? TYPE_COLORS[t] : "var(--muted)",
                border: postType === t ? `1px solid ${TYPE_COLORS[t]}40` : "1px solid var(--border)" }}>
                {icon} {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder={postType === "question" ? "Ask the community a question..." : postType === "achievement" ? "Share your achievement! 🎉" : postType === "resource" ? "Share a helpful resource..." : "What's on your mind?"}
            className="sg-input" style={{ height: 90, resize: "vertical", lineHeight: 1.5 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: ".6rem" }}>
            <span style={{ color: "var(--muted)", fontSize: ".78rem" }}>{content.length}/2000</span>
            <button onClick={createPost} disabled={posting || !content.trim()} className="sg-btn sg-btn-primary sg-btn-sm">
              {posting ? "Posting..." : "Post →"}
            </button>
          </div>
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: ".35rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {["all", "achievement", "question", "resource", "update"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: ".3rem .7rem", borderRadius: 20, border: "none", cursor: "pointer", fontSize: ".78rem", fontFamily: "inherit", fontWeight: 500,
              background: filter === f ? "var(--blue)" : "var(--bg3)",
              color: filter === f ? "#fff" : "var(--muted)",
              border: filter === f ? "none" : "1px solid var(--border)" }}>
              {f === "all" ? "All" : TYPE_ICONS[f] + " " + f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Posts */}
        {filteredPosts.map(p => (
          <div key={p._id} className="sg-card" style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".7rem" }}>
              <div style={{ display: "flex", gap: ".6rem", alignItems: "center" }}>
                <div className="sg-avatar" style={{ width: 36, height: 36, fontSize: ".9rem" }}>{p.author?.name?.[0]}</div>
                <div>
                  <span style={{ fontWeight: 700, fontSize: ".9rem" }}>{p.author?.name}</span>
                  <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
                    <span style={{ color: "var(--muted)", fontSize: ".74rem" }}>{p.author?.college}</span>
                    {p.author?.level && <span style={{ color: "var(--blue)", fontSize: ".72rem" }}>· {p.author.level}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: ".4rem", alignItems: "flex-start" }}>
                <span style={{ background: TYPE_COLORS[p.type] + "15", color: TYPE_COLORS[p.type], border: `1px solid ${TYPE_COLORS[p.type]}30`, borderRadius: 6, padding: ".1rem .5rem", fontSize: ".72rem", fontWeight: 600 }}>
                  {TYPE_ICONS[p.type]} {p.type}
                </span>
                <span style={{ color: "var(--muted)", fontSize: ".74rem", whiteSpace: "nowrap" }}>{timeAgo(p.createdAt)}</span>
              </div>
            </div>

            <p style={{ lineHeight: 1.65, fontSize: ".88rem", whiteSpace: "pre-line", marginBottom: ".7rem" }}>{p.content}</p>

            {p.tags?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem", marginBottom: ".7rem" }}>
                {p.tags.map(t => <span key={t} style={{ color: "var(--blue)", fontSize: ".75rem" }}>#{t}</span>)}
              </div>
            )}

            <div style={{ display: "flex", gap: "1rem", borderTop: "1px solid var(--border)", paddingTop: ".6rem", flexWrap: "wrap" }}>
              <button onClick={() => like(p._id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: ".35rem", color: p.likes?.includes("me") ? "var(--red)" : "var(--muted)", fontSize: ".82rem", fontFamily: "inherit", padding: ".2rem .5rem", borderRadius: 6 }}>
                {p.likes?.includes("me") ? "❤️" : "🤍"} {p.likes?.length || 0}
              </button>
              <button onClick={() => setShowComment(s => ({ ...s, [p._id]: !s[p._id] }))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: ".82rem", fontFamily: "inherit", padding: ".2rem .5rem", borderRadius: 6 }}>
                💬 {p.comments?.length || 0} comment{p.comments?.length !== 1 ? "s" : ""}
              </button>
            </div>

            {/* Comments */}
            {showComment[p._id] && (
              <div style={{ marginTop: ".8rem", borderTop: "1px solid var(--border)", paddingTop: ".8rem" }}>
                {p.comments?.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem" }}>
                    <div className="sg-avatar" style={{ width: 26, height: 26, fontSize: ".7rem", flexShrink: 0 }}>{c.author?.name?.[0]}</div>
                    <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: ".4rem .7rem", flex: 1 }}>
                      <span style={{ fontWeight: 600, fontSize: ".78rem", color: "var(--blue)" }}>{c.author?.name}</span>
                      <p style={{ fontSize: ".82rem", color: "var(--muted)", marginTop: ".1rem" }}>{c.text}</p>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: ".4rem", marginTop: ".5rem" }}>
                  <input value={commentText[p._id] || ""} onChange={e => setCommentText(prev => ({ ...prev, [p._id]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && addComment(p._id)}
                    placeholder="Write a comment..." className="sg-input sg-btn-sm" style={{ flex: 1, padding: ".4rem .8rem" }} />
                  <button onClick={() => addComment(p._id)} className="sg-btn sg-btn-primary sg-btn-sm">Send</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
