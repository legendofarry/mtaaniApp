export const setActiveTab = () => {
  const path = window.location.pathname;

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.path === path);
  });
};
