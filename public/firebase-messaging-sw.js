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

messaging.onBackgroundMessage((payload) => {
  // ✅ Backend WebpushNotification gönderiyorsa tarayıcı zaten gösterecek.
  // Çift bildirim olmasın.
  if (payload?.notification?.title || payload?.notification?.body) return;

  const data = payload?.data || {};
  const title = data.title || "";
  const body = data.body || "";

  // ✅ boş payload = hiç gösterme
  if (!title && !body) return;

  self.registration.showNotification(title, {
    body,
    icon: data.icon || "/logo192.png",
    badge: data.badge || "/badge-72.png",
    tag: data.notification_id || data.submission_id || undefined,
    renotify: false,
    data: {
      link: data.link || "",
      click_action: (data.click_action || "").toLowerCase(),
      type: (data.type || "").toLowerCase(),
    },
  });
});

self.addEventListener("notificationclick", (event) => {
  const raw = event.notification?.data || {};

  // Firebase bazen içe gömer:
  const fcm = raw.FCM_MSG || {};
  const nestedData = fcm.data || {};

  const type = (raw.type || nestedData.type || "").toLowerCase();
  const clickAction = (raw.click_action || nestedData.click_action || "").toLowerCase();
  const link = raw.link || nestedData.link || "";

  // bildirimi kapat
  event.notification.close();

  // ✅ Welcome / none: hiçbir şey yapma + başka handler varsa engelle
  if (type === "welcome" || clickAction === "none") {
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    return;
  }

  // link yoksa açma
  if (!link) return;

  event.waitUntil(
    (async () => {
      const all = await clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of all) {
        if ("focus" in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(link);
    })()
  );
});

