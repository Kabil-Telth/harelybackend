const express   = require("express");
const morgan    = require("morgan");
const cors      = require("cors");
const dotenv    = require("dotenv");
const dns       = require("dns");
const rateLimit = require("express-rate-limit");

// Fix DNS for MongoDB on Windows — prefer IPv4
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

dotenv.config();

const connectDB          = require("../src/config/db");
const applicationRoutes  = require("../src/routes/applicationRoutes");
const institutionRoutes  = require("../src/routes/institutionRoutes");
const organisationRoutes = require("../src/routes/organisationRoutes");

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min window
  max: 10,                  // 100 requests per IP
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors());
app.use(express.json({ limit: "10mb" })); // for any pure-JSON endpoints
app.use(morgan("dev"));
app.use(limiter);

connectDB();

// ── Routes ───────────────────────────────────────────────────────────────────
app.get("/", (req, res) =>
  res.json({ success: true, message: "Harley Admission API is running ✅" })
);

app.use("/api/applications",  applicationRoutes);
app.use("/api/institutions",  institutionRoutes);
app.use("/api/organisations", organisationRoutes);

// 404 handler — unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Global error handler ─────────────────────────────────────────────────────
// Catches all errors thrown in routes including multer errors.
// Returns clean JSON so frontend always gets a readable message.
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);

  // Multer-specific errors → give a clear user-facing message
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large. Maximum allowed size is 5 MB.",
    });
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: `Unexpected file field: "${err.field}". Check the field name matches what the server expects.`,
    });
  }
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  // Mongoose validation errors → list every invalid field
  if (err.name === "ValidationError") {
    const fields = Object.keys(err.errors).map(
      (k) => `${k}: ${err.errors[k].message}`
    );
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: fields,
    });
  }

  // Generic fallback
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

module.exports = app;

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT;
  app.listen(PORT, () =>
    console.log(`🚀 Server running → http://localhost:${PORT}`)
  );
}
