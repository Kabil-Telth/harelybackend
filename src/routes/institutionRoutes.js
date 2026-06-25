const router = require("express").Router();
const upload = require("../middleware/upload");
const c      = require("../controllers/institutionController");

// upload.single("logo") — reads one file in FormData field named "logo"
router.post("/",     upload.single("logo"), c.createInstitution);
router.get("/",                             c.getInstitutions);
router.get("/:id",                          c.getInstitution);
router.put("/:id",   upload.single("logo"), c.updateInstitution); // logo optional on update
router.delete("/:id",                       c.deleteInstitution);

module.exports = router;
