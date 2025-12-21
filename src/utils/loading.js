// src/utils/loading.js

let loadingScreen = null;
let customLoadingText = null;

export const initLoadingScreen = () => {
  loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    customLoadingText = loadingScreen.querySelector("p");
  }
};

export const showLoading = (message = "Loading...") => {
  if (!loadingScreen) {
    initLoadingScreen();
  }

  if (loadingScreen) {
    if (customLoadingText) {
      customLoadingText.textContent = message;
    }
    loadingScreen.style.display = "flex";
    loadingScreen.classList.remove("fade-out");
  }
};

export const hideLoading = () => {
  if (!loadingScreen) {
    initLoadingScreen();
  }

  if (loadingScreen) {
    loadingScreen.classList.add("fade-out");
    setTimeout(() => {
      loadingScreen.style.display = "none";
    }, 500);
  }
};

export const showAppContent = () => {
  const app = document.getElementById("app");
  if (app) {
    app.style.display = "block";
  }
  hideLoading();
};
