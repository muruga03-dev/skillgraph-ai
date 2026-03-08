"""
SkillGraph AI — FastAPI ML Service
====================================
Complete ML microservice with:
  - TF-IDF + Cosine Similarity career prediction
  - Graph-based learning path (BFS + topological sort)
  - NLP skill extraction
  - Career roadmaps, course suggestions, job matching
  - OCR certificate parsing (Tesseract)
  - Interview readiness scoring
"""


import json, re, io, math
from pathlib import Path
from typing import List, Optional
from collections import defaultdict, deque

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import pdfplumber

DATA = Path(__file__).parent / "data"

app = FastAPI(title="SkillGraph AI ML Service", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ─── Load datasets ────────────────────────────────────────────────────────────
df         = pd.read_csv(DATA / "job_skills.csv", encoding="utf-8")
skill_graph = json.loads((DATA / "skill_graph.json").read_text(encoding="utf-8"))
resources   = json.loads((DATA / "courses.json").read_text(encoding="utf-8"))
roadmaps    = json.loads((DATA / "career_roadmaps.json").read_text(encoding="utf-8"))
jobs_data   = json.loads((DATA / "jobs.json").read_text(encoding="utf-8"))
challenges  = json.loads((DATA / "challenges.json").read_text(encoding="utf-8"))

# ─── TF-IDF model ────────────────────────────────────────────────────────────
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

df["skills_doc"] = df["required_skills"].apply(
    lambda s: " ".join(x.strip().lower() for x in s.split(","))
)
vectorizer  = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
job_vectors = vectorizer.fit_transform(df["skills_doc"].tolist())

# ─── Skill vocabulary ─────────────────────────────────────────────────────────
# 350+ skills covering ALL engineering departments
SKILLS = [
    # Web Frontend
    "html","css","javascript","typescript","react","angular","vue","redux","bootstrap",
    "tailwind","webpack","vite","next.js","nuxt","svelte","jquery","sass","less",
    # Web Backend
    "node.js","express","django","flask","fastapi","spring boot","laravel","rails",
    "graphql","rest api","grpc","websockets","microservices","php","go","rust","java",
    # Databases
    "mongodb","postgresql","mysql","sql","redis","elasticsearch","firebase","cassandra",
    "dynamodb","oracle","sqlite","mariadb","neo4j","supabase","prisma","sequelize",
    "snowflake","bigquery","redshift","dbt","databricks",
    # Cloud & DevOps
    "aws","azure","gcp","docker","kubernetes","terraform","ansible","jenkins",
    "ci/cd","ci cd","linux","bash","nginx","prometheus","grafana","helm","argocd",
    "gitops","iam","cloudformation","pulumi","vagrant",
    # Programming Languages
    "python","c","c++","c#","go","rust","swift","kotlin","r","scala","php",
    "solidity","dart","matlab","julia","haskell","assembly","lua","perl","fortran",
    # AI & ML
    "machine learning","deep learning","tensorflow","pytorch","scikit-learn",
    "pandas","numpy","matplotlib","nlp","computer vision","llms","mlops",
    "statistics","mathematics","jupyter","keras","huggingface","transformers",
    "langchain","openai","cuda","xgboost","lightgbm","reinforcement learning",
    "bert","gpt","stable diffusion","llama","rag","vector databases","pinecone",
    "feature engineering","model monitoring","mlflow","feature store","automl",
    # Data Engineering
    "spark","apache spark","hadoop","kafka","airflow","etl","dbt","databricks",
    "data warehousing","power bi","tableau","looker","excel","data visualization",
    "data modeling","data cleaning",
    # Mobile
    "react native","flutter","swift","kotlin","android studio","xcode","dart",
    "firebase","expo","swiftui","jetpack compose","ios development","android development",
    "arkit","arcore","material design","bloc","provider","room","realm",
    # Algorithms & CS
    "dsa","algorithms","data structures","system design","git","github","dynamic programming",
    "graph theory","binary search","sorting","complexity analysis","os concepts","networking",
    "oop","object oriented programming","responsive design","vs code","problem solving",
    "data structures & algorithms","data structure & algorithms",
    # Security
    "network security","penetration testing","ethical hacking","firewalls","cryptography",
    "siem","risk assessment","compliance","gdpr","owasp","burp suite","wireshark",
    "kali linux","metasploit","vulnerability assessment","incident response","soc",
    "devsecos","sast","dast","cspm","zero trust","iso 27001","hipaa","soc2","nist",
    # Design
    "figma","sketch","adobe xd","user research","prototyping","wireframing",
    "design systems","usability testing","adobe photoshop","adobe illustrator","blender",
    "invision","zeplin","user interface","user experience","ui ux",
    # Project Management
    "agile","scrum","jira","confluence","product roadmap","stakeholder management",
    "communication","leadership","user stories","kanban","project management",
    "pmp","prince2","ms project","risk management","program management",
    # Embedded & IoT
    "microcontrollers","rtos","arm","raspberry pi","arduino","mqtt","can bus",
    "vhdl","fpga","hardware interfaces","iot","embedded linux","embedded c",
    "uart","spi","i2c","pcb design","altium","kicad","openocd","jtag","cmake",
    "freertos","zephyr","esp32","stm32",
    # VLSI / EE
    "vlsi","synopsys","cadence","rtl design","timing analysis","drc lvs","cmos",
    "verilog","systemverilog","spice","signal integrity","power electronics",
    "circuit design","orcad","multisim","ltspice","hspice","tcl",
    # DSP / Signal Processing
    "dsp","fft","filter design","signal processing","communication systems",
    "image processing","audio processing","control theory","pid controllers",
    "simulink","system identification","adaptive filtering","wavelets",
    # Mechanical / Civil
    "solidworks","catia","autocad","civil 3d","ansys","abaqus","comsol",
    "fea","cfd","gd&t","sheet metal design","product design","technical drawing",
    "lean manufacturing","six sigma","cnc","cam","cam cad","manufacturing processes",
    "material science","thermodynamics","fluid mechanics","heat transfer","staad pro",
    "sap2000","etabs","gis","arcgis","qgis","structural analysis","geotechnical",
    "traffic analysis","transportation planning","remote sensing","autocad civil 3d",
    # Robotics
    "ros","robot operating system","slam","kinematics","gazebo","sensor fusion",
    "computer vision","path planning","motion planning","manipulators","urdf",
    "moveit","trajectory planning","wheeled robots","drone programming",
    # Telecom / RF
    "5g","rf engineering","antenna design","lte","gsm","network protocols",
    "optical fiber","sdh","voip","spectrum analysis","radio frequency",
    "telecommunications","wireless communication","ofdm","mimo",
    # Chemical
    "aspen plus","process simulation","mass transfer","chemical reactor design",
    "separation processes","safety analysis","p&id","hazop","distillation","piping",
    # Environmental
    "environmental impact assessment","water treatment","air quality monitoring",
    "waste management","environmental regulations","ehs","life cycle assessment",
    # Power / Energy
    "power systems","grid systems","scada","smart grid","renewable energy",
    "pvsyst","etap","energy audit","solar design","wind energy","power electronics",
    # Control / Automation
    "plc","scada","hmi","ladder logic","industrial automation","control systems",
    "dcs","pneumatics","hydraulics","batch processing",
    # Enterprise
    "salesforce","sap","apex","abap","erp","crm","soql","power apps",
    "power automate","service now","oracle erp","workday",
    # Blockchain & Web3
    "solidity","ethereum","web3.js","smart contracts","defi","hardhat","truffle",
    "nft","metamask","polygon","layer 2","dao",
    # Testing & QA
    "selenium","jest","cypress","pytest","testng","postman","api testing",
    "unit testing","test automation","manual testing","jmeter","istqb",
    "performance testing","load testing","regression testing","bdd",
    # Analytics
    "google analytics","seo","sem","a/b testing","mixpanel","amplitude",
    "spss","r studio","statistical analysis","survey design","qualitative analysis",
    # Aerospace / Mechanical
    "aerodynamics","flight dynamics","propulsion","cfd simulation","structural dynamics",
    "composite materials","aeroelasticity","orbital mechanics",
    # Management & Soft Skills
    "technical leadership","mentoring","code review","system architecture",
    "product strategy","roadmapping","a/b testing","okrs","product analytics",
    # Research & ML Research
    "research papers","pytorch","paper implementation","experiment design",
    "academic research","data collection","annotation","evaluation metrics",
    # Misc
    "latex","technical writing","api documentation","langsmith","mlflow",
    "prompt engineering","fine-tuning","rag","vector search","llm evaluation",
]


# ── Canonical display names for known skills ─────────────────────────────────
CANONICAL = {
    "html": "HTML", "css": "CSS", "javascript": "JavaScript",
    "typescript": "TypeScript", "sql": "SQL", "nosql": "NoSQL",
    "aws": "AWS", "gcp": "GCP", "nlp": "NLP", "dsa": "DSA",
    "etl": "ETL", "mlops": "MLOps", "llms": "LLMs", "oop": "OOP",
    "rest api": "REST API", "rest apis": "REST API",
    "ci/cd": "CI/CD", "ci cd": "CI/CD",
    "c++": "C++", "c#": "C#",
    "node.js": "Node.js", "next.js": "Next.js", "vue.js": "Vue.js",
    "react.js": "React", "reactjs": "React", "nodejs": "Node.js",
    "expressjs": "Express", "express.js": "Express",
    "mongodb": "MongoDB", "mysql": "MySQL", "postgresql": "PostgreSQL",
    "fastapi": "FastAPI", "github": "GitHub",
    "machine learning": "Machine Learning", "deep learning": "Deep Learning",
    "data structures": "Data Structures", "data structures & algorithms": "DSA",
    "data structure & algorithms": "DSA", "data structures and algorithms": "DSA",
    "responsive design": "Responsive Design",
    "vs code": "VS Code", "vscode": "VS Code",
    "git": "Git", "github": "GitHub",
    "python": "Python", "react": "React", "express": "Express",
    "oops": "OOP", "object oriented programming": "OOP",
    "data structures & algorithms": "DSA",
    "data structure & algorithms": "DSA",
    "problem solving": "Problem Solving",
}

# Skill lookup set (lowercase) for validation
SKILLS_LOWER = set(s.lower() for s in SKILLS)

def _scan_text_for_skills(text: str) -> list:
    """Scan a block of text and return all matching skills from SKILLS list."""
    cleaned = re.sub(r"[^a-z0-9\s.+#/&]", " ", text.lower())
    found = {}
    # Sort by length descending so multi-word skills match before sub-parts
    for sk in sorted(SKILLS, key=len, reverse=True):
        pattern = r"(?<![a-z0-9.])" + re.escape(sk) + r"(?![a-z0-9.])"
        if re.search(pattern, cleaned):
            canon = CANONICAL.get(sk.lower(), sk.title())
            found[sk.lower()] = canon
    return list(found.values())

# Section header patterns → we ARE inside skills
_SKILL_HEADERS = re.compile(
    r"(?i)^\s*(skills?|technical\s+skills?|skill\s+set|key\s+skills?|"
    r"core\s+competencies|competencies|technologies\s+used|"
    r"web\s+development\s*:?|backend\s*(&|and)?\s*(frameworks?)?\s*:?|"
    r"tools?\s*(&|and)?\s*(platforms?)?\s*:?|programming\s+languages?\s*:?|"
    r"databases?\s*:?|concepts?\s*(&|and)?\s+(technologies?)?\s*:?|"
    r"frameworks?\s*:?|languages?\s+known\s*:?)\s*$",
    re.IGNORECASE
)

# Headers that signal end of skills section
_END_HEADERS = re.compile(
    r"(?i)^\s*(education|experience|work\s+experience|internship|professional\s+experience|"
    r"employment|projects?|certific|achievements?|awards?|"
    r"activities|interests?|hobbies|languages?\s*(known|spoken)?|references?|"
    r"objectives?|career\s+objective|summary|profile|about\s+me|declaration|personal\s+info)\s*$"
)

def extract_skills_from_resume(text: str, skills_list: list):

    text = text.lower()

    # clean text
    cleaned = re.sub(r"[^a-z0-9+#.\s,]", " ", text)

    extracted = set()

    for skill in skills_list:

        s = skill.lower()

        if re.search(r"\b" + re.escape(s) + r"\b", cleaned):
            extracted.add(CANONICAL.get(s, skill.title()))

    return sorted(list(extracted))


def extract_skills(text: str) -> list:
    """Used for manual text input — identical strict matching."""
    return extract_skills_from_resume(text,SKILLS)

def predict_jobs(skills: list, n: int = 5) -> list:
    """
    Predict best job roles using hybrid scoring:
    60% TF-IDF cosine similarity + 40% exact skill overlap ratio.
    Better accuracy than pure TF-IDF — removes random wrong predictions.
    """
    if not skills:
        return []

    user_lower = {s.lower() for s in skills}

    # Build TF-IDF vector from user's skill set
    doc = " ".join(user_lower)
    vec = vectorizer.transform([doc])
    sims = cosine_similarity(vec, job_vectors)[0]

    results = []
    for i, score in enumerate(sims):
        row = df.iloc[i]
        job_skills    = [s.strip() for s in row["required_skills"].split(",")]
        job_lower     = {s.lower() for s in job_skills}

        # Overlap: fraction of required skills the user already has
        overlap       = len(user_lower & job_lower)
        overlap_score = overlap / max(len(job_lower), 1)

        # Hybrid weighted score
        final_score = (0.5 * float(score)) + (0.5 * overlap_score)

        if final_score < 0.15:
            continue

        results.append({
            "job_role":         row["job_role"],
            "department":       row.get("department", ""),
            "description":      row["description"],
            "avg_salary":       row.get("avg_salary_usd", "N/A"),
            "avg_salary_usd":   row.get("avg_salary_usd", "N/A"),
            "avg_salary_inr":   row.get("avg_salary_inr", "N/A"),
            "demand_level":     row.get("demand_level", "Medium"),
            "career_path":      row.get("career_path", ""),
            "months_to_learn":  int(row.get("months_to_learn", 12)),
            "match_percentage": round(final_score * 100, 1),
            "matching_skills":  [s for s in job_skills if s.lower() in user_lower],
            "missing_skills":   [s for s in job_skills if s.lower() not in user_lower],
            "extra_skills":     [s for s in skills    if s.lower() not in job_lower],
        })

    results.sort(key=lambda x: x["match_percentage"], reverse=True)
    return results[:n]

def get_learning_path(target: list) -> list:
    prereq_of = {}
    for e in skill_graph["edges"]:
        if e["type"] == "prerequisite":
            prereq_of[e["to"].lower()] = e["from"].lower()
    needed = set()
    for sk in target:
        needed.add(sk.lower())
        cur = sk.lower()
        visited = set()
        while cur in prereq_of and cur not in visited:
            visited.add(cur)
            cur = prereq_of[cur]
            needed.add(cur)
    # topological sort
    skill_set = needed
    in_deg = defaultdict(int)
    g = defaultdict(list)
    for sk in skill_set:
        in_deg[sk]
        if sk in prereq_of and prereq_of[sk] in skill_set:
            in_deg[sk] += 1
            g[prereq_of[sk]].append(sk)
    q = deque([s for s in skill_set if in_deg[s] == 0])
    order = []
    while q:
        n_ = q.popleft(); order.append(n_)
        for nb in g[n_]:
            in_deg[nb] -= 1
            if in_deg[nb] == 0: q.append(nb)
    for s in skill_set:
        if s not in order: order.append(s)
    nodes_map = {n["id"].lower(): n for n in skill_graph["nodes"]}
    target_set = {s.lower() for s in target}
    path = []
    for sid in order:
        node = nodes_map.get(sid, {"id": sid.title(), "difficulty": "Intermediate", "hours": 30, "category": "General"})
        path.append({
            "skill":           node["id"],
            "difficulty":      node.get("difficulty","Intermediate"),
            "estimated_hours": node.get("hours", 30),
            "category":        node.get("category","General"),
            "is_prerequisite": sid not in target_set,
            "resources":       resources.get(node["id"], [])[:2]
        })
    return path

def generate_study_plan(path: list, hpd: int = 2, dpw: int = 5) -> dict:
    total_h = sum(s["estimated_hours"] for s in path)
    hpw = hpd * dpw
    weeks = max(1, math.ceil(total_h / hpw))
    days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][:dpw]
    weekly = []
    budget = hpw
    week = {"week": 1, "skills": [], "hours": 0, "daily_goals": []}
    for sk in path:
        rem = sk["estimated_hours"]
        while rem > 0:
            alloc = min(rem, budget)
            rem -= alloc; budget -= alloc; week["hours"] += alloc
            if sk not in week["skills"]: week["skills"].append(sk)
            if budget <= 0:
                week["daily_goals"] = [{"day": d, "task": f"Study {week['skills'][i%len(week['skills'])]['skill']}", "hours": hpd} for i,d in enumerate(days)]
                weekly.append(week)
                week = {"week": len(weekly)+1, "skills": [], "hours": 0, "daily_goals": []}
                budget = hpw
    if week["skills"]:
        week["daily_goals"] = [{"day": d, "task": f"Study {week['skills'][i%len(week['skills'])]['skill']}", "hours": hpd} for i,d in enumerate(days)]
        weekly.append(week)
    return {"total_hours": total_h, "total_weeks": weeks, "hours_per_day": hpd, "days_per_week": dpw, "weekly_plan": weekly}

