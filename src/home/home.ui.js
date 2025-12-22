// src/home/home.ui.js
import { handleLogout, getUserInfo } from "../controller/homeController.js";
import { getCurrentUserData } from "../services/user.service.js";

export const renderHome = async () => {
  const app = document.getElementById("app");
  const user = getUserInfo();

  // Fetch user data from Firestore
  const userData = await getCurrentUserData();
  const userProfile = userData.success ? userData.data : null;

  app.innerHTML = `
    <nav class="navbar">
      <div class="navbar-content">
        <a href="/home" class="navbar-brand">Flux</a>
        <ul class="navbar-menu">
          <li><a href="#" id="logout-btn">Logout</a></li>
        </ul>
      </div>
    </nav>
    
    <div class="container dashboard">
      <div class="welcome-section">
        <h1>Welcome, ${
          userProfile?.displayName || user?.displayName || user?.email || "User"
        }! 👋</h1>
        <p>Manage your community from the Flux dashboard</p>
        ${
          userProfile
            ? `
          <div style="margin-top: 15px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${
              userProfile.email
            }</p>
            <p style="margin: 5px 0;"><strong>Role:</strong> ${
              userProfile.role
            }</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${
              userProfile.status
            }</p>
            <p style="margin: 5px 0;"><strong>Member Since:</strong> ${new Date(
              userProfile.createdAt
            ).toLocaleDateString()}</p>
          </div>
        `
            : ""
        }
      </div>
    </div>
  `;

  // Attach event listeners
  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn.addEventListener("click", handleLogout);
};
