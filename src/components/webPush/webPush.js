import { getMessaging, getToken } from "firebase/messaging";
import { firebaseApp } from "./firebase";
import { FIREBASE_WEB_VAPID_KEY } from "../../config";

export async function getWebFcmToken() {
  try {
    console.log("🔔 getWebFcmToken başladı");

    if (!("Notification" in window)) {
      console.log("❌ Notification yok");
      return null;
    }
    if (!("serviceWorker" in navigator)) {
      console.log("❌ serviceWorker yok");
      return null;
    }

    const perm = await Notification.requestPermission();
    console.log("✅ permission:", perm);
    if (perm !== "granted") return null;

    const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    await navigator.serviceWorker.ready; // ✅ kritik
    console.log("✅ sw scope:", swReg.scope);
    console.log("✅ sw active:", !!swReg.active);

    const messaging = getMessaging(firebaseApp);

    const token = await getToken(messaging, {
      vapidKey: FIREBASE_WEB_VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    console.log("✅ WEB FCM TOKEN:", token);
    return token || null;
  } catch (e) {
    console.error("❌ getWebFcmToken hata:", e);
    return null;
  }
}
