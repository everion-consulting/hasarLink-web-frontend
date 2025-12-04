import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import GoogleIcon from "../assets/icons/google.svg";
import AppleIcon from "../assets/icons/apple.svg";
import AuthAPI from "../services/authAPI";
import { maskPhone, validatePhone, validateEmail } from "../components/utils/formatter";
import { KVKK_TEXT } from "../constants/kvkk";

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
  const [errors, setErrors] = useState({});

  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyScrolledToEnd, setPolicyScrolledToEnd] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);

  const navigate = useNavigate();

  // 📌 KVKK AYDINLATMA METNİ - HasarLink


  useEffect(() => {
    if (type === "login") {
      const savedRememberMe = localStorage.getItem("rememberMe");
      const savedUsername = localStorage.getItem("savedUsername");

      if (savedRememberMe === "true" && savedUsername) {
        setRememberMe(true);
        setForm((prev) => ({ ...prev, username: savedUsername }));
      }
    }
  }, [type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let finalValue = value;

    if (name === "phone") {
      finalValue = maskPhone(value);
    }
    
    setForm({ ...form, [name]: finalValue });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = "";

    if (name === "phone" && value) {
      if (!validatePhone(value)) {
        error = "Telefon 0 (5xx) xxx xx xx formatında olmalı";
      }
    }

    if (name === "email" && value) {
      if (!validateEmail(value)) {
        error = "Geçerli bir e-mail adresi giriniz";
      }
    }


    if (name === "confirm" && value) {
      if (value !== form.password) {
        error = "Şifreler eşleşmiyor";
      }
    }

    if (error) {
      setErrors({ ...errors, [name]: error });
    }
  };

  // 📌 Gizlilik Politikası Scroll Sonu Kontrolü
  const handlePolicyScroll = (e) => {
    const target = e.target;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 20) { 
      setPolicyScrolledToEnd(true);
    }
  };

  const handlePolicyAccept = () => {
    setPolicyAccepted(true);
    setShowPolicyModal(false);
    setPolicyScrolledToEnd(false);
  };

  const handlePolicyCheckbox = () => {
    if (!policyAccepted) setShowPolicyModal(true);
    else setPolicyAccepted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (type === "register") {
        if (!policyAccepted) {
          setMessage("Lütfen Gizlilik Politikasını kabul edin.");
          setLoading(false);
          return;
        }

        if (form.email && !validateEmail(form.email)) {
          setMessage("Geçerli bir e-mail adresi giriniz.");
          setLoading(false);
          return;
        }

        if (form.phone && !validatePhone(form.phone)) {
          setMessage("Telefon 0 (5xx) xxx xx xx formatında olmalı.");
          setLoading(false);
          return;
        }

        if (form.password !== form.confirm) {
          setMessage("Şifreler eşleşmiyor.");
          setErrors({ 
            password: "Şifreler eşleşmiyor.",
            confirm: "Şifreler eşleşmiyor." 
          });
          setLoading(false);
          return;
        }

        const result = await AuthAPI.register({
          email: form.email,
          username: form.email,
          full_name: form.name,
          phone: form.phone.replace(/\D/g, ""), 
          password: form.password,
          password_confirm: form.confirm,
        });

        if (result.success) {
          setMessage("✅ Kayıt başarılı! Giriş yapılıyor...");
          
          const loginResult = await AuthAPI.login(form.email, form.password);
          
          if (loginResult.success && localStorage.getItem("authToken")) {
            if (typeof setIsAuth === "function") setIsAuth(true);
            setTimeout(() => navigate("/"), 500); // why artifical delay? 
          } else {
            setMessage("✅ Kayıt başarılı! Lütfen giriş yapın.");
          }
        } else {
          setMessage(result.message || "Kayıt başarısız.");
        }
      } else {
        const result = await AuthAPI.login(form.username, form.password);

        if (result.success && localStorage.getItem("authToken")) {
          setMessage("✅ Giriş başarılı!");

          if (rememberMe) {
            localStorage.setItem("rememberMe", "true");
            localStorage.setItem("savedUsername", form.username);
          } else {
            localStorage.removeItem("rememberMe");
            localStorage.removeItem("savedUsername");
          }

          if (typeof setIsAuth === "function") setIsAuth(true);

          navigate("/");
        } else {
          setMessage(result.message || "Giriş başarısız.");
        }
      }
      //parseAPIError instead
    } catch (err) {
      console.error("Form Submit Error:", err);
      console.log("Error keys:", Object.keys(err));
      console.log("Full error object:", JSON.stringify(err, null, 2));

      const newErrors = {};

      if (err.details && typeof err.details === 'object') {
        const details = err.details;
        
        if (details.email) {
          newErrors.email = Array.isArray(details.email) ? details.email[0] : details.email;
        }
        if (details.username) {
          newErrors.email = Array.isArray(details.username) ? details.username[0] : details.username;
        }
        if (details.phone) {
          newErrors.phone = Array.isArray(details.phone) ? details.phone[0] : details.phone;
        }
        if (details.password) {
          newErrors.password = Array.isArray(details.password) ? details.password[0] : details.password;
        }
      }
      else {
        if (err.email) {
          newErrors.email = Array.isArray(err.email) ? err.email[0] : err.email;
        }
        if (err.username) {
          newErrors.email = Array.isArray(err.username) ? err.username[0] : err.username;
        }
        if (err.phone) {
          newErrors.phone = Array.isArray(err.phone) ? err.phone[0] : err.phone;
        }
        if (err.password) {
          newErrors.password = Array.isArray(err.password) ? err.password[0] : err.password;
        }
      }
      

      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) {
        if (err.detail) {
          setMessage(err.detail);
        } else if (err.message) {
          setMessage(err.message);
        } else if (err.error) {
          setMessage(err.error);
        } else {
          setMessage("Bir hata oluştu.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setMessage("");

      try {
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        const userData = await userInfoResponse.json();

        const result = await AuthAPI.googleLogin({
          idToken: tokenResponse.access_token,
          email: userData.email,
          fullName: userData.name || userData.email.split("@")[0],
        });

        if (result.success && result.token) {
          setMessage(result.created ? "Hesap oluşturuldu!" : "Giriş başarılı!");

          if (typeof setIsAuth === "function") setIsAuth(true);
          setTimeout(() => navigate("/"), 1000);
        } else {
          setMessage("Google ile giriş başarısız.");
        }
      } catch (err) {
        setMessage("Google ile giriş sırasında hata oluştu.");
      } finally {
        setGoogleLoading(false);
      }
    },
  });

  return (
    <>
      {/* ————————————————  
           🔶 GİZLİLİK POLİTİKASI MODALİ
      ———————————————— */}
      {showPolicyModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Gizlilik Politikası</h3>
              <button className="close-btn" onClick={() => setShowPolicyModal(false)}>×</button>
            </div>

            <div className="modal-content" onScroll={handlePolicyScroll}
              dangerouslySetInnerHTML={{ __html: KVKK_TEXT }} /> 

            <button
              className={`modal-accept-btn ${policyScrolledToEnd ? "active" : ""}`}
              disabled={!policyScrolledToEnd}
              onClick={handlePolicyAccept}
            >
              Onaylıyorum
            </button>
          </div>
        </div>
      )}

      {/* ————————————————  
           🧩 ANA FORM
      ———————————————— */}
      <form className="auth-form" onSubmit={handleSubmit}>
        {type === "register" && (
          <>
            <input type="text" name="name" placeholder="Ad Soyad" onChange={handleChange} required />
            <div className="input-wrapper">
              <input 
                type="email" 
                name="email" 
                placeholder="E-Mail" 
                value={form.email}
                onChange={handleChange} 
                onBlur={handleBlur}
                className={errors.email ? "error" : ""}
                required 
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            <div className="input-wrapper">
              <input 
                type="tel" 
                name="phone" 
                placeholder="Telefon No" 
                value={form.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.phone ? "error" : ""}
                maxLength={19}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>
            <div className="input-wrapper">
              <input 
                type="password" 
                name="password" 
                placeholder="Şifre"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                required 
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            
            <div className="input-wrapper">
              <input 
                type="password" 
                name="confirm" 
                placeholder="Şifre Tekrar"
                value={form.confirm}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.confirm ? "error" : ""}
                required 
              />
              {errors.confirm && <span className="error-text">{errors.confirm}</span>}
            </div>

            {/* KVKK Checkbox */}
            <label className="checkbox">
              <input
                type="checkbox"
                checked={policyAccepted}
                onChange={handlePolicyCheckbox}
              />
              Şartlar ve Gizlilik Politikasını kabul ediyorum.
            </label>
          </>
        )}

        {type === "login" && (
          <>
            <input 
              type="text" 
              name="username" 
              placeholder="Kullanıcı Adı veya E-Mail" 
              value={form.username} 
              onChange={handleChange} 
              required 
            />
            
            <input 
              type="password" 
              name="password" 
              placeholder="Şifre" 
              value={form.password} 
              onChange={handleChange} 
              required 
            />
            
            {/* Remember Me + Forgot Password (Horizontal) */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginTop: "5px", 
              marginBottom: "15px" 
            }}>
              <label className="checkbox" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Beni Hatırla
              </label>

              <a 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  navigate("/forgot-password"); 
                }}
                style={{ 
                  fontSize: "14px", 
                  color: "#133E87", 
                  textDecoration: "none",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                onMouseLeave={(e) => e.target.style.textDecoration = "none"}
              >
                Şifremi Unuttum?
              </a>
            </div>
          </>  
        )}

        <div className="divider"><span>veya şununla devam et</span></div>

        <div className="social-login">
          <button type="button" className="google" onClick={() => googleLogin()} disabled={googleLoading}>
            <img src={GoogleIcon} alt="Google" />
          </button>
          <button type="button" className="apple" onClick={() => alert("Apple yakında")}>
            <img src={AppleIcon} alt="Apple" />
          </button>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Lütfen bekleyin..." : type === "login" ? "GİRİŞ YAP" : "KAYIT OL"}
        </button>

        {message && (
          <p className="auth-message" style={{ color: message.includes("✅") ? "green" : "red" }}>
            {message}
          </p>
        )}

        <p className="switch-text">
          {type === "login" ? "Hesabın yok mu? " : "Zaten hesabın var mı? "}
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab(type === "login" ? "register" : "login"); }}>
            {type === "login" ? "Kayıt Ol" : "Giriş Yap"}
          </a>
        </p>
      </form>
    </>
  );
}
