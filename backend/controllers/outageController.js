const Outage = require("../models/Outage");

exports.reportOutage = async (req, res) => {
  const out = new Outage(req.body);
  await out.save();
  res.status(201).json({ success: true, outage: out });
};

exports.getByArea = async (req, res) => {
  const area = req.params.area;
  const outs = await Outage.find({ "location.area": area }).sort({
    createdAt: -1,
  });
  res.json({ success: true, outages: outs });
};
