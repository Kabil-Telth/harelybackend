// src/routes/institutionRoutes.js
const router  = require("express").Router();
const upload  = require("../middleware/upload");
const c       = require("../controllers/institutionController");
const { protect } = require("../middleware/auth");

// POST — public (institution submits their own registration)
router.post("/", upload.single("logo"), c.createInstitution);

// READ / UPDATE / DELETE — admin only
router.get("/",     protect, c.getInstitutions);
router.get("/:id",  protect, c.getInstitution);
router.put("/:id",  protect, upload.single("logo"), c.updateInstitution);
router.delete("/:id", protect, c.deleteInstitution);

module.exports = router;