# ─── Pydantic models ──────────────────────────────────────────────────────────
class SkillsReq(BaseModel):
    skills: List[str]
class TextReq(BaseModel):
    text: str
class StudyReq(BaseModel):
    skills: List[str]
    hours_per_day: int = 2
    days_per_week: int = 5

# ─── Endpoints ────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}

@app.post("/extract-skills")
def extract(p: TextReq):
    skills = extract_skills(p.text)
    return {"skills": skills, "count": len(skills)}

@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    content = await file.read()
    raw_text = ""
    fname = (file.filename or "").lower()

    # ── Extract raw text ─────────────────────────────────────────────────────
    try:
        if fname.endswith(".pdf") or file.content_type == "application/pdf":
            import pdfplumber
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                for page in pdf.pages:
                    t = page.extract_text()
                    if t:
                        raw_text += t + "\n"
        elif fname.endswith((".png", ".jpg", ".jpeg", ".tiff", ".bmp")):
            try:
                import pytesseract
                from PIL import Image
                img = Image.open(io.BytesIO(content))
                raw_text = pytesseract.image_to_string(img)
            except ImportError:
                raw_text = content.decode("utf-8", errors="ignore")
        else:
            raw_text = content.decode("utf-8", errors="ignore")
    except Exception:
        raw_text = content.decode("utf-8", errors="ignore")

    if not raw_text.strip():
        raise HTTPException(400, "Could not extract text from the file. Please upload a text-selectable PDF.")

    # ── Strict skill extraction ───────────────────────────────────────────────
    skills = extract_skills_from_resume(raw_text,SKILLS)

    return {
        "filename": file.filename,
        "text_preview": raw_text[:600],
        "skills": skills,
        "count": len(skills),
    }


