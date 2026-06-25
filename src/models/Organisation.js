const mongoose = require("mongoose");

// ── Organisation / Recruitment Agency Registration ───────────────────────────
// Stored in its own collection: "organisations"
// Separate from institutions (universities/colleges)

const OrganisationSchema = new mongoose.Schema({

  // ── Section 1: Organisation Identity ──────────────────────────────────────
  identity: {
    fullLegalName: {
      type: String,
      required: [true, "Full legal organisation name is required"],
      trim: true,
    },
    countryOfRegistration: {
      type: String,
      required: [true, "Country of registration is required"],
    },
    countriesOfOperation: {
      // Array: countries where they currently operate / place workers
      type: [String],
      default: [],
    },
    websiteUrl: {
      type: String,
      trim: true,
    },
    isLicensedAgency: {
      // Yes / No / In process
      type: String,
      enum: ["Yes", "No", "In process"],
      required: [true, "Licensed agency status is required"],
    },
  },

  // ── Section 2: Contact Person ──────────────────────────────────────────────
  contact: {
    fullName: {
      type: String,
      required: [true, "Contact person full name is required"],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String, // also serves as WhatsApp number
      trim: true,
    },
    whatsapp: {
      type: String, // separate WhatsApp if different from phone
      trim: true,
    },
  },

  // ── Status / Admin fields ──────────────────────────────────────────────────
  status: {
    type: String,
    enum: ["pending", "under_review", "approved", "rejected"],
    default: "pending",
  },
  notes: { type: String }, // internal admin notes

}, { timestamps: true });

module.exports = mongoose.model("Organisation", OrganisationSchema);
