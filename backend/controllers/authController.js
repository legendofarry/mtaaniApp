// backend/controllers/authController.js

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwtLib = require("../utils/jwt");
const User = require("../models/User");
const logger = require("../config/logger");

/* ======================================================
   AUTH HELPERS
====================================================== */
const normalizeEmail = (email) => email.trim().toLowerCase();

/* ======================================================
   REGISTER (Email + Password)
   - No verification
   - Auto-login
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

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName: fullName.trim(),
      email: emailNormalized,
      passwordHash,
      signupMethod: "email",
      verified: true, // always true (no verification flow)
      onboardingCompleted: false,
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
   LOGIN (Email + Password)
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
        onboardingCompleted: user.onboardingCompleted || false,
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
   SOCIAL AUTH (Google / Facebook via Firebase)
   - Auto-create or sync user
====================================================== */
exports.syncFirebaseUser = async (req, res) => {
  try {
    const { firebaseUid, email, fullName, signupMethod, photoURL } = req.body;

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
        signupMethod: signupMethod || "google",
        verified: true,
        onboardingCompleted: false,
        profileImageUrl: photoURL,
      });

      logger.info(`✅ Social signup: ${emailNormalized}`);
    } else if (!user.firebaseUid) {
      user.firebaseUid = firebaseUid;
      if (photoURL && !user.profileImageUrl) {
        user.profileImageUrl = photoURL;
      }
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
        onboardingCompleted: user.onboardingCompleted || false,
        profileImageUrl: user.profileImageUrl,
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
   ENABLE BIOMETRICS (Passkey Preference)
   - Generates a device-bound secret
====================================================== */
exports.savePasskey = async (req, res) => {
  try {
    const { userId, passkeyEnabled } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (passkeyEnabled === true) {
      user.biometrics = {
        enabled: true,
        secret: crypto.randomBytes(32).toString("hex"),
        createdAt: new Date(),
        lastUsed: new Date(),
      };
    } else {
      user.biometrics = { enabled: false };
    }

    await user.save();

    logger.info(`🔐 Biometrics enabled for ${user.email}`);

    return res.json({
      success: true,
      biometricSecret: user.biometrics.secret, // sent once to device
    });
  } catch (err) {
    logger.error("Save passkey error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save biometrics",
    });
  }
};

/* ======================================================
   BIOMETRIC LOGIN (SECURE)
   - Requires device secret
====================================================== */
exports.biometricLogin = async (req, res) => {
  try {
    const { email, biometricSecret } = req.body;

    if (!email || !biometricSecret) {
      return res.status(400).json({
        success: false,
        message: "Email and biometric secret required",
      });
    }

    const emailNormalized = normalizeEmail(email);
    const user = await User.findOne({ email: emailNormalized });

    if (
      !user ||
      !user.biometrics ||
      !user.biometrics.enabled ||
      user.biometrics.secret !== biometricSecret
    ) {
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
        onboardingCompleted: user.onboardingCompleted || false,
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
/* ======================================================
   COMPLETE ONBOARDING
   - Save required profile data
   - Mark onboarding as complete
====================================================== */
exports.completeOnboarding = async (req, res) => {
  try {
    const { userId, gender, age, location } = req.body;

    // 1️⃣ Basic validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    if (!location || !location.area) {
      return res.status(400).json({
        success: false,
        message: "Location area is required",
      });
    }

    // 2️⃣ Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3️⃣ Save profile data (optional fields)
    if (gender) {
      user.gender = gender;
    }

    if (age) {
      user.age = age;
    }

    // 4️⃣ Save location (required + optional fields)
    user.location = {
      area: location.area,
      estate: location.estate || undefined,
      apartmentName: location.apartmentName || undefined,
      plotNumber: location.plotNumber || undefined,
      block: location.block || undefined,
      floor: location.floor || undefined,
      houseNumber: location.houseNumber || undefined,
      landmark: location.landmark || undefined,
      structureNumber: location.structureNumber || undefined,
      gps: location.gps || undefined,
    };

    // 5️⃣ Mark onboarding complete
    user.onboardingCompleted = true;

    await user.save();

    return res.json({
      success: true,
      message: "Onboarding completed",
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        onboardingCompleted: true,
        location: user.location,
      },
    });
  } catch (err) {
    console.error("Complete onboarding error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to complete onboarding",
    });
  }
};
