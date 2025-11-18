// src/config.jsx

const ROOT = "https://dosya-bildirim-vrosq.ondigitalocean.app";

export const API_ROOT = ROOT;

// Auth işlemleri → /accounts
export const ACCOUNTS_BASE = `${ROOT}/accounts`;

// Backend veri API’leri → /api
export const API_BASE = `${ROOT}/api`;

export const API_URL = API_ROOT; // fetchData için uyumluluk
