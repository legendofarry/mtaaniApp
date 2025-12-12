const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/outageController");

router.post("/report", auth, ctrl.reportOutage);
router.get("/area/:area", auth, ctrl.getByArea);

module.exports = router;
