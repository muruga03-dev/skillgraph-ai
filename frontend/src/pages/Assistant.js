import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const STARTERS = [
  "How do I become a Data Scientist?",
  "What skills are trending in 2025?",
  "How to prepare for a Google interview?",
  "Difference between React and Angular?",
  "What is a good salary for a fresher developer?",
  "How long does it take to learn Machine Learning?",
];

const SYSTEM_PROMPT = `You are SkillGraph AI — a friendly and knowledgeable career guidance assistant for Computer Science students and fresh graduates.

You help students with:
- Career path advice
- Skill gap analysis
- Interview preparation
- Trending technologies
- Resume and LinkedIn tips
- Internship and job search strategies

Give practical advice using bullet points when possible.
Mention Indian companies like TCS, Infosys, Flipkart, Razorpay when relevant.
Mention salary in ₹ INR and USD.`;

export default function Assistant() {

  const { user } = useAuth();

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi ${user?.name?.split(" ")[0] || "there"}! 👋 I'm your AI Career Assistant.\n\nAsk me anything about careers, skills, interviews, or tech jobs.`,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {

    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput("");
    setError("");

    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {

      const response = await fetch(
        "https://skillgraph-backend.onrender.com/api/ai/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            system: SYSTEM_PROMPT,
            messages: newMessages
          })
        }
      );

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();

      const reply =
        data.reply ||
        data.message ||
        data.choices?.[0]?.message?.content ||
        "⚠️ AI returned empty response";

      setMessages([
        ...newMessages,
        { role: "assistant", content: reply }
      ]);

    } catch (err) {

      console.error(err);

      setError("⚠️ AI request failed");

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "⚠️ AI request failed. Please try again."
        }
      ]);

    } finally {

      setLoading(false);

    }
  };

  const formatMsg = (text) => {
    return text.split("\n").map((line, i) => {

      if (line.startsWith("- ") || line.startsWith("• "))
        return (
          <p key={i} style={{ margin: "0 0 .2rem", paddingLeft: "1rem" }}>
            • {line.slice(2)}
          </p>
        );

      if (line === "") return <br key={i} />;

      return <p key={i}>{line}</p>;
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--text)",
      display: "flex",
      flexDirection: "column"
    }}>

      <Sidebar />

      <div style={{
        maxWidth: 800,
        width: "100%",
        margin: "0 auto",
        padding: "1.5rem",
        flex: 1,
        display: "flex",
        flexDirection: "column"
      }}>

        <h1 className="sg-section-title">🤖 AI Career Assistant</h1>

        {messages.length <= 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                style={{
                  background: "var(--bg3)",
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                  padding: ".35rem .8rem",
                  fontSize: ".78rem",
                  cursor: "pointer"
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div style={{
          flex: 1,
          overflowY: "auto",
          marginTop: "1rem",
          marginBottom: "1rem"
        }}>

          {messages.map((m, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: "1rem"
            }}>
              <div style={{
                background: m.role === "user" ? "var(--blue)" : "var(--bg3)",
                color: m.role === "user" ? "#fff" : "var(--text)",
                padding: ".6rem 1rem",
                borderRadius: 12,
                maxWidth: "80%"
              }}>
                {m.role === "assistant"
                  ? formatMsg(m.content)
                  : m.content}
              </div>
            </div>
          ))}

          {loading && <p>🤖 Thinking...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          <div ref={bottomRef} />

        </div>

        <div style={{ display: "flex", gap: ".6rem" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about careers, skills, interviews..."
            style={{
              flex: 1,
              padding: ".6rem",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--bg2)",
              color: "var(--text)"
            }}
          />

          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="sg-btn sg-btn-primary"
          >
            Send →
          </button>
        </div>

      </div>
    </div>
  );
}