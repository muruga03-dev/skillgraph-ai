const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  author:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, maxlength: 2000 },
  type:    { type: String, default: "update", enum: ["update","achievement","question","resource","job"] },
  tags:    [String],
  likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments:[{
    author:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text:    String,
    createdAt:{ type: Date, default: Date.now }
  }],
  image:  String,
  link:   String,
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
