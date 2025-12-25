// src/controllers/loginController.js
import { login } from "../services/auth.service.js";
import { navigate } from "../app/router.js";
import { getUserProfile, createUserProfile } from "../services/user.service.js";
import {
  validateEmail,
  validatePassword,
  showFieldError,
  clearAllErrors,
} from "../utils/validation.js";

export const handleLogin = async (e) => {
  e.preventDefault();
  clearAllErrors();

  const form = e.target;
  const email = form.email.value.trim();
  const password = form.password.value;

  // 1️⃣ Validate inputs (frontend responsibility)
  let hasErrors = false;

  if (!validateEmail(email)) {
    showFieldError("email", "Please enter a valid email address");
    hasErrors = true;
  }

  if (!validatePassword(password)) {
    showFieldError("password", "Password must be at least 6 characters");
    hasErrors = true;
  }

  if (hasErrors) return;

  // 2️⃣ Attempt login (auth responsibility)
  try {
    const result = await login(email, password);

    if (!result.success) {
      showFieldError("password", result.error || "Invalid email or password");
      return;
    }

    // Ensure a Firestore profile exists for the user; if missing, create
    try {
      const profile = await getUserProfile(result.user.uid);
      if (!profile) {
        await createUserProfile(result.user.uid, {
          email: result.user.email,
          name: result.user.displayName || "",
        });
        navigate("/home");
        return;
      }
    } catch (e) {
      console.warn("Profile check failed:", e);
    }

    // Fallback: navigate to home
    navigate("/home");
  } catch (err) {
    showFieldError("password", "Invalid email or password");
  }
};

export const goToRegister = (e) => {
  e.preventDefault();
  navigate("/register");
};
