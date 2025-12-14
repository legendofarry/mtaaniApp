// backend\routes\meterRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const meterController = require("../controllers/meterController");

router.post("/link", authMiddleware, meterController.linkMeter);
router.get("/user/:userId", authMiddleware, meterController.getMetersForUser);
router.put("/:meterId", authMiddleware, meterController.updateMeter);

router.delete("/:meterId", authMiddleware, meterController.unlinkMeter);

module.exports = router;
