const router = require("express").Router();
const upload = require("../middleware/upload");
const c      = require("../controllers/organisationController");

// Organisation registration form sends JSON or FormData (no file uploads)
// Use multer.none() to parse multipart text fields without any file
const textOnly = upload.none();

router.post("/",     textOnly, c.createOrganisation);
router.get("/",               c.getOrganisations);
router.get("/:id",            c.getOrganisation);
router.put("/:id",   textOnly, c.updateOrganisation);
router.delete("/:id",         c.deleteOrganisation);

module.exports = router;
