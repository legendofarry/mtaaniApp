const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const tokenController = require("../controllers/tokenController");

router.post("/generate", authMiddleware, tokenController.createToken);
router.get("/user/:userId", authMiddleware, tokenController.getUserTokens);

module.exports = router;
