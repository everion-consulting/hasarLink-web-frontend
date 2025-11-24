import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/topbar.css";

export default function TopBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="topbar">
            <div className="logo">HASARLİNK</div>

            {/* Desktop Tabs */}
            <nav className="tabs desktop-menu">
                <NavLink to="/" end className={({ isActive }) => "tab" + (isActive ? " active" : "")}>
                    Anasayfa
                </NavLink>
                <NavLink to="/dosya-bildirimlerim" className={({ isActive }) => "tab" + (isActive ? " active" : "")}>
                    Dosya Bildirimlerim
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => "tab" + (isActive ? " active" : "")}>
                    Profilim
                </NavLink>
                <NavLink to="/contact" className={({ isActive }) => "tab" + (isActive ? " active" : "")}>
                    İletişim
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => "tab" + (isActive ? " active" : "")}>
                    Ayarlar
                </NavLink>
            </nav>

            {/* Desktop CTA */}
            <button className="contact-btn desktop-menu">
                İLETİŞİME GEÇ
                <span className="contact-btn-icon">
                    <img src="/src/assets/images/right-icon-white.svg" alt="Sağ Ok" />
                </span>
            </button>

            {/* Hamburger Icon */}
            <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                ☰
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="mobile-menu">
                    <NavLink to="/" end onClick={() => setIsMenuOpen(false)}>Anasayfa</NavLink>
                    <NavLink to="/dosya-bildirimlerim" onClick={() => setIsMenuOpen(false)}>Dosya Bildirimlerim</NavLink>
                    <NavLink to="/profile" onClick={() => setIsMenuOpen(false)}>Profilim</NavLink>
                    <NavLink to="/contact" onClick={() => setIsMenuOpen(false)}>İletişim</NavLink>
                    <NavLink to="/settings" onClick={() => setIsMenuOpen(false)}>Ayarlar</NavLink>
                </div>
            )}
        </header>
    );
}