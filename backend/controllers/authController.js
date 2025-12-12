// backend/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwtLib = require("../utils/jwt");
const User = require("../models/User");
const Otp = require("../models/Otp");
const generateOTP = require("../utils/generateOTP");
const saveOtp = require("../utils/saveOtp");
const transporter = require("../config/mailer");
const logger = require("../config/logger");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const fetch = require("node-fetch");

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");

function devIsEnabled() {
  return process.env.NODE_ENV !== "production";
}

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone, location, signupMethod } =
      req.body;

    if (!email || !fullName || !location || !location.area) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: fullName, email, location.area",
      });
    }

    // normalize email
    const emailNormalized = String(email).toLowerCase();

    const existing = await User.findOne({ email: emailNormalized });
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });

    const passwordHash = password
      ? await bcrypt.hash(password, SALT_ROUNDS)
      : undefined;

    const user = new User({
      fullName,
      email: emailNormalized,
      phone,
      passwordHash,
      signupMethod: signupMethod || "email",
      location: {
        area: location.area,
        estate: location.estate || undefined,
        apartmentName: location.apartmentName || undefined,
        plotNumber: location.plotNumber || undefined,
        block: location.block || undefined,
        floor: location.floor || undefined,
        houseNumber: location.houseNumber || undefined,
        landmark: location.landmark || undefined,
        gps: location.gps || undefined,
        structureNumber: location.structureNumber || undefined,
      },
      verified: false,
    });

    // Save user first
    await user.save();
    logger.info(`User created: ${user._id}`);

    // Generate OTP
    let otpCode = null;
    try {
      otpCode = generateOTP(6);
      await saveOtp(emailNormalized, otpCode, "verify", 10 * 60);
      logger.info(`OTP generated for ${emailNormalized}: ${otpCode}`);

      // Send email (skip in dev mode if you want)
      if (!devIsEnabled()) {
        const mail = {
          from: process.env.EMAIL_FROM,
          to: emailNormalized,
          subject: "Your MtaaniFlow verification code",
          html: `<p>Your verification code is <strong>${otpCode}</strong></p>`,
        };
        await transporter.sendMail(mail);
        logger.info(`OTP email sent to ${emailNormalized}`);
      }
    } catch (otpErr) {
      logger.error("OTP creation/send failed:", otpErr.message || otpErr);
      // Continue - user is created, they can request OTP again
    }

    // Build response
    const response = {
      success: true,
      message: devIsEnabled()
        ? "Account created (dev mode). Check console for OTP"
        : "Account created. Check your email for verification code.",
      userId: user._id,
    };

    // Return OTP in dev mode
    if (devIsEnabled() && otpCode) {
      response.otp = otpCode;
    }

    return res.status(201).json(response);
  } catch (err) {
    logger.error("Register error:", err.message || err);
    return res
      .status(500)
      .json({ success: false, message: "Server error during registration" });
  }
};

