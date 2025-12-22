import { getCurrentUserData } from "../services/user.service.js";

export const renderWater = async () => {
  const content = document.getElementById("content");
  const userData = await getCurrentUserData();
  const user = userData.success ? userData.data : null;

  content.innerHTML = `
    <div class="flex flex-col h-full p-4">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Water Dashboard</h2>

      <!-- Current Status Card -->
      <div class="bg-white rounded-xl shadow p-4 mb-4">
        <p class="text-gray-500">Current Water Status</p>
        <h3 class="text-3xl font-bold text-blue-600">Available</h3>
        <p class="text-sm text-gray-400 mt-1">No reported outages</p>
      </div>

      <!-- Community Water Map Placeholder -->
      <div class="bg-white rounded-xl shadow p-4 mb-4">
        <p class="text-gray-500 mb-2">Water Map (v1)</p>
        <div class="w-full h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">
          Map Placeholder
        </div>
      </div>

      <!-- Water Usage & Schedule Placeholder -->
      <div class="bg-white rounded-xl shadow p-4 flex flex-col">
        <p class="text-gray-500 mb-2">Usage & Schedule</p>
        <ul class="text-gray-700 text-sm">
          <li>Mon: Water ON — 6am to 10am</li>
          <li>Wed: Water ON — 5am to 9am</li>
          <li>Fri: Water ON — 6am to 8am</li>
        </ul>
      </div>
    </div>
  `;
};
