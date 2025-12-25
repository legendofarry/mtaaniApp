// src/auth/login.ui.js
import { handleLogin, goToRegister } from "../controller/loginController";
import { navigate } from "../app/router.js";

export const renderLogin = () => {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 p-6 animate-in fade-in duration-500">
      
      <!-- Decorative Background Blur -->
      <div class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-200/40 blur-[120px] rounded-full"></div>
        <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-200/40 blur-[120px] rounded-full"></div>
      </div>

      <div class="w-full max-w-[440px]">
        <!-- Brand / Header -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-[1.5rem] text-white shadow-xl shadow-indigo-200 mb-6">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h2 class="text-4xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p class="text-slate-500 font-medium mt-2">Sign in to your MtaaniFlow account</p>
        </div>

        <!-- Auth Card -->
        <div class="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/60 border border-slate-100">
          <form id="login-form" class="space-y-6">
            
            <!-- Email Field -->
            <div class="space-y-2">
              <label for="email" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"></path></svg>
                </div>
                <input 
                  type="email" id="email" name="email" required
                  placeholder="name@example.com"
                  class="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl p-4 pl-12 text-sm font-bold outline-none transition-all"
                />
              </div>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <label for="password" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div class="flex gap-3">
                <div class="relative flex-1 group">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                  <input 
                    type="password" id="password" name="password" required
                    placeholder="••••••••"
                    class="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl p-4 pl-12 text-sm font-bold outline-none transition-all"
                  />
                </div>
                
                <!-- Biometric Quick Button -->
                <button id="biometric-btn" type="button" 
                  class="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all active:scale-95 shadow-lg group"
                  title="Sign in with Biometrics">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                    <path d="M18,12c-3.314,0-6,2.686-6,6s2.686,6,6,6,6-2.686,6-6-2.686-6-6-6Zm3.683,5.712l-2.703,2.614c-.452,.446-1.052,.671-1.653,.671s-1.203-.225-1.663-.674l-1.354-1.332c-.395-.387-.4-1.02-.014-1.414,.386-.395,1.019-.401,1.414-.014l1.354,1.331c.144,.142,.38,.139,.522-.002l2.713-2.624c.397-.381,1.031-.37,1.414,.029,.382,.398,.369,1.031-.029,1.414ZM0,14v-3C0,4.935,4.935,0,11,0c2.401,0,4.683,.763,6.601,2.206,.441,.333,.53,.959,.198,1.4-.332,.441-.959,.53-1.4,.198-1.569-1.18-3.436-1.804-5.399-1.804C6.038,2,2,6.038,2,11v3c0,.553-.448,1-1,1S0,14.553,0,14Zm6-3c0-.28,.023-.562,.069-.834,.092-.545-.275-1.061-.82-1.152-.556-.085-1.062,.276-1.152,.82-.064,.383-.097,.774-.097,1.166,0,2.888-.553,6.436-3.188,6.937-.542,.104-.898,.627-.795,1.17,.092,.479,.511,.812,.981,.812,2.693-.534,5.001-2.319,5.001-8.919ZM.999,19.919c-.063,.013,.062,0,0,0H.999ZM12.006,11.028c.015,.539,.452,.972,.994,.972,.552,0,1-.448,1-1h0c0-1.654-1.346-3-3-3s-2.998,1.344-3,2.997c0,.001,0,.002,0,.003l.006,1c0,3.874-1.324,5.923-1.339,5.945-1.078,1.497-2.298,3.195-5.442,4.093-.531,.152-.838,.706-.687,1.236,.125,.439,.526,.726,.961,.726,.091,0,.184-.013,.275-.038,3.812-1.09,5.375-3.263,6.552-4.9,.069-.101,1.679-2.524,1.679-7.07l-.006-.991h0c0-.552,.448-1,1-1s1,.448,1,1.024c0,0,.005,.003,.005,.003Zm-1.005-7.028c-1.984,0-3.885,.851-5.213,2.332-.369,.412-.335,1.044,.076,1.412,.413,.37,1.044,.335,1.412-.076,.95-1.061,2.308-1.668,3.725-1.668,2.161,0,4.029,1.362,4.719,3.339,.163,.466,.624,.757,1.111,.675,.598-.101,.989-.712,.794-1.286-.952-2.797-3.58-4.728-6.624-4.728Zm8.958,6.132c.048,.498,.486,.868,.987,.868,.596,0,1.059-.519,.999-1.112-.157-1.544-.64-3.043-1.42-4.389-.276-.479-.89-.642-1.366-.364-.479,.276-.642,.889-.364,1.366,.645,1.113,1.041,2.353,1.165,3.631Zm-10.641,11.2c-.288,.32-.604,.618-.939,.885-.433,.344-.504,.974-.161,1.405,.197,.249,.489,.378,.783,.378,.218,0,.438-.071,.622-.217,.423-.337,.821-.712,1.184-1.115,.369-.411,.335-1.043-.076-1.412-.41-.369-1.042-.334-1.412,.076Z"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Submit Action -->
            <div class="pt-4">
              <button type="submit" class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all active:scale-95">
                Sign In
              </button>
            </div>
          </form>

          <!-- Footer Link -->
          <div class="mt-8 text-center">
            <p class="text-slate-400 text-sm font-medium">
              Don't have an account? 
              <button id="go-to-register" class="text-indigo-600 font-bold hover:underline underline-offset-4 ml-1">Create Account</button>
            </p>
          </div>
        </div>

        <!-- Extra Footer -->
        <p class="text-center mt-10 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Secure Cloud Utility Platform</p>
      </div>
    </div>
  `;

  // Attach event listeners
  setupLoginHandlers();
};

const setupLoginHandlers = () => {
  const form = document.getElementById("login-form");
  const registerLink = document.getElementById("go-to-register");
  const biometricBtn = document.getElementById("biometric-btn");

  form.addEventListener("submit", handleLogin);
  registerLink.addEventListener("click", goToRegister);

  biometricBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const { default: biometricService } = await import(
        "../services/biometric.service.js"
      );
      const { showToast } = await import("../components/toast.js");

      if (!biometricService?.authenticateWithPasskey) {
        showToast("Biometrics not supported on this device", "warning");
        return;
      }

      const r = await biometricService.authenticateWithPasskey();
      if (!r.success) {
        showToast(
          "No saved biometrics. Sign in and enable them in your profile.",
          "info"
        );
        return;
      }

      const local = localStorage.getItem("webauthn_credential");
      if (local) {
        const parsed = JSON.parse(local);
        const session = {
          uid: parsed.uid,
          email: parsed.email,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem("webauthn_session", JSON.stringify(session));

        const m = await import("../services/auth.store.js");
        m.emitLocalAuth({
          uid: parsed.uid,
          email: parsed.email,
          _biometric: true,
        });

        showToast("Secure biometric entry successful", "success");
        setTimeout(() => navigate("/home"), 400);
      }
    } catch (err) {
      console.warn("Biometric error:", err);
    }
  });
};
