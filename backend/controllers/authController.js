// backend/controllers/authController.js
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwtLib = require("../utils/jwt");
const User = require("../models/User");
const MagicToken = require("../models/MagicToken");
const logger = require("../config/logger");
const { Resend } = require("resend");

// -------------------- EMAIL (RESEND) --------------------
let resend = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  logger.info("📧 Resend email service initialized");
} else {
  logger.warn("⚠️ RESEND_API_KEY missing. Emails disabled (dev-safe).");
}

function devIsEnabled() {
  return process.env.NODE_ENV !== "production";
}

/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const emailNormalized = email.toLowerCase();

    const existingUser = await User.findOne({ email: emailNormalized });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email: emailNormalized,
      password: hashedPassword,
      signupMethod: "email",
      verified: false,
      onboardingCompleted: false,
    });

    const token = jwtLib.sign({ id: user._id });

    return res.status(201).json({
      success: true,
      accessToken: token,
      userId: user._id.toString(),
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        verified: user.verified,
        onboardingCompleted: user.onboardingCompleted,
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

// ==================== LOGIN ====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const emailNormalized = email.toLowerCase();
    const user = await User.findOne({ email: emailNormalized });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwtLib.sign({ id: user._id });

    return res.json({
      success: true,
      accessToken: token,
      userId: user._id.toString(),
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        verified: user.verified,
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

// ==================== FORGOT PASSWORD ====================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email required" });
    }

    const emailNormalized = email.toLowerCase();
    const user = await User.findOne({ email: emailNormalized });

    if (!user) {
      return res.json({
        success: true,
        message: "If the email exists, a reset link was sent",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await MagicToken.create({
      email: emailNormalized,
      token,
      userId: user._id,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    if (resend) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "MtaaniFlow <onboarding@resend.dev>",
        to: emailNormalized,
        subject: "Reset your password",
        html: `<p>Click to reset password:</p><a href="${resetLink}">${resetLink}</a>`,
      });
    }

    return res.json({
      success: true,
      message: "If the email exists, a reset link was sent",
      ...(devIsEnabled() && { resetLink, token }),
    });
  } catch (err) {
    logger.error("Forgot password error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to process request",
    });
  }
};

// ==================== RESET PASSWORD ====================
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password required",
      });
    }

    const magicToken = await MagicToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!magicToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const user = await User.findById(magicToken.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.verified = true;
    await user.save();

    magicToken.used = true;
    await magicToken.save();

    return res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    logger.error("Reset password error:", err);
    return res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};

// ==================== FIREBASE USER SYNC ====================
exports.syncFirebaseUser = async (req, res) => {
  try {
    const { firebaseUid, email, fullName, signupMethod, photoURL } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({
        success: false,
        message: "firebaseUid and email required",
      });
    }

    const emailNormalized = email.toLowerCase();
    let user = await User.findOne({ email: emailNormalized });

    if (!user) {
      user = new User({
        fullName: fullName || "User",
        email: emailNormalized,
        signupMethod: signupMethod || "firebase",
        firebaseUid,
        verified: true,
        onboardingCompleted: false,
        profileImageUrl: photoURL,
      });
      await user.save();
    }

    const token = jwtLib.sign({ id: user._id });

    return res.json({
      success: true,
      accessToken: token,
      userId: user._id.toString(),
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        verified: true,
        onboardingCompleted: user.onboardingCompleted || false,
      },
    });
  } catch (err) {
    logger.error("Firebase sync error:", err);
    return res.status(500).json({
      success: false,
      message: "Firebase sync failed",
    });
  }
};

