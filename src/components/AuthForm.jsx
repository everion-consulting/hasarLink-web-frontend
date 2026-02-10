import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import GoogleIcon from "../assets/icons/google.svg";
import AppleIcon from "../assets/icons/apple.svg";
import AuthAPI from "../services/authAPI";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { maskPhone, validatePhone, validateEmail } from "../components/utils/formatter";
import apiService from "../services/apiServices";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyScrolledToEnd, setPolicyScrolledToEnd] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);

  // Sahacı başvuru
  const [showSahaciPassword, setShowSahaciPassword] = useState(false);
  const [sahaciPassword, setSahaciPassword] = useState("");
  const [sahaciError, setSahaciError] = useState("");
  const [sahaciAuthorized, setSahaciAuthorized] = useState(false);

  // Sahacı form
  const [sahaciForm, setSahaciForm] = useState({
    sahaci_tc: "",
    sahaci_adi: "",
    sahaci_soyadi: "",
    sahaci_phone: "",
    sahaci_mail: "",
    username: ""
  });

  const SAHACI_PASSWORD = "123456";

  const handleSahaciPasswordSubmit = () => {
    if (sahaciPassword === SAHACI_PASSWORD) {
      setSahaciAuthorized(true);
      setShowSahaciPassword(false);
      setSahaciError("");
      setSahaciPassword("");
    } else {
      setSahaciError("Şifre hatalı");
    }
  };

  const handleSahaciSubmit = async (e) => {
    console.log("SAHACI SUBMIT ÇALIŞTI");

    e.preventDefault();

    if (!validateEmail(sahaciForm.sahaci_mail)) {
      alert("Geçerli bir e-posta adresi giriniz");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        sahaci_tc: sahaciForm.sahaci_tc,
        sahaci_adi: sahaciForm.sahaci_adi,
        sahaci_soyadi: sahaciForm.sahaci_soyadi,
        sahaci_phone: sahaciForm.sahaci_phone.replace(/\D/g, ""),
        sahaci_mail: sahaciForm.sahaci_mail,
        username: sahaciForm.sahaci_mail,
      };

      const res = await apiService.fieldUserAPI(payload);
      console.log("API RESPONSE:", res);



      alert("Başvurunuz başarıyla alındı ✅");
      setSahaciAuthorized(false);
      setSahaciForm({
        sahaci_tc: "",
        sahaci_adi: "",
        sahaci_soyadi: "",
        sahaci_phone: "",
        sahaci_mail: "",
        username: ""
      });

    } catch (err) {
      console.error("Field User Error:", err);

      if (err.response?.data?.detail) {
        alert(err.response.data.detail);
      } else {
        alert("Başvuru sırasında bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };



  const navigate = useNavigate();

  // 📌 KVKK AYDINLATMA METNİ - HasarLink
  const policyText = `
<b>KVKK AYDINLATMA METNİ</b><br>
<b>HasarLink – Araç Kaza Dosya Takip Uygulaması</b><br><br>

<b>Veri Sorumlusu:</b> Everion Consulting<br>
<b>Uygulama:</b> HasarLink – Araç Kaza Dosya Takip Uygulaması<br>
<b>E-posta:</b> kvkk@everionconsulting.com<br>
<b>Telefon:</b> [Telefon numaranız]<br>
<b>Adres:</b> [Şirket adresiniz]<br>
<b>KEP Adresi:</b> [KEP adresiniz - varsa]<br><br>

Everion Consulting ("Şirket") olarak, HasarLink uygulaması aracılığıyla işlediğimiz kişisel verilerinizi 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında korumakta ve aşağıda açıklanan şartlarda işlemekteyiz.<br><br>

<b>1. Kişisel Verilerin İşlenme Amaçları</b><br>
• Araç kaza dosya bildiriminin oluşturulması ve yönetilmesi<br>
• Sigorta şirketlerine iletilecek bilgilerin ve belgelerin toplanması<br>
• Kullanıcı bilgilendirme ve dosya durumu süreçlerinin yürütülmesi<br>
• Eksik evrak süreçlerinin yönetilmesi<br>
• Uygulama güvenliği, erişim doğrulama, log kayıtları<br>
• Müşteri destek hizmetleri<br>
• Yasal yükümlülüklerin yerine getirilmesi<br>
• Hizmet kalitesinin artırılması ve istatistiksel analizler<br><br>

<b>2. İşlenen Kişisel Veri Kategorileri</b><br><br>

<b>2.1 Standart Kişisel Veriler</b><br>
• Ad, soyad, T.C. kimlik numarası<br>
• Telefon numarası, e-posta, adres<br>
• Araç plaka, marka, model, yıl, ruhsat bilgileri<br>
• Kaza tarihi, konumu, taraf bilgileri<br>
• Fotoğraflar, tutanaklar, belgeler<br>
• IP adresi, cihaz bilgisi, log kayıtları<br>
• Banka bilgileri (ödeme yapılması durumunda)<br><br>

<b>2.2 Özel Nitelikli Veriler</b><br>
• Yaralanmalı kazalarda sağlık verileri (yalnızca açık rıza ile)<br><br>

<b>3. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebep</b><br>
<b>3.1 Toplama Yöntemi:</b><br>
• Uygulama formları<br>
• Kullanıcı tarafından yüklenen fotoğraf ve belgeler<br>
• Çağrı merkezi ve destek kayıtları<br>
• Sistem logları ve teknik veri kayıtları<br><br>

<b>3.2 Hukuki Sebepler:</b><br>
• Sözleşmenin kurulması ve ifası<br>
• Kanuni yükümlülüklerin yerine getirilmesi<br>
• Meşru menfaat<br>
• Açık rıza (özel nitelikli veriler için)<br><br>

<b>4. Kişisel Verilerin Aktarılması</b><br>

<b>4.1 Yurt İçi Aktarımlar</b><br>
• Sigorta şirketleri<br>
• Eksperler<br>
• Yetkili kamu kurumları<br>
• Hukuk danışmanları<br>
• Bankalar<br><br>

<b>4.2 Yurt Dışı Aktarımlar</b><br>
• Bulut hizmet sağlayıcıları (AWS/Azure/Google Cloud vb.)<br>
• Aktarımlar şifreleme ve sözleşmeler ile korunmaktadır<br><br>

<b>5. Kişisel Verilerin Saklama Süresi</b><br>
• Kaza dosya bilgileri: 10 yıl<br>
• Kimlik ve iletişim verileri: 10 yıl<br>
• Finansal kayıtlar: 10 yıl<br>
• Log kayıtları: 2 yıl<br>
• Pazarlama izinleri: Geri çekilene kadar<br><br>

<b>6. Otomatik Karar Verme</b><br>
Uygulamada otomatik karar verme yapılmamaktadır.<br><br>

<b>7. Çocukların Verileri</b><br>
Uygulama 18 yaş altına yönelik değildir.<br><br>

<b>8. Uygulama İçi Analitik</b><br>
Sadece anonim kullanım verileri toplanır.<br><br>

<b>9. KVKK Kapsamındaki Haklarınız</b><br>
• Bilgi talep etme<br>
• Düzeltme<br>
• Silme / yok etme<br>
• İtiraz etme<br>
• Tazminat talep etme<br><br>

<b>10. Başvuru Yöntemleri</b><br>
E-posta: kvkk@everionconsulting.com<br>
Adres: [Şirket adresiniz]<br>
KEP: [KEP adresi – varsa]<br>
Uygulama içi KVKK formu<br><br>

<b>11. Güvenlik Önlemleri</b><br>
• Veri şifreleme<br>
• Erişim kontrolü<br>
• Güvenlik testleri<br>
• Log yönetimi<br>
• Gizlilik sözleşmeleri<br><br>

<b>12. Aydınlatma Metni Güncellemeleri</b><br>
Güncellemeler uygulama içi bildirim veya e-posta yoluyla duyurulur.<br><br>

<b>Son Güncelleme Tarihi:</b> 2025<br><br>

<b>İletişim</b><br>
E-posta: kvkk@everionconsulting.com<br>
Adres: [Şirket adresiniz]<br>
© 2024 Everion Consulting - HasarLink<br>
`;


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
            setTimeout(() => navigate("/"), 500);
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
      {showSahaciPassword && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ gap: "20px" }}>
            <div className="modal-header">
              <h3>Yönetici Şifre</h3>
              <button
                className="close-btn"
                onClick={() => setShowSahaciPassword(false)}
              >
                ×
              </button>
            </div>

            <input
              type="password"
              placeholder="Yetkili Şifre"
              value={sahaciPassword}
              onChange={(e) => setSahaciPassword(e.target.value)}
              style={{ padding: "10px", borderRadius: "10px", borderColor: 'black' }}
            />

            {sahaciError && (
              <p className="error-text">{sahaciError}</p>
            )}

            <button className="submit-btn" onClick={handleSahaciPasswordSubmit}>
              Devam Et
            </button>
          </div>
        </div>
      )}

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
              dangerouslySetInnerHTML={{ __html: policyText }} />

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
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Şifre"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                required
              />

              {/* GÖRSEL DOĞRU: Slash varsa AÇIK, yoksa GİZLİ */}
              {showPassword ? (
                <EyeIcon
                  className="eye-icon"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <EyeSlashIcon
                  className="eye-icon"
                  onClick={() => setShowPassword(true)}
                />
              )}

              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>



            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm"
                placeholder="Şifre Tekrar"
                value={form.confirm}
                onChange={handleChange}
                required
              />

              {showConfirmPassword ? (
                <EyeIcon
                  className="eye-icon"
                  onClick={() => setShowConfirmPassword(false)}
                />
              ) : (
                <EyeSlashIcon
                  className="eye-icon"
                  onClick={() => setShowConfirmPassword(true)}
                />
              )}
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
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"              // ✅ password
                placeholder="Şifre"
                value={form.password}        // ✅ form.password
                onChange={handleChange}
                required
              />

              {showPassword ? (
                <EyeIcon
                  className="eye-icon"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <EyeSlashIcon
                  className="eye-icon"
                  onClick={() => setShowPassword(true)}
                />
              )}

              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
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
          <br />
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowSahaciPassword(true);
            }}
          >
            Yönetici Kodu Başvuru Formu
          </a>

        </p>
      </form>
      {sahaciAuthorized && (
        <div
          className="modal-overlay"
        >
          <form
            className="auth-form"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSahaciSubmit}
          >

            <h3 style={{ textAlign: "center" }}>Yönetici Giriş</h3>

            <input
              type="text"
              placeholder="T.C. Kimlik No"
              maxLength={11}
              value={sahaciForm.sahaci_tc}
              onChange={(e) =>
                setSahaciForm({ ...sahaciForm, sahaci_tc: e.target.value })
              }
              required
            />

            <input
              type="text"
              placeholder="Ad"
              value={sahaciForm.sahaci_adi}
              onChange={(e) =>
                setSahaciForm({ ...sahaciForm, sahaci_adi: e.target.value })
              }
              required
            />

            <input
              type="text"
              placeholder="Soyad"
              value={sahaciForm.sahaci_soyadi}
              onChange={(e) =>
                setSahaciForm({ ...sahaciForm, sahaci_soyadi: e.target.value })
              }
              required
            />

            <input
              type="tel"
              placeholder="Telefon No"
              value={sahaciForm.sahaci_phone}
              onChange={(e) =>
                setSahaciForm({
                  ...sahaciForm,
                  sahaci_phone: maskPhone(e.target.value),
                })
              }
              required
            />

            <input
              type="email"
              placeholder="Gmail Adresi"
              value={sahaciForm.sahaci_mail}
              onChange={(e) =>
                setSahaciForm({
                  ...sahaciForm,
                  sahaci_mail: e.target.value,
                })
              }
              required
            />




            <button type="submit" className="submit-btn" onClick={(e) => e.stopPropagation()}>
              BAŞVUR
            </button>
          </form>

        </div>
      )}

    </>
  );
}
