import React, { useState, useEffect, useRef } from "react";
import { getSocket } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

const ROOMS = [
  { id: "general", name: "# General", desc: "Open chat for everyone" },
  { id: "dsa", name: "# DSA Help", desc: "Algorithms & data structures" },
  { id: "frontend", name: "# Frontend", desc: "React, HTML, CSS" },
  { id: "backend", name: "# Backend", desc: "Node.js, APIs, Databases" },
  { id: "ml", name: "# ML & AI", desc: "Machine Learning, Python" },
  { id: "jobs", name: "# Job Hunt", desc: "Placements, internships" },
  { id: "placement", name: "# Placement Prep", desc: "Interview tips" },
];

const MOCK_MESSAGES = {
  general: [
    { sender: { name: "Priya S.", _id: "x1" }, text: "Welcome everyone! Use this chat to connect with fellow students 🎓", createdAt: new Date(Date.now() - 3600000) },
    { sender: { name: "Rahul K.", _id: "x2" }, text: "Hey! I'm preparing for TCS interviews. Anyone else?", createdAt: new Date(Date.now() - 1800000) },
    { sender: { name: "Sneha R.", _id: "x3" }, text: "Yes! Just completed my first React project. Feeling confident now 😊", createdAt: new Date(Date.now() - 900000) },
  ],
  dsa: [
    { sender: { name: "Arjun P.", _id: "x4" }, text: "Anyone working on the Two Pointers pattern? It's used in so many problems!", createdAt: new Date(Date.now() - 1200000) },
    { sender: { name: "Meera K.", _id: "x5" }, text: "Yes! I solved 3 Sum using two pointers today. Much cleaner than brute force", createdAt: new Date(Date.now() - 600000) },
  ],
  frontend: [],
  backend: [],
  ml: [
    { sender: { name: "Arjun P.", _id: "x4" }, text: "Just finished Andrew Ng's ML course. Highly recommend for beginners!", createdAt: new Date(Date.now() - 5400000) },
  ],
  jobs: [],
  placement: [],
};

export default function Chat() {
  const { user } = useAuth();
  const [activeRoom, setActiveRoom] = useState("general");
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(12);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    socket.connect();

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join", { userId: user?._id || "guest" });
      socket.emit("join_room", { room: activeRoom });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("online_users", (users) => setOnlineCount(users.length || 12));

    socket.on("receive_message", (msg) => {
      setMessages(prev => ({ ...prev, [msg.room || activeRoom]: [...(prev[msg.room || activeRoom] || []), msg] }));
    });

    return () => { socket.off("receive_message"); socket.off("online_users"); socket.disconnect(); };
  }, []);

  useEffect(() => {
    socketRef.current?.emit("join_room", { room: activeRoom });
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeRoom]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = { room: activeRoom, text: input.trim(), senderId: user?._id };
    // Optimistic UI
    const localMsg = { sender: { name: user?.name || "You", _id: "me" }, text: input.trim(), createdAt: new Date() };
    setMessages(prev => ({ ...prev, [activeRoom]: [...(prev[activeRoom] || []), localMsg] }));
    socketRef.current?.emit("send_message", msg);
    setInput("");
  };

  const timeStr = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const msgs = messages[activeRoom] || [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", display: "flex", flexDirection: "column" }}>
      <Sidebar/>
      <div style={{ flex: 1, display: "flex", maxWidth: 1100, width: "100%", margin: "0 auto", padding: "1.5rem 1.5rem 0", gap: "1rem" }}>

        {/* Sidebar */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: ".8rem 1rem", borderBottom: "1px solid var(--border)" }}>
              <p style={{ fontWeight: 700, fontSize: ".85rem" }}>💬 Study Rooms</p>
              <p style={{ color: "var(--green)", fontSize: ".74rem" }}>● {onlineCount} online</p>
            </div>
            {ROOMS.map(r => (
              <button key={r.id} onClick={() => setActiveRoom(r.id)} style={{ width: "100%", padding: ".7rem 1rem", background: activeRoom === r.id ? "rgba(61,142,240,.1)" : "transparent", border: "none", borderLeft: activeRoom === r.id ? "3px solid var(--blue)" : "3px solid transparent", cursor: "pointer", textAlign: "left", transition: "all .15s" }}>
                <p style={{ fontWeight: 600, fontSize: ".84rem", color: activeRoom === r.id ? "var(--blue)" : "var(--text)" }}>{r.name}</p>
                <p style={{ color: "var(--muted)", fontSize: ".72rem" }}>{r.desc}</p>
              </button>
            ))}
          </div>
          <div style={{ marginTop: "1rem", background: "rgba(56,226,154,.05)", border: "1px solid rgba(56,226,154,.2)", borderRadius: 12, padding: ".8rem 1rem" }}>
            <p style={{ color: "var(--green)", fontWeight: 700, fontSize: ".82rem", marginBottom: ".3rem" }}>🔗 Connection</p>
            <p style={{ fontSize: ".75rem", color: connected ? "var(--green)" : "var(--muted)" }}>{connected ? "● Connected" : "○ Disconnected"}</p>
            <p style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: ".2rem" }}>Start the backend server for real-time chat</p>
          </div>
        </div>

        {/* Chat Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: ".9rem 1.2rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 700 }}>{ROOMS.find(r => r.id === activeRoom)?.name}</p>
              <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>{ROOMS.find(r => r.id === activeRoom)?.desc}</p>
            </div>
            <span style={{ color: "var(--green)", fontSize: ".78rem" }}>● {onlineCount} online</span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: ".6rem", minHeight: 0, maxHeight: "calc(100vh - 300px)" }}>
            {msgs.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--muted)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: ".5rem" }}>💬</div>
                <p>No messages yet. Be the first to say hi!</p>
              </div>
            )}
            {msgs.map((m, i) => {
              const isMe = m.sender?._id === "me" || m.sender?._id === user?._id;
              return (
                <div key={i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", gap: ".5rem" }}>
                  {!isMe && (
                    <div className="sg-avatar" style={{ width: 30, height: 30, fontSize: ".75rem", flexShrink: 0, alignSelf: "flex-end" }}>{m.sender?.name?.[0]}</div>
                  )}
                  <div style={{ maxWidth: "70%" }}>
                    {!isMe && <p style={{ fontSize: ".72rem", color: "var(--blue)", fontWeight: 600, marginBottom: ".2rem", paddingLeft: ".3rem" }}>{m.sender?.name}</p>}
                    <div className={isMe ? "chat-bubble chat-me" : "chat-bubble chat-other"}>{m.text}</div>
                    <p style={{ fontSize: ".68rem", color: "var(--muted)", marginTop: ".2rem", textAlign: isMe ? "right" : "left", paddingLeft: isMe ? 0 : ".3rem" }}>{timeStr(m.createdAt)}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: ".8rem 1rem", borderTop: "1px solid var(--border)", display: "flex", gap: ".5rem" }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder={`Message ${ROOMS.find(r => r.id === activeRoom)?.name}...`}
              className="sg-input" style={{ flex: 1 }} />
            <button onClick={sendMessage} disabled={!input.trim()} className="sg-btn sg-btn-primary" style={{ padding: ".6rem 1.2rem" }}>Send →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
