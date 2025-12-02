import { API_ROOT, ACCOUNTS_BASE, API_BASE } from "../config";

function handleUnauthorized() {
  const token = localStorage.getItem("authToken");
  if (token) {
    console.log("⚠️ Token geçersiz veya süresi dolmuş, oturum sonlandırılıyor");
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
    if (!window.location.pathname.includes('/auth')) {
      window.location.href = "/auth";
    }
  }
}

function storeTokenFromResponse(data) {
  let raw = "";

  if (typeof data.token === "string") {
    raw = data.token.trim();
  }
  else if (typeof data?.data?.token === "string") {
    raw = data.data.token.trim();
  }
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

      if (!response.ok) {
        if (response.status === 401) {
          throw { detail: "Kullanıcı adı veya şifre hatalı" };
        }
        throw data;
      }

      const token = storeTokenFromResponse(data);

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

      const rememberMe = localStorage.getItem("rememberMe");
      
      localStorage.removeItem("authToken");
      localStorage.removeItem("authToken_type");
      
      if (rememberMe !== "true") {
        localStorage.removeItem("savedUsername");
      }

      return data;
    } catch (error) {
      console.error("Logout API Error:", error);
      const rememberMe = localStorage.getItem("rememberMe");
      
      localStorage.removeItem("authToken");
      localStorage.removeItem("authToken_type");
      
      if (rememberMe !== "true") {
        localStorage.removeItem("savedUsername");
      }
      throw error;
    }
  },

  // -----------------------------------------
  // PROFILE → mobildeki gibi /api/profile/
  // -----------------------------------------
  getProfile: async (tokenParam) => {
    const token = (tokenParam || localStorage.getItem("authToken") || "").trim();

    const url = `${API_BASE}/profile/`;
    const response = await fetch(url, {
      method: "GET",
      headers: AuthAPI.getHeaders(token),
    });

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
    }

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  },

  // -----------------------------------------
  // GOOGLE LOGIN - Web version
  // -----------------------------------------
  googleLogin: async ({ idToken, email, fullName }) => {
    try {
      const response = await fetch(`${ACCOUNTS_BASE}/auth/google-login/`, {
        method: "POST",
        headers: AuthAPI.getHeaders(),
        body: JSON.stringify({
          firebase_token: idToken,
          firebase_uid: "", 
          email: email,
          full_name: fullName,
          device_token: "web_device",
          platform: "web",
        }),
      });

      const data = await response.json();
      console.log("📥 Google Login backend response:", data);

      if (!response.ok) throw data;

      const token = storeTokenFromResponse(data.data || data);

      return {
        success: data.success || true,
        message: data.message,
        user: data.data?.user || data.user || null,
        token: token || data.data?.token || data.token,
        created: data.data?.created || false,
      };
    } catch (error) {
      console.error("Google Login API Error:", error);
      throw error;
    }
  },

  // -----------------------------------------
  // PASSWORD RESET - EMAIL (3 Aşamalı)
  // -----------------------------------------

  requestPasswordResetEmail: async (email) => {
    try {
      const response = await fetch(`${ACCOUNTS_BASE}/password-reset-code/request/`, {
        method: "POST",
        headers: AuthAPI.getHeaders(),
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw data;

      return { success: true, message: data.message };
    } catch (error) {
      console.error("Password Reset Request Error:", error);
      throw error;
    }
  },

  verifyPasswordResetCode: async (email, code) => {
    try {
      const response = await fetch(`${ACCOUNTS_BASE}/password-reset-code/verify-code/`, {
        method: "POST",
        headers: AuthAPI.getHeaders(),
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      if (!response.ok) throw data;

      return { success: true, reset_token: data.reset_token };
    } catch (error) {
      console.error("Code Verify Error:", error);
      throw error;
    }
  },

  resetPasswordWithToken: async (reset_token, new_password, confirm_password) => {
    try {
      const response = await fetch(`${ACCOUNTS_BASE}/password-reset-code/reset-password/`, {
        method: "POST",
        headers: AuthAPI.getHeaders(),
        body: JSON.stringify({
          reset_token,
          new_password,
          confirm_password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw data;

      return { success: true, message: data.message };
    } catch (error) {
      console.error("Password Reset Error:", error);
      throw error;
    }
  },
};

export default AuthAPI;
