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
  const userData = await getCurrentUserData();
  const user = userData.success ? userData.data : null;

  const existingApp = user
    ? await getVendorApplication(getAuthUser()?.uid)
    : null;

  // simple placeholder for multi-meter support
  const meters = user?.meters || [];

  content.innerHTML = `
    <div class="flex flex-col h-full p-4">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Profile</h2>

      <div class="card rounded-xl p-4 mb-4">
        <p class="text-muted mb-1">Name</p>
        <h3 class="text-lg font-semibold text-accent">${
          user?.displayName || "User"
        }</h3>

        <p class="text-gray-500 mt-2 mb-1">Email</p>
        <h3 class="text-gray-900 text-sm">${user?.email || "-"}</h3>

        <p class="text-gray-500 mt-2 mb-1">Role</p>
        <div class="flex items-center justify-between">
          <h3 class="text-gray-900 text-sm">${user?.role || "user"}</h3>
          ${
            user?.role === "vendor"
              ? `<span class="px-2 py-1 rounded bg-green-100 text-green-800 text-sm">Vendor</span>`
              : existingApp && existingApp.status === "pending"
              ? `<span class="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-sm">Application pending</span>`
              : `<div class="flex items-center gap-2"><a href="/vendor/apply" data-link class="py-1 px-3 bg-yellow-500 text-white rounded text-sm">Become a Water Vendor</a><a href="/share-target" data-link class="py-1 px-3 bg-indigo-600 text-white rounded text-sm">Paste/Share SMS</a></div>`
          }
        </div>
      </div>

      <div class="card rounded-xl p-4 mb-4">
        <p class="text-muted mb-2">Meters</p>
        <ul id="meters-list" class="text-gray-700 text-sm space-y-2">
          ${meters
            .map(
              (m) =>
                `<li class="p-2 border rounded flex items-center justify-between"><div><strong>${m.label}</strong> <span class="text-xs text-gray-500">— ${m.id} (${m.type})</span></div><div class="space-x-2"><button data-edit="${m.id}" class="px-2 py-1 text-xs bg-blue-500 text-white rounded">Edit</button><button data-delete="${m.id}" class="px-2 py-1 text-xs bg-red-500 text-white rounded">Delete</button></div></li>`
            )
            .join("")}
        </ul>
      </div>

      <div class="card rounded-xl p-4 mb-4">
        <p class="text-muted mb-2">Add Meter</p>
        <form id="add-meter-form" class="space-y-2">
          <div>
            <label class="text-xs text-gray-600">Meter ID</label>
            <input id="meter-id" required class="w-full border rounded p-2 mt-1" />
          </div>
          <div>
            <label class="text-xs text-gray-600">Label</label>
            <input id="meter-label" required class="w-full border rounded p-2 mt-1" />
          </div>
          <div>
            <label class="text-xs text-gray-600">Type</label>
            <select id="meter-type" class="w-full border rounded p-2 mt-1">
              <option value="electricity">Electricity</option>
              <option value="water">Water</option>
            </select>
          </div>
          <div>
            <button type="submit" class="py-2 px-4 bg-green-600 text-white rounded">Add Meter</button>
          </div>
        </form>
      </div>

      <button id="logout-btn" class="mt-auto w-full max-w-xs py-3 rounded-xl bg-red-600 text-white font-semibold text-base shadow-md active:scale-95 transition">Logout</button>
    </div>
  `;

  document.getElementById("logout-btn").onclick = handleLogout;
  // Attach meter handlers
  const uid = getAuthUser()?.uid;

  const addForm = document.getElementById("add-meter-form");
  if (addForm) {
    addForm.onsubmit = async (e) => {
      e.preventDefault();
      const profile = await getCurrentUserData();
      if (!profile.success || !profile.data.onboarded) {
        showToast(
          "Please complete onboarding before adding a meter",
          "warning"
        );
        navigate("/onboarding");
        return;
      }
      const id = document.getElementById("meter-id").value.trim();
      const label = document.getElementById("meter-label").value.trim();
      const type = document.getElementById("meter-type").value;
      if (!id || !label)
        return showToast("Please provide meter id and label", "warning");
      try {
        await addMeter(uid, { id, label, type });
        renderProfile();
      } catch (err) {
        console.error(err);
        showToast("Failed to add meter", "error");
      }
    };
  }

  // Delete / Edit buttons
  document.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute("data-delete");
      if (!(await confirm("Delete meter " + id + "?"))) return;
      try {
        await removeMeter(uid, id);
        showToast("Meter deleted", "success");
        renderProfile();
      } catch (err) {
        console.error(err);
        showToast("Failed to delete meter", "error");
      }
    };
  });

  document.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.getAttribute("data-edit");
      const newLabel = await prompt(
        "New label for " + id + "?",
        "Edit meter",
        "e.g. Home meter"
      );
      if (!newLabel) return;
      try {
        await updateMeter(uid, id, { label: newLabel });
        showToast("Meter updated", "success");
        renderProfile();
      } catch (err) {
        console.error(err);
        showToast("Failed to update meter", "error");
      }
    };
  });
};
