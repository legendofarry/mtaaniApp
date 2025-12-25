import { showToast } from "./toast.js";
import { confirm } from "./modal.js";

const STORAGE_KEY = "pwa_install_dismissed";
let deferredPrompt = null;
let shown = false;

const isIOS = () => {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
};

const createCTA = () => {
  const c = document.createElement("div");
  c.id = "install-cta";
  c.className = "install-cta fixed bottom-28 right-6 z-50";
  c.innerHTML = `
    <button id="install-btn" class="px-4 py-3 rounded-full bg-indigo-600 text-white flex items-center gap-2 shadow-lg animate-bounce">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5"><path fill="currentColor" d="M5 20h14v-2H5v2zm7-18L7 9h3v6h4V9h3l-5-7z"/></svg>
      <span class="font-semibold">Install App</span>
    </button>
    <button id="dismiss-install" class="ml-2 text-xs text-gray-600">Dismiss</button>
  `;
  return c;
};

const showCTA = () => {
  if (shown) return;
  if (localStorage.getItem(STORAGE_KEY) === "1") return;
  const container = document.getElementById("install-cta-container");
  const c = createCTA();

  const onInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        showToast("App installation accepted", "success");
      } else {
        showToast("Installation dismissed", "info");
      }
      hideCTA();
      deferredPrompt = null;
    } else if (isIOS()) {
      // show instructions on iOS Safari
      await confirm("To install, tap Share → Add to Home Screen in Safari.\n\nOpen the share menu and choose 'Add to Home Screen'.");
      hideCTA();
    } else {
      showToast("Installation not available in this browser", "warning");
    }
  };

  c.querySelector("#install-btn").onclick = onInstall;
  c.querySelector("#dismiss-install").onclick = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    hideCTA();
  };

  if (container) container.appendChild(c);
  else document.body.appendChild(c);
  shown = true;
};

const hideCTA = () => {
  const el = document.getElementById("install-cta");
  if (el) el.remove();
  shown = false;
};

export const startInstallPrompt = () => {
  // handle beforeinstallprompt for Android/Chrome
  window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    deferredPrompt = e;
    // show CTA after a short delay to avoid immediate pop
    setTimeout(showCTA, 800);
  });

  // hide on install
  window.addEventListener("appinstalled", () => {
    showToast("App installed", "success");
    hideCTA();
    localStorage.setItem(STORAGE_KEY, "1");
  });

  // if iOS (no beforeinstallprompt), offer manual instructions
  if (isIOS()) {
    // delay a bit to let UI render
    setTimeout(showCTA, 1000);
  }
};

export default { startInstallPrompt };