Biometrics / Passkeys (WebAuthn) — Implementation notes

What we implemented (client-side):

- Client helpers: `src/services/biometric.service.js`

  - `registerPasskey({ uid, email })`: prompts for device name, runs `navigator.credentials.create`, stores a minimal passkey record in the user's Firestore profile (field `passkeys`) and keeps a small local reference in `localStorage`.
  - `authenticateWithPasskey()`: attempts `navigator.credentials.get` against the locally-known credential and returns an assertion (client-side success only).

- Profile helpers: `src/services/user.service.js` now includes `savePasskey`, `getPasskeys`, and `removePasskey`.
- UI hooks:
  - Added a fingerprint button to the login screen (`src/auth/login.ui.js`) — clicking it attempts local biometric auth and autofills the email if a local credential exists.
  - After a successful sign-in, the app checks if the user has any saved passkeys; if none, it prompts the user to enable biometrics on the current device (via `loginController`).

Important Security Notes (do NOT skip):

- **Server-side verification is mandatory for real security.**
  - WebAuthn registration must use a server-provided challenge and the attestation object must be verified by the server (valid attestation, correct challenge, correct origin, etc.).
  - Similarly, assertion responses (navigator.credentials.get) must be verified on the server to ensure the signature is valid and the challenge is fresh.
- This implementation stores only minimal passkey metadata in Firestore for convenience (credential id, device name, createdAt). Do **not** rely on client-side-only checks for authentication in production.
- For production integration:
  1. Implement endpoints to generate registration and authentication challenges tied to the user session.
  2. On register: server verifies the attestation, stores public key and credential ID securely.
  3. On auth: client sends assertion to server, server verifies signature, counter, and that the assertion matches a registered credential for the user.

Next recommended steps:

- Add server endpoints for challenge generation and assertion verification.
- Store credential public keys on the server (or in Firestore via Cloud Functions after verification) instead of relying solely on client-saved entries.
- Provide UI to manage (list/remove) devices with passkeys (i.e., remove lost device credentials).

If you'd like, I can:

- Add a small server endpoint stub (Node/Express) to produce/verify challenges and wire the client to use it.
- Add a UI screen where users can view and revoke saved devices.
