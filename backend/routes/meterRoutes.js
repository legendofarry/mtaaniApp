const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const meterController = require("../controllers/meterController");

router.post("/link", authMiddleware, meterController.linkMeter);
router.get("/user/:userId", authMiddleware, meterController.getMetersForUser);

module.exports = router;
