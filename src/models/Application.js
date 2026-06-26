const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    // ─────────────────────────────────────────────
    // STEP 1 — Personal & Programme Information
    // ─────────────────────────────────────────────
    step1: {
      joiningDate: String,   // e.g. "2026-01"
      program:     String,   // e.g. "Continuous Professional Development Program"

      // Profile photo (Cloudinary)
      photoUrl:         String,
      photoUrlPublicId: String,

      // Personal details
      firstName:  String,
      lastName:   String,
      middleName: String,

      // Identity documents
      passportNumber: String,
      aadharPanNumber: String,

      // Demographics
      gender:               String,   // "Male" | "Female" | "Other"
      age:                  String,
      dateOfBirth:          String,   // "YYYY-MM-DD"
      cityStateCountryOfBirth: String,

      // Contact
      mobilePhone: String,
      homePhone:   String,
      studentEmail: String,
      parentEmail:  String,

      // Immigration / citizenship
      citizenshipStatus:    String,   // "Yes" / "No"
      permanentResident:    String,
      alienRegistration:    String,
      countryOfCitizenship: String,
      visaType:             String,
      ukEntryDate:          String,   // "YYYY-MM-DD"

      // Mailing address
      currentMailingAddress: {
        street:     String,
        state:      String,
        country:    String,
        postalCode: String,
      },

      // Billing information
      billingInformation: {
        firstName:  String,
        lastName:   String,
        middleName: String,
        address:    String,
        city:       String,
        state:      String,
      },

      useSameAddressForBilling: mongoose.Schema.Types.Mixed, // boolean as string or bool
    },

    // ─────────────────────────────────────────────
    // EMERGENCY CONTACTS
    // ─────────────────────────────────────────────
    emergencyContacts: [
      {
        fullName:    String,
        phoneNumber: String,
        relation:    String,
        email:       String,        // ← added (field 37)
        addressLine: String,        // ← added (field 38)
        city:        String,        // ← added (field 39)
        state:       String,        // ← added (field 40)
        pincode:     String,        // ← added (field 41)
        country:     String,        // ← added (field 42)
        _id: false,
      },
    ],

    // ─────────────────────────────────────────────
    // ACADEMICS
    // ─────────────────────────────────────────────
    academics: {
      highSchool: {
        schoolName:             String,
        city:                   String,
        state:                  String,
        country:                String,
        graduationDate:         String,   // "YYYY-MM-DD"
        completionCertificate:  String,   // Cloudinary URL
      },

      englishTests: {
        ielts: {
          taken: mongoose.Schema.Types.Mixed,  // boolean
          grade: String,
          date:  String,
        },
        toefl: {
          taken: mongoose.Schema.Types.Mixed,
          grade: String,
          date:  String,
        },
        oet: {
          taken: mongoose.Schema.Types.Mixed,
          grade: String,
          date:  String,
        },
      },

      previousInstitutions: [
        {
          institutionName: String,
          city:            String,
          stateCountry:    String,
          fromDate:        String,
          toDate:          String,
          creditsEarned:   String,
          major:           String,
          degreeEarned:    String,
          _id: false,
        },
      ],
    },

    // ─────────────────────────────────────────────
    // PERSONAL STATEMENT
    // ─────────────────────────────────────────────
    personalStatement:       String,
    personalStatementMethod: String,        // "type" | "upload"
    personalStatementFileUrl: String,       // Cloudinary URL (when method = "upload")

    // ─────────────────────────────────────────────
    // CAMPUS SECURITY
    // ─────────────────────────────────────────────
    campusSecurity: {
      criminalConviction: mongoose.Schema.Types.Mixed,  // boolean
      academicDismissal:  mongoose.Schema.Types.Mixed,  // boolean
      explanationLetter:  String,                        // Cloudinary URL
    },

    // ─────────────────────────────────────────────
    // STUDENT AGREEMENT
    // ─────────────────────────────────────────────
    studentAgreement: {
      agreed:       mongoose.Schema.Types.Mixed,  // boolean
      signatureUrl: String,                        // Cloudinary URL (was File on frontend)
      signedDate:   String,                        // "YYYY-MM-DD"
    },

    // ─────────────────────────────────────────────
    // CHECKLIST
    // ─────────────────────────────────────────────
    checklist: {
      // Boolean flags — whether each item is confirmed complete
      passportPhotos:             mongoose.Schema.Types.Mixed,  // boolean
      registrationFeePaid:        mongoose.Schema.Types.Mixed,  // boolean  ← added (field 76)
      passportCopy:               mongoose.Schema.Types.Mixed,  // boolean
      healthCertificate:          mongoose.Schema.Types.Mixed,  // boolean  ← added (field 78)
      policeClearanceCertificate: mongoose.Schema.Types.Mixed,  // boolean  ← added (field 79)
      recommendationLetters:      mongoose.Schema.Types.Mixed,  // boolean
      personalStatementSubmitted: mongoose.Schema.Types.Mixed,  // boolean
      transcriptsSubmitted:       mongoose.Schema.Types.Mixed,  // boolean
      highSchoolDiplomaSubmitted: mongoose.Schema.Types.Mixed,  // boolean
      documentsConfirmed:         mongoose.Schema.Types.Mixed,  // boolean

      // Uploaded file URLs (Cloudinary)
      files: {
        passportPhotos:             mongoose.Schema.Types.Mixed,  // array of up to 3 URLs
        passportCopy:               String,
        recommendationLetters:      mongoose.Schema.Types.Mixed,  // array of up to 2 URLs
        personalStatementSubmitted: String,
        transcriptsSubmitted:       String,
        highSchoolDiplomaSubmitted: String,
      },
    },

    // ─────────────────────────────────────────────
    // AGENT INFORMATION
    // ─────────────────────────────────────────────
    agentInformation: {
      name:               String,
      agentNumber:        String,
      contactInformation: String,

      hearAboutUs: {                        // ← added (fields 97-101)
        facebook:       mongoose.Schema.Types.Mixed,  // boolean
        instagram:      mongoose.Schema.Types.Mixed,  // boolean
        google:         mongoose.Schema.Types.Mixed,  // boolean
        others:         mongoose.Schema.Types.Mixed,  // boolean
        othersSpecify:  String,
      },
    },

    // ─────────────────────────────────────────────
    // APPLICATION STATUS
    // ─────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ["draft", "submitted", "under_review", "approved", "rejected"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", ApplicationSchema);