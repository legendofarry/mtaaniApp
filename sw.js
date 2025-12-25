// sw.js - minimal service worker to handle Push API notifications
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = {
      title: "Notification",
      body: event.data ? event.data.text() : "You have a notification",
    };
  }

  const title = payload.title || "MtaaniFlow";
  const options = {
    body: payload.body || "",
    icon: "/icons/icon-192.png",
    data: payload.data || {},
    badge: "/icons/icon-192.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(clients.openWindow(url));
});
