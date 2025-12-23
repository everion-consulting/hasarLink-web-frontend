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
  const body  = data.body  || "";

  // ✅ boş payload / test push / gereksiz mesajlar = hiç gösterme
  if (!title && !body) return;

  const link = data.link || "";
  const clickAction = data.click_action || (link ? "open_link" : "focus_only");

  self.registration.showNotification(title, {
    body,
    icon: data.icon || "/logo192.png",
    badge: data.badge || "/badge-72.png",
    // ✅ aynı bildirimi tekilleştirmek için
    tag: data.notification_id || data.submission_id || undefined,
    renotify: false,
    data: { link, click_action: clickAction },
  });
});


