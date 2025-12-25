import { getAuthUser } from "../services/auth.store.js";
import {
  submitVendorApplication,
  getUserData,
} from "../services/user.service.js";
import { getVendorApplication } from "../services/user.service.js";
import { showToast } from "../components/toast.js";
import { navigate } from "../app/router.js";

export const renderVendorApply = async () => {
  const content = document.getElementById("content");
  const user = getAuthUser();

  // prevent re-applying if already vendor or pending
  const existing = await getVendorApplication(user?.uid);
  const me = await getUserData(user?.uid);
  if (!me || !me.onboarded) {
    showToast("Please complete onboarding before applying", "warning");
    navigate("/onboarding");
    return;
  }
  if (user?.role === "vendor") {
    content.innerHTML = `<div class="p-4"><h2 class="text-xl font-semibold">You're already a registered vendor</h2><p class="text-sm text-gray-600 mt-2">Thank you — your account has vendor privileges.</p><div class="mt-4"><a href="/profile" data-link class="py-2 px-4 bg-gray-200 rounded">Back to profile</a></div></div>`;
    return;
  }

  if (existing && existing.status === "pending") {
    content.innerHTML = `<div class="p-4"><h2 class="text-xl font-semibold">Application Pending</h2><p class="text-sm text-gray-600 mt-2">We have received your application and will review it shortly.</p><div class="mt-4"><a href="/profile" data-link class="py-2 px-4 bg-gray-200 rounded">Back to profile</a></div></div>`;
    return;
  }

  content.innerHTML = `
    <div class="p-4 max-w-2xl mx-auto">
      <h2 class="text-2xl font-semibold mb-4">Apply to Become a Water Vendor</h2>
      <p class="text-sm text-gray-600 mb-4">Fill out the form below to apply. Applications are reviewed by the team and you'll be notified when approved.</p>

      <div class="bg-white rounded-xl shadow p-4">
        <form id="vendor-apply-form" class="space-y-3">
          <div>
            <label class="text-xs text-gray-600">Business / Vendor Name</label>
            <input id="vendor-name" required class="w-full border rounded p-2 mt-1" />
          </div>
          <div>
            <label class="text-xs text-gray-600">Contact Phone</label>
            <input id="vendor-phone" required class="w-full border rounded p-2 mt-1" />
          </div>
          <div>
            <label class="text-xs text-gray-600">Location / Route</label>
            <input id="vendor-location" required class="w-full border rounded p-2 mt-1" />
          </div>
          <div>
            <label class="text-xs text-gray-600">Short description / notes</label>
            <textarea id="vendor-notes" class="w-full border rounded p-2 mt-1" rows="4"></textarea>
          </div>

          <div class="flex items-center justify-between">
            <button type="submit" class="py-2 px-4 bg-blue-600 text-white rounded">Submit Application</button>
            <button id="cancel-apply" type="button" class="py-2 px-4 bg-gray-200 text-gray-700 rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

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
      const uid = user?.uid;
      await submitVendorApplication(uid, { name, phone, location, notes });
      showToast("Application submitted. We'll review it shortly.", "success");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      showToast("Failed to submit application", "error");
    }
  };

  document.getElementById("cancel-apply").onclick = () => navigate("/profile");
};
