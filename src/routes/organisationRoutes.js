// src/routes/organisationRoutes.js
const router  = require("express").Router();
const upload  = require("../middleware/upload");
const c       = require("../controllers/organisationController");
const { protect } = require("../middleware/auth");

// POST — public (organisation submits their own registration)
router.post("/", upload.none(), c.createOrganisation);

// READ / UPDATE / DELETE — admin only
router.get("/",     protect, c.getOrganisations);
router.get("/:id",  protect, c.getOrganisation);
router.put("/:id",  protect, upload.none(), c.updateOrganisation);
router.delete("/:id", protect, c.deleteOrganisation);

module.exports = router;