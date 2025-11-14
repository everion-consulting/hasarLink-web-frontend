import React, { useEffect, useState } from "react";
import AuthAPI from "../../services/authAPI";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        navigate("/auth");
        return;
      }

      try {
        const data = await AuthAPI.getProfile(token);
        setUser(data);
      } catch (err) {
        console.error("Profil alınamadı:", err);
        localStorage.removeItem("auth_token");
        navigate("/auth");
      }
    };

    // ❗ sadece ilk render’da çalışır
    fetchProfile();
  }, []); // navigate bağımlılığı eklenmez

  const handleLogout = async () => {
    await AuthAPI.logout(localStorage.getItem("auth_token"));
    localStorage.removeItem("auth_token");
    navigate("/auth");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Hoş geldin, {user?.full_name || "Kullanıcı"}!</h1>
      <button onClick={handleLogout}>Çıkış Yap</button>
    </div>
  );
}
