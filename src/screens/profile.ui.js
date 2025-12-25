import {
  getCurrentUserData,
  addMeter,
  removeMeter,
  updateMeter,
  getVendorApplication,
} from "../services/user.service.js";
import { handleLogout } from "../controller/homeController.js";
import { getAuthUser } from "../services/auth.store.js";
import { showToast } from "../components/toast.js";
import { confirm, prompt } from "../components/modal.js";
import { navigate } from "../app/router.js";

export const renderProfile = async () => {
  const content = document.getElementById("content");

  // Data Fetching
  const userData = await getCurrentUserData();
  const user = userData.success ? userData.data : null;
  const existingApp = user
    ? await getVendorApplication(getAuthUser()?.uid)
    : null;
  const meters = user?.meters || [];

  content.innerHTML = `
    <div class="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in pb-24">
      
      <!-- Header -->
      <header class="flex justify-between items-center">
        <h2 class="text-4xl font-black text-slate-900 tracking-tight">Profile</h2>
        <div class="bg-indigo-50 px-4 py-2 rounded-2xl">
           <span class="text-xs font-black text-indigo-600 uppercase tracking-widest">${
             user?.role || "Member"
           }</span>
        </div>
      </header>

      <!-- Identity Card -->
      <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-100">
          ${user?.displayName?.charAt(0) || "U"}
        </div>
        <div class="text-center md:text-left space-y-1">
          <h3 class="text-2xl font-black text-slate-900">${
            user?.displayName || "Utility User"
          }</h3>
          <p class="text-slate-500 font-medium">${
            user?.email || "No email linked"
          }</p>
          <div class="pt-2 flex flex-wrap justify-center md:justify-start gap-2">
            ${renderRoleBadge(user, existingApp)}
          </div>
        </div>
      </div>

      <!-- Quick Actions (Vendor/Share) -->
      ${
        user?.role !== "vendor"
          ? `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/vendor/apply" data-link class="group p-6 bg-slate-900 rounded-[2rem] text-white flex items-center justify-between hover:bg-slate-800 transition-all">
          <div>
            <p class="font-bold text-lg">Become a Vendor</p>
            <p class="text-slate-400 text-xs">Sell water to your community</p>
          </div>
          <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
        </a>
        <a href="/share-target" data-link class="group p-6 bg-white border border-slate-100 rounded-[2rem] text-slate-900 flex items-center justify-between hover:border-indigo-200 transition-all">
          <div>
            <p class="font-bold text-lg">Sync SMS Token</p>
            <p class="text-slate-500 text-xs">Paste token from your provider</p>
          </div>
          <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
          </div>
        </a>
      </div>
      `
          : ""
      }

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Meter Management -->
        <div class="space-y-6">
          <div class="flex justify-between items-end px-2">
            <h4 class="font-black text-slate-900 uppercase tracking-widest text-xs">Registered Meters</h4>
            <span class="text-xs font-bold text-slate-400">${
              meters.length
            } Total</span>
          </div>
          
          <div id="meters-list" class="space-y-3">
            ${
              meters.length > 0
                ? meters.map((m) => renderMeterTile(m)).join("")
                : `
              <div class="p-8 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <p class="text-slate-400 text-sm font-medium">No meters registered yet</p>
              </div>
            `
            }
          </div>
        </div>

        <!-- Add Meter Form -->
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm self-start">
          <h4 class="text-xl font-black text-slate-900 mb-6">Add New Meter</h4>
          <form id="add-meter-form" class="space-y-4">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Meter Serial Number</label>
              <input id="meter-id" required placeholder="e.g. 44002211" class="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Friendly Label</label>
              <input id="meter-label" required placeholder="e.g. Main House" class="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Utility Type</label>
              <select id="meter-type" class="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all">
                <option value="electricity">Electricity</option>
                <option value="water">Water</option>
              </select>
            </div>
            <button type="submit" class="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all active:scale-95 mt-2">
              Add Meter
            </button>
          </form>
        </div>

      </div>

      <div class="pt-8 border-t border-slate-100">
        <button id="logout-btn" class="w-full py-4 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl font-black transition-all active:scale-95">
          Sign Out of Account
        </button>
      </div>
    </div>
  `;

  // --- Logic & Handlers ---
  setupProfileHandlers(renderProfile);
};

/**
 * Sub-component: Role Badges
 */
function renderRoleBadge(user, app) {
  if (user?.role === "vendor") {
    return `<span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-black uppercase tracking-tighter flex items-center gap-1">
      <span class="w-2 h-2 bg-emerald-500 rounded-full"></span> Active Vendor
    </span>`;
  }
  if (app && app.status === "pending") {
    return `<span class="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-black uppercase tracking-tighter flex items-center gap-1">
      <span class="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span> Application Pending
    </span>`;
  }
  return `<span class="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-black uppercase tracking-tighter">Standard Account</span>`;
}

/**
 * Sub-component: Meter Tile
 */
function renderMeterTile(m) {
  const isElec = m.type === "electricity";
  return `
    <div class="p-4 bg-white border border-slate-100 rounded-3xl flex items-center justify-between group hover:shadow-md transition-all">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl ${
          isElec ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
        } flex items-center justify-center transition-transform group-hover:scale-110">
          ${
            isElec
              ? `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`
              : `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>`
          }
        </div>
        <div>
          <h5 class="font-black text-slate-800 tracking-tight">${m.label}</h5>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${
            m.id
          } • ${m.type}</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button data-edit="${
          m.id
        }" class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
        </button>
        <button data-delete="${
          m.id
        }" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    </div>
  `;
}

/**
 * Event Logic
 */
function setupProfileHandlers(reRender) {
  const uid = getAuthUser()?.uid;
  document.getElementById("logout-btn").onclick = handleLogout;

  const addForm = document.getElementById("add-meter-form");
  if (addForm) {
    addForm.onsubmit = async (e) => {
      e.preventDefault();
      const profile = await getCurrentUserData();
      if (!profile.success || !profile.data.onboarded) {
        showToast("Complete onboarding first", "warning");
        navigate("/onboarding");
        return;
      }
      const id = document.getElementById("meter-id").value.trim();
      const label = document.getElementById("meter-label").value.trim();
      const type = document.getElementById("meter-type").value;

      try {
        await addMeter(uid, { id, label, type });
        showToast("Meter added!", "success");
        reRender();
      } catch (err) {
        showToast("Error adding meter", "error");
      }
    };
  }

  document.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute("data-delete");
      if (!(await confirm(`Are you sure you want to remove meter ${id}?`)))
        return;
      try {
        await removeMeter(uid, id);
        showToast("Meter removed", "success");
        reRender();
      } catch (err) {
        showToast("Error removing meter", "error");
      }
    };
  });

  document.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute("data-edit");
      const newLabel = await prompt(
        "Enter new friendly name:",
        "Rename Meter",
        "Home Meter"
      );
      if (!newLabel) return;
      try {
        await updateMeter(uid, id, { label: newLabel });
        showToast("Meter updated", "success");
        reRender();
      } catch (err) {
        showToast("Error updating meter", "error");
      }
    };
  });
}
