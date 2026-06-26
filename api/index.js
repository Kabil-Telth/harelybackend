// api/index.js
const express   = require("express");
const morgan    = require("morgan");
const cors      = require("cors");
const dotenv    = require("dotenv");
const dns       = require("dns");
const rateLimit = require("express-rate-limit");
 
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");
dotenv.config();
 
const connectDB          = require("../src/config/db");
const { login }          = require("../src/middleware/auth");
const applicationRoutes  = require("../src/routes/applicationRoutes");
const institutionRoutes  = require("../src/routes/institutionRoutes");
const organisationRoutes = require("../src/routes/organisationRoutes");
 
const app = express();
 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
 
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(limiter);
 
connectDB();
 
// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/", (req, res) =>
  res.json({ success: true, message: "Harley Admission API is running ✅" })
);
 
// Auth — public
app.post("/api/auth/login", login);
 
// Feature routes (POST public, rest protected — see each route file)
app.use("/api/applications",  applicationRoutes);
app.use("/api/institutions",  institutionRoutes);
app.use("/api/organisations", organisationRoutes);
 
// 404
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` })
);
 
// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  if (err.code === "LIMIT_FILE_SIZE")
    return res.status(400).json({ success: false, message: "File too large. Max 5 MB." });
  if (err.name === "MulterError")
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  if (err.name === "ValidationError") {
    const fields = Object.keys(err.errors).map(k => `${k}: ${err.errors[k].message}`);
    return res.status(400).json({ success: false, message: "Validation failed.", errors: fields });
  }
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error." });
});
 
module.exports = app;

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});