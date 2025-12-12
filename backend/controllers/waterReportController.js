const WaterReport = require("../models/WaterReport");

exports.createReport = async (req, res) => {
  const report = new WaterReport({ reporterId: req.user._id, ...req.body });
  await report.save();
  res.status(201).json({ success: true, report });
};

exports.getByArea = async (req, res) => {
  const area = req.params.area;
  const reports = await WaterReport.find({ "location.area": area }).sort({
    createdAt: -1,
  });
  res.json({ success: true, reports });
};
