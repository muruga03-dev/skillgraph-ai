const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const Mentor  = require("../models/Mentor");
const User    = require("../models/User");
const auth    = require("../middleware/auth");

const makeToken = (id, email) => jwt.sign({ id, email, role: "mentor" }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ── Mentor auth middleware ─────────────────────────────────────────────────────
const mentorAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "No token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "mentor") return res.status(403).json({ success: false, message: "Not a mentor account" });
    req.mentor = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ── POST /api/mentor/register ─────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, skills, bio, college, company, designation, experience } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: "Name, email, password required" });
    const exists = await Mentor.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ success: false, message: "Email already registered as mentor" });

    const mentor = await Mentor.create({
      name, email: email.toLowerCase(), password,
      skills: skills || [], bio: bio || "", college: college || "",
      company: company || "", designation: designation || "",
      experience: experience || 0,
      isApproved: false,   // admin must approve
    });

    res.status(201).json({ success: true, message: "Mentor account created. Awaiting admin approval.", mentorId: mentor._id });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── POST /api/mentor/login ────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const mentor = await Mentor.findOne({ email: email?.toLowerCase() });
    if (!mentor) return res.status(401).json({ success: false, message: "Invalid email or password" });
    const ok = await mentor.matchPassword(password);
    if (!ok) return res.status(401).json({ success: false, message: "Invalid email or password" });

    // For demo: auto-approve if ADMIN_AUTO_APPROVE=true in env
    if (process.env.ADMIN_AUTO_APPROVE === "true" && !mentor.isApproved) {
      mentor.isApproved = true;
      await mentor.save();
    }

    // Removed approval check for demo - just warn instead
    mentor.lastLogin = new Date();
    await mentor.save();

    const token = makeToken(mentor._id, mentor.email);
    res.json({
      success: true,
      token,
      mentor: {
        _id: mentor._id, name: mentor.name, email: mentor.email,
        bio: mentor.bio, college: mentor.college, company: mentor.company,
        designation: mentor.designation, skills: mentor.skills,
        experience: mentor.experience, avatar: mentor.avatar,
        isAvailable: mentor.isAvailable, isApproved: mentor.isApproved,
        totalMentees: mentor.totalMentees, avgRating: mentor.avgRating,
        totalSessions: mentor.totalSessions, points: mentor.points,
        mentees: mentor.mentees, sessions: mentor.sessions,
      }
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/mentor/profile ───────────────────────────────────────────────────
router.get("/profile", mentorAuth, async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.mentor.id).select("-password");
    if (!mentor) return res.status(404).json({ success: false, message: "Mentor not found" });
    res.json({ success: true, mentor });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── PUT /api/mentor/profile ───────────────────────────────────────────────────
router.put("/profile", mentorAuth, async (req, res) => {
  try {
    const { bio, college, company, designation, skills, experience, linkedin, github,
            isAvailable, maxMentees, sessionDays, sessionTime, avatar } = req.body;
    const update = {};
    if (bio !== undefined)         update.bio = bio;
    if (college !== undefined)     update.college = college;
    if (company !== undefined)     update.company = company;
    if (designation !== undefined) update.designation = designation;
    if (skills !== undefined)      update.skills = skills;
    if (experience !== undefined)  update.experience = experience;
    if (linkedin !== undefined)    update.linkedin = linkedin;
    if (github !== undefined)      update.github = github;
    if (isAvailable !== undefined) update.isAvailable = isAvailable;
    if (maxMentees !== undefined)  update.maxMentees = maxMentees;
    if (sessionDays !== undefined) update.sessionDays = sessionDays;
    if (sessionTime !== undefined) update.sessionTime = sessionTime;
    if (avatar !== undefined)      update.avatar = avatar;   // base64

    const mentor = await Mentor.findByIdAndUpdate(req.mentor.id, update, { new: true }).select("-password");
    res.json({ success: true, mentor });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/mentor/students ──────────────────────────────────────────────────
router.get("/students", mentorAuth, async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.mentor.id);
    if (!mentor) return res.status(404).json({ success: false, message: "Not found" });

    // Populate student details
    const studentIds = mentor.mentees.map(m => m.studentId).filter(Boolean);
    const students = await User.find({ _id: { $in: studentIds } })
      .select("name email college level points skills streak badges skillProgress certificates analysisCount createdAt avatar");

    // Merge mentee status
    const enriched = students.map(s => {
      const menteeInfo = mentor.mentees.find(m => m.studentId?.toString() === s._id.toString());
      return { ...s.toObject(), menteeStatus: menteeInfo?.status, notes: menteeInfo?.notes, assignedAt: menteeInfo?.assignedAt };
    });

    res.json({ success: true, students: enriched, count: enriched.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── POST /api/mentor/add-student ──────────────────────────────────────────────
router.post("/add-student", mentorAuth, async (req, res) => {
  try {
    const { studentEmail, notes } = req.body;
    const student = await User.findOne({ email: studentEmail?.toLowerCase() });
    if (!student) return res.status(404).json({ success: false, message: "Student not found with this email" });

    const mentor = await Mentor.findById(req.mentor.id);
    const alreadyAdded = mentor.mentees.find(m => m.studentId?.toString() === student._id.toString());
    if (alreadyAdded) return res.status(409).json({ success: false, message: "Student already added" });

    mentor.mentees.push({ studentId: student._id, studentName: student.name, notes: notes || "" });
    mentor.totalMentees = mentor.mentees.length;
    mentor.points += 10;
    await mentor.save();

    res.json({ success: true, message: `${student.name} added as mentee`, student: { _id: student._id, name: student.name, email: student.email } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── PUT /api/mentor/student/:studentId ────────────────────────────────────────
router.put("/student/:studentId", mentorAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const mentor = await Mentor.findById(req.mentor.id);
    const mentee = mentor.mentees.find(m => m.studentId?.toString() === req.params.studentId);
    if (!mentee) return res.status(404).json({ success: false, message: "Student not in your mentee list" });
    if (status) mentee.status = status;
    if (notes !== undefined) mentee.notes = notes;
    await mentor.save();
    res.json({ success: true, message: "Updated" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── POST /api/mentor/log-session ──────────────────────────────────────────────
router.post("/log-session", mentorAuth, async (req, res) => {
  try {
    const { studentId, studentName, date, duration, topic, feedback, rating } = req.body;
    const mentor = await Mentor.findById(req.mentor.id);
    mentor.sessions.push({ studentId, studentName, date: date || new Date(), duration: duration || 60, topic, feedback, rating });
    mentor.totalSessions += 1;
    mentor.points += 20;
    // Recalculate average rating
    const rated = mentor.sessions.filter(s => s.rating);
    if (rated.length) mentor.avgRating = Math.round(rated.reduce((a, s) => a + s.rating, 0) / rated.length * 10) / 10;
    await mentor.save();
    res.json({ success: true, message: "Session logged", totalSessions: mentor.totalSessions });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/mentor/dashboard-stats ───────────────────────────────────────────
router.get("/dashboard-stats", mentorAuth, async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.mentor.id);
    const studentIds = mentor.mentees.filter(m => m.status === "active").map(m => m.studentId);
    const students = await User.find({ _id: { $in: studentIds } }).select("name level points streak skills");

    const recentSessions = mentor.sessions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalMentees: mentor.mentees.length,
        activeMentees: mentor.mentees.filter(m => m.status === "active").length,
        totalSessions: mentor.totalSessions,
        avgRating: mentor.avgRating,
        points: mentor.points,
        isAvailable: mentor.isAvailable,
      },
      recentSessions,
      topStudents: students.sort((a, b) => b.points - a.points).slice(0, 5),
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/mentor/all (public listing for student mentor search) ─────────────
router.get("/all", async (req, res) => {
  try {
    const { skill } = req.query;
    let query = { isApproved: true, isAvailable: true };
    if (skill) query.skills = { $regex: skill, $options: "i" };
    const mentors = await Mentor.find(query)
      .select("-password -sessions -mentees")
      .sort({ avgRating: -1, totalSessions: -1 })
      .limit(20);
    res.json({ success: true, mentors });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
