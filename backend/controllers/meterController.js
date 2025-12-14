// backend\controllers\meterController.js
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

exports.unlinkMeter = async (req, res) => {
  const { meterId } = req.params;

  const meter = await Meter.findOne({
    _id: meterId,
    userId: req.user._id,
  });

  if (!meter) {
    return res.status(404).json({ message: "Meter not found" });
  }

  await meter.deleteOne();
  res.json({ success: true });
};

exports.updateMeter = async (req, res) => {
  const { meterId } = req.params;

  const meter = await Meter.findOne({
    _id: meterId,
    userId: req.user._id,
  });

  if (!meter) {
    return res.status(404).json({ message: "Meter not found" });
  }

  const { meterNumber, nickname, location } = req.body;

  if (meterNumber) meter.meterNumber = meterNumber;
  if (nickname !== undefined) meter.nickname = nickname;
  if (location) meter.location = location;

  await meter.save();

  res.json({ success: true, meter });
};
