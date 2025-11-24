// src/components/AuthForm.jsx (veya neredeyse)

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import GoogleIcon from "../assets/icons/google.svg";
import AppleIcon from "../assets/icons/apple.svg";
import AuthAPI from "../services/authAPI";

export default function AuthForm({ type, setIsAuth, setActiveTab }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    username: "",
  });
  
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (type === "register") {
        const result = await AuthAPI.register({
          email: form.email,
          username: form.email,
          full_name: form.name,
          phone: form.phone,
          password: form.password,
          password_confirm: form.confirm,
        });

        if (result.success) {
          setMessage("✅ Kayıt başarılı! Giriş yapabilirsiniz.");
        } else {
          setMessage(result.message || "Kayıt başarısız.");
        }
      } else {
        // 🔹 Giriş isteği
        const result = await AuthAPI.login(form.username, form.password);

        console.log("🧪 Login result:", result);
        console.log("🧪 localStorage token after login:", localStorage.getItem("authToken"));

        if (result.success && localStorage.getItem("authToken")) {
          setMessage("✅ Giriş başarılı!");

          // Beni Hatırla seçeneği
          if (rememberMe) {
            localStorage.setItem("rememberMe", "true");
            localStorage.setItem("savedUsername", form.username);
          } else {
            localStorage.removeItem("rememberMe");
            localStorage.removeItem("savedUsername");
          }

          if (typeof setIsAuth === "function") {
            setIsAuth(true);
          }

          navigate("/");
        } else {
          setMessage(result.message || "Giriş başarısız.");
        }
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setMessage(err.detail || err.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setMessage("");

    try {
      console.log("🔵 Google Login başarılı:", credentialResponse);

      // JWT token'ı decode et
      const token = credentialResponse.credential;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const userData = JSON.parse(jsonPayload);
      console.log("👤 Kullanıcı bilgileri:", userData);

      // Backend'e gönder
      const result = await AuthAPI.googleLogin({
        idToken: token,
        email: userData.email,
        fullName: userData.name || userData.email.split('@')[0],
      });

      console.log("✅ Backend response:", result);

      if (result.success && result.token) {
        setMessage(result.created ? "✅ Hesap oluşturuldu! Hoş geldiniz." : "✅ Giriş başarılı!");

        if (typeof setIsAuth === "function") {
          setIsAuth(true);
        }

        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setMessage(result.message || "Google ile giriş başarısız.");
      }
    } catch (err) {
      console.error("Google Login Error:", err);
      setMessage(err.detail || err.message || "Google ile giriş sırasında bir hata oluştu.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Login başarısız");
    setMessage("Google ile giriş başarısız oldu.");
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {type === "register" && (
        <>
          <input type="text" name="name" placeholder="Ad Soyad" onChange={handleChange} required />
          <input type="email" name="email" placeholder="E-Mail" onChange={handleChange} required />
          <input type="tel" name="phone" placeholder="Telefon No" onChange={handleChange} />
          <input type="password" name="password" placeholder="Şifre" onChange={handleChange} required />
          <input type="password" name="confirm" placeholder="Şifre Tekrar" onChange={handleChange} required />
          <label className="checkbox">
            <input type="checkbox" required /> Şartlar ve Gizlilik Politikası’nı kabul ediyorum.
          </label>
        </>
      )}

      {type === "login" && (
        <>
          <input
            type="text"
            name="username"
            placeholder="Kullanıcı Adı veya E-Mail"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Şifre"
            onChange={handleChange}
            required
          />
          <div className="login-options">
            <label>
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              /> Beni Hatırla
            </label>
            <a 
              href="#" 
              className="forgot"
              onClick={(e) => {
                e.preventDefault();
                navigate("/forgot-password");
              }}
            >
              Şifremi unuttum
            </a>
          </div>
        </>
      )}

      <div className="divider">
        <span>veya şununla devam et</span>
      </div>

      <div className="social-login">
        {googleLoading ? (
          <div className="google-loading">
            <p>Google ile giriş yapılıyor...</p>
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            text={type === "login" ? "signin_with" : "signup_with"}
            shape="circle"
            size="large"
          />
        )}
        
        <button
          type="button"
          className="apple"
          onClick={() => alert("Apple ile giriş yakında eklenecek")}
        >
          <img src={AppleIcon} alt="Apple Icon" className="icon" />
        </button>
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Lütfen bekleyin..." : type === "login" ? "GİRİŞ YAP" : "KAYIT OL"}
      </button>

      {message && (
        <p
          style={{
            textAlign: "center",
            marginTop: "10px",
            color: message.includes("✅") ? "green" : "red",
          }}
        >
          {message}
        </p>
      )}

      <p className="switch-text">
        {type === "login" ? "Hesabın yok mu? " : "Zaten hesabın var mı? "}
        <a href="#" onClick={(e) => {
          e.preventDefault();
          if (setActiveTab) {
            setActiveTab(type === "login" ? "register" : "login");
          }
        }}>
          {type === "login" ? "Kayıt Ol" : "Giriş Yap"}
        </a>
      </p>
    </form>
  );
}
