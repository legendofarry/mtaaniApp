const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/notificationController");

router.post("/send", auth, ctrl.sendNotification);
router.get("/:userId", auth, ctrl.getForUser);

module.exports = router;
