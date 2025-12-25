import { showToast } from "../components/toast.js";
// This route handles incoming shared text via the Web Share Target manifest
export const renderShareTarget = async () => {
  const content = document.getElementById('content');
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

  document.getElementById('parse-shared').onclick = () => {
    const txt = document.getElementById('shared-text').value.trim();
    if (!txt) return showToast('Please paste the message', 'warning');
    // simple token parsing example (very dependent on provider SMS format)
    const tokenMatch = txt.match(/(\d{4,})/g);
    showToast('Shared message received', 'success');
    console.log('shared text:', txt, 'tokens found:', tokenMatch);
  };
};

export default renderShareTarget;
