require("dotenv").config();
// Sanitize LinkedIn secret (may contain == from base64)
if (process.env.LINKEDIN_CLIENT_SECRET) {
  process.env.LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET.trim();
}
const express   = require("express");
const http      = require("http");
const cors      = require("cors");
const passport  = require("passport");
const session   = require("express-session");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const Message   = require("./models/Message");

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:3000", methods: ["GET","POST"] }
});

connectDB();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(session({ secret: process.env.SESSION_SECRET || "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// ── Passport Google OAuth ─────────────────────────────────────────────────────
const GoogleStrategy  = require("passport-google-oauth20").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const User = require("./models/User");

if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        user = await new User({
          name: profile.displayName, email: profile.emails[0].value,
          avatar: profile.photos[0]?.value, googleId: profile.id, authProvider: "google"
        }).save();
      } else if (!user.googleId) {
        user.googleId = profile.id; await user.save();
      }
      done(null, user);
    } catch (e) { done(e, null); }
  }));
}

if (process.env.LINKEDIN_CLIENT_ID) {
  passport.use(new LinkedInStrategy({
    clientID:     process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL:  process.env.LINKEDIN_CALLBACK_URL,
    scope:        ["r_emailaddress","r_liteprofile"],
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ linkedinId: profile.id });
      if (!user) user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        user = await new User({
          name: profile.displayName, email: profile.emails[0].value,
          linkedinId: profile.id, authProvider: "linkedin"
        }).save();
      }
      done(null, user);
    } catch (e) { done(e, null); }
  }));
}

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try { done(null, await User.findById(id)); } catch (e) { done(e, null); }
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",      require("./routes/auth"));
app.use("/api/mentor",    require("./routes/mentor"));
app.use("/api/analysis",  require("./routes/analysis"));
app.use("/api/community", require("./routes/community"));
app.use("/api/ai", require("./routes/ai"));
app.get("/api/health", (req, res) => res.json({ status: "ok", version: "2.0.0", timestamp: new Date().toISOString() }));
app.use((req, res) => res.status(404).json({ success: false, message: `Not found: ${req.method} ${req.url}` }));
app.use((err, req, res, next) => res.status(500).json({ success: false, message: err.message }));

// ── Socket.io Chat ────────────────────────────────────────────────────────────
const onlineUsers = new Map(); // userId → socketId

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("join", ({ userId }) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    io.emit("online_users", Array.from(onlineUsers.keys()));
  });

  socket.on("join_room", ({ room }) => {
    socket.join(room);
  });

  socket.on("send_message", async ({ room, text, senderId }) => {
    try {
      const msg = await new Message({ room, sender: senderId, text }).save();
      const populated = await msg.populate("sender", "name avatar");
      io.to(room).emit("receive_message", populated);
    } catch (e) { console.error("Message error:", e.message); }
  });

  socket.on("typing", ({ room, userName }) => {
    socket.to(room).emit("user_typing", { userName });
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("online_users", Array.from(onlineUsers.keys()));
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n${"═".repeat(55)}`);
  console.log(`  🚀 SkillGraph AI Backend v2.0`);
  console.log(`  🌐 http://localhost:${PORT}`);
  console.log(`  🔑 Auth: /api/auth`);
  console.log(`  🔍 Analysis: /api/analysis`);
  console.log(`  👥 Community: /api/community`);
  console.log(`  💬 WebSocket: Socket.io enabled`);
  console.log(`${"═".repeat(55)}\n`);
});

module.exports = { app, io };
