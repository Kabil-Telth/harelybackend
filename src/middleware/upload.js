const multer = require("multer");

// memoryStorage keeps file in RAM as req.file.buffer
// We pipe that buffer directly to Cloudinary — no disk writes needed
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);  // accept
  } else {
    cb(new Error("Only jpg/png/webp images and PDFs are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB cap per file
});

module.exports = upload;
