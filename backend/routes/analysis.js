const express  = require("express");
const router   = express.Router();
const axios    = require("axios");
const multer   = require("multer");
const FormData = require("form-data");
const auth     = require("../middleware/auth");
const Analysis = require("../models/Analysis");
const User     = require("../models/User");

const ML = process.env.ML_SERVICE_URL || "http://localhost:8000";
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15e6 } });

const callML = async (method, path, data, params) => {
  const cfg = { method, url: `${ML}${path}`, timeout: 30000 };
  if (data instanceof FormData) { cfg.data = data; cfg.headers = data.getHeaders(); }
  else if (data) cfg.data = data;
  if (params) cfg.params = params;
  const r = await axios(cfg);
  return r.data;
};

// Full skill analysis
router.post("/analyze", auth, async (req, res) => {
  try {
    const { skills } = req.body;
    if (!skills?.length) return res.status(400).json({ success: false, message: "Skills required" });
    const ml = await callML("post", "/full-analysis", { skills });
    const analysis = await new Analysis({
      userId: req.user.userId, inputSkills: skills, inputMethod: "manual",
      predictions: ml.predictions, topMatch: ml.top_match,
      learningPath: ml.learning_path, studyPlan: ml.study_plan,
      readiness: ml.readiness, careerRoadmap: ml.career_roadmap
    }).save();
    await User.findByIdAndUpdate(req.user.userId, { skills, $inc: { analysisCount: 1 }, $inc: { points: 10 } });
    res.json({ success: true, analysis: ml, savedId: analysis._id });
  } catch (e) {
    if (e.code === "ECONNREFUSED") return res.status(503).json({ success: false, message: "ML service not running. Start FastAPI on port 8000." });
    res.status(500).json({ success: false, message: e.message });
  }
});

// Resume upload
router.post("/resume", auth, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    const form = new FormData();
    form.append("file", req.file.buffer, { filename: req.file.originalname, contentType: "application/pdf" });
    const parsed = await callML("post", "/parse-resume", form);
    const skills = parsed.skills || [];
    if (!skills.length) return res.status(422).json({ success: false, message: "No skills found in resume" });
    const ml = await callML("post", "/full-analysis", { skills });
    const analysis = await new Analysis({ userId: req.user.userId, inputSkills: skills, inputMethod: "resume", predictions: ml.predictions, topMatch: ml.top_match, learningPath: ml.learning_path, studyPlan: ml.study_plan, readiness: ml.readiness }).save();
    await User.findByIdAndUpdate(req.user.userId, { skills, $inc: { analysisCount: 1 } });
    res.json({ success: true, extractedSkills: skills, textPreview: parsed.text_preview, analysis: ml, savedId: analysis._id });
  } catch (e) {
    if (e.code === "ECONNREFUSED") return res.status(503).json({ success: false, message: "ML service not running" });
    res.status(500).json({ success: false, message: e.message });
  }
});

// Certificate OCR
router.post("/certificate-ocr", auth, upload.single("certificate"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file" });
    const form = new FormData();
    form.append("file", req.file.buffer, { filename: req.file.originalname, contentType: req.file.mimetype });
    const result = await callML("post", "/parse-certificate", form);
    res.json({ success: true, ...result });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// History
router.get("/history", auth, async (req, res) => {
  try {
    const h = await Analysis.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(10).select("inputSkills inputMethod topMatch readiness createdAt");
    res.json({ success: true, history: h });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Career roadmap
router.get("/roadmap/:role", auth, async (req, res) => {
  try {
    const data = await callML("get", `/career-roadmap/${encodeURIComponent(req.params.role)}`);
    res.json({ success: true, roadmap: data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Match jobs
router.post("/match-jobs", auth, async (req, res) => {
  try {
    const data = await callML("post", "/match-jobs", { skills: req.body.skills || [] });
    res.json({ success: true, ...data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Course suggestions
router.get("/courses/:skill", auth, async (req, res) => {
  try {
    const data = await callML("get", `/courses/${encodeURIComponent(req.params.skill)}`);
    res.json({ success: true, ...data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Challenges
router.get("/challenges", auth, async (req, res) => {
  try {
    const data = await callML("get", "/challenges");
    res.json({ success: true, ...data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Complete challenge
router.post("/challenges/:id/complete", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.challengesCompleted.includes(req.params.id)) {
      return res.status(400).json({ success: false, message: "Already completed" });
    }
    user.challengesCompleted.push(req.params.id);
    user.points += req.body.points || 100;
    user.updateLevel();
    await user.save();
    res.json({ success: true, points: user.points, level: user.level });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Study plan
router.post("/study-plan", auth, async (req, res) => {
  try {
    const { skills, hours_per_day = 2, days_per_week = 5 } = req.body;
    const data = await callML("post", "/study-plan", { skills, hours_per_day, days_per_week });
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Career trends
router.get("/career/trends", auth, async (req, res) => {
  try {
    const data = await callML("get", "/career-trends");
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Interview readiness
router.post("/interview/readiness", auth, async (req, res) => {
  try {
    const data = await callML("post", "/interview-readiness", { skills: req.body.skills });
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