@app.post("/resume-analysis")
async def resume_analysis(file: UploadFile = File(...)):
    """
    Full resume-to-prediction pipeline in one endpoint:
    1. Extract PDF text
    2. extract_skills_from_resume() — strict SKILLS vocab match
    3. predict_jobs() — hybrid TF-IDF + overlap scoring
    Returns structured output: detected skills, best role, match %, gaps.
    """
    content = await file.read()
    raw_text = ""
    fname = (file.filename or "").lower()

    # Step 1 — Extract text
    try:
        if fname.endswith(".pdf") or file.content_type == "application/pdf":
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    raw_text += t + "\n"
        elif fname.endswith((".png", ".jpg", ".jpeg", ".tiff", ".bmp")):
            try:
                import pytesseract
                from PIL import Image
                raw_text = pytesseract.image_to_string(Image.open(io.BytesIO(content)))
            except ImportError:
                raw_text = content.decode("utf-8", errors="ignore")
        else:
            raw_text = content.decode("utf-8", errors="ignore")
    except Exception:
        raw_text = content.decode("utf-8", errors="ignore")

    if not raw_text.strip():
        raise HTTPException(400, "Could not extract text from the file.")

    # Step 2 — extract_skills_from_resume()
    skills = extract_skills_from_resume(raw_text,SKILLS)

    if not skills:
        return {
            "detected_skills": [],
            "message": "No recognisable technical skills found in this resume.",
        }

    # Step 3 — predict_jobs() with hybrid scoring
    predictions = predict_jobs(skills, n=8)

    if not predictions:
        return {
            "detected_skills": skills,
            "message": "Skills found but no job role matched. Try adding more technical skills.",
        }

    best = predictions[0]

    # Build learning path for missing skills
    learning_path = get_learning_path(best["missing_skills"][:6])
    next_skills   = [s["skill"] for s in learning_path[:6]]

    return {
        # ── Step 1+2 output ──
        "detected_skills":   skills,
        "skill_count":       len(skills),

        # ── Step 3+4 output ──
        "best_job_role":     best["job_role"],
        "department":        best.get("department", ""),
        "match_percentage":  best["match_percentage"],
        "description":       best.get("description", ""),
        "avg_salary_usd":    best.get("avg_salary_usd", "N/A"),
        "avg_salary_inr":    best.get("avg_salary_inr", "N/A"),
        "demand_level":      best.get("demand_level", ""),
        "career_path":       best.get("career_path", ""),

        # ── Step 5 output ──
        "matching_skills":   best["matching_skills"],
        "missing_skills":    best["missing_skills"],

        # ── Step 6 output ──
        "next_skills_to_learn": next_skills,

        # ── Alternative paths ──
        "other_predictions": [
            {
                "job_role":        p["job_role"],
                "department":      p.get("department", ""),
                "match_percentage":p["match_percentage"],
                "matching_skills": p["matching_skills"],
                "missing_skills":  p["missing_skills"],
                "avg_salary_inr":  p.get("avg_salary_inr", "N/A"),
                "demand_level":    p.get("demand_level", ""),
            }
            for p in predictions[1:5]
        ],
    }


