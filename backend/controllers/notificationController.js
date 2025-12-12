const Notification = require("../models/Notification");
exports.sendNotification = async (req, res) => {
  const n = new Notification(req.body);
  await n.save();
  // TODO: push via FCM or Expo Push
  res.json({ success: true, notification: n });
};
exports.getForUser = async (req, res) => {
  const n = await Notification.find({ userId: req.params.userId }).sort({
    createdAt: -1,
  });
  res.json({ success: true, notifications: n });
};
