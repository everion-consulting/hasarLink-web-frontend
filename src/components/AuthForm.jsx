import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
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

  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyScrolledToEnd, setPolicyScrolledToEnd] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);

  const navigate = useNavigate();

  // 📌 Gizlilik Politikası Metni
  const policyText = `
<b>Son Güncelleme Tarihi:</b> 2025<br><br>
Bu Gizlilik Politikası, HasarLink Web Uygulaması (“Uygulama”) tarafından ...
<b>Son Güncelleme Tarihi:</b> 2025<br><br>

Bu Gizlilik Politikası, HasarLink Web Uygulaması (“Uygulama”) tarafından sunulan
hizmetler kapsamında işlenen kişisel verilerin toplanması, kullanılması, saklanması,
paylaşılması ve korunmasına ilişkin esasları açıklar.<br>
Uygulamayı kullanarak bu politikayı kabul etmiş sayılırsınız.<br><br>

<b>1. Toplanan Kişisel Veriler</b><br>
Uygulama, hizmet sunumu sırasında aşağıdaki veri kategorilerini toplayabilir:<br><br>

<b>1.1 Kimlik Bilgileri</b><br>
• Ad, soyad<br>
• T.C. kimlik numarası (gerekmesi hâlinde)<br>
• Doğum tarihi<br>
• Araç plakası<br>
• Ehliyet ve ruhsat bilgileri<br><br>

<b>1.2 İletişim Bilgileri</b><br>
• Telefon numarası<br>
• E-posta adresi<br>
• Adres bilgileri<br>
• Servis/işletme iletişim bilgileri<br><br>

<b>1.3 Araç ve Kaza Bilgileri</b><br>
• Araç marka, model, plaka<br>
• Kaza türü, niteliği, yeri ve zamanı<br>
• Kaza fotoğrafları<br>
• Karşı taraf bilgileri<br><br>

<b>1.4 Konum Bilgisi</b><br>
• Kaza yeri konumu<br>
• Kullanıcı tarafından paylaşılan anlık konum<br><br>

<b>1.5 Cihaz ve Kullanım Bilgileri</b><br>
• IP adresi<br>
• Cihaz modeli, tarayıcı bilgisi, işletim sistemi<br>
• Uygulama sürümü ve oturum bilgileri<br>
• Hata kayıtları (loglar)<br>
• Çerez ve kullanım analitiği verileri<br><br>

<b>2. Kişisel Verilerin İşlenme Amaçları</b><br>
Toplanan veriler aşağıdaki amaçlarla işlenebilir:<br><br>

• Hasar dosyası oluşturmak ve sigorta şirketlerine iletmek<br>
• Kaza değerlendirme ve raporlama süreçlerini yürütmek<br>
• Kullanıcı profili oluşturmak ve doğrulamak<br>
• Servis/işletme yönlendirmesi yapmak<br>
• Kullanıcı destek hizmetlerini sağlamak<br>
• Uygulama performansını artırmak ve hata kayıtlarını analiz etmek<br>
• Güvenlik, kötüye kullanımın önlenmesi ve log takibi<br>
• Yasal yükümlülüklerin yerine getirilmesi<br><br>

<b>3. Kişisel Verilerin Paylaşılması</b><br><br>

<b>3.1 Sigorta Şirketleri</b><br>
• Hasar dosyalarının değerlendirilmesi için ilgili bilgiler paylaşılır.<br><br>

<b>3.2 Yetkili Servisler ve İş Ortakları</b><br>
• Araç onarım süreçlerinin yürütülmesi ve servis yönlendirmeleri<br><br>

<b>3.3 Yasal Otoriteler</b><br>
• Mahkemeler, emniyet birimleri ve diğer resmi makamlar<br>
• Resmî taleplere istinaden gerekli bilgi paylaşımı yapılabilir<br><br>

<b>3.4 Hizmet Sağlayıcılar</b><br>
• Sunucu (hosting) hizmetleri<br>
• Veri güvenliği sağlayıcıları<br>
• SMS/e-posta gönderim sistemleri<br>
• Analitik ve log takip hizmetleri<br><br>

Kişisel veriler hiçbir şekilde reklam amaçlı üçüncü kişilere satılmaz.<br><br>

<b>4. Veri Saklama Süresi</b><br>
Kişisel veriler:<br>
• Hizmet sunumu devam ettiği sürece,<br>
• Yasal zorunluluklarda belirtilen süre boyunca,<br>
saklanır. Süre dolduğunda veriler silinir, yok edilir veya anonimleştirilir.<br><br>

<b>5. Kullanıcı Hakları</b><br>
KVKK kapsamında kullanıcılar şu haklara sahiptir:<br><br>

• Kişisel verilerinin işlenip işlenmediğini öğrenme<br>
• İşlendi ise buna ilişkin bilgi talep etme<br>
• Verilerin düzeltilmesini isteme<br>
• Silinmesini veya yok edilmesini talep etme<br>
• Verilerin aktarıldığı kişi veya kurumları öğrenme<br>
• İşlenmesine itiraz etme<br>
• Zarara uğraması hâlinde tazminat talep etme<br><br>

Bu talepler, uygulama içerisindeki iletişim kanallarından iletilebilir.<br><br>

<b>6. Güvenlik Önlemleri</b><br>
Kişisel verilerinizin korunması için alınan önlemler:<br><br>

• SSL/TLS şifreleme<br>
• Güvenli sunucu altyapıları<br>
• Erişim yetkilendirme ve kontrol mekanizmaları<br>
• Log yönetimi<br>
• Güvenlik duvarı ve saldırı tespit önlemleri<br>
• Veri yedekleme politikaları<br><br>

<b>7. Çerezler ve Analitik Kullanımı</b><br>
Uygulama üzerinde:<br><br>

• Performans ölçümü<br>
• Kullanıcı deneyimi geliştirme<br>
• Hata tespiti<br>
amaçlı çerez ve analitik araçlar kullanılır.<br>
Bu veriler reklam amacıyla kullanılmaz.<br><br>

<b>8. Gizlilik Politikasında Değişiklikler</b><br>
Bu politika gerektiğinde güncellenebilir. Güncel sürüm uygulama üzerinden erişilebilir olacaktır.<br><br>

<b>9. İletişim</b><br>
HasarLink Destek Ekibi<br>
E-posta: destek@hasarlink.com<br>
Web: www.hasarlink.com<br><br>
...
<b>İletişim</b><br>
HasarLink Destek Ekibi<br>
E-posta: destek@hasarlink.com<br>
Web: www.hasarlink.com<br><br>
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
    setForm({ ...form, [e.target.name]: e.target.value });
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

  // 🔐 FORM SUBMIT
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
      setMessage(err.detail || err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // 🔵 Google Login
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
            <input type="email" name="email" placeholder="E-Mail" onChange={handleChange} required />
            <input type="tel" name="phone" placeholder="Telefon No" onChange={handleChange} />
            <input type="password" name="password" placeholder="Şifre" onChange={handleChange} required />
            <input type="password" name="confirm" placeholder="Şifre Tekrar" onChange={handleChange} required />

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
            <input type="text" name="username" placeholder="Kullanıcı Adı veya E-Mail" value={form.username} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Şifre" value={form.password} onChange={handleChange} required />
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
