// src/services/biometric.service.js
// Lightweight WebAuthn helper for registering and authenticating passkeys on the client.
// NOTE: For production, WebAuthn registration/assertion challenges MUST come from and be
// verified by a server. This helper implements the client-side flow and stores
// a minimal record in Firestore (credential id, device label, createdAt). Use the
// attestation/assertion on the server for full verification.

import { showToast } from "../components/toast.js";
import { prompt as showPrompt } from "../components/modal.js";
import { savePasskey, getPasskeys } from "./user.service.js";

const encoder = (s) => new TextEncoder().encode(s);
const bufferToBase64Url = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const base64UrlToBuffer = (b64u) => {
  const b64 =
    b64u.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (b64u.length % 4)) % 4);
  const str = atob(b64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes.buffer;
};

export const isWebAuthnSupported = () => {
  return (
    typeof window !== "undefined" &&
    !!window.PublicKeyCredential &&
    !!navigator.credentials
  );
};

// Create / register a new passkey on this device for the authenticated user
export const registerPasskey = async ({ uid, email }) => {
  if (!isWebAuthnSupported()) {
    throw new Error("WebAuthn not supported in this browser");
  }

  // Ask the user for a friendly device name
  const deviceName =
    (await showPrompt(
      "Name this device so you can recognize it later",
      "Device name",
      "e.g. My phone"
    )) || "My device";

  // Build a registration request. In production, the challenge should come from the server.
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const publicKey = {
    challenge,
    rp: { name: "MtaaniFlow" },
    user: {
      id: encoder(String(uid)), // must be bytes
      name: email || String(uid),
      displayName: email || String(uid),
    },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }], // ES256
    timeout: 60000,
    attestation: "none",
    authenticatorSelection: {
      userVerification: "preferred",
      // prefer platform authenticators (biometrics) when available
      authenticatorAttachment: "platform",
    },
  };

  try {
    const cred = await navigator.credentials.create({ publicKey });

    if (!cred) throw new Error("No credential returned");

    const rawId = cred.rawId;
    const idB64 = bufferToBase64Url(rawId);

    const passkeyRecord = {
      id: idB64,
      createdAt: new Date().toISOString(),
      deviceName,
      // mark platform vs cross-platform heuristically
      isPlatform: cred.type === "public-key",
    };

    // Save to Firestore (user doc) and store a local reference for faster login UX
    await savePasskey(uid, passkeyRecord);
    localStorage.setItem(
      "webauthn_credential",
      JSON.stringify({ uid, id: idB64, email })
    );

    showToast("Biometric credential registered", "success");

    return { success: true, passkey: passkeyRecord };
  } catch (err) {
    console.warn("registerPasskey error:", err);
    showToast(err.message || "Failed to register passkey", "error");
    return { success: false, error: err.message || String(err) };
  }
};

// Attempt to authenticate using available credentials on this device
export const authenticateWithPasskey = async () => {
  if (!isWebAuthnSupported()) {
    showToast(
      "Biometric authentication not supported in this browser",
      "warning"
    );
    return { success: false, error: "not_supported" };
  }

  const local = localStorage.getItem("webauthn_credential");
  let allow = [];
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed.id) {
        allow.push({ id: base64UrlToBuffer(parsed.id), type: "public-key" });
      }
    } catch (e) {
      // ignore
    }
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const publicKey = {
    challenge,
    timeout: 60000,
    userVerification: "preferred",
  };

  if (allow.length) publicKey.allowCredentials = allow;

  try {
    const assertion = await navigator.credentials.get({ publicKey });
    if (!assertion) throw new Error("No assertion received");

    // In production the assertion should be sent to the server to verify signature and challenge
    showToast("Biometric check successful", "success");
    return { success: true, assertion };
  } catch (err) {
    console.warn("authenticateWithPasskey error:", err);
    showToast(
      "No saved biometric credentials found or authentication cancelled",
      "warning"
    );
    return { success: false, error: err.message || String(err) };
  }
};

export default {
  isWebAuthnSupported,
  registerPasskey,
  authenticateWithPasskey,
};
