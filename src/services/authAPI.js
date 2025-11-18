// src/services/authAPI.js
import { API_ROOT, ACCOUNTS_BASE, API_BASE } from "../config";

// 🔹 Token kaydetme helper
function storeTokenFromResponse(data) {
  let raw = "";

  // Login cevabında token direkt geliyor
  if (typeof data.token === "string") {
    raw = data.token.trim();
  }
  // Bazı endpointler data.data.token dönebilir – şimdilik yedek dursun
  else if (typeof data?.data?.token === "string") {
    raw = data.data.token.trim();
  }
  // Bazı paketler key kullanıyor olabilir
  else if (typeof data.key === "string") {
    raw = data.key.trim();
  }

  if (!raw) {
    console.warn("❌ TOKEN BULUNAMADI, backend cevabı:", data);
    return null;
  }

  localStorage.setItem("authToken", raw);
  localStorage.setItem("authToken_type", "Token");

  console.log("✅ Token kaydedildi:", {
    tokenType: "Token",
    token: raw,
  });

  return raw;
}

const AuthAPI = {
  baseURL: ACCOUNTS_BASE,

  // -----------------------------------------
  // HEADERS
  // -----------------------------------------
  getHeaders: (explicitToken = null, explicitType = null) => {
    const t = (explicitToken || localStorage.getItem("authToken") || "").trim();
    const type =
      (explicitType || localStorage.getItem("authToken_type") || "Token").trim();

    console.log("🟩 getHeaders token:", t);
    console.log("🟩 getHeaders type:", type);

    return {
      "Content-Type": "application/json",
      ...(t && type && { Authorization: `${type} ${t}` }),
    };
  },

  // -----------------------------------------
  // REGISTER
  // -----------------------------------------
  register: async (userData) => {
    try {
      const response = await fetch(`${ACCOUNTS_BASE}/auth/register/`, {
        method: "POST",
        headers: AuthAPI.getHeaders(),
        body: JSON.stringify({
          email: userData.email,
          username: userData.username,
          full_name: userData.full_name,
          phone: userData.phone || "",
          password: userData.password,
          password_confirm: userData.password_confirm,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw data;

      // İstersen burada da login olsun diye token kaydedebilirsin
      storeTokenFromResponse(data);

      return {
        success: data.success,
        message: data.message,
        user: data.data?.user || null,
        token: data.token || null,
      };
    } catch (error) {
      console.error("Register API Error:", error);
      throw error;
    }
  },

  // -----------------------------------------
  // LOGIN
  // -----------------------------------------
  login: async (username, password) => {
    try {
      const response = await fetch(`${ACCOUNTS_BASE}/auth/login/`, {
        method: "POST",
        headers: AuthAPI.getHeaders(),
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log("📥 Login backend response:", data);

      if (!response.ok) throw data;

      const token = storeTokenFromResponse(data); // 🔥 Burada kesin kaydediyoruz

      return {
        success: data.success,
        message: data.message,
        user: data.data?.user || data.user || null,
        token,
      };
    } catch (error) {
      console.error("Login API Error:", error);
      throw error;
    }
  },

  // -----------------------------------------
  // LOGOUT
  // -----------------------------------------
  logout: async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${ACCOUNTS_BASE}/auth/logout/`, {
        method: "POST",
        headers: AuthAPI.getHeaders(token),
      });
      const data = await response.json();

      localStorage.removeItem("authToken");
      localStorage.removeItem("authToken_type");

      return data;
    } catch (error) {
      console.error("Logout API Error:", error);
      throw error;
    }
  },

  // -----------------------------------------
  // PROFILE → mobildeki gibi /api/profile/
  // -----------------------------------------
  getProfile: async (tokenParam) => {
    const token = (tokenParam || localStorage.getItem("authToken") || "").trim();

    const url = `${API_BASE}/profile/`; // 🔥 → https://.../api/profile/

    const response = await fetch(url, {
      method: "GET",
      headers: AuthAPI.getHeaders(token),
    });

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  },
};

export default AuthAPI;
