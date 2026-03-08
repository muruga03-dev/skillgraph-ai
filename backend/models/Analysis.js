const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  inputSkills: [String],
  inputMethod: { type: String, enum: ["manual","resume","certificate"], default: "manual" },
  predictions: [{ job_role: String, match_percentage: Number, matching_skills: [String], missing_skills: [String], irrelevant_skills: [String], avg_salary: String, demand_level: String }],
  topMatch:    { job_role: String, match_percentage: Number, matching_skills: [String], missing_skills: [String], description: String },
  learningPath:[{ skill: String, difficulty: String, estimated_hours: Number, category: String, is_prerequisite: Boolean }],
  studyPlan:   mongoose.Schema.Types.Mixed,
  readiness:   { score: Number, level: String },
  careerRoadmap: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model("Analysis", analysisSchema);
