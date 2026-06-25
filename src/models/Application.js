const mongoose = require("mongoose");

// Mirrors the exact structure from frontend's getInitialFormData()
// Using Mixed/Object type for nested dynamic sections so mongoose doesn't
// reject fields it doesn't know — the dot-key parser rebuilds the exact shape.

const ApplicationSchema = new mongoose.Schema({

  step1: {
    joiningDate: String,
    program: String,
    photoUrl: String,       // Cloudinary URL (was a File on frontend)
    photoUrlPublicId: String,

    firstName: String, lastName: String, middleName: String,
    passportNumber: String, gender: String, age: String,
    dateOfBirth: String,
    mobilePhone: String, homePhone: String,
    studentEmail: String, parentEmail: String,
    cityStateCountryOfBirth: String,
    citizenshipStatus: String, permanentResident: String,
    alienRegistration: String, countryOfCitizenship: String,
    visaType: String, ukEntryDate: String,

    currentMailingAddress: {
      street: String, state: String, country: String, postalCode: String,
    },
    billingInformation: {
      firstName: String, lastName: String, middleName: String,
      address: String, city: String, state: String,
    },
    useSameAddressForBilling: mongoose.Schema.Types.Mixed,
  },

  emergencyContacts: [{
    fullName: String,
    phoneNumber: String,
    relation: String,
    _id: false,
  }],

  academics: {
    highSchool: {
      schoolName: String, city: String, state: String,
      country: String, graduationDate: String, completionCertificate: String,
    },
    englishTests: {
      ielts: { taken: mongoose.Schema.Types.Mixed, grade: String, date: String },
      toefl: { taken: mongoose.Schema.Types.Mixed, grade: String, date: String },
      oet:   { taken: mongoose.Schema.Types.Mixed, grade: String, date: String },
    },
    previousInstitutions: [{
      institutionName: String, city: String, stateCountry: String,
      fromDate: String, toDate: String, creditsEarned: String,
      major: String, degreeEarned: String,
      _id: false,
    }],
  },

  personalStatement: String,

  campusSecurity: {
    criminalConviction: mongoose.Schema.Types.Mixed,
    academicDismissal:  mongoose.Schema.Types.Mixed,
    explanationLetter:  String,
  },

  studentAgreement: {
    agreed: mongoose.Schema.Types.Mixed,
    signedDate: String,
  },

  checklist: {
    files: {
      // Each file field stores the Cloudinary URL after upload
      // Multi-file fields (passportPhotos, recommendationLetters) become arrays of URLs
      passportPhotos:             mongoose.Schema.Types.Mixed, // array of up to 3 URLs
      passportCopy:               String,
      recommendationLetters:      mongoose.Schema.Types.Mixed, // array of up to 2 URLs
      personalStatementSubmitted: String,
      transcriptsSubmitted:       String,
      highSchoolDiplomaSubmitted: String,
    },
    documentsConfirmed: mongoose.Schema.Types.Mixed,
  },

  agentInformation: {
    name: String,
    contactInformation: String,
    agentNumber: String,
  },

  status: {
    type: String,
    enum: ["draft", "submitted", "under_review", "approved", "rejected"],
    default: "draft",
  },

}, { timestamps: true });

module.exports = mongoose.model("Application", ApplicationSchema);
