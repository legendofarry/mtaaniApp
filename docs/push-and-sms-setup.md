# Push & SMS (Share) Setup — Quick Guide

This note explains how to enable Web Push (Push API / FCM) and how to use the "Paste/Share SMS" flow for token purchases.

## Web Push (Push API)

1. Generate a VAPID key pair (use `web-push` CLI):

   ```bash
   npx web-push generate-vapid-keys --json
   ```

   Copy the `publicKey` into `src/config/pushConfig.js` as `VAPID_PUBLIC_KEY`.

2. Provide a push server (your backend or a simple service using `web-push`) that sends push messages to subscriptions stored in `push_subscriptions/{uid}`.

3. Optionally use Firebase Cloud Messaging (FCM):

   - Add FCM config into `firebase-messaging-sw.js` and call `getToken()` on the client.
   - FCM can be easier to manage if you don't want to build a push server.

4. Ensure `sw.js` is served from your app root (this repo places it at `/sw.js`).

5. When users grant notifications in onboarding, the app registers the service worker and attempts to subscribe and save the subscription for the user.

## SMS / Token Capture (Web)

- Background SMS reading on the web is **not possible**. Instead this app supports:

  - Manual paste of the SMS into `/share-target` (paste box).
  - Web Share Target (PWA install required) — if installed, users can share an SMS to the app to open `/share-target`.

- The app contains `src/services/sms.service.js` with a basic `parseSMS(text)` and `saveTokenPurchase(uid, parsed)` helper. The parser is intentionally simple — tailor it to the exact SMS format used by your provider.

- The parsed purchase is saved to `token_purchases` collection in Firestore using `saveTokenPurchase()`.

## Firestore rules (recommended)

The app will write to `token_purchases` and `push_subscriptions`. Add rules like the following to permit authenticated users to create their own documents:

```js
match /token_purchases/{docId} {
  allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
  allow read: if request.auth != null && (request.auth.token.admin == true || request.auth.uid == resource.data.uid);
  allow update, delete: if false;
}

match /push_subscriptions/{userId} {
  allow create, update: if request.auth != null && request.auth.uid == userId;
  allow read: if request.auth != null && (request.auth.token.admin == true || request.auth.uid == userId);
}
```

Make sure to adapt and tighten rules as needed.

## Android / Native

- If you plan a native Android app and want automated SMS capture, prefer SMS Retriever API (for OTP) or implement READ_SMS only if you will follow Play Store policy and declare usage.
- Consider server-side integration with provider (KPLC) or ask vendors for webhooks — this is the most robust approach.

## Next steps I can help with

- Add FCM `getToken()` integration (client) and store tokens.
- Add example server push script using `web-push` to send a test notification.
- Improve the SMS parser to match KPLC exact SMS formats (share sample SMS text if you have one).

---

If you want, I can add the FCM client wiring next and an example `web-push` notifier script. Which would you prefer?
