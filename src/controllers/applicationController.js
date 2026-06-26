// src/controllers/applicationController.js
const Application        = require("../models/Application");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

// Parse dot-notation / bracket-notation flat FormData keys → nested object
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

// Deep-set a dot-path on a nested object (supports array indices)
function setDeep(obj, dotPath, value) {
  // Normalise bracket notation → dot notation first
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

// Upload one file buffer to Cloudinary
async function uploadOne(file, folder) {
  console.log(`  [UPLOAD] ${file.fieldname} → ${file.originalname} (${file.size} bytes)`);
  const result = await uploadToCloudinary(file.buffer, folder);
  console.log(`  [UPLOAD] ✅ ${result.secure_url}`);
  return { url: result.secure_url, publicId: result.public_id };
}

// Build the publicId storage path from the file's fieldname.
// FIX: previous regex /(\w+)$/ matched the INDEX digit on array paths like
// "checklist.files.passportPhotos[0]" → produced "passportPhotos[0PublicId]"
// which is invalid. Now we strip the bracket index, append PublicId to the
// field name, then put the index back.
//   "checklist.files.passportPhotos[0]" → "checklist.files.passportPhotosPublicId[0]"
//   "step1.photoUrl"                    → "step1.photoUrlPublicId"
//   "checklist.files.passportCopy"      → "checklist.files.passportCopyPublicId"
function publicIdPath(fieldname) {
  const bracketMatch = fieldname.match(/^(.*?)(\[\d+\])$/);
  if (bracketMatch) {
    // Has trailing index → insert PublicId before the bracket
    return bracketMatch[1] + "PublicId" + bracketMatch[2];
  }
  return fieldname + "PublicId";
}

// POST /api/applications
exports.createApplication = async (req, res) => {
  try {
    console.log("\n[APP CREATE] ─────────────────────────────────");
    console.log("[APP CREATE] Body keys:", Object.keys(req.body).length, "fields");
    console.log("[APP CREATE] Files:", (req.files || []).map(f => f.fieldname));

    const nested = parseDotKeys(req.body);

    const files = req.files || [];
    for (const file of files) {
      const folder = file.fieldname.startsWith("checklist")
        ? "harley-admissions/documents"
        : "harley-admissions/photos";

      const { url, publicId } = await uploadOne(file, folder);

      setDeep(nested, file.fieldname, url);              // store URL at original path
      setDeep(nested, publicIdPath(file.fieldname), publicId); // store publicId alongside
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
      hint: err.name === "ValidationError" ? "One or more required fields are missing." : undefined,
    });
  }
};

// GET /api/applications
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
      setDeep(nested, publicIdPath(file.fieldname), publicId);
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