const Ad = require("../models/Ad");
exports.createAd = async (req, res) => {
  const ad = new Ad(req.body);
  await ad.save();
  res.status(201).json({ success: true, ad });
};
exports.getAds = async (req, res) => {
  const ads = await Ad.find({ "schedule.active": true }).limit(50);
  res.json({ success: true, ads });
};
