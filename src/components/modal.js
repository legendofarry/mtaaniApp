// src/components/modal.js
export const confirm = (message, title = "Confirm") => {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay show";

    const box = document.createElement("div");
    box.className = "modal-box";
    document.body.appendChild(overlay);

    document.getElementById("modal-no").onclick = () => {
      overlay.remove();
      resolve(false);
    };

    document.getElementById("modal-yes").onclick = () => {
      overlay.remove();
      resolve(true);
    };
  });
};

export default confirm;

export const prompt = (message, title = "Input", placeholder = "") => {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.4)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = 99999;

    const box = document.createElement("div");
    box.style.width = "92%";
    box.style.maxWidth = "420px";
    box.style.background = "white";
    box.style.borderRadius = "12px";
    box.style.padding = "18px";
    box.style.boxShadow = "0 10px 40px rgba(2,6,23,0.2)";

    box.innerHTML = `
      <div style="font-weight:700;margin-bottom:8px">${title}</div>
      <div style="color:#374151;margin-bottom:8px">${message}</div>
      <input id="modal-input" placeholder="${placeholder}" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:12px" />
      <div style="display:flex;justify-content:flex-end;gap:8px">
        <button id="modal-cancel" style="padding:8px 12px;border-radius:8px;border:1px solid #e5e7eb;background:#fff">Cancel</button>
        <button id="modal-ok" style="padding:8px 12px;border-radius:8px;background:var(--primary-color);color:#fff">OK</button>
      </div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    const input = document.getElementById("modal-input");
    input.focus();

    document.getElementById("modal-cancel").onclick = () => {
      overlay.remove();
      resolve(null);
    };

    document.getElementById("modal-ok").onclick = () => {
      const v = input.value.trim();
      overlay.remove();
      resolve(v || null);
    };
  });
};
