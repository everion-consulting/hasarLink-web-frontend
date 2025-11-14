// src/services/authAPI.js
const API_URL = "https://dosya-bildirim-vrosq.ondigitalocean.app";

const AuthAPI = {
    baseURL: API_URL,
    getHeaders: (token = null) => ({
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    }),


    // =========================
    // REGISTER (Email / Password)
    // =========================
    register: async (userData) => {
        try {
            const response = await fetch(`${AuthAPI.baseURL}/accounts/auth/register/`, {
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
            return data;
        } catch (error) {
            console.error("Register API Error:", error);
            throw error;
        }
    },

    // =========================
    // LOGIN (Email / Username)
    // =========================
    login: async (username, password) => {
        try {
            const response = await fetch(`${AuthAPI.baseURL}/accounts/auth/login/`, {
                method: "POST",
                headers: AuthAPI.getHeaders(),
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (!response.ok) throw data;

            // 🔹 Token alanını backend’e göre seç
            const token = data.token || data.access || data.access_token;

            if (token) {
                localStorage.setItem("auth_token", token);
            } else {
                console.warn("⚠️ Token bulunamadı, backend yanıtı:", data);
            }

            return data;
        } catch (error) {
            console.error("Login API Error:", error);
            throw error;
        }
    },


    // =========================
    // GOOGLE LOGIN (opsiyonel)
    // =========================
    googleLogin: async ({ email, full_name, firebase_token, firebase_uid }) => {
        try {
            const response = await fetch(`${AuthAPI.baseURL}/auth/google-login/`, {
                method: "POST",
                headers: AuthAPI.getHeaders(),
                body: JSON.stringify({
                    email,
                    full_name,
                    firebase_token,
                    firebase_uid,
                    auth_provider: "google",
                    email_verified: true,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw data;

            if (data.token) localStorage.setItem("auth_token", data.token);
            return data;
        } catch (error) {
            console.error("Google Login API Error:", error);
            throw error;
        }
    },

    // =========================
    // LOGOUT
    // =========================
    logout: async (token) => {
        try {
            const response = await fetch(`${AuthAPI.baseURL}/accounts/auth/logout/`, {
                method: "POST",
                headers: AuthAPI.getHeaders(token),
            });
            const data = await response.json();
            localStorage.removeItem("auth_token");
            return data;
        } catch (error) {
            console.error("Logout API Error:", error);
            throw error;
        }
    },

    // =========================
    // CHECK USERNAME / EMAIL
    // =========================
    checkUsername: async (username) => {
        try {
            const res = await fetch(
                `${AuthAPI.baseURL}/auth/check-username/?username=${encodeURIComponent(username)}`,
                { headers: AuthAPI.getHeaders() }
            );
            const data = await res.json();
            return data.available;
        } catch (err) {
            console.error("Check Username Error:", err);
            return false;
        }
    },

    checkEmail: async (email) => {
        try {
            const res = await fetch(
                `${AuthAPI.baseURL}/auth/check-email/?email=${encodeURIComponent(email)}`,
                { headers: AuthAPI.getHeaders() }
            );
            const data = await res.json();
            return data.available;
        } catch (err) {
            console.error("Check Email Error:", err);
            return false;
        }
    },

    // =========================
    // PROFILE
    // =========================
    getProfile: async (token) => {
        const response = await fetch(`${AuthAPI.baseURL}/api/profile/`, {
            headers: AuthAPI.getHeaders(token),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return response.json();
    },


};

export default AuthAPI;