@app.post("/parse-certificate")
async def parse_certificate(file: UploadFile = File(...)):
    """OCR-based certificate parsing to extract skill names."""
    content = await file.read()
    text = ""
    fname = file.filename.lower()
    try:
        if fname.endswith(".pdf"):
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            for page in reader.pages:
                t = page.extract_text()
                if t: text += t + "\n"
        else:
            # Image-based OCR
            try:
                import pytesseract
                from PIL import Image
                img = Image.open(io.BytesIO(content))
                text = pytesseract.image_to_string(img)
            except ImportError:
                # Fallback: try to decode as text
                text = content.decode("utf-8", errors="ignore")
    except Exception as e:
        text = content.decode("utf-8", errors="ignore")
    
    skills = extract_skills(text)
    # Extract certificate title heuristic
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    cert_title = lines[0] if lines else "Certificate"
    
    # Look for common certificate keywords
    cert_keywords = ["certificate of completion", "certified", "credential", "awarded to", "successfully completed"]
    for line in lines[:10]:
        if any(kw in line.lower() for kw in cert_keywords):
            cert_title = line; break
    
    return {
        "certificate_title": cert_title,
        "extracted_text": text[:1000],
        "verified_skills": skills,
        "confidence": "High" if skills else "Low",
        "points_awarded": len(skills) * 20
    }

