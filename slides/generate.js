#!/usr/bin/env node
"use strict";
const PptxGenJS = require("pptxgenjs");

const pres = new PptxGenJS();
pres.layout = "LAYOUT_16x9";
pres.title = "SkillGraph AI - Career Intelligence Platform";

// ── Color palette ──────────────────────────────────────────────────────────────
const C = {
  bg:     "060D1A",
  bg2:    "0B1528",
  bg3:    "0F1D36",
  border: "172442",
  blue:   "3D8EF0",
  purple: "9F7AEA",
  green:  "38E29A",
  amber:  "F6AD55",
  red:    "FC8181",
  white:  "E2EAF7",
  muted:  "5A7196",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const bg = (slide) => {
  slide.background = { color: C.bg };
};

const addBg = (slide) => {
  bg(slide);
  // top accent bar
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.blue } });
};

const title = (slide, text, y = 0.35, size = 36) => {
  slide.addText(text, {
    x: 0.5, y, w: 9, h: 0.65,
    fontSize: size, fontFace: "Georgia", bold: true, color: C.white, margin: 0,
  });
};

const subtitle = (slide, text, y = 1.05, color = C.muted) => {
  slide.addText(text, {
    x: 0.5, y, w: 9, h: 0.38,
    fontSize: 14, fontFace: "Calibri", color, margin: 0,
  });
};

const card = (slide, x, y, w, h, color = C.bg2) => {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: color },
    line: { color: C.border, width: 1 },
    shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.25 },
  });
};

const accentCard = (slide, x, y, w, h, accentColor = C.blue) => {
  card(slide, x, y, w, h);
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.05, h, fill: { color: accentColor }, line: { color: accentColor, width: 0 } });
};

const pill = (slide, text, x, y, color = C.blue) => {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 1.5, h: 0.26, fill: { color: C.bg3 }, line: { color: color, width: 1 }, rectRadius: 0.13 });
  slide.addText(text, { x, y, w: 1.5, h: 0.26, fontSize: 9, color, bold: true, align: "center", valign: "middle", fontFace: "Calibri", margin: 0 });
};

const statBox = (slide, x, y, value, label, color = C.blue) => {
  card(slide, x, y, 2.1, 1.0);
  slide.addText(value, { x, y: y + 0.1, w: 2.1, h: 0.52, fontSize: 32, fontFace: "Georgia", bold: true, color, align: "center", margin: 0 });
  slide.addText(label, { x, y: y + 0.65, w: 2.1, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.muted, align: "center", margin: 0 });
};

