const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const Post    = require("../models/Post");
const Event   = require("../models/Event");
const User    = require("../models/User");

// ── Posts feed ────────────────────────────────────────────────────────────────
router.get("/feed", auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.userId);
    const feed = await Post.find({
      $or: [
        { author: { $in: [...(me.following || []), req.user.userId] } },
        { author: { $exists: true } }  // global feed for now
      ]
    }).sort({ createdAt: -1 }).limit(20)
      .populate("author", "name avatar level points college")
      .populate("comments.author", "name avatar");
    res.json({ success: true, posts: feed });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post("/post", auth, async (req, res) => {
  try {
    const { content, type, tags, link } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: "Content required" });
    const post = await new Post({ author: req.user.userId, content, type: type||"update", tags: tags||[], link }).save();
    const populated = await post.populate("author", "name avatar level points");
    // Award points
    await User.findByIdAndUpdate(req.user.userId, { $inc: { points: 5 } });
    res.status(201).json({ success: true, post: populated });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post("/post/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    const liked = post.likes.includes(req.user.userId);
    if (liked) post.likes.pull(req.user.userId);
    else post.likes.push(req.user.userId);
    await post.save();
    res.json({ success: true, liked: !liked, count: post.likes.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post("/post/:id/comment", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({ author: req.user.userId, text: req.body.text });
    await post.save();
    const updated = await post.populate("comments.author", "name avatar");
    res.json({ success: true, comments: updated.comments });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete("/post/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, author: req.user.userId });
    if (!post) return res.status(404).json({ success: false, message: "Not found" });
    await post.deleteOne();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Events ────────────────────────────────────────────────────────────────────
router.get("/events", auth, async (req, res) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } })
      .sort({ date: 1 }).limit(20)
      .populate("host", "name avatar");
    // Add mock events if empty
    const mockEvents = [
      { title: "React Best Practices 2025", type: "webinar", date: new Date(Date.now() + 2*24*3600000), duration: 60, skills: ["React","JavaScript"], maxAttendees: 200, host: null, meetLink: "https://meet.google.com/abc-defg" },
      { title: "ML Interview Masterclass", type: "career_talk", date: new Date(Date.now() + 5*24*3600000), duration: 90, skills: ["Machine Learning","Python"], maxAttendees: 150, host: null, meetLink: "https://zoom.us/j/1234567" },
      { title: "Live Resume Review Session", type: "resume_review", date: new Date(Date.now() + 7*24*3600000), duration: 120, skills: [], maxAttendees: 30, host: null, meetLink: "https://meet.google.com/xyz-uvwx" },
      { title: "System Design for Beginners", type: "coding_session", date: new Date(Date.now() + 10*24*3600000), duration: 90, skills: ["System Design","DSA"], maxAttendees: 100, host: null, meetLink: "https://zoom.us/j/9876543" },
    ];
    res.json({ success: true, events: events.length > 0 ? events : mockEvents });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post("/events", auth, async (req, res) => {
  try {
    const event = await new Event({ ...req.body, host: req.user.userId }).save();
    res.status(201).json({ success: true, event });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post("/events/:id/rsvp", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    const joined = event.attendees.includes(req.user.userId);
    if (joined) event.attendees.pull(req.user.userId);
    else if (event.attendees.length < event.maxAttendees) event.attendees.push(req.user.userId);
    await event.save();
    res.json({ success: true, joined: !joined, count: event.attendees.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Mentor matching ───────────────────────────────────────────────────────────
router.get("/mentors", auth, async (req, res) => {
  try {
    const { skill } = req.query;
    const q = { role: "mentor", isPublic: true };
    if (skill) q.skills = { $in: [skill] };
    let mentors = await User.find(q).select("name avatar bio skills points level college").limit(20);
    // If no mentors in DB, return mock data
    if (!mentors.length) {
      mentors = [
        { _id: "m1", name: "Priya Sharma", bio: "Senior SDE at Google, 5 yrs exp", skills: ["React","Node.js","System Design","AWS"], points: 3500, level: "Expert", college: "IIT Bombay" },
        { _id: "m2", name: "Arjun Patel", bio: "ML Engineer at Meta, PhD IISc", skills: ["Machine Learning","Python","TensorFlow","NLP"], points: 4200, level: "Expert", college: "IISc Bangalore" },
        { _id: "m3", name: "Sneha Reddy", bio: "Full Stack Dev at Razorpay, 3 yrs", skills: ["JavaScript","React","MongoDB","Docker"], points: 2100, level: "Advanced", college: "NIT Warangal" },
        { _id: "m4", name: "Rahul Kumar", bio: "DevOps at Flipkart, AWS Certified", skills: ["Docker","Kubernetes","AWS","CI/CD","Linux"], points: 1800, level: "Advanced", college: "VIT Vellore" },
      ];
    }
    res.json({ success: true, mentors });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
