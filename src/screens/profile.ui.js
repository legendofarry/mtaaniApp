import { getCurrentUserData } from "../services/user.service.js";
import { handleLogout } from "../controller/homeController.js";

export const renderProfile = async () => {
  const content = document.getElementById("content");
  const userData = await getCurrentUserData();
  const user = userData.success ? userData.data : null;

  content.innerHTML = `
    <div class="flex flex-col h-full p-4">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Profile</h2>

      <div class="bg-white rounded-xl shadow p-4 mb-4">
        <p class="text-gray-500 mb-1">Name</p>
        <h3 class="text-lg font-semibold text-gray-900">${
          user?.displayName || "User"
        }</h3>

        <p class="text-gray-500 mt-2 mb-1">Email</p>
        <h3 class="text-gray-900 text-sm">${user?.email || "-"}</h3>

        <p class="text-gray-500 mt-2 mb-1">Role</p>
        <h3 class="text-gray-900 text-sm">${user?.role || "user"}</h3>
      </div>

      <button
        id="logout-btn"
        class="mt-auto w-full max-w-xs py-3 rounded-xl bg-red-600 text-white font-semibold text-base shadow-md active:scale-95 transition"
      >
        Logout
      </button>
    </div>
  `;

  document.getElementById("logout-btn").onclick = handleLogout;
};
