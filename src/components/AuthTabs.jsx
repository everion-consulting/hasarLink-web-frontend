import React, { useState } from "react";
import AuthForm from "./AuthForm";
import "../styles/auth.css";

export default function AuthTabs({ setIsAuth }) {
  
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="auth-wrapper">
      <div className="auth-header">
        <h1>HOŞ GELDİNİZ</h1>
        <div className="auth-tabs">
          <button
            className={activeTab === "register" ? "active" : ""}
            onClick={() => setActiveTab("register")}
          >
            KAYIT OL
          </button>
          <button
            className={activeTab === "login" ? "active" : ""}
            onClick={() => setActiveTab("login")}
          >
            GİRİŞ YAP
          </button>
        </div>
      </div>

      <AuthForm type={activeTab} setIsAuth={setIsAuth} setActiveTab={setActiveTab} />
    </div>
  );
}