// ==================== MAGIC LINK ====================
exports.sendMagicLink = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email required" });
    }

    const emailNormalized = email.toLowerCase();
    const user = await User.findOne({ email: emailNormalized });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await MagicToken.create({
      email: emailNormalized,
      token,
      userId: user._id,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const magicLink = `${process.env.API_URL}/api/auth/verify-email?token=${token}`;

    if (resend) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "MtaaniFlow <onboarding@resend.dev>",
        to: emailNormalized,
        subject: "🔐 Let's get you verified, chief!",
        html: `
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">MtaaniFlow</div>
            <div class="tagline">Where community magic happens ✨</div>
          </div>
          
          <div class="card">
            <div class="emoji">🎉</div>
            
            <h1 class="greeting">Hey there, future community superstar! 👋</h1>
            
            <div class="message">
              <p>Someone (hopefully you!) is trying to join MtaaniFlow. To make sure it's really you and not an over-enthusiastic robot 🤖, we need you to click that glorious button below.</p>
              
              <p>This magic link will expire faster than a free pizza at a developer meetup, so don't wait too long!</p>
            </div>
            
            <a href="${magicLink}" class="button">
              <span class="button-text">✨ Click Me! I'm Magical! ✨</span>
              <span class="arrow">→</span>
            </a>
            
            <div class="tip">
              <strong>💡 Pro Tip:</strong> If the button above is feeling shy, you can copy and paste this link into your browser:
              <div class="magic-text">${magicLink}</div>
            </div>
            
            <div class="fun-fact">
              "Did you know? The first 'verify your email' link was sent in 1971. We've come a long way from green screens!"
            </div>
            
            <div class="message">
              <p>If you didn't request this, no worries! Just ignore this email and carry on with your day. Your coffee ☕ is getting cold anyway.</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Sent with 💖 by the team at MtaaniFlow</p>
            <p>Need help? <a href="mailto:support@mtaaniflow.com">Reply to this email</a> • We're here for you!</p>
            <p style="font-size: 12px; margin-top: 10px;">
              This link expires in 24 hours. Because magic has an expiration date too! ⏰
            </p>
          </div>
        </div>
      </body>
    `,
      });
    }

    return res.json({
      success: true,
      message: "Verification sent",
      ...(devIsEnabled() && { token, magicLink }),
    });
  } catch (err) {
    logger.error("Magic link error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send magic link",
    });
  }
};

// ==================== VERIFY MAGIC LINK ====================
exports.verifyMagicLink = async (req, res) => {
  try {
    const { token } = req.body;

    const magicToken = await MagicToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!magicToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const user = await User.findById(magicToken.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    magicToken.used = true;
    await magicToken.save();

    user.verified = true;
    await user.save();

    const jwtToken = jwtLib.sign({ id: user._id });

    return res.json({
      success: true,
      accessToken: jwtToken,
      userId: user._id.toString(),
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        verified: true,
        onboardingCompleted: user.onboardingCompleted || false,
      },
    });
  } catch (err) {
    logger.error("Verify magic link error:", err);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

// ==================== PASSKEY ====================
exports.savePasskey = async (req, res) => {
  try {
    const { userId, passkeyEnabled } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.biometrics = {
      enabled: passkeyEnabled === true,
      createdAt: new Date(),
      lastUsed: new Date(),
    };

    await user.save();

    return res.json({
      success: true,
      message: "Passkey saved",
    });
  } catch (err) {
    logger.error("Save passkey error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save passkey",
    });
  }
};

/* ================= VERIFY EMAIL (CLICK LINK) ================= */
exports.verifyEmailFromLink = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send("Invalid verification link");
    }

    const record = await MagicToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).send("Verification link expired or invalid");
    }

    const user = await User.findById(record.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.verified = true;
    await user.save();

    record.used = true;
    await record.save();

    // ✅ NO WHITE SCREEN
    return res.redirect(`${process.env.FRONTEND_URL}/verified-success`);
  } catch (err) {
    logger.error("Email verification error:", err);
    return res.status(500).send("Verification failed");
  }
};

exports.checkVerificationStatus = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      verified: user.verified,
      user,
    });
  } catch (error) {
    console.error("Check verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
