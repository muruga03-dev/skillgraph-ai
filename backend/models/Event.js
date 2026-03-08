const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: String,
  host:        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type:        { type: String, enum: ["webinar","career_talk","resume_review","coding_session","qa"], default: "webinar" },
  date:        { type: Date, required: true },
  duration:    { type: Number, default: 60 },  // minutes
  meetLink:    String,
  skills:      [String],
  maxAttendees:{ type: Number, default: 100 },
  attendees:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isPublic:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
