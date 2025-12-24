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
  const d = event.notification?.data || {};
  const clickAction = (d.click_action || "").toLowerCase();
  const link = d.link || "";

  event.notification.close();

  // ✅ welcome: hiçbir şey yapma
  if (clickAction === "none" || !link) return;

  event.waitUntil(
    (async () => {
      const all = await clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of all) {
        if ("focus" in c) {
          c.focus();
          // aynı origin ise yönlendirme de yapılabilir ama basit bırakıyoruz
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(link);
    })()
  );
});
