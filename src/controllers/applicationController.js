const Application        = require("../models/Application");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: parse dot-notation / bracket-notation FormData keys → nested object
//
// The frontend's appendToFormData() serialises the entire formData tree using
// the full key path as the multipart field name:
//   "step1.firstName"              → { step1: { firstName: "John" } }
//   "checklist.files.passportCopy" → { checklist: { files: { passportCopy: … } } }
//   "emergencyContacts[0].fullName"→ { emergencyContacts: [{ fullName: "…" }] }
// ─────────────────────────────────────────────────────────────────────────────
function parseDotKeys(flat) {
  const result = {};
  for (const [rawKey, value] of Object.entries(flat)) {
    const key   = rawKey.replace(/\[(\d+)\]/g, ".$1").replace(/\[(\w+)\]/g, ".$1");
    const parts = key.split(".");
    let cursor  = result;
    parts.forEach((part, i) => {
      const isLast      = i === parts.length - 1;
      const nextIsIndex = !isLast && /^\d+$/.test(parts[i + 1]);
      if (isLast) {
        cursor[part] = value;
      } else {
        if (cursor[part] === undefined || cursor[part] === null)
          cursor[part] = nextIsIndex ? [] : {};
        cursor = cursor[part];
      }
    });
  }
  return result;
}

// Upload one file buffer to Cloudinary, return { url, publicId }
async function uploadOne(file, folder) {
  console.log(`  [UPLOAD] ${file.fieldname} → ${file.originalname} (${file.size} bytes)`);
  const result = await uploadToCloudinary(file.buffer, folder);
  console.log(`  [UPLOAD] ✅ ${result.secure_url}`);
  return { url: result.secure_url, publicId: result.public_id };
}

// Deep-set a dot-path on a nested object (mutates obj)
function setDeep(obj, dotPath, value) {
  const parts = dotPath.replace(/\[(\d+)\]/g, ".$1").split(".");
  let cursor = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const nextIsIndex = /^\d+$/.test(parts[i + 1]);
    if (cursor[p] === undefined || cursor[p] === null)
      cursor[p] = nextIsIndex ? [] : {};
    cursor = cursor[p];
  }
  cursor[parts[parts.length - 1]] = value;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/applications
// ─────────────────────────────────────────────────────────────────────────────
exports.createApplication = async (req, res) => {
  try {
    // multer.any() → req.body has text fields (flat dot-notation keys)
    //             → req.files is an array of { fieldname, originalname, buffer, ... }
    console.log("\n[APP CREATE] ─────────────────────────────────");
    console.log("[APP CREATE] Body keys:", Object.keys(req.body).length, "fields");
    console.log("[APP CREATE] Files:", (req.files || []).map(f => f.fieldname));

    // 1. Rebuild nested structure from flat text fields
    const nested = parseDotKeys(req.body);

    // 2. Upload every file to Cloudinary
    //    The fieldname IS the dot-path (e.g. "step1.photoUrl",
    //    "checklist.files.passportCopy", "checklist.files.passportPhotos[0]")
    //    Upload it, then store the Cloudinary URL at the same dot-path.
    const files = req.files || [];
    for (const file of files) {
      const folder = file.fieldname.startsWith("checklist")
        ? "harley-admissions/documents"
        : "harley-admissions/photos";

      const { url, publicId } = await uploadOne(file, folder);

      // Store URL at the exact same path the frontend used for the File object
      setDeep(nested, file.fieldname, url);

      // Also store publicId alongside (append "PublicId" to the path)
      setDeep(nested, file.fieldname.replace(/(\w+)$/, "$1PublicId"), publicId);
    }

    console.log("[APP CREATE] Saving to MongoDB...");
    const data = await Application.create(nested);
    console.log("[APP CREATE] ✅ Saved:", data._id);

    res.status(201).json({ success: true, data });

  } catch (err) {
    console.error("[APP CREATE] ❌", err.message);
    res.status(400).json({
      success: false,
      message: err.message,
      hint: err.name === "ValidationError"
        ? "One or more required fields are missing or invalid."
        : undefined,
    });
  }
};

// GET /api/applications  (newest first)
exports.getApplications = async (req, res) => {
  try {
    const data = await Application.find().sort({ createdAt: -1 });
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/applications/:id
exports.getApplication = async (req, res) => {
  try {
    const data = await Application.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Application not found." });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/applications/:id
exports.updateApplication = async (req, res) => {
  try {
    const nested = parseDotKeys(req.body);
    const files  = req.files || [];
    for (const file of files) {
      const folder = file.fieldname.startsWith("checklist")
        ? "harley-admissions/documents"
        : "harley-admissions/photos";
      const { url, publicId } = await uploadOne(file, folder);
      setDeep(nested, file.fieldname, url);
      setDeep(nested, file.fieldname.replace(/(\w+)$/, "$1PublicId"), publicId);
    }
    const data = await Application.findByIdAndUpdate(req.params.id, nested, {
      new: true, runValidators: true,
    });
    if (!data) return res.status(404).json({ success: false, message: "Application not found." });
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/applications/:id
exports.deleteApplication = async (req, res) => {
  try {
    const data = await Application.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Application not found." });
    res.json({ success: true, message: "Application deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
