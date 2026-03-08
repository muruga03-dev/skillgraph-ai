const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return res.status(401).json({ success: false, message: "Authentication required" });
  try {
    req.user = jwt.verify(h.split(" ")[1], process.env.JWT_SECRET || "secret");
    next();
  } catch (e) {
    res.status(401).json({ success: false, message: e.name === "TokenExpiredError" ? "Session expired" : "Invalid token" });
  }
};