@app.post("/predict-jobs")
def predict(p: SkillsReq):
    preds = predict_jobs(p.skills)
    return {"top_match": preds[0] if preds else None, "all_predictions": preds}

@app.post("/full-analysis")
def full_analysis(p: SkillsReq):
    preds = predict_jobs(p.skills)
    if not preds:
        raise HTTPException(422, "No matches found")
    top = preds[0]
    path = get_learning_path(top["missing_skills"]) if top["missing_skills"] else []
    plan = generate_study_plan(path) if path else {}
    # Readiness
    user_lower = {s.lower() for s in p.skills}
    score = min(top["match_percentage"], 70)
    dsa = 20 if user_lower & {"dsa","algorithms","data structures"} else 0
    sys = 10 if user_lower & {"system design","microservices"} else 0
    total = round(score + dsa + sys + 5, 1)
    level = "Expert" if total>=80 else "Intermediate" if total>=55 else "Beginner"
    roadmap = roadmaps.get(top["job_role"], roadmaps.get("Full Stack Developer"))
    return {
        "user_skills": p.skills, "predictions": preds, "top_match": top,
        "analysis": {"matching_skills": top["matching_skills"], "missing_skills": top["missing_skills"], "irrelevant_skills": top.get("extra_skills", []), "match_percentage": top["match_percentage"]},
        "learning_path": path, "study_plan": plan,
        "career_roadmap": roadmap,
        "readiness": {"score": total, "level": level, "breakdown": {"skill_match": round(score,1), "dsa_knowledge": dsa, "system_design": sys, "soft_skills": 5}}
    }

