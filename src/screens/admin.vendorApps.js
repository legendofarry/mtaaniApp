import {
  getAllVendorApplications,
  approveVendorApplication,
  rejectVendorApplication,
} from "../services/user.service.js";
import { getCurrentUserData } from "../services/user.service.js";
import { showToast } from "../components/toast.js";
import { confirm, prompt } from "../components/modal.js";

export const renderAdminVendorApps = async () => {
  const content = document.getElementById("content");
  const me = await getCurrentUserData();
  if (!me.success || me.data.role !== "admin") {
    content.innerHTML = `<div class="p-6"><h2 class="text-2xl font-semibold">Access denied</h2><p class="mt-2 text-gray-600">You must be an admin to view vendor applications.</p></div>`;
    return;
  }

  content.innerHTML = `<div class="p-6"><h2 class="text-3xl font-bold text-indigo-600 mb-4">Vendor Applications</h2><div id="apps-list" class="space-y-4"></div></div>`;

  const listEl = document.getElementById("apps-list");

  try {
    const res = await getAllVendorApplications();
    if (!res.success) {
      listEl.innerHTML = `<div class="bg-white p-6 rounded-lg shadow text-red-600">Failed to load applications: ${res.error}</div>`;
      return;
    }

    const apps = res.data;

    if (!apps.length) {
      listEl.innerHTML = `<div class="bg-white p-6 rounded-lg shadow">No applications yet.</div>`;
      return;
    }

    listEl.innerHTML = apps
      .map(
        (a) => `
      <div class="bg-gradient-to-r from-indigo-50 to-pink-50 p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">${
            a.name
          } <span class="text-sm text-gray-500">(${a.uid})</span></h3>
          <p class="text-sm text-gray-600">${a.location} — ${a.phone}</p>
          <p class="mt-2 text-sm text-gray-700">${(a.notes || "").substring(
            0,
            220
          )}</p>
          <p class="mt-2 text-xs font-medium">Status: <span class="px-2 py-1 rounded ${
            a.status === "pending"
              ? "bg-yellow-200 text-yellow-800"
              : a.status === "approved"
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }">${a.status}</span></p>
        </div>
        <div class="mt-3 md:mt-0 flex gap-2">
          <button data-approve="${
            a.uid
          }" class="px-3 py-2 bg-green-600 text-white rounded">Approve</button>
          <button data-reject="${
            a.uid
          }" class="px-3 py-2 bg-red-500 text-white rounded">Reject</button>
          <button data-view="${
            a.uid
          }" class="px-3 py-2 bg-white border rounded">View</button>
        </div>
      </div>
    `
      )
      .join("");

    // attach handlers
    document.querySelectorAll("[data-approve]").forEach((btn) => {
      btn.onclick = async () => {
        const uid = btn.getAttribute("data-approve");
        if (!(await confirm("Approve this application?"))) return;
        try {
          await approveVendorApplication(uid);
          showToast("Application approved", "success");
          renderAdminVendorApps();
        } catch (err) {
          console.error(err);
          showToast("Failed to approve", "error");
        }
      };
    });

    document.querySelectorAll("[data-reject]").forEach((btn) => {
      btn.onclick = async () => {
        const uid = btn.getAttribute("data-reject");
        const reason = await prompt(
          "Reason for rejection",
          "Reject application",
          "Optional reason"
        );
        if (reason === null) return; // cancelled
        try {
          await rejectVendorApplication(uid, reason || "");
          showToast("Application rejected", "success");
          renderAdminVendorApps();
        } catch (err) {
          console.error(err);
          showToast("Failed to reject", "error");
        }
      };
    });

    document.querySelectorAll("[data-view]").forEach((btn) => {
      btn.onclick = async () => {
        const uid = btn.getAttribute("data-view");
        // reload to get latest; for simplicity just refresh page section
        renderAdminVendorApps();
      };
    });
  } catch (err) {
    console.error(err);
    listEl.innerHTML = `<div class="bg-white p-6 rounded-lg shadow text-red-600">Failed to load applications</div>`;
  }
};
