const mongoose = require("mongoose");

const InstitutionPartnerSchema = new mongoose.Schema({
  institutionIdentity: {
    fullLegalInstitutionName: { type: String, required: true, trim: true },
    country:     { type: String, required: true },
    city:        { type: String, required: true },
    institutionType: {
      type: String,
      enum: ["Public University","Private University","Medical College",
             "Nursing College","Online University","Accredited Training Body","Other"],
      required: true,
    },
    websiteUrl:         { type: String },
    accredited:         { type: Boolean, default: false },
    accreditationBody:  { type: String },
  },

  contactPerson: {
    fullName:       { type: String, required: true },
    designation:    { type: String, required: true },
    officialEmail:  { type: String, required: true, lowercase: true },
    phoneNumber:    { type: String },
    whatsappNumber: { type: String },
  },


  status: {
    type: String,
    enum: ["pending","under_review","approved","rejected"],
    default: "pending",
  },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("InstitutionPartner", InstitutionPartnerSchema);
