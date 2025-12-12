const Meter = require("../models/Meter");

exports.linkMeter = async (req, res) => {
  const { type, meterNumber, location, nickname } = req.body;
  const meter = new Meter({
    userId: req.user._id,
    type,
    meterNumber,
    location,
    nickname,
  });
  await meter.save();
  res.status(201).json({ success: true, meter });
};

exports.getMetersForUser = async (req, res) => {
  const userId = req.params.userId || req.user._id;
  const meters = await Meter.find({ userId });
  res.json({ success: true, meters });
};
