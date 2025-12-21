// src/controllers/loginController.js
import { login } from "../services/auth.service.js";
import { navigate } from "../app/router.js";
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

  // Validate inputs
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

  // Attempt login
  const result = await login(email, password);

  if (result.success) {
    console.log("Login successful:", result.user);
    navigate("/home");
  } else {
    showFieldError("password", result.error);
  }
};

export const goToRegister = (e) => {
  e.preventDefault();
  navigate("/register");
};
