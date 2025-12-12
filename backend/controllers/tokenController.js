const Token = require("../models/Token");
exports.createToken = async (req, res) => {
  const { meterId, amountKES, source } = req.body;
  // TODO integrate MPESA or vendor flows
  const token = new Token({
    userId: req.user._id,
    meterId,
    amountKES,
    source,
    purchasedAt: new Date(),
  });
  await token.save();
  res.status(201).json({ success: true, token });
};

exports.getUserTokens = async (req, res) => {
  const tokens = await Token.find({
    userId: req.params.userId || req.user._id,
  });
  res.json({ success: true, tokens });
};