@app.post("/learning-path")
def lpath(p: SkillsReq):
    path = get_learning_path(p.skills)
    return {"learning_path": path, "total_hours": sum(s["estimated_hours"] for s in path)}

@app.post("/study-plan")
def study_plan(p: StudyReq):
    path = get_learning_path(p.skills)
    plan = generate_study_plan(path, p.hours_per_day, p.days_per_week)
    return {"learning_path": path, "study_plan": plan}

@app.get("/career-roadmap/{role}")
def career_roadmap(role: str):
    rm = roadmaps.get(role)
    if not rm:
        # fuzzy match
        for k in roadmaps:
            if role.lower() in k.lower():
                rm = roadmaps[k]; break
    if not rm:
        rm = roadmaps.get("Full Stack Developer")
    return rm

@app.get("/courses/{skill}")
def get_courses(skill: str):
    courses = resources.get(skill)
    if not courses:
        for k, v in resources.items():
            if k.lower() == skill.lower(): courses = v; break
    return {"skill": skill, "courses": courses or [], "count": len(courses) if courses else 0}

@app.post("/match-jobs")
def match_jobs(p: SkillsReq):
    """Match user skills to internships and jobs from the job board."""
    user_skills = {s.lower() for s in p.skills}
    def score(job):
        req = {s.lower() for s in job["skills_required"]}
        if not req: return 0
        return round(len(user_skills & req) / len(req) * 100, 1)
    internships = sorted([{**j, "match": score(j)} for j in jobs_data["internships"]], key=lambda x: x["match"], reverse=True)
    jobs = sorted([{**j, "match": score(j)} for j in jobs_data["jobs"]], key=lambda x: x["match"], reverse=True)
    return {"internships": internships[:5], "jobs": jobs[:5]}

