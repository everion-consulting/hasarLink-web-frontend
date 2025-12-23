export async function ensureWebPushReady() {
  if (!("serviceWorker" in navigator)) return null;

  // zaten kayıtlıysa tekrar kayıt etmez (browser cache’ler)
  const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  return reg;
}
