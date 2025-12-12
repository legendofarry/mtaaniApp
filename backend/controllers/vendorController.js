const Vendor = require("../models/Vendor");

exports.registerVendor = async (req, res) => {
  const v = new Vendor(req.body);
  await v.save();
  res.status(201).json({ success: true, vendor: v });
};

exports.searchVendors = async (req, res) => {
  const { area, type } = req.query;
  const q = {};
  if (area) q["location.area"] = area;
  if (type) q.type = type;
  const vendors = await Vendor.find(q);
  res.json({ success: true, vendors });
};
