/* public/firebase-messaging-sw.js */

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDeH9NKC12YL80PFeWDsGR5k0XsUTCLPRw",
  authDomain: "dbappnew-900b7.firebaseapp.com",
  projectId: "dbappnew-900b7",
  storageBucket: "dbappnew-900b7.firebasestorage.app",
  messagingSenderId: "131263545911",
  appId: "1:131263545911:web:47a1e75f9f6aae345bb5b2",
});

const messaging = firebase.messaging();

// ✅ Sayfa kapalıyken gelen mesajı yakala
messaging.onBackgroundMessage((payload) => {
  const data = payload?.data || {};
  const title = data.title || "HasarLink";
  const body = data.body || "";
  const link = data.link || "/notifications";

  const options = {
    body,
    icon: data.icon || "/logo192.png",
    badge: data.badge || "/badge-72.png",
    data: { link },
  };

  self.registration.showNotification(title, options);
});

// ✅ Bildirime tıklanınca ilgili sayfayı aç
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = event.notification?.data?.link || "/notifications";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      return clients.openWindow(link);
    })
  );
});