@app.get("/challenges")
def get_challenges():
    return challenges

@app.get("/career-trends")
def career_trends():
    return {
        "trending_roles": [
            {"role":"AI/ML Engineer", "demand":97, "growth":"+35%", "avg_salary":"$145k"},
            {"role":"Full Stack Developer", "demand":90, "growth":"+18%", "avg_salary":"$110k"},
            {"role":"DevOps/SRE", "demand":88, "growth":"+22%", "avg_salary":"$125k"},
            {"role":"Data Scientist", "demand":85, "growth":"+20%", "avg_salary":"$125k"},
            {"role":"Cloud Architect", "demand":83, "growth":"+28%", "avg_salary":"$155k"},
        ],
        "trending_skills": ["Python","LLMs","Kubernetes","React","TypeScript","MLOps","Rust","Go"],
        "year": 2025
    }

@app.get("/skill-graph")
def skill_graph_data():
    return skill_graph

@app.post("/interview-readiness")
def readiness(p: SkillsReq):
    preds = predict_jobs(p.skills, 1)
    if not preds: return {"score": 0, "level": "Not Ready"}
    top = preds[0]
    score = min(top["match_percentage"], 70)
    user_lower = {s.lower() for s in p.skills}
    dsa = 20 if user_lower & {"dsa","algorithms","data structures"} else 0
    sys = 10 if user_lower & {"system design"} else 0
    total = round(score + dsa + sys + 5, 1)
    return {"score": total, "level": "Expert" if total>=80 else "Intermediate" if total>=55 else "Beginner", "top_role": top["job_role"], "missing_skills": top["missing_skills"][:5]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

@app.get("/departments")
def get_departments():
    """All unique departments from the ML dataset"""
    depts = sorted(df["department"].dropna().unique().tolist())
    dept_data = {}
    for dept in depts:
        roles = df[df["department"] == dept][["job_role","avg_salary_usd","avg_salary_inr","demand_level","months_to_learn"]].to_dict("records")
        dept_data[dept] = {"roles": roles, "count": len(roles)}
    return {"departments": depts, "data": dept_data, "total_roles": len(df)}

@app.get("/roles-by-dept/{dept}")
def roles_by_dept(dept: str):
    """Get all roles for a specific department"""
    filtered = df[df["department"].str.lower() == dept.lower()]
    if filtered.empty:
        filtered = df[df["department"].str.lower().str.contains(dept.lower())]
    return {
        "department": dept,
        "roles": filtered[["job_role","required_skills","description","avg_salary_usd","avg_salary_inr","demand_level","career_path","months_to_learn"]].to_dict("records"),
        "count": len(filtered)
    }

@app.post("/predict-jobs-v2")
def predict_jobs_v2(p: SkillsReq):
    """
    Enhanced prediction with hybrid scoring (TF-IDF + skill overlap),
    full salary data (INR + USD), department, career path.
    """
    if not p.skills:
        raise HTTPException(400, "No skills provided")

    user_lower = {s.lower() for s in p.skills}
    user_doc   = " ".join(user_lower)
    user_vec   = vectorizer.transform([user_doc])
    sims       = cosine_similarity(user_vec, job_vectors)[0]

    results = []
    for idx, score in enumerate(sims):
        row       = df.iloc[idx]
        req       = [s.strip() for s in row["required_skills"].split(",")]
        req_set   = {s.lower() for s in req}

        # Hybrid score: 60% TF-IDF + 40% overlap
        overlap       = len(user_lower & req_set)
        overlap_score = overlap / max(len(req_set), 1)
        final_score   = (0.6 * float(score)) + (0.4 * overlap_score)

        if final_score < 0.05:
            continue

        results.append({
            "job_role":         row["job_role"],
            "department":       row.get("department", ""),
            "match_percentage": round(final_score * 100, 1),
            "matching_skills":  [s for s in req if s.lower() in user_lower],
            "missing_skills":   [s for s in req if s.lower() not in user_lower],
            "extra_skills":     [s for s in p.skills if s.lower() not in req_set],
            "description":      row["description"],
            "avg_salary_usd":   row.get("avg_salary_usd", "N/A"),
            "avg_salary_inr":   row.get("avg_salary_inr", "N/A"),
            "demand_level":     row.get("demand_level", "Medium"),
            "career_path":      row.get("career_path", ""),
            "months_to_learn":  int(row.get("months_to_learn", 12)),
        })

    results.sort(key=lambda x: x["match_percentage"], reverse=True)
    return {"predictions": results[:10]}