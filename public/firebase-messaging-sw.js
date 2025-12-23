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

  const title = data.title || "";
  const body = data.body || "";

  // ✅ boş payload = hiç gösterme
  if (!title && !body) return;

  const link = data.link || "";
  const clickAction = data.click_action || (link ? "open_link" : "focus_only");

  self.registration.showNotification(title, {
    body,
    icon: data.icon || "/logo192.png",
    badge: data.badge || "/badge-72.png",
    tag: data.notification_id || data.submission_id || undefined,
    renotify: false,
    data: { link, click_action: clickAction },
  });
});

// ✅ Tıklanınca ne olacak?
self.addEventListener("notificationclick", (event) => {
  const n = event.notification;
  const payload = n.data || {};
  const link = payload.link || "";
  const action = payload.click_action || "focus_only";

  n.close();

  // ✅ sadece hoşgeldin gibi bildirimlerde gitmesin
  if (action === "none") return;

  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // sekme varsa odakla
      if (action === "focus_only") {
        if (allClients.length) return allClients[0].focus();
        return clients.openWindow(self.location.origin + "/");
      }

      // linke git
      if (action === "open_link" && link) {
        const url = link.startsWith("http")
          ? link
          : new URL(link, self.location.origin).toString();

        // aynı url açık mı?
        for (const c of allClients) {
          if (c.url === url) return c.focus();
        }
        return clients.openWindow(url);
      }

      // fallback
      if (allClients.length) return allClients[0].focus();
      return clients.openWindow(self.location.origin + "/");
    })()
  );
});
