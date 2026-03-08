const mongoose = require("mongoose");

module.exports = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/skillgraph");
    console.log(`✅ MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB failed:", err.message);
    process.exit(1);
  }
};
