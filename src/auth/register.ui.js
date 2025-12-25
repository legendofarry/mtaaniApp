// src/auth/register.ui.js
import { handleRegister, goToLogin } from "../controller/registerController";

export const renderRegister = () => {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 p-6 animate-in fade-in duration-500">
      
      <!-- Decorative Background Blur (Matches Login for consistency) -->
      <div class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div class="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-200/40 blur-[120px] rounded-full"></div>
        <div class="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-200/40 blur-[120px] rounded-full"></div>
      </div>

      <div class="w-full max-w-[480px]">
        <!-- Brand / Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100 mb-6">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h2 class="text-4xl font-black text-slate-900 tracking-tight">Create Account</h2>
          <p class="text-slate-500 font-medium mt-2">Join the MtaaniFlow community</p>
        </div>

        <!-- Auth Card -->
        <div class="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200/60 border border-slate-100">
          <form id="register-form" class="space-y-5">
            
            <!-- Full Name Field -->
            <div class="space-y-1.5">
              <label for="displayName" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <input 
                  type="text" id="displayName" name="displayName" required
                  placeholder="John Doe"
                  class="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl p-4 pl-12 text-sm font-bold outline-none transition-all"
                />
              </div>
            </div>

            <!-- Email Field -->
            <div class="space-y-1.5">
              <label for="email" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <input 
                  type="email" id="email" name="email" required
                  placeholder="john@example.com"
                  class="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl p-4 pl-12 text-sm font-bold outline-none transition-all"
                />
              </div>
            </div>

            <!-- Password Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label for="password" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <input 
                    type="password" id="password" name="password" required minlength="6"
                    placeholder="••••••••"
                    class="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl p-4 text-sm font-bold outline-none transition-all"
                  />
                </div>
                <div class="space-y-1.5">
                  <label for="confirmPassword" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm</label>
                  <input 
                    type="password" id="confirmPassword" name="confirmPassword" required
                    placeholder="••••••••"
                    class="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl p-4 text-sm font-bold outline-none transition-all"
                  />
                </div>
            </div>

            <div class="pt-4 text-center">
                <p class="text-[10px] text-slate-400 font-bold mb-4">Password must be at least 6 characters</p>
                <button type="submit" class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all active:scale-95">
                  Create Account
                </button>
            </div>
          </form>

          <!-- Footer Link -->
          <div class="mt-8 text-center">
            <p class="text-slate-400 text-sm font-medium">
              Already have an account? 
              <button id="go-to-login" class="text-indigo-600 font-bold hover:underline underline-offset-4 ml-1">Sign In</button>
            </p>
          </div>
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
