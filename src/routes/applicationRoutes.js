// src/routes/applicationRoutes.js
const router  = require("express").Router();
const upload  = require("../middleware/upload");
const c       = require("../controllers/applicationController");
const { protect } = require("../middleware/auth");
 
// POST /api/applications — public (anyone can submit a form)
router.post("/", upload.any(), c.createApplication);
 
// All READ / UPDATE / DELETE — admin only
router.get("/",     protect, c.getApplications);    // list all
router.get("/:id",  protect, c.getApplication);     // get one
router.put("/:id",  protect, upload.any(), c.updateApplication);
router.delete("/:id", protect, c.deleteApplication);
 
module.exports = router;