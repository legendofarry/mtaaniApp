import { showToast } from "../components/toast.js";
// This route handles incoming shared text via the Web Share Target manifest
export const renderShareTarget = async () => {
  const content = document.getElementById("content");
  // The browser will POST form data to /share-target; in SPA we can read location.search or body depending on how server is configured.
  // For now show a simple UI instructing user to paste the SMS if automatic share isn't available.
  content.innerHTML = `
    <div class="p-4 max-w-2xl mx-auto">
      <h2 class="text-2xl font-semibold mb-2">Shared Message</h2>
      <p class="text-sm text-gray-600 mb-4">If you shared an SMS to the app, paste it below to let the app parse any purchased tokens.</p>
      <div class="bg-white rounded p-4">
        <textarea id="shared-text" rows="6" class="w-full border rounded p-2" placeholder="Paste SMS content here..."></textarea>
        <div class="mt-3 flex justify-end gap-2"><button id="parse-shared" class="px-4 py-2 bg-indigo-600 text-white rounded">Parse</button></div>
      </div>
    </div>
  `;

  document.getElementById("parse-shared").onclick = async () => {
    const txt = document.getElementById("shared-text").value.trim();
    if (!txt) return showToast("Please paste the message", "warning");

    try {
      const sms = await import("../services/sms.service.js");
      const parsed = sms.parseSMS(txt);

      // show parsed preview
      const preview = document.createElement("div");
      preview.className = "bg-white p-3 rounded mt-3 border";
      preview.innerHTML = `
        <div class="text-sm text-gray-600">Detected:</div>
        <div class="mt-2">
          <div><strong>Meter:</strong> ${parsed.meter || "-"} </div>
          <div><strong>Token:</strong> ${parsed.token || "-"} </div>
          <div><strong>Date:</strong> ${parsed.date || "-"} </div>
          <div><strong>Units:</strong> ${parsed.units ?? "-"} </div>
          <div><strong>Amount:</strong> ${parsed.amt ?? "-"} </div>
          <div><strong>Token Amt:</strong> ${parsed.tknAmount ?? "-"} </div>
          <div><strong>Other Charges:</strong> ${
            parsed.otherCharges ?? "-"
          } </div>
        </div>
        <div class="mt-3 flex justify-end gap-2">
          <button id="save-shared" class="px-3 py-1 bg-green-600 text-white rounded">Save</button>
          <button id="cancel-preview" class="px-3 py-1 bg-gray-200 rounded">Cancel</button>
        </div>
      `;

      // remove old preview if any
      const old = document.getElementById("shared-preview");
      if (old) old.remove();
      preview.id = "shared-preview";
      document
        .getElementById("shared-text")
        .insertAdjacentElement("afterend", preview);

      document.getElementById("cancel-preview").onclick = () =>
        preview.remove();

      document.getElementById("save-shared").onclick = async () => {
        const uid = (await import("../services/auth.store.js")).getAuthUser()
          ?.uid;
        if (!uid)
          return showToast("Please login to save token purchase", "warning");
        const res = await sms.saveTokenPurchase(uid, parsed);
        if (res.success) {
          if (res.offline) {
            showToast(
              "Purchase saved locally (permissions missing). Will sync when possible.",
              "warning"
            );
          } else {
            showToast("Token purchase saved", "success");
          }
          preview.remove();
          document.getElementById("shared-text").value = "";
        } else {
          showToast(res.error || "Failed to save purchase", "error");
          console.error(res.error);
        }
      };
    } catch (err) {
      console.error("parse/save failed", err);
      showToast("Failed to parse message", "error");
    }
  };
};

export default renderShareTarget;
