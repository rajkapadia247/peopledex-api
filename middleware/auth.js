const { verifyToken } = require("../utils/jwt");

module.exports = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Access denied. No token found." });

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};
