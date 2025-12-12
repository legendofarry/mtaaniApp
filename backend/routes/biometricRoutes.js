const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/biometricController");

router.post("/create", auth, ctrl.createBiometric);
router.post("/auth", ctrl.authBiometric);

module.exports = router;
