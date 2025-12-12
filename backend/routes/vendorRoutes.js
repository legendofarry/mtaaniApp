const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/vendorController");

router.post("/register", auth, ctrl.registerVendor);
router.get("/", auth, ctrl.searchVendors);

module.exports = router;
