// src/auth/login.ui.js
import { handleLogin, goToRegister } from "../controller/loginController";

export const renderLogin = () => {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Welcome Back</h2>
        <p>Sign in to continue to MtaaniFlow</p>
        
        <form id="login-form">
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
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button type="submit" class="btn btn-primary">
            Sign In
          </button>
        </form>
        
        <div class="auth-link">
          Don't have an account? 
          <a href="/register" id="go-to-register">Create Account</a>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  const form = document.getElementById("login-form");
  const registerLink = document.getElementById("go-to-register");

  form.addEventListener("submit", handleLogin);
  registerLink.addEventListener("click", goToRegister);
};
