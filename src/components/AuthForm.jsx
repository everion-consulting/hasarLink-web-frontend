// src/components/AuthForm.jsx (veya neredeyse)

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "../assets/icons/google.svg";
import AppleIcon from "../assets/icons/apple.svg";
import AuthAPI from "../services/authAPI";

export default function AuthForm({ type, setIsAuth }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    username: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
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
              <input type="checkbox" /> Beni Hatırla
            </label>
            <a href="#" className="forgot">
              Şifremi unuttum
            </a>
          </div>
        </>
      )}

      <div className="divider">
        <span>veya şununla devam et</span>
      </div>

      <div className="social-login">
        <button
          type="button"
          className="google"
          onClick={() => alert("Google ile giriş yakında eklenecek")}
        >
          <img src={GoogleIcon} alt="Google Icon" className="icon" />
        </button>
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
        <a href="#" onClick={(e) => e.preventDefault()}>
          {type === "login" ? "Kayıt Ol" : "Giriş Yap"}
        </a>
      </p>
    </form>
  );
}
