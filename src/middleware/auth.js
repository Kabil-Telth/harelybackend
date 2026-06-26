// src/middleware/auth.js
const jwt = require("jsonwebtoken");

const ADMIN = {
  email:    "admin@medpass",
  password: "Admin123@456",  // checked in plain — no DB needed for single hardcoded admin
};

const JWT_SECRET = process.env.JWT_SECRET || "medpass_super_secret_change_in_prod";
const JWT_EXPIRES = "8h"; // token valid for 8 hours

// ── POST /api/auth/login ─────────────────────────────────────────────────────
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email and password are required." });

  if (email !== ADMIN.email || password !== ADMIN.password)
    return res.status(401).json({ success: false, message: "Invalid credentials." });

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  console.log("[AUTH] ✅ Admin logged in:", email);
  res.json({ success: true, token, expiresIn: JWT_EXPIRES });
};

// ── Middleware: protect routes ───────────────────────────────────────────────
// Usage: router.get("/", protect, handler)
exports.protect = (req, res, next) => {
  const header = req.headers.authorization;

  // Expect:  Authorization: Bearer <token>
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });

  const token = header.split(" ")[1];

  try {
    req.admin = jwt.verify(token, JWT_SECRET); // attaches decoded payload to req
    next();
  } catch (err) {
    // Expired vs tampered — give specific message
    const message = err.name === "TokenExpiredError"
      ? "Session expired. Please log in again."
      : "Invalid token.";
    res.status(401).json({ success: false, message });
  }
};