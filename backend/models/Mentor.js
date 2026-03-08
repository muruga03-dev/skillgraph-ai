const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const mentorSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true },
  password:    { type: String, required: true, minlength: 6 },
  role:        { type: String, default: "mentor" },

  // Profile
  bio:         { type: String, default: "" },
  college:     { type: String, default: "" },
  company:     { type: String, default: "" },
  designation: { type: String, default: "" },
  linkedin:    { type: String, default: "" },
  github:      { type: String, default: "" },
  avatar:      { type: String, default: "" },      // base64 or URL
  skills:      [{ type: String }],
  experience:  { type: Number, default: 0 },       // years

  // Availability
  isAvailable: { type: Boolean, default: true },
  maxMentees:  { type: Number, default: 5 },
  timezone:    { type: String, default: "IST" },
  sessionDays: [{ type: String }],                 // ["Monday","Wednesday"]
  sessionTime: { type: String, default: "6PM-8PM IST" },

  // Assigned students
  mentees: [{
    studentId:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    studentName:{ type: String },
    assignedAt: { type: Date, default: Date.now },
    status:     { type: String, enum: ["active","completed","dropped"], default: "active" },
    notes:      { type: String, default: "" },
  }],

  // Sessions / Activity Log
  sessions: [{
    studentId:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    studentName:{ type: String },
    date:       { type: Date },
    duration:   { type: Number },   // minutes
    topic:      { type: String },
    feedback:   { type: String },
    rating:     { type: Number, min: 1, max: 5 },
  }],

  // Stats
  totalMentees:   { type: Number, default: 0 },
  avgRating:      { type: Number, default: 0 },
  totalSessions:  { type: Number, default: 0 },
  points:         { type: Number, default: 0 },

  isApproved:     { type: Boolean, default: false },
  isActive:       { type: Boolean, default: true },
  lastLogin:      { type: Date },
  createdAt:      { type: Date, default: Date.now },
}, { timestamps: true });

mentorSchema.pre("save", async function(next) {
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 10);
  next();
});

mentorSchema.methods.matchPassword = async function(pwd) {
  return bcrypt.compare(pwd, this.password);
};

module.exports = mongoose.model("Mentor", mentorSchema);