const progressBar = (slide, x, y, w, pct, color = C.blue) => {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.09, fill: { color: C.bg3 }, line: { color: C.border, width: 0 } });
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w: w * (pct / 100), h: 0.09, fill: { color: color }, line: { color: color, width: 0 } });
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — TITLE
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s);

  // Background gradient blocks
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.bg } });
  s.addShape(pres.shapes.RECTANGLE, { x: 6.5, y: 0, w: 3.5, h: 5.625, fill: { color: C.bg2 }, line: { color: C.border, width: 0 } });

  // Left accent
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.08, h: 5.625, fill: { color: C.blue }, line: { color: C.blue, width: 0 } });

  // Logo icon box
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 0.7, w: 0.55, h: 0.55, fill: { color: C.blue }, line: { color: C.blue, width: 0 },
    shadow: { type: "outer", color: "000000", blur: 12, offset: 3, angle: 135, opacity: 0.4 } });
  s.addText("⬡", { x: 0.6, y: 0.7, w: 0.55, h: 0.55, fontSize: 22, align: "center", valign: "middle", color: C.white, fontFace: "Calibri", margin: 0 });

  s.addText("SkillGraph", { x: 1.25, y: 0.7, w: 3.5, h: 0.3, fontSize: 20, fontFace: "Georgia", bold: true, color: C.blue, margin: 0 });
  s.addText("AI", { x: 2.93, y: 0.7, w: 0.7, h: 0.3, fontSize: 20, fontFace: "Georgia", bold: true, color: C.purple, margin: 0 });
  s.addText("Career Intelligence Platform", { x: 1.25, y: 1.0, w: 4, h: 0.22, fontSize: 10, color: C.muted, fontFace: "Calibri", margin: 0 });

  // Main headline
  s.addText("Land Your Dream", { x: 0.55, y: 1.55, w: 6, h: 0.75, fontSize: 42, fontFace: "Georgia", bold: true, color: C.white, margin: 0 });
  s.addText("Tech Career", { x: 0.55, y: 2.3, w: 6, h: 0.75, fontSize: 42, fontFace: "Georgia", bold: true, color: C.blue, margin: 0 });
  s.addText("with Machine Learning", { x: 0.55, y: 3.08, w: 6, h: 0.55, fontSize: 24, fontFace: "Georgia", color: C.muted, margin: 0 });

  s.addText("AI-powered skill analysis · Personalized roadmaps · Gamified learning · Student community", {
    x: 0.55, y: 3.75, w: 6.2, h: 0.32, fontSize: 11, color: C.muted, fontFace: "Calibri", margin: 0,
  });

  // Right panel — stats
  s.addText("Platform Highlights", { x: 6.7, y: 0.5, w: 3.1, h: 0.3, fontSize: 13, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
  const stats = [["20+","Job Roles"],["12","AI Features"],["50+","Skills Tracked"],["100%","Free Forever"],["Real-time","Chat Rooms"],["5","Interview Rounds"]];
  stats.forEach(([v, l], i) => {
    const x = 6.75 + (i % 2) * 1.6;
    const y = 0.95 + Math.floor(i / 2) * 1.3;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 1.45, h: 1.1, fill: { color: C.bg3 }, line: { color: C.border, width: 1 } });
    s.addText(v, { x, y: y + 0.1, w: 1.45, h: 0.55, fontSize: i < 2 ? 28 : 22, fontFace: "Georgia", bold: true, color: i % 3 === 0 ? C.blue : i % 3 === 1 ? C.purple : C.green, align: "center", margin: 0 });
    s.addText(l, { x, y: y + 0.68, w: 1.45, h: 0.3, fontSize: 9.5, color: C.muted, align: "center", fontFace: "Calibri", margin: 0 });
  });

  // Bottom tech stack
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.15, w: 10, h: 0.475, fill: { color: C.bg2 }, line: { color: C.border, width: 0 } });
  const tech = ["React.js","Node.js + Express","Python FastAPI","MongoDB","TF-IDF ML","Socket.io","JWT + OAuth","Google Login","LinkedIn Login"];
  tech.forEach((t, i) => {
    s.addText(t, { x: 0.25 + i * 1.08, y: 5.22, w: 1.0, h: 0.2, fontSize: 8, color: C.muted, fontFace: "Calibri", margin: 0 });
    if (i < tech.length - 1) s.addShape(pres.shapes.LINE, { x: 1.2 + i * 1.08, y: 5.22, w: 0, h: 0.2, line: { color: C.border, width: 1 } });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — PROBLEM STATEMENT
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addBg(s);
  title(s, "The Problem Every CS Student Faces", 0.25, 30);

  const problems = [
    { icon:"❓", title:"No Clear Career Direction", desc:"Students have skills but don't know which tech career to pursue or what's missing", color: C.red },
    { icon:"📚", title:"Wrong Learning Order", desc:"Learning advanced topics before prerequisites leads to confusion and wasted time", color: C.amber },
    { icon:"😰", title:"Interview Anxiety", desc:"Students don't know how to prepare across all 5 interview rounds (aptitude to system design)", color: C.purple },
    { icon:"🏝️", title:"Learning in Isolation", desc:"No platform to connect with peers, find mentors, or share achievements in STEM community", color: C.blue },
    { icon:"📄", title:"Resume & Cert Gaps", desc:"Certificates exist but are not verified or organized. Resume doesn't reflect real skills", color: C.green },
    { icon:"🎯", title:"No Motivation System", desc:"No gamification or progress tracking keeps students from staying consistent", color: C.amber },
  ];

  problems.forEach((p, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.3 + col * 3.22;
    const y = 1.1 + row * 1.85;

    card(s, x, y, 3.0, 1.65);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 3.0, h: 0.07, fill: { color: p.color }, line: { color: p.color, width: 0 } });
    s.addText(p.icon, { x: x + 0.12, y: y + 0.18, w: 0.4, h: 0.38, fontSize: 20, fontFace: "Calibri", margin: 0 });
    s.addText(p.title, { x: x + 0.58, y: y + 0.15, w: 2.3, h: 0.35, fontSize: 12, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
    s.addText(p.desc, { x: x + 0.12, y: y + 0.6, w: 2.75, h: 0.88, fontSize: 10, color: C.muted, fontFace: "Calibri", lineSpacingMultiple: 1.2, margin: 0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.1, w: 10, h: 0.525, fill: { color: C.bg2 }, line: { color: C.border, width: 0 } });
  s.addText("SkillGraph AI solves ALL of these problems in one unified platform.", { x: 0.5, y: 5.18, w: 9, h: 0.35, fontSize: 14, bold: true, color: C.blue, align: "center", fontFace: "Georgia", margin: 0 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — SOLUTION OVERVIEW / 12 FEATURES
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addBg(s);
  title(s, "12 AI-Powered Features — One Platform", 0.22, 28);
  subtitle(s, "Every feature students need to go from beginner to hired", 0.75);

  const feats = [
    { icon:"🧠", t:"AI Career Prediction",   c:C.blue },
    { icon:"🗺️", t:"Career Roadmap",         c:C.purple },
    { icon:"📅", t:"Personalized Study Plan", c:C.green },
    { icon:"📜", t:"Certificate Verifier",    c:C.amber },
    { icon:"🏆", t:"Gamified Challenges",     c:C.red },
    { icon:"👥", t:"Student Community",       c:C.blue },
    { icon:"💬", t:"Real-time Chat",          c:C.purple },
    { icon:"🎓", t:"Mentor Matching",         c:C.green },
    { icon:"🏢", t:"Job & Internship Board",  c:C.amber },
    { icon:"🎯", t:"Virtual Events",          c:C.red },
    { icon:"💼", t:"Interview Preparation",   c:C.blue },
    { icon:"🤖", t:"AI Career Assistant",     c:C.purple },
  ];

  feats.forEach((f, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 0.25 + col * 2.4;
    const y = 1.1 + row * 1.45;
    card(s, x, y, 2.2, 1.28);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.2, h: 0.04, fill: { color: f.c }, line: { color: f.c, width: 0 } });
    s.addText(f.icon, { x: x + 0.1, y: y + 0.12, w: 0.38, h: 0.35, fontSize: 18, fontFace: "Calibri", margin: 0 });
    s.addText(f.t, { x: x + 0.1, y: y + 0.56, w: 2.0, h: 0.58, fontSize: 10.5, bold: true, color: C.white, fontFace: "Calibri", lineSpacingMultiple: 1.15, margin: 0 });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — SYSTEM ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addBg(s);
  title(s, "System Architecture — 3-Tier Microservices", 0.22, 28);

  // Frontend
  accentCard(s, 0.3, 1.0, 2.85, 3.95, C.blue);
  s.addText("FRONTEND", { x: 0.45, y: 1.12, w: 2.55, h: 0.25, fontSize: 10, bold: true, color: C.blue, fontFace: "Calibri", margin: 0 });
  s.addText("React.js — Port 3000", { x: 0.45, y: 1.38, w: 2.55, h: 0.22, fontSize: 10, color: C.muted, fontFace: "Calibri", margin: 0 });
  const fpages = ["Landing + Auth","Dashboard","Skill Analysis","Career Roadmap","Study Plan","Interview Prep","AI Assistant","Community Feed","Chat (Socket.io)","Jobs & Internships","Challenges","Certificates","Leaderboard","Events · Mentors · Profile"];
  fpages.forEach((p, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.45, y: 1.7 + i * 0.22, w: 2.55, h: 0.2, fill: { color: i%2===0?"060f20":"070d1a" }, line: { color: C.border, width: 0 } });
    s.addText(p, { x: 0.55, y: 1.72 + i * 0.22, w: 2.35, h: 0.18, fontSize: 8.5, color: C.muted, fontFace: "Calibri", margin: 0 });
  });

  // Arrow
  s.addShape(pres.shapes.LINE, { x: 3.18, y: 2.95, w: 0.45, h: 0, line: { color: C.blue, width: 2, dashType: "dash" } });
  s.addText("JWT+REST", { x: 3.15, y: 2.72, w: 0.5, h: 0.18, fontSize: 7, color: C.muted, align: "center", fontFace: "Calibri", margin: 0 });

  // Backend
  accentCard(s, 3.65, 1.0, 2.85, 3.95, C.purple);
  s.addText("BACKEND", { x: 3.8, y: 1.12, w: 2.55, h: 0.25, fontSize: 10, bold: true, color: C.purple, fontFace: "Calibri", margin: 0 });
  s.addText("Node.js + Express — Port 5000", { x: 3.8, y: 1.38, w: 2.55, h: 0.22, fontSize: 9.5, color: C.muted, fontFace: "Calibri", margin: 0 });
  const bItems = ["JWT Auth + bcrypt","Google OAuth 2.0","LinkedIn OAuth","Socket.io (Chat)","Multer (File Uploads)","Mongoose + MongoDB","Analysis Proxy","Community Routes","Certificate OCR route","Leaderboard API","Events & Mentors","Challenges system","Cron jobs (reminders)","Node-cron scheduled tasks"];
  bItems.forEach((b, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 3.8, y: 1.7 + i * 0.22, w: 2.55, h: 0.2, fill: { color: i%2===0?"0d0f24":"0a0d20" }, line: { color: C.border, width: 0 } });
    s.addText(b, { x: 3.9, y: 1.72 + i * 0.22, w: 2.35, h: 0.18, fontSize: 8.5, color: C.muted, fontFace: "Calibri", margin: 0 });
  });

  // Arrow
  s.addShape(pres.shapes.LINE, { x: 6.53, y: 2.95, w: 0.45, h: 0, line: { color: C.purple, width: 2, dashType: "dash" } });
  s.addText("HTTP", { x: 6.5, y: 2.72, w: 0.5, h: 0.18, fontSize: 7, color: C.muted, align: "center", fontFace: "Calibri", margin: 0 });

  // ML Service
  accentCard(s, 7.0, 1.0, 2.7, 3.95, C.green);
  s.addText("ML SERVICE", { x: 7.15, y: 1.12, w: 2.4, h: 0.25, fontSize: 10, bold: true, color: C.green, fontFace: "Calibri", margin: 0 });
  s.addText("Python FastAPI — Port 8000", { x: 7.15, y: 1.38, w: 2.4, h: 0.22, fontSize: 9.5, color: C.muted, fontFace: "Calibri", margin: 0 });
  const mlItems = ["TF-IDF Vectorizer","Cosine Similarity","BFS (Prerequisites)","Topological Sort","Skill NLP Extractor","PyPDF2 Resume Parser","Tesseract OCR","Career Roadmaps JSON","Job Matching Engine","Study Plan Generator","Challenge Data","Course Suggestions","Career Trends API","Interview Questions"];
  mlItems.forEach((m, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 7.15, y: 1.7 + i * 0.22, w: 2.4, h: 0.2, fill: { color: i%2===0?"071420":"080f1c" }, line: { color: C.border, width: 0 } });
    s.addText(m, { x: 7.25, y: 1.72 + i * 0.22, w: 2.2, h: 0.18, fontSize: 8.5, color: C.muted, fontFace: "Calibri", margin: 0 });
  });

  // MongoDB
  s.addShape(pres.shapes.RECTANGLE, { x: 3.65, y: 5.1, w: 2.85, h: 0.38, fill: { color: C.bg2 }, line: { color: C.border, width: 1 } });
  s.addText("🗄 MongoDB — Users · Analysis · Posts · Messages · Events", { x: 3.75, y: 5.15, w: 2.65, h: 0.28, fontSize: 8.5, color: C.amber, fontFace: "Calibri", margin: 0 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — ML ALGORITHMS
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addBg(s);
  title(s, "AI & ML Algorithms Explained", 0.22, 28);

  const algos = [
    { t:"TF-IDF Vectorization",    c:C.blue,   icon:"📊",
      desc:"Converts job skill sets into numerical vectors. TF = how often a skill appears. IDF = how unique it is across all jobs. High TF-IDF = skill is frequent in this job but rare overall.",
      code:"vectorizer = TfidfVectorizer(ngram_range=(1,2))\njob_vectors = vectorizer.fit_transform(job_docs)" },
    { t:"Cosine Similarity",        c:C.purple, icon:"📐",
      desc:"Measures angle between user skill vector and each job vector. sim(A,B) = A·B / (||A||×||B||). Returns value 0-1 (0=no match, 1=perfect match). Used to rank all 20 job roles.",
      code:"sims = cosine_similarity(user_vec, job_vectors)[0]\nresults = sorted(enumerate(sims), key=lambda x: x[1])" },
    { t:"BFS Prerequisite Discovery",c:C.green, icon:"🔍",
      desc:"Traverses skill dependency graph backwards from target skills. If you want 'React', BFS finds: HTML → CSS → JavaScript → React. Ensures no skill is taught without its prerequisites.",
      code:"while queue:\n  skill = queue.popleft()\n  for prereq in graph[skill]:\n    if prereq not in visited: queue.append(prereq)" },
    { t:"Kahn's Topological Sort",  c:C.amber,  icon:"📋",
      desc:"Orders discovered prerequisites so they're learned in the correct sequence. Processes nodes with zero in-degree (no prerequisites) first. Guarantees a valid learning order for any DAG.",
      code:"# In-degree 0 nodes first\nqueue = [s for s in skills if in_deg[s]==0]\nwhile queue:\n  n = queue.pop(); order.append(n)" },
  ];

  algos.forEach((a, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.3 + col * 4.85;
    const y = 1.0 + row * 2.35;

    card(s, x, y, 4.55, 2.18);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.05, h: 2.18, fill: { color: a.c }, line: { color: a.c, width: 0 } });
    s.addText(a.icon + " " + a.t, { x: x + 0.2, y: y + 0.1, w: 4.2, h: 0.3, fontSize: 13, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
    s.addText(a.desc, { x: x + 0.2, y: y + 0.5, w: 4.2, h: 0.7, fontSize: 9.5, color: C.muted, fontFace: "Calibri", lineSpacingMultiple: 1.25, margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: x + 0.18, y: y + 1.28, w: 4.22, h: 0.76, fill: { color: C.bg3 }, line: { color: C.border, width: 1 } });
    s.addText(a.code, { x: x + 0.26, y: y + 1.32, w: 4.06, h: 0.68, fontSize: 8, color: C.green, fontFace: "Consolas", lineSpacingMultiple: 1.2, margin: 0 });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — KEY FEATURES DEEP DIVE
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addBg(s);
  title(s, "Feature Deep-Dive", 0.22, 28);

  const features = [
    { icon:"🧠", title:"Skill Analysis + Career Prediction", color: C.blue,
      points:["Input: manual skills OR upload PDF resume","ML extracts skills via NLP (60+ skill vocabulary)","TF-IDF + Cosine Similarity → top 5 career matches","Shows: match%, matching skills, missing skills, salary","Saves analysis history for progress tracking"] },
    { icon:"🗺️", title:"Career Roadmap with Timeline", color: C.purple,
      points:["Step-by-step phases (Month 1-2, 3-4, etc.)","Each phase: skills to learn + daily tasks + milestone","Curated FREE and paid course links per skill","Covers 5 major career paths with full detail","Powered by real roadmap JSON dataset"] },
    { icon:"🏆", title:"Gamified Challenges + Leaderboard", color: C.amber,
      points:["7 weekly challenges (Beginner → Advanced)","Each challenge: tasks, resources, point rewards","Badges: First Analysis, Week Warrior, ML Pioneer...","Global leaderboard ranked by points + streak","Points for: analyses, certs, posts, challenges"] },
    { icon:"👥", title:"Community + Real-time Chat", color: C.green,
      points:["LinkedIn-style feed: posts, likes, comments","5 post types: achievement, question, resource...","7 real-time study rooms via Socket.io WebSocket","Mentor matching by skill compatibility","Virtual events: webinars, career talks, Q&A"] },
  ];

  features.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.28 + col * 4.85;
    const y = 1.0 + row * 2.35;

    card(s, x, y, 4.55, 2.2);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.55, h: 0.05, fill: { color: f.color }, line: { color: f.color, width: 0 } });
    s.addText(f.icon + " " + f.title, { x: x + 0.18, y: y + 0.1, w: 4.2, h: 0.32, fontSize: 12, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
    f.points.forEach((p, j) => {
      s.addText("• " + p, { x: x + 0.18, y: y + 0.5 + j * 0.33, w: 4.2, h: 0.3, fontSize: 9.5, color: C.muted, fontFace: "Calibri", margin: 0 });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — DATASETS
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addBg(s);
  title(s, "Real Datasets Powering SkillGraph AI", 0.22, 28);

  const datasets = [
    { file:"job_skills.csv",           icon:"💼", size:"20 roles",    c:C.blue,   desc:"20 job roles with required skills, description, avg salary (USD+INR), demand level, career path, and months to learn" },
    { file:"skill_graph.json",         icon:"🔗", size:"36 nodes",    c:C.purple, desc:"49 skill nodes with difficulty, hours, category + 41 prerequisite/related edges for graph-based learning paths" },
    { file:"career_roadmaps.json",     icon:"🗺️", size:"5 paths",     c:C.green,  desc:"5 detailed career roadmaps with monthly phases, tasks, milestones, and curated course links per phase" },
    { file:"courses.json",             icon:"📚", size:"60+ courses", c:C.amber,  desc:"Curated courses mapped by skill — Udemy, Coursera, YouTube, free+paid — with ratings, duration, instructor" },
    { file:"jobs.json",                icon:"🏢", size:"14 listings", c:C.red,    desc:"8 internships (Google, Meta, Flipkart, NVIDIA...) + 6 full-time jobs with salary, skills, apply links" },
    { file:"challenges.json",          icon:"🏆", size:"7 challenges",c:C.blue,   desc:"7 gamified challenges (Beginner-Advanced) with tasks, resources, points, badges + 8 badge definitions" },
    { file:"interview_questions.json", icon:"💼", size:"5 rounds",    c:C.purple, desc:"5 interview rounds: 10 aptitude, 10 technical (JS/Python/React/DB), 8 DSA, 8 HR (STAR), 5 system design" },
  ];

  datasets.forEach((d, i) => {
    const y = 1.0 + i * 0.66;
    card(s, 0.3, y, 9.4, 0.58);
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 0.05, h: 0.58, fill: { color: d.c }, line: { color: d.c, width: 0 } });
    s.addText(d.icon + " " + d.file, { x: 0.5, y: y + 0.08, w: 2.5, h: 0.24, fontSize: 11, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
    s.addText(d.size, { x: 0.5, y: y + 0.32, w: 2.5, h: 0.2, fontSize: 9, color: d.c, fontFace: "Calibri", margin: 0 });
    s.addText(d.desc, { x: 3.1, y: y + 0.1, w: 6.45, h: 0.4, fontSize: 9.5, color: C.muted, fontFace: "Calibri", lineSpacingMultiple: 1.2, margin: 0 });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 8 — SETUP & RUNNING
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addBg(s);
  title(s, "Setup & Running the Application", 0.22, 28);

  const steps = [
    { n:"1", title:"Clone & Install Dependencies", color: C.blue,
      cmds:["git clone https://github.com/your-repo/skillgraph-ai","cd skillgraph-ai/backend && npm install","cd ../frontend && npm install","pip install -r ml-service/requirements.txt"] },
    { n:"2", title:"Configure Environment Variables", color: C.purple,
      cmds:["cp backend/.env.example backend/.env","# Set: MONGODB_URI, JWT_SECRET, ML_SERVICE_URL","# Set: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET","# Set: LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET"] },
    { n:"3", title:"Start All 3 Services (3 Terminals)", color: C.green,
      cmds:["# Terminal 1 — ML Service (Port 8000)","cd ml-service && uvicorn main:app --reload","# Terminal 2 — Backend (Port 5000)","cd backend && npm run dev","# Terminal 3 — Frontend (Port 3000)","cd frontend && npm start"] },
  ];

  steps.forEach((step, i) => {
    const x = 0.28 + i * 3.25;
    card(s, x, 0.95, 3.06, 4.4);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 0.95, w: 3.06, h: 0.05, fill: { color: step.color }, line: { color: step.color, width: 0 } });
    s.addShape(pres.shapes.RECTANGLE, { x: x + 0.15, y: 1.1, w: 0.38, h: 0.38, fill: { color: step.color }, line: { color: step.color, width: 0 } });
    s.addText(step.n, { x: x + 0.15, y: 1.1, w: 0.38, h: 0.38, fontSize: 16, bold: true, color: "FFFFFF", align: "center", valign: "middle", fontFace: "Georgia", margin: 0 });
    s.addText(step.title, { x: x + 0.15, y: 1.55, w: 2.78, h: 0.42, fontSize: 11.5, bold: true, color: C.white, fontFace: "Calibri", lineSpacingMultiple: 1.1, margin: 0 });
    step.cmds.forEach((c, j) => {
      s.addShape(pres.shapes.RECTANGLE, { x: x + 0.15, y: 2.08 + j * 0.58, w: 2.78, h: 0.52, fill: { color: C.bg3 }, line: { color: C.border, width: 1 } });
      s.addText(c, { x: x + 0.25, y: 2.1 + j * 0.58, w: 2.58, h: 0.48, fontSize: 8.5, color: C.green, fontFace: "Consolas", lineSpacingMultiple: 1.15, margin: 0 });
    });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.28, y: 5.1, w: 9.44, h: 0.38, fill: { color: C.bg2 }, line: { color: C.border, width: 1 } });
  s.addText("✅ Open http://localhost:3000 — Sign up → Analyze Skills → Get Your Career Roadmap!", { x: 0.5, y: 5.17, w: 9, h: 0.26, fontSize: 12, bold: true, color: C.green, align: "center", fontFace: "Calibri", margin: 0 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 9 — VIVA Q&A
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addBg(s);
  title(s, "Viva Preparation — Expected Questions", 0.22, 28);

  const qas = [
    { q:"Why microservices architecture?",           c:C.blue,
      a:"ML in Python (sklearn), backend in Node.js (async I/O), frontend in React. Each scales independently. A slow ML job won't block API responses." },
    { q:"Why TF-IDF over Word2Vec/BERT?",           c:C.purple,
      a:"TF-IDF is interpretable, fast, needs no GPU, and works perfectly for structured keyword matching across 20 job roles. Embeddings would be overkill." },
    { q:"How does graph-based learning path work?",  c:C.green,
      a:"Skills are a directed graph (HTML→CSS→JS→React). BFS discovers all prerequisites. Kahn's topological sort guarantees correct learning order." },
    { q:"How is user data secured?",                 c:C.amber,
      a:"JWT tokens (7-day expiry), bcrypt password hashing (10 rounds), express-validator input validation, Mongoose injection prevention, 15MB file size limits." },
    { q:"How does OAuth (Google/LinkedIn) work?",   c:C.red,
      a:"Passport.js handles OAuth 2.0 flow: user clicks → redirect to Google → user consents → Google sends code → we exchange for profile → create/find user → issue JWT." },
    { q:"What is Socket.io used for?",              c:C.blue,
      a:"Real-time bidirectional chat. Clients join rooms (general, DSA, ML). Messages saved to MongoDB. Online presence tracked via Map(userId → socketId)." },
    { q:"How does the leaderboard work?",           c:C.purple,
      a:"MongoDB query sorts users by points descending. Points awarded for: analysis (+10), challenge (+100-500), cert (+20), community post (+5), skill complete (+50)." },
    { q:"How is Certificate OCR implemented?",      c:C.green,
      a:"User uploads PDF/image → FastAPI receives it → PyPDF2 or Tesseract OCR extracts text → NLP skill extractor finds skill keywords → returns skill list + confidence score." },
  ];

  qas.forEach((qa, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.28 + col * 4.86;
    const y = 1.0 + row * 1.2;

    card(s, x, y, 4.56, 1.1);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.05, h: 1.1, fill: { color: qa.c }, line: { color: qa.c, width: 0 } });
    s.addText("Q: " + qa.q, { x: x + 0.2, y: y + 0.06, w: 4.28, h: 0.26, fontSize: 10, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
    s.addText("A: " + qa.a, { x: x + 0.2, y: y + 0.36, w: 4.28, h: 0.66, fontSize: 9, color: C.muted, fontFace: "Calibri", lineSpacingMultiple: 1.2, margin: 0 });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 10 — CONCLUSION
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s);

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 5, h: 5.625, fill: { color: C.bg2 }, line: { color: C.border, width: 0 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.08, h: 5.625, fill: { color: C.blue }, line: { color: C.blue, width: 0 } });

  s.addText("SkillGraph", { x: 0.4, y: 0.5, w: 4.3, h: 0.6, fontSize: 36, fontFace: "Georgia", bold: true, color: C.blue, margin: 0 });
  s.addText("AI", { x: 2.7, y: 0.5, w: 0.8, h: 0.6, fontSize: 36, fontFace: "Georgia", bold: true, color: C.purple, margin: 0 });
  s.addText("Career Intelligence Platform", { x: 0.4, y: 1.1, w: 4.4, h: 0.3, fontSize: 14, color: C.muted, fontFace: "Calibri", margin: 0 });

  s.addText("What We Built:", { x: 0.4, y: 1.6, w: 4.4, h: 0.28, fontSize: 13, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });
  const points = [
    "✓ Full 3-tier microservice architecture",
    "✓ TF-IDF ML career prediction (20 roles)",
    "✓ Graph-based learning paths (BFS + Topo Sort)",
    "✓ AI OCR certificate verifier (Tesseract)",
    "✓ Real-time chat via Socket.io WebSocket",
    "✓ Google + LinkedIn OAuth login",
    "✓ Gamification: challenges, badges, leaderboard",
    "✓ Student community social feed",
    "✓ AI Career Assistant (Claude API)",
    "✓ Job matching for 14 real opportunities",
    "✓ 5-round interview preparation",
    "✓ Career roadmaps with curated courses",
  ];
  points.forEach((p, i) => {
    s.addText(p, { x: 0.45, y: 2.0 + i * 0.29, w: 4.4, h: 0.26, fontSize: 10, color: i%2===0?C.white:C.muted, fontFace: "Calibri", margin: 0 });
  });

  // Right panel
  s.addText("Technologies Used", { x: 5.3, y: 0.4, w: 4.4, h: 0.32, fontSize: 15, bold: true, color: C.white, fontFace: "Calibri", margin: 0 });

  const techs = [
    { cat:"Frontend",   items:["React.js","React Router","Bootstrap","Socket.io Client","Recharts"] },
    { cat:"Backend",    items:["Node.js","Express","Socket.io","Passport.js","JWT","Multer"] },
    { cat:"ML Service", items:["Python","FastAPI","scikit-learn","Pandas","PyPDF2","Tesseract"] },
    { cat:"Database",   items:["MongoDB","Mongoose"] },
    { cat:"Auth",       items:["Google OAuth 2.0","LinkedIn OAuth","bcrypt"] },
  ];

  techs.forEach((t, i) => {
    s.addText(t.cat, { x: 5.3, y: 0.85 + i * 0.95, w: 1.2, h: 0.25, fontSize: 10, bold: true, color: [C.blue,C.purple,C.green,C.amber,C.red][i], fontFace: "Calibri", margin: 0 });
    t.items.forEach((item, j) => {
      pill(s, item, 5.3 + (j % 3) * 1.6, 1.13 + i * 0.95 + Math.floor(j / 3) * 0.32, [C.blue,C.purple,C.green,C.amber,C.red][i]);
    });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 5.3, y: 5.0, w: 4.4, h: 0.48, fill: { color: C.bg2 }, line: { color: C.border, width: 1 } });
  s.addText("React + Node.js + FastAPI + MongoDB + ML = Complete Career Platform", { x: 5.35, y: 5.07, w: 4.3, h: 0.35, fontSize: 10, color: C.blue, fontFace: "Calibri", bold: true, align: "center", margin: 0 });
}

// Save file
const outputPath = "/home/claude/skillgraph-ai/slides/SkillGraph_AI_Presentation.pptx";
pres.writeFile({ fileName: outputPath }).then(() => {
  console.log("✅ Presentation saved:", outputPath);
}).catch(e => console.error("Error:", e));
