import { Platform } from "react-native";

// Lokal geliştirme için bilgisayarının IP adresi (sadece fiziksel cihaz testlerinde lazım olacak)
// Windows: ipconfig  → IPv4
// Mac/Linux: ifconfig  → en0 inet
const LOCAL_IP = "192.168.1.35";

// Development için base url (emülatör/simülatör)
const DEV_BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:8000/api"   // Android Emulator
    : "http://127.0.0.1:8000/api";

// Production için base url
const PROD_BASE_URL = "https://dosya-bildirim-vrosq.ondigitalocean.app/api";

// export const apiBaseUrl = "http://192.168.3.65:8000/api";

// Ortam seçimi (__DEV__ = true → debug mode)
export const apiBaseUrl = PROD_BASE_URL;

// Fiziksel cihazda backend'e bağlanmak istersen (WiFi ile aynı ağda olmalı)
// export const apiBaseUrl = `http://${LOCAL_IP}:8000`;
