import { renderHeader } from "../../components/header.js";
import { renderBottomNav } from "../../components/bottomNav.js";

export const renderMainLayout = async () => {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="app-shell">
      <header id="header"></header>
      <main id="content" class="app-content"></main>
      <nav id="bottom-nav"></nav>
    </div>
  `;

  renderHeader();
  renderBottomNav();
};
