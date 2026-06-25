const router = require("express").Router();
const upload = require("../middleware/upload");
const c      = require("../controllers/applicationController");

// FIX: Use upload.any() instead of upload.fields([...])
// The frontend's appendToFormData() sends files using the full dot-path as the
// field name: e.g.  "step1.photoUrl", "checklist.files.passportCopy",
// "checklist.files.passportPhotos[0]", etc.
// upload.fields() only accepts exact declared names — any unknown name throws
// "MulterError: Unexpected field".
// upload.any() accepts all field names and puts every file in req.files[] array.

router.post("/",    upload.any(), c.createApplication);
router.get("/",                   c.getApplications);
router.get("/:id",                c.getApplication);
router.put("/:id",  upload.any(), c.updateApplication);
router.delete("/:id",             c.deleteApplication);

module.exports = router;
