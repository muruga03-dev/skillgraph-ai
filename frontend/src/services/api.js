/**
 * SkillGraph AI — Central API Service
 * ─────────────────────────────────────
 * All URLs are driven by environment variables so the same code
 * works in both local dev and production (Vercel + Render).
 *
 * Local dev:  REACT_APP_API_URL  is blank → CRA proxy → localhost:5000
 *             REACT_APP_ML_URL   is blank → requests go to localhost:8000
 * Production: set both in Vercel environment variables:
 *             REACT_APP_API_URL  = https://skillgraph-backend.onrender.com
 *             REACT_APP_ML_URL   = https://skillgraph-ml.onrender.com
 */

import axios from "axios";
import { io } from "socket.io-client";
import Assistant from "../pages/Assistant";

// ─── Base URLs (env-driven) ───────────────────────────────────────────────────
const API_BASE = process.env.REACT_APP_API_URL || "";
const ML_BASE  = process.env.REACT_APP_ML_URL  || "http://localhost:8000";
const WS_BASE  = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ─── Main axios instance (backend) ───────────────────────────────────────────
const api = axios.create({ baseURL: `${API_BASE}/api`, timeout: 30000 });

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem("sg_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem("sg_token");
    localStorage.removeItem("sg_user");
    if (!window.location.pathname.includes("/login"))
      window.location.href = "/login";
  }
  return Promise.reject(err);
});

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  signup:         d  => api.post("/auth/signup", d),
  login:          d  => api.post("/auth/login", d),
  profile:        () => api.get("/auth/profile"),
  updateProfile:  d  => api.put("/auth/profile", d),
  updateSkills:   s  => api.put("/auth/skills", { skills: s }),
  updateProgress: d  => api.put("/auth/progress", d),
  leaderboard:    () => api.get("/auth/leaderboard"),
  community:      p  => api.get("/auth/community", { params: p }),
  follow:        id  => api.post(`/auth/follow/${id}`),
  addCert:        d  => api.post("/auth/certificate", d),
  googleURL: () => `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/google`,
  linkedinURL:() => `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/linkedin`,
};

// ─── Analysis API ─────────────────────────────────────────────────────────────
export const analysisAPI = {
  analyze:   s => api.post("/analysis/analyze", { skills: s }),
  resume:    f => {
    const fd = new FormData();
    fd.append("resume", f);
    return api.post("/analysis/resume", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
  },
  certOCR:   f => {
    const fd = new FormData();
    fd.append("certificate", f);
    return api.post("/analysis/certificate-ocr", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  history:      ()         => api.get("/analysis/history"),
  roadmap:      role       => api.get(`/analysis/roadmap/${encodeURIComponent(role)}`),
  matchJobs:    s          => api.post("/analysis/match-jobs", { skills: s }),
  courses:      sk         => api.get(`/analysis/courses/${encodeURIComponent(sk)}`),
  challenges:   ()         => api.get("/analysis/challenges"),
  completeChallenge: (id, pts) => api.post(`/analysis/challenges/${id}/complete`, { points: pts }),
  studyPlan:    (s, h, d)  => api.post("/analysis/study-plan", { skills: s, hours_per_day: h, days_per_week: d }),
  trends:       ()         => api.get("/analysis/career/trends"),
  readiness:    s          => api.post("/analysis/interview/readiness", { skills: s }),
  Assistant:      (system, messages) => api.post("/analysis/assistant", { system, messages }),
};

// ─── Community API ────────────────────────────────────────────────────────────
export const communityAPI = {
  feed:        ()         => api.get("/community/feed"),
  post:        d          => api.post("/community/post", d),
  like:        id         => api.post(`/community/post/${id}/like`),
  comment:     (id, text) => api.post(`/community/post/${id}/comment`, { text }),
  deletePost:  id         => api.delete(`/community/post/${id}`),
  events:      ()         => api.get("/community/events"),
  rsvp:        id         => api.post(`/community/events/${id}/rsvp`),
  mentors:     p          => api.get("/community/mentors", { params: p }),
};

// ─── Departments API (ML service) ─────────────────────────────────────────────
export const deptAPI = {
  all:    ()  => axios.get(`${ML_BASE}/departments`),
  byDept: d   => axios.get(`${ML_BASE}/roles-by-dept/${encodeURIComponent(d)}`),
};

// ─── Mentor API ───────────────────────────────────────────────────────────────
const mentorApi = axios.create({ baseURL: `${API_BASE}/api/mentor`, timeout: 30000 });
mentorApi.interceptors.request.use(c => {
  const t = localStorage.getItem("sg_mentor_token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export const mentorAPI = {
  register:      d        => mentorApi.post("/register", d),
  login:         d        => mentorApi.post("/login", d),
  profile:       ()       => mentorApi.get("/profile"),
  updateProfile: d        => mentorApi.put("/profile", d),
  students:      ()       => mentorApi.get("/students"),
  addStudent:    d        => mentorApi.post("/add-student", d),
  updateStudent: (id, d)  => mentorApi.put(`/student/${id}`, d),
  logSession:    d        => mentorApi.post("/log-session", d),
  stats:         ()       => mentorApi.get("/dashboard-stats"),
  all:           p        => mentorApi.get("/all", { params: p }),
};

// ─── Socket.io ────────────────────────────────────────────────────────────────
let socket = null;
export const getSocket = () => {
  if (!socket) socket = io(WS_BASE, { autoConnect: false });
  return socket;
};

// ─── Utilities ────────────────────────────────────────────────────────────────
export const uploadAvatar = (base64) => api.post("/auth/avatar", { avatar: base64 });
export const updateTheme  = (theme)  => api.put("/auth/theme", { theme });

export default api;

// ─── Fetch helpers (used by Assistant.js, OAuthCallback.js) ──────────────────
const BASE_URL = process.env.REACT_APP_API_URL || "";
export const apiURL   = (path) => `${BASE_URL}${path}`;
export const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem("sg_token");
  const headers = {
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  return fetch(apiURL(path), { ...options, headers });
};
