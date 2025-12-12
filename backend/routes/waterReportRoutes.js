const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const ctrl = require("../controllers/waterReportController");

router.post("/report", authMiddleware, ctrl.createReport);
router.get("/area/:area", authMiddleware, ctrl.getByArea);

module.exports = router;
