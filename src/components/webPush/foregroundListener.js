import { getMessaging, onMessage } from "firebase/messaging";
import { firebaseApp } from "./firebase";

export function listenForegroundMessages() {
  const messaging = getMessaging(firebaseApp);

  onMessage(messaging, (payload) => {
    console.log("🔔 Foreground message:", payload);

    const title = payload?.notification?.title || "HasarLink";
    const body = payload?.notification?.body || "";
    const link = payload?.fcmOptions?.link || payload?.data?.link || "/notifications";

    // Sayfa açıkken de native bildirim göstermek istersen:
    if (Notification.permission === "granted") {
      const n = new Notification(title, {
        body,
        icon: "/icon.png",
      });

      n.onclick = () => {
        window.focus();
        window.location.href = link;
      };
    }
  });
}
