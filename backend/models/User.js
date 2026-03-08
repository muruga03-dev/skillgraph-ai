const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },  // optional for OAuth users
  avatar:   { type: String, default: "" },
  theme:    { type: String, default: "dark", enum: ["dark","light"] },
  bio:      { type: String, default: "" },
  college:  { type: String, default: "" },
  year:     { type: String, default: "" },
  linkedin: { type: String, default: "" },
  github:   { type: String, default: "" },
  
  // Auth providers
  googleId:   { type: String },
  linkedinId: { type: String },
  authProvider: { type: String, default: "local", enum: ["local","google","linkedin"] },

  // Skills & career
  skills:       { type: [String], default: [] },
  targetRole:   { type: String, default: "" },
  learningGoals:{ type: [String], default: [] },

  // Progress tracking
  skillProgress: [{
    skill:    String,
    status:   { type: String, enum: ["planning","learning","completed"], default: "planning" },
    progress: { type: Number, default: 0 },  // 0–100
    startedAt:  Date,
    completedAt:Date,
  }],

  // Certificates
  certificates: [{
    title:  String,
    skill:  String,
    issuedBy: String,
    uploadedAt: { type: Date, default: Date.now },
    verified:   { type: Boolean, default: true },
    points:     { type: Number, default: 20 },
    filePath:   String,
  }],

  // Gamification
  points:   { type: Number, default: 0 },
  badges:   [{ badgeId: String, earnedAt: { type: Date, default: Date.now } }],
  streak:   { type: Number, default: 0 },
  lastLogin:{ type: Date },
  level:    { type: String, default: "Beginner" },

  // Social
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // Stats
  analysisCount: { type: Number, default: 0 },
  challengesCompleted: [String],
  
  isPublic: { type: Boolean, default: true },
  role:     { type: String, default: "student", enum: ["student","mentor","admin"] },
}, { timestamps: true });

userSchema.pre("save", async function(next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function(p) { return bcrypt.compare(p, this.password || ""); };

userSchema.methods.toSafeObject = function() {
  const o = this.toObject();
  delete o.password; delete o.googleId; delete o.linkedinId;
  return o;
};

// Update level based on points
userSchema.methods.updateLevel = function() {
  if (this.points >= 2000) this.level = "Expert";
  else if (this.points >= 800) this.level = "Advanced";
  else if (this.points >= 300) this.level = "Intermediate";
  else this.level = "Beginner";
};

module.exports = mongoose.model("User", userSchema);
