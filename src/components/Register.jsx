import React, { useState } from "react";
import "../styles/auth.css";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Kayıt Başarılı!\n${formData.name} - ${formData.email}`);
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Kayıt Ol</h2>

        <input
          type="text"
          name="name"
          placeholder="Ad Soyad"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="E-posta"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Şifre"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Kayıt Ol</button>

        <p className="auth-switch">
          Zaten hesabın var mı? <a href="/login">Giriş Yap</a>
        </p>
      </form>
    </div>
  );
}
