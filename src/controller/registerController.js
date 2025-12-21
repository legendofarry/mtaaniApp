// src/controllers/registerController.js
import { register } from "../services/auth.service.js";
import { navigate } from "../app/router.js";
import {
  validateEmail,
  validatePassword,
  validateRequired,
  showFieldError,
  clearAllErrors,
} from "../utils/validation.js";

export const handleRegister = async (e) => {
  e.preventDefault();
  clearAllErrors();

  const form = e.target;
  const displayName = form.displayName.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;

  // Validate inputs
  let hasErrors = false;

  if (!validateRequired(displayName)) {
    showFieldError("displayName", "Name is required");
    hasErrors = true;
  }

  if (!validateEmail(email)) {
    showFieldError("email", "Please enter a valid email address");
    hasErrors = true;
  }

  if (!validatePassword(password)) {
    showFieldError("password", "Password must be at least 6 characters");
    hasErrors = true;
  }

  if (password !== confirmPassword) {
    showFieldError("confirmPassword", "Passwords do not match");
    hasErrors = true;
  }

  if (hasErrors) return;

  // Attempt registration
  const result = await register(email, password, displayName);

  if (result.success) {
    console.log("Registration successful:", result.user);
    navigate("/home");
  } else {
    showFieldError("email", result.error);
  }
};

export const goToLogin = (e) => {
  e.preventDefault();
  navigate("/login");
};
