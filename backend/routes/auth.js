const express   = require("express");
const router    = express.Router();
const jwt       = require("jsonwebtoken");
const passport  = require("passport");
const { body, validationResult } = require("express-validator");
const User      = require("../models/User");
const auth      = require("../middleware/auth");

const makeToken = (id, email) => jwt.sign({ userId: id, email }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });


// ── GET /me (used by OAuth callback to fetch user profile) ───────────────────
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Local signup ──────────────────────────────────────────────────────────────
router.post("/signup", [
  body("name").trim().isLength({ min: 2 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(409).json({ success: false, message: "Email already registered" });
    const user = await new User({ name, email, password, authProvider: "local" }).save();
    res.status(201).json({ success: true, token: makeToken(user._id, user.email), user: user.toSafeObject() });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Local login ───────────────────────────────────────────────────────────────
router.post("/login", [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ success: false, message: "Invalid email or password" });
    // Streak: calendar-day based (resets if >1 day gap, increments if new day)
    const now  = new Date();
    const last = user.lastLogin;
    if (last) {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
      const diffDays = Math.round((today - lastDay) / 86400000);
      if (diffDays === 0) { /* same day — keep streak */ }
      else if (diffDays === 1) { user.streak = (user.streak || 0) + 1; } // consecutive day
      else { user.streak = 1; } // gap > 1 day — reset
    } else {
      user.streak = 1;
    }
    user.lastLogin = now;
    await user.save();
    res.json({ success: true, token: makeToken(user._id, user.email), user: user.toSafeObject() });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Profile ───────────────────────────────────────────────────────────────────
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: user.toSafeObject() });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put("/profile", auth, async (req, res) => {
  try {
    const { name, bio, college, year, linkedin, github, targetRole, learningGoals } = req.body;
    const update = {};
    if (name) update.name = name; if (bio !== undefined) update.bio = bio;
    if (college) update.college = college; if (year) update.year = year;
    if (linkedin) update.linkedin = linkedin; if (github) update.github = github;
    if (targetRole) update.targetRole = targetRole; if (learningGoals) update.learningGoals = learningGoals;
    const user = await User.findByIdAndUpdate(req.user.userId, update, { new: true }).select("-password");
    res.json({ success: true, user: user.toSafeObject() });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put("/skills", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.userId, { skills: req.body.skills || [] }, { new: true }).select("-password");
    res.json({ success: true, user: user.toSafeObject() });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Progress tracker ──────────────────────────────────────────────────────────
router.put("/progress", auth, async (req, res) => {
  try {
    const { skill, status, progress } = req.body;
    const user = await User.findById(req.user.userId);
    const existing = user.skillProgress.find(s => s.skill === skill);
    if (existing) {
      existing.status = status || existing.status;
      existing.progress = progress !== undefined ? progress : existing.progress;
      if (status === "completed" && !existing.completedAt) {
        existing.completedAt = new Date();
        user.points += 50; // Award points for completing a skill
        user.updateLevel();
      }
    } else {
      user.skillProgress.push({ skill, status: status || "planning", progress: progress || 0, startedAt: new Date() });
    }
    await user.save();
    res.json({ success: true, skillProgress: user.skillProgress, points: user.points, level: user.level });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Google OAuth (only if credentials configured) ────────────────────────────
router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({ success: false, message: "Google OAuth not configured. Add GOOGLE_CLIENT_ID to .env" });
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_not_configured`);
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }, (err, user) => {
    if (err || !user) return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth`);
    const token = makeToken(user._id, user.email);
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}`);
  })(req, res, next);
});

// ── LinkedIn OAuth (only if credentials configured) ───────────────────────────
router.get("/linkedin", (req, res, next) => {
  if (!process.env.LINKEDIN_CLIENT_ID) {
    return res.status(503).json({ success: false, message: "LinkedIn OAuth not configured. Add LINKEDIN_CLIENT_ID to .env" });
  }
  passport.authenticate("linkedin", { scope: ["r_emailaddress", "r_liteprofile"] })(req, res, next);
});

router.get("/linkedin/callback", (req, res, next) => {
  if (!process.env.LINKEDIN_CLIENT_ID) return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_not_configured`);
  passport.authenticate("linkedin", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }, (err, user) => {
    if (err || !user) return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth`);
    const token = makeToken(user._id, user.email);
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}`);
  })(req, res, next);
});

// ── Leaderboard ───────────────────────────────────────────────────────────────
router.get("/leaderboard", auth, async (req, res) => {
  try {
    const users = await User.find({ isPublic: true })
      .select("name avatar points level badges streak skills college")
      .sort({ points: -1 }).limit(50);
    res.json({ success: true, leaderboard: users });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Follow/Unfollow ───────────────────────────────────────────────────────────
router.post("/follow/:userId", auth, async (req, res) => {
  try {
    const target = await User.findById(req.params.userId);
    if (!target) return res.status(404).json({ success: false, message: "User not found" });
    const me = await User.findById(req.user.userId);
    const isFollowing = me.following.includes(req.params.userId);
    if (isFollowing) {
      me.following.pull(req.params.userId);
      target.followers.pull(req.user.userId);
    } else {
      me.following.push(req.params.userId);
      target.followers.push(req.user.userId);
    }
    await me.save(); await target.save();
    res.json({ success: true, isFollowing: !isFollowing });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Community users search ────────────────────────────────────────────────────
router.get("/community", auth, async (req, res) => {
  try {
    const { search, skill, role } = req.query;
    const q = { isPublic: true };
    if (search) q.$or = [{ name: new RegExp(search,"i") }, { college: new RegExp(search,"i") }];
    if (skill) q.skills = { $in: [skill] };
    if (role) q.role = role;
    const users = await User.find(q).select("name avatar bio college skills points level badges role").limit(40);
    res.json({ success: true, users });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Certificate upload ────────────────────────────────────────────────────────
router.post("/certificate", auth, async (req, res) => {
  try {
    const { title, skill, issuedBy, points } = req.body;
    const user = await User.findById(req.user.userId);
    user.certificates.push({ title, skill, issuedBy, points: points || 20, verified: true });
    user.points += (points || 20);
    user.updateLevel();
    if (!user.skills.includes(skill)) user.skills.push(skill);
    await user.save();
    res.json({ success: true, certificates: user.certificates, points: user.points });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;

// ── Avatar upload (base64, max 2MB) ───────────────────────────────────────────
router.post("/avatar", auth, async (req, res) => {
  try {
    const { avatar } = req.body;   // base64 data URL
    if (!avatar) return res.status(400).json({ success: false, message: "No avatar data" });
    if (avatar.length > 2 * 1024 * 1024 * 1.37) { // ~2MB base64
      return res.status(400).json({ success: false, message: "Image too large. Max 2MB." });
    }
    const user = await User.findByIdAndUpdate(req.user.userId, { avatar }, { new: true }).select("-password");
    res.json({ success: true, avatar: user.avatar, user });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Theme preference ──────────────────────────────────────────────────────────
router.put("/theme", auth, async (req, res) => {
  try {
    const { theme } = req.body;
    const user = await User.findByIdAndUpdate(req.user.userId, { theme }, { new: true }).select("-password");
    res.json({ success: true, theme: user.theme });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── AI Chat Proxy (avoids browser CORS on Anthropic API) ─────────────────────
router.post("/ai/chat", auth, async (req, res) => {
  try {
    const { messages, system } = req.body;
    const axios = require("axios");
    const { data } = await axios.post("https://api.anthropic.com/v1/messages", {
      model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages,
    }, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
    });
    res.json(data);
  } catch (e) {
    const msg = e.response?.data?.error?.message || e.message;
    res.status(500).json({ error: { message: msg } });
  }
});
