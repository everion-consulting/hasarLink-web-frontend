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

  // link ve click_action data'dan gelsin
  const link = data.link || ""; // boş olabilir
  const clickAction = data.click_action || (link ? "open_link" : "focus_only");
  // click_action örnekleri:
  // - "none"       -> tıkla, sadece kapat
  // - "focus_only" -> sadece mevcut sekmeyi odakla
  // - "open_link"  -> link'e yönlendir

  const options = {
    body,
    icon: data.icon || "/logo192.png",
    badge: data.badge || "/badge-72.png",
    data: {
      link,
      click_action: clickAction,
    },
  };

  self.registration.showNotification(title, options);
});

// ✅ Bildirime tıklanınca davranış seç
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const { link = "", click_action = "focus_only" } = event.notification?.data || {};

  // 1) Hiçbir şey yapma (welcome gibi)
  if (click_action === "none") {
    return;
  }

  // link'i absolute yap (client.navigate/openWindow daha sağlıklı)
  const absUrl = link ? new URL(link, self.location.origin).href : "";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clientList) => {
      // 2) Sadece focus (yönlendirme yok)
      if (click_action === "focus_only" || !absUrl) {
        if (clientList.length > 0) {
          await clientList[0].focus();
        }
        return;
      }

      // 3) Link'e yönlendir
      // - varsa açık sekmede navigate + focus
      for (const client of clientList) {
        if ("navigate" in client) {
          await client.navigate(absUrl);
          await client.focus();
          return;
        }
      }

      // - açık sekme yoksa yeni sekme aç
      return clients.openWindow(absUrl);
    })
  );
});
