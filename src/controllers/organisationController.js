const Organisation = require("../models/Organisation");

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: parse dot-notation FormData keys into nested object
// Same helper as applicationController — needed because the frontend sends
// FormData for this registration form too (identity.fullLegalName, etc.)
// ─────────────────────────────────────────────────────────────────────────────
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

// POST /api/organisations
exports.createOrganisation = async (req, res) => {
  try {
    console.log("[ORG CREATE] req.body keys:", Object.keys(req.body));
    const nested = parseDotKeys(req.body);
    console.log("[ORG CREATE] Parsed data:", JSON.stringify(nested, null, 2));

    const org = await Organisation.create(nested);
    console.log("[ORG CREATE] ✅ Saved organisation:", org._id, "-", org.identity?.fullLegalName);
    res.status(201).json({ success: true, data: org });

  } catch (err) {
    console.error("[ORG CREATE] ❌ Error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/organisations
exports.getOrganisations = async (req, res) => {
  try {
    const orgs = await Organisation.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orgs.length, data: orgs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/organisations/:id
exports.getOrganisation = async (req, res) => {
  try {
    const org = await Organisation.findById(req.params.id);
    if (!org) return res.status(404).json({ success: false, message: "Organisation not found" });
    res.json({ success: true, data: org });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/organisations/:id
exports.updateOrganisation = async (req, res) => {
  try {
    const nested = parseDotKeys(req.body);
    const org = await Organisation.findByIdAndUpdate(req.params.id, nested, {
      new: true,
      runValidators: true,
    });
    if (!org) return res.status(404).json({ success: false, message: "Organisation not found" });
    res.json({ success: true, data: org });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/organisations/:id
exports.deleteOrganisation = async (req, res) => {
  try {
    const org = await Organisation.findByIdAndDelete(req.params.id);
    if (!org) return res.status(404).json({ success: false, message: "Organisation not found" });
    res.json({ success: true, message: "Organisation deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
