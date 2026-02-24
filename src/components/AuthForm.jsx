import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import GoogleIcon from "../assets/icons/google.svg";
import AppleIcon from "../assets/icons/apple.svg";
import AuthAPI from "../services/authAPI";
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
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

  // -----------------------------
  // ŞİFREMİ UNUTTUM (Email 3 adım)
  // -----------------------------
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: code, 3: new pass

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotResetToken, setForgotResetToken] = useState("");

  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotNewPass2, setForgotNewPass2] = useState("");

  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

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
<b>E-posta:</b> bilgi@hasarlink.com<br>
<b>Adres:</b> [Şirket adresiniz]<br>
<b>KEP Adresi:</b> [KEP adresiniz - varsa]<br><br>

Everion Consulting olarak, HasarLink uygulaması aracılığıyla işlediğimiz kişisel verilerinizi 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında korumakta ve aşağıda açıklanan şartlarda işlemekteyiz.<br><br>

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
E-posta: bilgi@hasarlink.com<br>
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
E-posta: bilgi@hasarlink.com<br>
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
  const openForgot = () => {
    setForgotEmail(form.username || "");
    setForgotCode("");
    setForgotResetToken("");
    setForgotNewPass("");
    setForgotNewPass2("");
    setForgotMsg("");
    setForgotStep(1);
    setShowForgotModal(true);
  };

  const closeForgot = () => {
    setShowForgotModal(false);
    setForgotLoading(false);
  };

  const requestResetCode = async () => {
    if (!validateEmail(forgotEmail)) {
      setForgotMsg("Geçerli bir e-posta adresi giriniz.");
      return;
    }

    try {
      setForgotLoading(true);
      setForgotMsg("");

      const res = await AuthAPI.requestPasswordResetEmail(forgotEmail);
      setForgotMsg(res?.message || "Kod e-posta adresinize gönderildi.");
      setForgotStep(2);
    } catch (err) {
      setForgotMsg(err?.detail || err?.message || "Kod gönderilirken hata oluştu.");
    } finally {
      setForgotLoading(false);
    }
  };

  const verifyResetCode = async () => {
    if (!validateEmail(forgotEmail)) {
      setForgotMsg("Geçerli bir e-posta adresi giriniz.");
      return;
    }
    if (!forgotCode || forgotCode.trim().length < 4) {
      setForgotMsg("Lütfen doğrulama kodunu girin.");
      return;
    }

    try {
      setForgotLoading(true);
      setForgotMsg("");

      const res = await AuthAPI.verifyPasswordResetCode(forgotEmail, forgotCode.trim());

      const token =
        res?.reset_token ||
        res?.resetToken ||
        res?.token ||
        res?.data?.reset_token ||
        res?.data?.token;

      if (!token) {
        setForgotMsg("Reset token alınamadı. Lütfen kodu tekrar isteyin.");
        return;
      }

      setForgotResetToken(token);
      setForgotMsg("Kod doğrulandı. Yeni şifrenizi belirleyin.");
      setForgotStep(3);
    } catch (err) {
      setForgotMsg(err?.detail || err?.message || "Kod doğrulanamadı.");
    } finally {
      setForgotLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!forgotResetToken) {
      setForgotMsg("Reset token yok. Lütfen kodu tekrar doğrulayın.");
      setForgotStep(2);
      return;
    }
    if (!forgotNewPass || forgotNewPass.length < 6) {
      setForgotMsg("Şifre en az 6 karakter olmalı.");
      return;
    }
    if (forgotNewPass !== forgotNewPass2) {
      setForgotMsg("Şifreler eşleşmiyor.");
      return;
    }

    try {
      setForgotLoading(true);
      setForgotMsg("");

      const res = await AuthAPI.resetPasswordWithToken(
        forgotResetToken,
        forgotNewPass,
        forgotNewPass2
      );

      setForgotMsg(res?.message || "Şifreniz güncellendi. Giriş yapabilirsiniz.");
      // login ekranına dön + username'i doldur
      setForm((p) => ({ ...p, username: forgotEmail, password: "" }));
      setTimeout(() => {
        closeForgot();
        setActiveTab?.("login");
      }, 700);
    } catch (err) {
      setForgotMsg(err?.detail || err?.message || "Şifre güncellenemedi.");
    } finally {
      setForgotLoading(false);
    }
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

      {showForgotModal && (
        <div
          className="modal-overlay"
          onClick={closeForgot}
          style={{
            background: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
            zIndex: 9999,
          }}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(520px, 92vw)",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.92)",
              boxShadow: "0 20px 60px rgba(15,23,42,0.25)",
              overflow: "hidden",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                padding: "16px 16px 14px",
                background:
                  "linear-gradient(135deg, rgba(19,62,135,0.12), rgba(59,130,246,0.10))",
                borderBottom: "1px solid rgba(15,23,42,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: "rgba(19,62,135,0.12)",
                    display: "grid",
                    placeItems: "center",
                    border: "1px solid rgba(19,62,135,0.18)",
                  }}
                >
                  {/* basit kilit ikonu */}
                  <span style={{ fontSize: 18 }}>🔒</span>
                </div>

                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
                    Şifremi Unuttum
                  </div>
                  <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
                    3 adımda şifreni yenileyelim.
                  </div>
                </div>
              </div>

              <button
                onClick={closeForgot}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: "1px solid rgba(15,23,42,0.10)",
                  background: "rgba(255,255,255,0.85)",
                  cursor: "pointer",
                  fontSize: 18,
                  lineHeight: "32px",
                }}
                aria-label="Kapat"
                title="Kapat"
              >
                ×
              </button>
            </div>

            {/* PROGRESS + STEPS */}
            <div style={{ padding: "14px 16px 0" }}>
              {/* progress bar */}
              <div
                style={{
                  height: 8,
                  borderRadius: 999,
                  background: "rgba(15,23,42,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: forgotStep === 1 ? "33%" : forgotStep === 2 ? "66%" : "100%",
                    background: "linear-gradient(90deg, #133E87, #3B82F6)",
                    borderRadius: 999,
                    transition: "width .25s ease",
                  }}
                />
              </div>

              {/* step chips */}
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {[
                  { n: 1, t: "E-posta" },
                  { n: 2, t: "Kod" },
                  { n: 3, t: "Yeni Şifre" },
                ].map((s) => {
                  const active = forgotStep === s.n;
                  const done = forgotStep > s.n;
                  return (
                    <div
                      key={s.n}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "7px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        color: active || done ? "#133E87" : "#64748b",
                        background: active
                          ? "rgba(19,62,135,0.10)"
                          : done
                            ? "rgba(34,197,94,0.12)"
                            : "rgba(15,23,42,0.06)",
                        border: "1px solid rgba(15,23,42,0.08)",
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 999,
                          display: "grid",
                          placeItems: "center",
                          fontSize: 11,
                          background: active
                            ? "rgba(19,62,135,0.14)"
                            : done
                              ? "rgba(34,197,94,0.18)"
                              : "rgba(15,23,42,0.08)",
                        }}
                      >
                        {done ? "✓" : s.n}
                      </span>
                      {s.t}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BODY */}
            <div style={{ padding: "14px 16px 16px", display: "grid", gap: 12 }}>
              {/* STEP 1 */}
              {forgotStep === 1 && (
                <>
                  <div style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.5 }}>
                    E-posta adresini gir, sana doğrulama kodu göndereceğiz.
                  </div>

                  <input
                    type="email"
                    placeholder="E-posta adresiniz"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={{
                      height: 44,
                      borderRadius: 12,
                      border: "1px solid rgba(15,23,42,0.12)",
                      padding: "0 12px",
                      outline: "none",
                      background: "white",
                    }}
                  />

                  <button
                    type="button"
                    onClick={requestResetCode}
                    disabled={forgotLoading}
                    style={{
                      height: 44,
                      borderRadius: 12,
                      border: "none",
                      cursor: forgotLoading ? "not-allowed" : "pointer",
                      fontWeight: 800,
                      color: "white",
                      background: forgotLoading
                        ? "rgba(59,130,246,0.60)"
                        : "linear-gradient(90deg, #133E87, #3B82F6)",
                      boxShadow: "0 10px 24px rgba(59,130,246,0.18)",
                    }}
                  >
                    {forgotLoading ? "Gönderiliyor..." : "Kodu Gönder"}
                  </button>
                </>
              )}

              {/* STEP 2 */}
              {forgotStep === 2 && (
                <>
                  <div style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.5 }}>
                    E-postana gelen doğrulama kodunu gir.
                  </div>

                  <input
                    type="email"
                    placeholder="E-posta adresiniz"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={{
                      height: 44,
                      borderRadius: 12,
                      border: "1px solid rgba(15,23,42,0.12)",
                      padding: "0 12px",
                      outline: "none",
                      background: "white",
                    }}
                  />

                  <input
                    type="text"
                    placeholder="Doğrulama Kodu"
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value)}
                    style={{
                      height: 44,
                      borderRadius: 12,
                      border: "1px solid rgba(15,23,42,0.12)",
                      padding: "0 12px",
                      outline: "none",
                      background: "white",
                      letterSpacing: 3,
                      fontWeight: 800,
                    }}
                  />

                  <button
                    type="button"
                    onClick={verifyResetCode}
                    disabled={forgotLoading}
                    style={{
                      height: 44,
                      borderRadius: 12,
                      border: "none",
                      cursor: forgotLoading ? "not-allowed" : "pointer",
                      fontWeight: 800,
                      color: "white",
                      background: forgotLoading
                        ? "rgba(19,62,135,0.55)"
                        : "linear-gradient(90deg, #133E87, #1D4ED8)",
                      boxShadow: "0 10px 24px rgba(19,62,135,0.18)",
                    }}
                  >
                    {forgotLoading ? "Doğrulanıyor..." : "Kodu Doğrula"}
                  </button>

                  <button
                    type="button"
                    onClick={requestResetCode}
                    disabled={forgotLoading}
                    style={{
                      height: 44,
                      borderRadius: 12,
                      border: "1px solid rgba(15,23,42,0.12)",
                      background: "white",
                      cursor: forgotLoading ? "not-allowed" : "pointer",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    Kodu Tekrar Gönder
                  </button>
                </>
              )}

              {/* STEP 3 */}
              {forgotStep === 3 && (
                <>
                  <div style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.5 }}>
                    Yeni şifreni belirle ve onayla.
                  </div>

                  <input
                    type="password"
                    placeholder="Yeni Şifre"
                    value={forgotNewPass}
                    onChange={(e) => setForgotNewPass(e.target.value)}
                    style={{
                      height: 44,
                      borderRadius: 12,
                      border: "1px solid rgba(15,23,42,0.12)",
                      padding: "0 12px",
                      outline: "none",
                      background: "white",
                    }}
                  />

                  <input
                    type="password"
                    placeholder="Yeni Şifre Tekrar"
                    value={forgotNewPass2}
                    onChange={(e) => setForgotNewPass2(e.target.value)}
                    style={{
                      height: 44,
                      borderRadius: 12,
                      border: "1px solid rgba(15,23,42,0.12)",
                      padding: "0 12px",
                      outline: "none",
                      background: "white",
                    }}
                  />

                  <button
                    type="button"
                    onClick={resetPassword}
                    disabled={forgotLoading}
                    style={{
                      height: 44,
                      borderRadius: 12,
                      border: "none",
                      cursor: forgotLoading ? "not-allowed" : "pointer",
                      fontWeight: 800,
                      color: "white",
                      background: forgotLoading
                        ? "rgba(34,197,94,0.60)"
                        : "linear-gradient(90deg, #16A34A, #22C55E)",
                      boxShadow: "0 10px 24px rgba(34,197,94,0.18)",
                    }}
                  >
                    {forgotLoading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setForgotStep(2)}
                    disabled={forgotLoading}
                    style={{
                      height: 44,
                      borderRadius: 12,
                      border: "1px solid rgba(15,23,42,0.12)",
                      background: "white",
                      cursor: forgotLoading ? "not-allowed" : "pointer",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    Koda Geri Dön
                  </button>
                </>
              )}

              {/* MESSAGE */}
              {forgotMsg && (
                <div
                  style={{
                    marginTop: 4,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(15,23,42,0.10)",
                    background: forgotMsg.includes("✅")
                      ? "rgba(34,197,94,0.10)"
                      : "rgba(239,68,68,0.10)",
                    color: forgotMsg.includes("✅") ? "#166534" : "#991b1b",
                    fontSize: 12.5,
                    lineHeight: 1.45,
                    fontWeight: 700,
                  }}
                >
                  {forgotMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ————————————————  
           🧩 ANA FORM
      ———————————————— */}
      <form className="auth-form" onSubmit={handleSubmit}>
        {type === "register" && (
          <>
            {/* Veri Güvenliği Bilgilendirme Kartı */}
            <div style={{
              backgroundColor: '#EFF6FF',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '16px',
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}>
              <ShieldCheckIcon style={{ width: '22px', height: '22px', color: '#133E87', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#133E87', marginBottom: '4px' }}>
                  Verileriniz Güvende
                </div>
                <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: '1.5' }}>
                  Bilgileriniz 256-bit SSL şifreleme ile korunmaktadır. Verileriniz yalnızca hasar bildirim sürecinde kullanılır, üçüncü taraflarla ticari amaçla paylaşılmaz.
                </div>
              </div>
            </div>

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
            {/* Veri Güvenliği Bildirimi */}
            <div style={{
              backgroundColor: '#EFF6FF', borderRadius: '12px',
              padding: '12px 14px', marginBottom: '16px',
              border: '1px solid #BFDBFE', display: 'flex',
              alignItems: 'flex-start', gap: '10px',
            }}>
              <ShieldCheckIcon style={{ width: '22px', height: '22px', color: '#133E87', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#133E87', marginBottom: '4px' }}>
                  Verileriniz Güvende
                </div>
                <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: '1.5' }}>
                  Bilgileriniz 256-bit SSL şifreleme ile korunmaktadır. Verileriniz yalnızca hasar bildirim sürecinde kullanılır, üçüncü taraflarla ticari amaçla paylaşılmaz.
                </div>
              </div>
            </div>

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
          <br />
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openForgot();
            }}
            style={{ display: "inline-block", marginTop: 8 }}
          >
            Şifremi Unuttum
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