exports.requestOtp = async (req, res) => {
  const { email, purpose = "verify" } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: "Email required" });

  const emailNormalized = String(email).toLowerCase();

  const user = await User.findOne({ email: emailNormalized });
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  const otp = generateOTP(6);
  try {
    await saveOtp(emailNormalized, otp, purpose, 10 * 60);
  } catch (err) {
    logger.warn("Failed to save OTP:", err.message || err);
  }

  const mail = {
    from: process.env.EMAIL_FROM,
    to: emailNormalized,
    subject: "Your MtaaniFlow verification code",
    html: `<p>Your verification code is <strong>${otp}</strong></p>`,
  };

  try {
    if (!devIsEnabled()) await transporter.sendMail(mail);
    const response = { success: true, message: "OTP created" };
    if (devIsEnabled()) response.otp = otp;
    return res.json(response);
  } catch (err) {
    logger.warn("Failed to send OTP:", err.message || err);
    if (devIsEnabled())
      return res.json({ success: true, message: "OTP created (dev)", otp });
    return res
      .status(500)
      .json({ success: false, message: "Failed to send OTP" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp, purpose = "verify" } = req.body;
  if (!email || !otp)
    return res.status(400).json({ success: false, message: "Missing fields" });

  const emailNormalized = String(email).toLowerCase();

  const otpDoc = await Otp.findOne({
    email: emailNormalized,
    code: otp,
    purpose,
    used: false,
  }).sort({ createdAt: -1 });
  if (!otpDoc)
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired OTP" });
  if (otpDoc.expiresAt && otpDoc.expiresAt < new Date())
    return res.status(400).json({ success: false, message: "OTP expired" });

  otpDoc.used = true;
  await otpDoc.save();

  // mark user verified if purpose is verify
  const user = await User.findOne({ email: emailNormalized });
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  if (purpose === "verify") {
    user.verified = true;
    await user.save();
  }

  const token = jwtLib.sign({ id: user._id });
  return res.json({
    success: true,
    message: "OTP verified",
    accessToken: token,
    user: { id: user._id, email: user.email },
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Missing fields" });

  const emailNormalized = String(email).toLowerCase();

  const user = await User.findOne({ email: emailNormalized });
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });
  if (!user.passwordHash)
    return res
      .status(400)
      .json({ success: false, message: "Account uses social login" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok)
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });

  const token = jwtLib.sign({ id: user._id });
  return res.json({
    success: true,
    accessToken: token,
    user: { id: user._id, email: user.email, fullName: user.fullName },
  });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: "Email required" });

  const emailNormalized = String(email).toLowerCase();

  const user = await User.findOne({ email: emailNormalized });
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  const otp = generateOTP(6);
  try {
    await saveOtp(emailNormalized, otp, "reset", 15 * 60);
  } catch (err) {
    logger.warn("Failed to save reset OTP:", err.message || err);
  }

  const mail = {
    from: process.env.EMAIL_FROM,
    to: emailNormalized,
    subject: "Password reset code",
    html: `<p>Your password reset code is <strong>${otp}</strong></p>`,
  };

  try {
    if (!devIsEnabled()) await transporter.sendMail(mail);
    const response = { success: true, message: "Reset OTP sent" };
    if (devIsEnabled()) response.otp = otp;
    return res.json(response);
  } catch (err) {
    logger.warn("Failed to send reset email:", err.message);
    if (devIsEnabled())
      return res.json({ success: true, message: "Reset OTP (dev)", otp });
    return res
      .status(500)
      .json({ success: false, message: "Failed to send reset email" });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return res.status(400).json({ success: false, message: "Missing fields" });

  const emailNormalized = String(email).toLowerCase();

  const otpDoc = await Otp.findOne({
    email: emailNormalized,
    code: otp,
    purpose: "reset",
    used: false,
  }).sort({ createdAt: -1 });
  if (!otpDoc)
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired OTP" });

  otpDoc.used = true;
  await otpDoc.save();

  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const user = await User.findOneAndUpdate(
    { email: emailNormalized },
    { passwordHash: hash },
    { new: true }
  );
  return res.json({ success: true, message: "Password reset successful" });
};

exports.google = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken)
    return res.status(400).json({ success: false, message: "Missing idToken" });

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const email = payload.email;
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({
      fullName: payload.name || "",
      email,
      signupMethod: "google",
      verified: true,
    });
    await user.save();
  }
  const token = jwtLib.sign({ id: user._id });
  res.json({
    success: true,
    accessToken: token,
    user: { id: user._id, email },
  });
};

exports.facebook = async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken)
    return res
      .status(400)
      .json({ success: false, message: "Missing accessToken" });
  // call FB debug / me endpoint
  const resp = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
  );
  const json = await resp.json();
  if (json.error)
    return res
      .status(400)
      .json({ success: false, message: "Invalid FB token" });
  const email = json.email;
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({
      fullName: json.name || "",
      email,
      signupMethod: "facebook",
      verified: true,
    });
    await user.save();
  }
  const token = jwtLib.sign({ id: user._id });
  res.json({
    success: true,
    accessToken: token,
    user: { id: user._id, email },
  });
};
