// src/components/TopBar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AuthAPI from "../services/authAPI";
import styles from "../styles/topbar.module.css";

export default function TopBar() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await AuthAPI.logout();
            window.dispatchEvent(new Event("storage"));
            navigate("/auth");
        } catch (err) {
            console.error("Logout error:", err);
            window.dispatchEvent(new Event("storage"));
            navigate("/auth");
        }
    };

    return (
        <header className={styles.topBar}>
            <div className={styles.logo}>HASARLİNK</div>

            {/* Desktop Tabs */}
            <nav className={`${styles.tabs} ${styles.desktopMenu}`}>
                <NavLink to="/" end className={({ isActive }) =>
                    `${styles.tab} ${isActive ? styles.active : ""}`
                }>Anasayfa</NavLink>

                <NavLink to="/dosya-bildirimlerim" className={({ isActive }) =>
                    `${styles.tab} ${isActive ? styles.active : ""}`
                }>Dosya Bildirimlerim</NavLink>

                <NavLink to="/profile" className={({ isActive }) =>
                    `${styles.tab} ${isActive ? styles.active : ""}`
                }>Profilim</NavLink>

                <NavLink to="/contact" className={({ isActive }) =>
                    `${styles.tab} ${isActive ? styles.active : ""}`
                }>İletişim</NavLink>

                <NavLink to="/settings" className={({ isActive }) =>
                    `${styles.tab} ${isActive ? styles.active : ""}`
                }>Ayarlar</NavLink>
            </nav>

            {/* CTA BUTTON — Mobilde otomatik olarak gizlenecek */}
            <button
                className={`${styles.contactBtn} ${styles.logoutBtn}`}
                onClick={handleLogout}
            >
                ÇIKIŞ YAP
                <span className={styles.contactBtnIcon}>
                    <img src="/src/assets/images/right-icon-white.svg" alt="Sağ Ok" />
                </span>
            </button>

            {/* Hamburger */}
            <div
                className={styles.hamburger}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                ☰
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className={styles.mobileMenu}>
                    <NavLink to="/" end onClick={() => setIsMenuOpen(false)}>Anasayfa</NavLink>
                    <NavLink to="/dosya-bildirimlerim" onClick={() => setIsMenuOpen(false)}>Dosya Bildirimlerim</NavLink>
                    <NavLink to="/profile" onClick={() => setIsMenuOpen(false)}>Profilim</NavLink>
                    <NavLink to="/contact" onClick={() => setIsMenuOpen(false)}>İletişim</NavLink>
                    <NavLink to="/settings" onClick={() => setIsMenuOpen(false)}>Ayarlar</NavLink>

                    <button
                        className={styles.mobileLogout} onClick={() => {
                            setIsMenuOpen(false);
                            handleLogout();
                        }}
                    >
                        ÇIKIŞ YAP
                        <span className={styles.contactBtnIcon}>
                            <img src="/src/assets/images/right-icon-white.svg" alt="Sağ Ok" />
                        </span>
                    </button>
                </div>
            )}
        </header>
    );
}