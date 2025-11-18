// src/components/TopBar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/topbar.css";

export default function TopBar() {
    return (
        <header className="topbar">
            <div className="logo">HASARLİNK</div>

            <nav className="tabs">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) => "tab" + (isActive ? " active" : "")}
                >
                    Anasayfa
                </NavLink>
                <NavLink
                    to="/dosya-bildirimlerim"
                    end
                    className={({ isActive }) => "tab" + (isActive ? " active" : "")}
                >
                    Dosya Bildirimlerim
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) => "tab" + (isActive ? " active" : "")}
                >
                    Profilim
                </NavLink>

                <NavLink
                    to="/contact"
                    className={({ isActive }) => "tab" + (isActive ? " active" : "")}
                >
                    İletişim
                </NavLink>

                <NavLink
                    to="/settings"
                    className={({ isActive }) => "tab" + (isActive ? " active" : "")}
                >
                    Ayarlar
                </NavLink>
            </nav>

            <button className="contact-btn">
                İLETİŞİME GEÇ
                <span className="icon">➜</span>
            </button>
        </header>
    );
}
