// backend/controllers/authController.js

const bcrypt = require("bcryptjs");
const jwtLib = require("../utils/jwt");
const User = require("../models/User");
const logger = require("../config/logger");

/* ======================================================
   HELPERS
====================================================== */
const normalizeEmail = (email) => email.trim().toLowerCase();

/* ======================================================
   REGISTER (EMAIL + PASSWORD)
====================================================== */
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const emailNormalized = normalizeEmail(email);

    const existingUser = await User.findOne({ email: emailNormalized });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName: fullName.trim(),
      email: emailNormalized,
      passwordHash,
      signupMethod: "email",
      onboardingCompleted: false,
      biometrics: { enabled: false },
    });

    const token = jwtLib.sign({ id: user._id });

    logger.info(`✅ Registered user: ${emailNormalized}`);

    return res.status(201).json({
      success: true,
      accessToken: token,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        onboardingCompleted: false,
        biometrics: { enabled: false },
      },
    });
  } catch (err) {
    logger.error("Register error:", err);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

/* ======================================================
   LOGIN (EMAIL + PASSWORD)
====================================================== */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const emailNormalized = normalizeEmail(email);

    const user = await User.findOne({ email: emailNormalized }).select(
      "+passwordHash"
    );

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwtLib.sign({ id: user._id });

    logger.info(`✅ Login: ${emailNormalized}`);

    return res.json({
      success: true,
      accessToken: token,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        onboardingCompleted: user.onboardingCompleted,
        biometrics: {
          enabled: user.biometrics?.enabled || false,
        },
      },
    });
  } catch (err) {
    logger.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

/* ======================================================
   SOCIAL AUTH (FIREBASE → BACKEND)
====================================================== */
exports.syncFirebaseUser = async (req, res) => {
  try {
    const { firebaseUid, email, fullName, provider, photoURL } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({
        success: false,
        message: "firebaseUid and email are required",
      });
    }

    const emailNormalized = normalizeEmail(email);

    let user = await User.findOne({ email: emailNormalized });

    if (!user) {
      user = await User.create({
        fullName: fullName || "User",
        email: emailNormalized,
        firebaseUid,
        signupMethod: provider || "google",
        onboardingCompleted: false,
        biometrics: { enabled: false },
        profileImageUrl: photoURL,
      });

      logger.info(`✅ Social signup: ${emailNormalized}`);
    } else if (!user.firebaseUid) {
      user.firebaseUid = firebaseUid;
      await user.save();
    }

    const token = jwtLib.sign({ id: user._id });

    return res.json({
      success: true,
      accessToken: token,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        onboardingCompleted: user.onboardingCompleted,
        biometrics: {
          enabled: user.biometrics?.enabled || false,
        },
      },
    });
  } catch (err) {
    logger.error("Firebase sync error:", err);
    return res.status(500).json({
      success: false,
      message: "Social login failed",
    });
  }
};

/* ======================================================
   ENABLE PASSKEY (OPTIONAL)
====================================================== */
exports.enablePasskey = async (req, res) => {
  try {
    const userId = req.user.id;
    const { passkeyRaw } = req.body;

    if (!passkeyRaw) {
      return res.status(400).json({
        success: false,
        message: "Passkey is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.biometrics?.enabled) {
      return res.status(409).json({
        success: false,
        message: "Passkey already enabled",
      });
    }

    const passkeyHash = await bcrypt.hash(passkeyRaw, 12);

    user.biometrics = {
      enabled: true,
      passkeyHash,
      createdAt: new Date(),
      lastUsed: new Date(),
    };

    await user.save();

    logger.info(`🔐 Passkey enabled: ${user.email}`);

    return res.json({
      success: true,
      user: {
        biometrics: {
          enabled: true,
          createdAt: user.biometrics.createdAt,
        },
      },
    });
  } catch (err) {
    logger.error("Enable passkey error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to enable passkey",
    });
  }
};

/* ======================================================
   BIOMETRIC LOGIN
====================================================== */
exports.biometricLogin = async (req, res) => {
  try {
    const { email, passkeyRaw } = req.body;

    if (!email || !passkeyRaw) {
      return res.status(400).json({
        success: false,
        message: "Email and passkey required",
      });
    }

    const emailNormalized = normalizeEmail(email);

    const user = await User.findOne({ email: emailNormalized });

    if (!user || !user.biometrics?.enabled || !user.biometrics.passkeyHash) {
      return res.status(401).json({
        success: false,
        message: "Biometric login not enabled",
      });
    }

    const isMatch = await bcrypt.compare(
      passkeyRaw,
      user.biometrics.passkeyHash
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid biometric credentials",
      });
    }

    user.biometrics.lastUsed = new Date();
    await user.save();

    const token = jwtLib.sign({ id: user._id });

    logger.info(`✅ Biometric login: ${emailNormalized}`);

    return res.json({
      success: true,
      accessToken: token,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        onboardingCompleted: user.onboardingCompleted,
        biometrics: { enabled: true },
      },
    });
  } catch (err) {
    logger.error("Biometric login error:", err);
    return res.status(500).json({
      success: false,
      message: "Biometric login failed",
    });
  }
};

/* ======================================================
   COMPLETE ONBOARDING
====================================================== */
exports.completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gender, age, location } = req.body;

    if (!location?.area) {
      return res.status(400).json({
        success: false,
        message: "Location area is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.gender = gender ?? user.gender;
    user.age = age ?? user.age;
    user.location = location;
    user.onboardingCompleted = true;

    await user.save();

    return res.json({
      success: true,
      user: {
        onboardingCompleted: true,
        location: user.location,
      },
    });
  } catch (err) {
    logger.error("Complete onboarding error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to complete onboarding",
    });
  }
};
