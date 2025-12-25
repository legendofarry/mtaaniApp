import { getCurrentUserData } from "../services/user.service.js";
import { sparklineSVG } from "../services/usage.service.js";
import {
  getCommunityStatus,
  getVendors,
  submitReport,
  trySync,
  predictNextSupply,
  getSupplyPatternSeries,
} from "../services/water.service.js";
import { showToast } from "../components/toast.js";
import { navigate } from "../app/router.js";

const statusToColor = (s) => {
  if (!s) return "bg-green-100";
  if (s === "OFF") return "bg-red-100";
  if (s === "LOW PRESSURE") return "bg-yellow-100";
  return "bg-green-100";
};

const renderVendorCard = (v) => `
  <div class="p-3 border rounded flex items-center justify-between">
    <div>
      <div class="font-semibold">${v.name}</div>
      <div class="text-xs text-gray-500">${v.route} • Ksh ${v.price}/20L</div>
    </div>
    <div class="text-right">
      <div class="text-sm ${
        v.available ? "text-green-600" : "text-gray-400"
      }">${v.available ? "Available" : "Unavailable"}</div>
      <div class="mt-2">
        <button data-vendor-id="${
          v.id
        }" class="px-3 py-1 bg-indigo-600 text-white rounded text-xs">Details</button>
      </div>
    </div>
  </div>`;

export const renderWater = async () => {
  const content = document.getElementById("content");
  const userData = await getCurrentUserData();

  const status = getCommunityStatus();
  const vendors = getVendors();
  const pred = predictNextSupply();
  const pattern = getSupplyPatternSeries(14);
  const spark = sparklineSVG(pattern, 320, 48);

  content.innerHTML = `
    <div class="p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-2xl font-bold">Water</h2>
        <button id="fab-report" class="py-2 px-3 bg-blue-600 text-white rounded">Report Water</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="md:col-span-2">
          <div class="rounded-xl overflow-hidden ${statusToColor(
            status.status
          )} border p-4">
            <p class="text-sm text-gray-600">Area status</p>
            <h3 class="text-2xl font-bold mt-1">${status.status}</h3>
            <p class="text-xs text-gray-500 mt-1">${
              status.count
            } recent reports</p>
            <div class="mt-4 bg-white rounded p-3">
              <div class="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">Map Placeholder</div>
            </div>
          </div>
        </div>

        <div>
          <div class="card rounded-xl p-4 mb-4">
            <p class="text-sm text-gray-500">Summary</p>
            <h3 class="text-lg font-semibold mt-1">Water is ${
              status.status
            } in your area.</h3>
            <p class="text-xs text-gray-400 mt-2">Next predicted supply: ${
              pred.day
            } ${pred.time}</p>
          </div>

          <div class="card rounded-xl p-4">
            <p class="text-sm text-gray-500">Vendors nearby</p>
            <div id="vendors-list" class="mt-2 space-y-2">
              ${vendors.map((v) => renderVendorCard(v)).join("")}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Modal -->
    <div id="report-modal" class="fixed inset-0 bg-black/40 hidden items-center justify-center z-50">
      <div class="bg-white rounded-xl p-4 w-11/12 max-w-md">
        <h3 class="font-bold mb-2">Report Water Issue</h3>
        <form id="report-form" class="space-y-2">
          <div>
            <label class="text-xs text-gray-600">Type</label>
            <select id="report-type" class="w-full border rounded p-2">
              <option value="ON">Water ON</option>
              <option value="OFF">Water OFF</option>
              <option value="LOW">Low pressure</option>
              <option value="DIRTY">Dirty water</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-600">Notes (optional)</label>
            <textarea id="report-notes" class="w-full border rounded p-2" rows="3"></textarea>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" id="report-cancel" class="px-3 py-1 rounded border">Cancel</button>
            <button type="submit" class="px-3 py-1 bg-green-600 text-white rounded">Submit</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Vendor details modal -->
    <div id="vendor-modal" class="fixed inset-0 bg-black/40 hidden items-center justify-center z-50">
      <div class="bg-white rounded-xl p-4 w-11/12 max-w-sm" id="vendor-modal-content"></div>
    </div>
  `;

  // Handlers
  document.getElementById("fab-report").onclick = async () => {
    const profile = await getCurrentUserData();
    if (!profile.success || !profile.data.onboarded) {
      showToast("Please complete onboarding before reporting", "warning");
      navigate("/onboarding");
      return;
    }
    document.getElementById("report-modal").classList.remove("hidden");
    document.getElementById("report-modal").classList.add("flex");
  };

  document.getElementById("report-cancel").onclick = () => {
    document.getElementById("report-modal").classList.add("hidden");
    document.getElementById("report-modal").classList.remove("flex");
  };

  document.getElementById("report-form").onsubmit = async (e) => {
    e.preventDefault();
    const type = document.getElementById("report-type").value;
    const notes = document.getElementById("report-notes").value.trim();
    const profile = await getCurrentUserData();
    if (!profile.success || !profile.data.onboarded) {
      showToast("Please complete onboarding before reporting", "warning");
      navigate("/onboarding");
      return;
    }
    await submitReport({ type, notes });
    showToast("Report saved (will sync when online).", "success");
    document.getElementById("report-modal").classList.add("hidden");
    document.getElementById("report-modal").classList.remove("flex");
    // re-render to update counts
    renderWater();
  };

  // Vendor detail buttons
  document.querySelectorAll("[data-vendor-id]").forEach((btn) => {
    btn.onclick = (e) => {
      const id = btn.getAttribute("data-vendor-id");
      const v = vendors.find((x) => x.id === id);
      if (!v) return;
      const el = document.getElementById("vendor-modal-content");
      el.innerHTML = `
        <h3 class="font-bold">${v.name}</h3>
        <p class="text-xs text-gray-500">${v.route} — Ksh ${v.price}/20L</p>
        <p class="text-xs text-gray-500">Hours: ${v.hours}</p>
        <p class="mt-2"><a href="tel:${v.contact}" class="text-blue-600">Call ${v.contact}</a></p>
        <div class="mt-3 text-right"><button id="vendor-close" class="px-3 py-1 bg-gray-200 rounded">Close</button></div>
      `;
      document.getElementById("vendor-modal").classList.remove("hidden");
      document.getElementById("vendor-modal").classList.add("flex");
      document.getElementById("vendor-close").onclick = () => {
        document.getElementById("vendor-modal").classList.add("hidden");
        document.getElementById("vendor-modal").classList.remove("flex");
      };
    };
  });

  // attempt sync in background
  trySync();
};
