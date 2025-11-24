// src/config.jsx

const ROOT = "https://dosya-bildirim-vrosq.ondigitalocean.app";

export const API_ROOT = ROOT;

// Auth işlemleri → /accounts
export const ACCOUNTS_BASE = `${ROOT}/accounts`;

// Backend veri API'leri → /api
export const API_BASE = `${ROOT}/api`;

export const API_URL = API_ROOT; // fetchData için uyumluluk

// Google OAuth - Web Client ID
// ⚠️ Bu ID'yi Firebase Console > Authentication > Sign-in method > Google > Web SDK configuration kısmından alın
export const GOOGLE_CLIENT_ID = "131263545911-3m8h2edlm0g1qte8qr4b49j55e2hkp46.apps.googleusercontent.com";
