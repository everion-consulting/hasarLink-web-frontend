import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthAPI from "../services/authAPI";
import "../styles/auth.css";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [timer, setTimer] = useState(120);
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const codeInputRef = useRef(null);

  // Timer countdown
  useEffect(() => {
    if (codeSent && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [codeSent, timer]);

  const formatTimer = () => {
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // STEP 1: Email ile kod gönder
  const handleSendCode = async (e) => {
    e.preventDefault();
    const emailRegex = /\S+@\S+\.\S+/;

    if (!email || !emailRegex.test(email)) {
      setError("Geçerli bir email adresi giriniz");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await AuthAPI.requestPasswordResetEmail(email.trim());
      setCodeSent(true);
      setTimer(120);
      setStep(2);
      setMessage("✅ Şifre sıfırlama kodu email adresinize gönderildi.");
    } catch (err) {
      console.error("Password reset email error:", err);
      setError(err?.email?.[0] || err?.detail || "E-posta gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Kodu doğrula
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError("6 haneli kodu giriniz");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await AuthAPI.verifyPasswordResetCode(email.trim(), code);
      setResetToken(result.reset_token);
      setStep(3);
      setMessage("✅ Kod doğrulandı! Yeni şifrenizi belirleyin.");
    } catch (err) {
      console.error("Verify code error:", err);
      setError(err?.code?.[0] || err?.error || err?.detail || "Kod doğrulanamadı. Lütfen kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Yeni şifre belirle
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 8) {
      setError("Şifre en az 8 karakter olmalı");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await AuthAPI.resetPasswordWithToken(resetToken, newPassword, confirmPassword);
      setMessage("✅ Şifreniz başarıyla değiştirildi! Giriş yapabilirsiniz.");
      
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      
      // Backend'den gelen tüm hata mesajlarını yakala
      let errorMessage = "Şifre değiştirilemedi. Lütfen tekrar deneyin.";
      
      if (err?.new_password) {
        errorMessage = Array.isArray(err.new_password) ? err.new_password.join(", ") : err.new_password;
      } else if (err?.confirm_password) {
        errorMessage = Array.isArray(err.confirm_password) ? err.confirm_password.join(", ") : err.confirm_password;
      } else if (err?.reset_token) {
        errorMessage = "Reset token geçersiz veya süresi dolmuş. Lütfen tekrar kod gönderin.";
      } else if (err?.error) {
        errorMessage = err.error;
      } else if (err?.detail) {
        errorMessage = err.detail;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Kodu tekrar gönder
  const handleResendCode = async () => {
    if (timer > 0) return;
    
    setLoading(true);
    setError("");
    setCode("");

    try {
      await AuthAPI.requestPasswordResetEmail(email.trim());
      setTimer(120);
      setMessage("✅ Yeni kod gönderildi.");
    } catch (err) {
      setError("Kod gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-header">
        <h1>ŞİFREMİ UNUTTUM</h1>
      </div>

      <div className="auth-form-container">
        <form className="auth-form" onSubmit={
          step === 1 ? handleSendCode : 
          step === 2 ? handleVerifyCode : 
          handleResetPassword
        }>
          {/* STEP 1: Email girişi */}
          {step === 1 && (
            <>
              <p style={{ textAlign: "center", marginBottom: "20px", color: "#666" }}>
                Email adresinize şifre sıfırlama kodu göndereceğiz.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email adresinizi giriniz"
                required
                autoFocus
              />
            </>
          )}

          {/* STEP 2: Kod doğrulama */}
          {step === 2 && (
            <>
              <p style={{ textAlign: "center", marginBottom: "20px", color: "#666" }}>
                <strong>{email}</strong> adresine gönderilen 6 haneli kodu giriniz
              </p>
              
              <div className="code-input-container" onClick={() => codeInputRef.current?.focus()}>
                <div className="code-boxes">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="code-box">
                      {code[i] || "-"}
                    </div>
                  ))}
                </div>
                <input
                  ref={codeInputRef}
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  maxLength={6}
                  style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
                  autoFocus
                />
              </div>

              <div style={{ textAlign: "center", marginTop: "15px" }}>
                <p style={{ color: "#666", fontSize: "14px" }}>
                  Kod süresi: <strong style={{ color: "#133E87" }}>{formatTimer()}</strong>
                </p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={timer > 0 || loading}
                  style={{
                    background: "none",
                    border: "none",
                    color: timer > 0 ? "#ccc" : "#133E87",
                    textDecoration: "underline",
                    cursor: timer > 0 ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    marginTop: "10px",
                  }}
                >
                  {timer > 0 ? `Tekrar kod gönder (${formatTimer()})` : "Tekrar kod gönder"}
                </button>
              </div>
            </>
          )}

          {/* STEP 3: Yeni şifre */}
          {step === 3 && (
            <>
              <p style={{ textAlign: "center", marginBottom: "20px", color: "#666" }}>
                Yeni şifrenizi belirleyin
              </p>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Yeni şifre (en az 8 karakter)"
                required
                autoFocus
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Yeni şifre tekrar"
                required
              />
            </>
          )}

          {error && (
            <p style={{ color: "red", textAlign: "center", marginTop: "10px", fontSize: "14px" }}>
              {error}
            </p>
          )}

          {message && (
            <p style={{ color: "green", textAlign: "center", marginTop: "10px", fontSize: "14px" }}>
              {message}
            </p>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Lütfen bekleyin..." : 
             step === 1 ? "KOD GÖNDER" :
             step === 2 ? "DOĞRULA" :
             "ŞİFREYİ DEĞİŞTİR"}
          </button>

          <p className="switch-text" style={{ textAlign: "center", marginTop: "20px" }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/auth"); }}>
              Giriş ekranına dön
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
