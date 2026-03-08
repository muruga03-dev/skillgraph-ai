const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  room:    { type: String, required: true },  // "user1id_user2id" or "group_groupid"
  sender:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text:    { type: String, required: true },
  type:    { type: String, default: "text", enum: ["text","file","image"] },
  read:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
