import { getAuthUser } from "../services/auth.store.js";
import {
  submitVendorApplication,
  getUserData,
  getVendorApplication,
} from "../services/user.service.js";
import { showToast } from "../components/toast.js";
import { navigate } from "../app/router.js";

export const renderVendorApply = async () => {
  const content = document.getElementById("content");
  const user = getAuthUser();

  // Data Fetching
  const [existing, me] = await Promise.all([
    getVendorApplication(user?.uid),
    getUserData(user?.uid),
  ]);

  // Security Check: Onboarding
  if (!me || !me.onboarded) {
    showToast("Please complete onboarding before applying", "warning");
    navigate("/onboarding");
    return;
  }

  // --- State 1: Already a Vendor ---
  if (user?.role === "vendor") {
    content.innerHTML = `
      <div class="max-w-xl mx-auto p-6 h-[80vh] flex flex-col items-center justify-center animate-in fade-in">
        <div class="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-lg shadow-emerald-100">
          <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 class="text-3xl font-black text-slate-900 text-center tracking-tight">Verified Partner</h2>
        <p class="text-slate-500 text-center mt-3 font-medium px-4">Your account is already registered with vendor privileges. You can manage your listing from the dashboard.</p>
        <button onclick="navigate('/profile')" class="mt-10 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold active:scale-95 transition-all">Return to Profile</button>
      </div>
    `;
    return;
  }

  // --- State 2: Application Pending ---
  if (existing && existing.status === "pending") {
    content.innerHTML = `
      <div class="max-w-xl mx-auto p-6 h-[80vh] flex flex-col items-center justify-center animate-in fade-in">
        <div class="w-24 h-24 bg-amber-100 text-amber-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-lg shadow-amber-100">
          <svg class="w-12 h-12 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-3xl font-black text-slate-900 text-center tracking-tight">Review in Progress</h2>
        <p class="text-slate-500 text-center mt-3 font-medium px-4">We've received your application! Our team typically reviews vendor requests within 24-48 hours.</p>
        <button onclick="navigate('/profile')" class="mt-10 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold active:scale-95 transition-all">Back to Profile</button>
      </div>
    `;
    return;
  }

  // --- State 3: The Application Form ---
  content.innerHTML = `
    <div class="max-w-3xl mx-auto p-6 md:p-12 space-y-10 animate-in fade-in pb-24">
      
      <header class="text-center space-y-4">
        <div class="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl text-indigo-600 mb-2">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        </div>
        <h2 class="text-4xl font-black text-slate-900 tracking-tight">Become a Water Vendor</h2>
        <p class="text-slate-500 max-w-md mx-auto font-medium">Join our network to supply clean water to your community. Please provide your business details below.</p>
      </header>

      <div class="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
        <form id="vendor-apply-form" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
              <input id="vendor-name" required placeholder="e.g. BlueWave Supplies" 
                class="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl p-4 text-sm font-bold outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
              <input id="vendor-phone" type="tel" required placeholder="e.g. +254..." 
                class="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl p-4 text-sm font-bold outline-none transition-all" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Area / Route</label>
            <input id="vendor-location" required placeholder="e.g. Westlands, Lower Kabete" 
              class="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl p-4 text-sm font-bold outline-none transition-all" />
          </div>

          <div class="space-y-2">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Description</label>
            <textarea id="vendor-notes" rows="4" placeholder="Briefly describe your capacity (e.g. 5,000L truck, delivery times...)" 
              class="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl p-4 text-sm font-bold outline-none transition-all"></textarea>
          </div>

          <div class="pt-6 flex flex-col md:flex-row gap-4">
            <button type="submit" class="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all active:scale-95">
              Submit Application
            </button>
            <button id="cancel-apply" type="button" class="px-8 py-4 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl font-bold transition-all">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div class="p-6 bg-indigo-50/50 rounded-3xl flex items-start gap-4 border border-indigo-100/50">
        <svg class="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <p class="text-xs font-medium text-indigo-900/60 leading-relaxed">By submitting this application, you agree to provide accurate service information and maintain community supply standards. Your contact details will be visible to users in your selected route upon approval.</p>
      </div>
    </div>
  `;

  // --- Form Logic ---
  const form = document.getElementById("vendor-apply-form");
  form.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById("vendor-name").value.trim();
    const phone = document.getElementById("vendor-phone").value.trim();
    const location = document.getElementById("vendor-location").value.trim();
    const notes = document.getElementById("vendor-notes").value.trim();

    if (!name || !phone || !location) {
      return showToast("Please complete all required fields", "warning");
    }

    try {
      // Loading State Visual
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="animate-pulse">Submitting...</span>`;

      await submitVendorApplication(user?.uid, {
        name,
        phone,
        location,
        notes,
      });
      showToast("Application received!", "success");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      showToast("Failed to submit application", "error");
    }
  };

  document.getElementById("cancel-apply").onclick = () => navigate("/profile");
};
