# 🚀 SkillGraph AI — Career Intelligence Platform

A full-stack, AI-powered career guidance platform for CS students.  
**React.js + Node.js + Python FastAPI + MongoDB + ML + Socket.io**

---

## ✨ Features (12 Total)

| Feature | Description |
|---|---|
| 🧠 AI Career Prediction | TF-IDF + Cosine Similarity matches skills to 20 job roles |
| 🗺️ Career Roadmap | Step-by-step guide with courses, tasks, timeline per role |
| 📅 Personalized Study Plan | BFS + Topological sort for prerequisite-ordered schedule |
| 📜 Certificate Verifier | OCR reads certificates, extracts skills, awards points |
| 🏆 Gamified Challenges | Weekly challenges, badges, streaks, leaderboard |
| 👥 Student Community | LinkedIn-style social feed with posts, likes, comments |
| 💬 Real-time Chat | Socket.io WebSocket study rooms (7 rooms) |
| 🎓 Mentor Matching | Match with senior students by skill compatibility |
| 🏢 Job & Internship Board | AI-matched real opportunities (Google, Meta, Flipkart...) |
| 🎯 Virtual Events | Webinars, career talks, resume reviews |
| 💼 Interview Preparation | 5 rounds: Aptitude, Technical, DSA, HR, System Design |
| 🤖 AI Career Assistant | Claude-powered chatbot for career guidance |

**+ Google Login + LinkedIn Login + Progress Tracker + Resume Export**

---

## 🏗️ Architecture

```
Frontend (React, Port 3000)
    ↕ JWT + REST API
Backend (Node.js + Express, Port 5000)
    ↕ HTTP + Socket.io
    ↕ FormData (file uploads)
ML Service (Python FastAPI, Port 8000)
    ↕ MongoDB (all data)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Python 3.9+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
git clone https://github.com/your-repo/skillgraph-ai
cd skillgraph-ai

# Backend
cd backend && npm install

# Frontend  
cd ../frontend && npm install

# ML Service
cd ../ml-service
pip install -r requirements.txt
# Optional: pip install pytesseract  (for OCR)
# macOS: brew install tesseract
# Ubuntu: sudo apt-get install tesseract-ocr
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env:
```

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillgraph
JWT_SECRET=your_secret_here
ML_SERVICE_URL=http://localhost:8000
CLIENT_URL=http://localhost:3000

# Google OAuth (from console.developers.google.com)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# LinkedIn OAuth (from developer.linkedin.com)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_CALLBACK_URL=http://localhost:5000/api/auth/linkedin/callback
```

### 3. Start All 3 Services

Open **3 separate terminals**:

**Terminal 1 — ML Service:**
```bash
cd ml-service
uvicorn main:app --reload --port 8000
# → http://localhost:8000/docs
```

**Terminal 2 — Backend:**
```bash
cd backend
npm run dev
# → http://localhost:5000/api/health
```

**Terminal 3 — Frontend:**
```bash
cd frontend
npm start
# → http://localhost:3000
```

### 4. Open the App
Navigate to **http://localhost:3000** → Sign up → Start exploring!

---

## 📁 Project Structure

```
skillgraph-ai/
├── frontend/                    # React.js app
│   └── src/
│       ├── pages/               # 17 pages
│       │   ├── Landing.js       # Marketing page
│       │   ├── Login.js         # Email + Google + LinkedIn login
│       │   ├── Signup.js        # Registration
│       │   ├── Dashboard.js     # Hub with stats & quick actions
│       │   ├── Analysis.js      # AI skill analysis + resume upload
│       │   ├── Roadmap.js       # Career roadmap viewer
│       │   ├── StudyPlan.js     # Personalized study plan
│       │   ├── Interview.js     # 5-round interview prep
│       │   ├── Assistant.js     # AI chatbot (Claude)
│       │   ├── Community.js     # Social feed
│       │   ├── Chat.js          # Real-time chat rooms
│       │   ├── Jobs.js          # Job & internship board
│       │   ├── Challenges.js    # Gamified challenges
│       │   ├── Certificates.js  # OCR certificate upload
│       │   ├── Leaderboard.js   # Points leaderboard
│       │   ├── Events.js        # Virtual events
│       │   ├── Mentors.js       # Mentor matching
│       │   └── Profile.js       # User profile + progress
│       ├── components/Navbar.js
│       ├── context/AuthContext.js
│       └── services/api.js
│
├── backend/                     # Node.js + Express
│   ├── server.js                # Main server + Socket.io
│   ├── routes/
│   │   ├── auth.js              # Login, signup, OAuth, profile, progress
│   │   ├── analysis.js          # Analysis, resume, OCR, roadmap, jobs
│   │   └── community.js         # Feed, posts, events, mentors
│   ├── models/
│   │   ├── User.js              # Full user schema with gamification
│   │   ├── Analysis.js
│   │   ├── Post.js
│   │   ├── Message.js
│   │   └── Event.js
│   └── middleware/auth.js
│
├── ml-service/                  # Python FastAPI
│   ├── main.py                  # 15+ endpoints
│   ├── data/
│   │   ├── job_skills.csv       # 20 job roles
│   │   ├── skill_graph.json     # 36 skill nodes + edges
│   │   ├── career_roadmaps.json # 5 career roadmaps
│   │   ├── courses.json         # 60+ curated courses
│   │   ├── jobs.json            # Real internships & jobs
│   │   └── challenges.json      # Gamified challenges
│   └── requirements.txt
│
└── slides/
    └── SkillGraph_AI_Presentation.pptx  # 10-slide presentation
