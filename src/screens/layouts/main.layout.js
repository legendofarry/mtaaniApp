// src\screens\layouts\main.layout.js
import { getAuthUser } from "../../services/auth.store.js";
import { navigate } from "../../app/router.js";
import { renderHeader } from "../../components/header.js";
import { renderBottomNav } from "../../components/bottomNav.js";

export const renderMainLayout = async () => {
  const user = getAuthUser();

  if (!user) {
    navigate("/login");
    return;
  }

  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="min-h-screen flex flex-col bg-gray-50">
      <header id="header" class="fixed top-0 w-full z-50"></header>
      <main id="content" class="flex-1 pt-20 pb-16"></main>
      <nav id="bottom-nav" class="fixed bottom-0 w-full z-50"></nav>
    </div>
  `;

  renderHeader();
  renderBottomNav();
};
