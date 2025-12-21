// src/auth/register.ui.js
import { handleRegister, goToLogin } from "../controller/registerController";

export const renderRegister = () => {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Create Account</h2>
        <p>Join MtaaniFlow community today</p>
        
        <form id="register-form">
          <div class="form-group">
            <label for="displayName">Full Name</label>
            <input 
              type="text" 
              id="displayName" 
              name="displayName" 
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Create a password (min 6 characters)"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              placeholder="Re-enter your password"
              required
            />
          </div>
          
          <button type="submit" class="btn btn-primary">
            Create Account
          </button>
        </form>
        
        <div class="auth-link">
          Already have an account? 
          <a href="/login" id="go-to-login">Sign In</a>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  const form = document.getElementById("register-form");
  const loginLink = document.getElementById("go-to-login");

  form.addEventListener("submit", handleRegister);
  loginLink.addEventListener("click", goToLogin);
};