```

---

## 🤖 ML Algorithms

### TF-IDF + Cosine Similarity (Career Prediction)
```python
vectorizer = TfidfVectorizer(ngram_range=(1, 2))
job_vectors = vectorizer.fit_transform(job_docs)
user_vec = vectorizer.transform([user_skills_str])
similarities = cosine_similarity(user_vec, job_vectors)[0]
```

### BFS + Kahn's Topological Sort (Learning Path)
```python
# BFS discovers prerequisites
while queue:
    skill = queue.popleft()
    for prereq in dependency_graph[skill]:
        if prereq not in visited: queue.append(prereq)

# Kahn's topological sort ensures correct order
queue = deque([s for s in skills if in_degree[s] == 0])
while queue:
    n = queue.popleft(); order.append(n)
    for neighbor in graph[n]: in_degree[neighbor] -= 1
```

---

## 🔐 Security

- JWT tokens (7-day expiry)
- bcrypt password hashing (10 rounds)
- Google + LinkedIn OAuth 2.0
- express-validator input validation
- MongoDB injection prevention (Mongoose)
- 15MB file upload limit

---

## 📊 Datasets

| Dataset | Size | Content |
|---|---|---|
| job_skills.csv | 20 roles | Skills, salary, demand, career path |
| skill_graph.json | 36 nodes + 24 edges | Prerequisites, categories, hours |
| career_roadmaps.json | 5 paths | Monthly phases, tasks, courses |
| courses.json | 60+ courses | Udemy, Coursera, YouTube, free+paid |
| jobs.json | 14 listings | 8 internships + 6 full-time jobs |
| challenges.json | 7 challenges | Tasks, points, badges |

---

## 🎯 Pages Summary

| Page | Route | Description |
|---|---|---|
| Landing | / | Marketing with features |
| Login | /login | Email + Google + LinkedIn |
| Signup | /signup | Registration |
| Dashboard | /dashboard | Hub with stats |
| Analysis | /analysis | AI skill analysis |
| Roadmap | /roadmap | Career path guide |
| Study Plan | /study-plan | Weekly schedule |
| Interview | /interview | 5-round prep (40+ Q&A) |
| AI Assistant | /assistant | Claude chatbot |
| Community | /community | Social feed |
| Chat | /chat | Real-time rooms |
| Jobs | /jobs | Internships & jobs |
| Challenges | /challenges | Gamified learning |
| Certificates | /certificates | OCR verifier |
| Leaderboard | /leaderboard | Points ranking |
| Events | /events | Virtual events |
| Mentors | /mentors | Mentor matching |
| Profile | /profile | Progress + resume |

---

## 📝 License

MIT License — Free to use for educational purposes.

Built with ❤️ using React + Node.js + Python FastAPI + MongoDB + TF-IDF ML
