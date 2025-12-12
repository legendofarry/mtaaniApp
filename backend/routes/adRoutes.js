const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/adController");

router.post("/", auth, ctrl.createAd);
router.get("/", ctrl.getAds);

module.exports = router;
