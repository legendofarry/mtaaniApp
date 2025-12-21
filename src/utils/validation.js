// src/utils/validation.js

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.trim() !== "";
};

export const validateForm = (fields) => {
  const errors = {};

  for (const [name, value] of Object.entries(fields)) {
    if (!validateRequired(value)) {
      errors[name] = "This field is required";
    }
  }

  return errors;
};

export const showFieldError = (fieldName, errorMessage) => {
  const input = document.querySelector(`[name="${fieldName}"]`);
  if (input) {
    input.classList.add("error");

    // Remove existing error message
    const existingError = input.parentElement.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    // Add new error message
    if (errorMessage) {
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      errorDiv.textContent = errorMessage;
      input.parentElement.appendChild(errorDiv);
    }
  }
};

export const clearFieldError = (fieldName) => {
  const input = document.querySelector(`[name="${fieldName}"]`);
  if (input) {
    input.classList.remove("error");
    const errorDiv = input.parentElement.querySelector(".error-message");
    if (errorDiv) {
      errorDiv.remove();
    }
  }
};

export const clearAllErrors = () => {
  document
    .querySelectorAll(".error")
    .forEach((el) => el.classList.remove("error"));
  document.querySelectorAll(".error-message").forEach((el) => el.remove());
};
