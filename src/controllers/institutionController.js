const InstitutionPartner  = require("../models/InstitutionPartner");
const uploadToCloudinary  = require("../utils/cloudinaryUpload");

// Parse dot-notation FormData keys  (institutionIdentity.country → nested)
function parseDotKeys(flat) {
  const result = {};
  for (const [rawKey, value] of Object.entries(flat)) {
    const key   = rawKey.replace(/\[(\d+)\]/g, ".$1").replace(/\[(\w+)\]/g, ".$1");
    const parts = key.split(".");
    let cursor  = result;
    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        cursor[part] = value;
      } else {
        if (!cursor[part]) cursor[part] = /^\d+$/.test(parts[i + 1]) ? [] : {};
        cursor = cursor[part];
      }
    });
  }
  return result;
}

// POST /api/institutions
exports.createInstitution = async (req, res) => {
  try {
    console.log("[INST CREATE] req.body keys:", Object.keys(req.body));
    const nested = parseDotKeys(req.body);
    console.log("[INST CREATE] Parsed data:", JSON.stringify(nested, null, 2));

    let logoUrl, logoPublicId;
    if (req.file) {
      // FIX: pass req.file.buffer (actual bytes), not req.file (multer object)
      // Previously: uploadToCloudinary(req.file) → only stored the filename
      console.log(`[INST CREATE] Uploading logo: ${req.file.originalname}`);
      const result = await uploadToCloudinary(req.file.buffer, "harley-institutions");
      logoUrl      = result.secure_url;
      logoPublicId = result.public_id;
      console.log("[INST CREATE] ✅ Logo uploaded:", logoUrl);
    }

    const institution = await InstitutionPartner.create({
      ...nested,
      logoUrl,
      logoPublicId,
    });

    console.log("[INST CREATE] ✅ Saved institution:", institution._id);
    res.status(201).json({ success: true, data: institution });

  } catch (err) {
    console.error("[INST CREATE] ❌ Error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/institutions
exports.getInstitutions = async (req, res) => {
  try {
    const institutions = await InstitutionPartner.find().sort({ createdAt: -1 });
    res.json({ success: true, count: institutions.length, data: institutions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/institutions/:id
exports.getInstitution = async (req, res) => {
  try {
    const institution = await InstitutionPartner.findById(req.params.id);
    if (!institution) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: institution });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/institutions/:id
exports.updateInstitution = async (req, res) => {
  try {
    const nested = parseDotKeys(req.body);
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "harley-institutions");
      nested.logoUrl      = result.secure_url;
      nested.logoPublicId = result.public_id;
    }
    const institution = await InstitutionPartner.findByIdAndUpdate(
      req.params.id, nested, { new: true, runValidators: true }
    );
    if (!institution) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: institution });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/institutions/:id
exports.deleteInstitution = async (req, res) => {
  try {
    const institution = await InstitutionPartner.findByIdAndDelete(req.params.id);
    if (!institution) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
