import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AuthAPI from "../services/authAPI";
import apiService from "../services/apiServices";
import styles from "../styles/topbar.module.css";
import { Bell } from "lucide-react";

export default function TopBar() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);

    const handleNotificationsClick = () => {
        navigate("/notifications");
    };

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

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const res = await apiService.getUnreadNotificationsCount();

                if (!res?.success) {
                    console.error("❌ Dosya sayıları alınamadı:", res?.message);
                    setNotificationCount(0);
                    return;
                }

                const data = res?.data?.data ?? res?.data ?? {};

                // İstersen burayı ihtiyacına göre değiştir:
                // pending_files adetini badge'e yazıyorum, yoksa counts.pending kullanıyorum.
                const fromPendingFiles = Array.isArray(data.pending_files)
                    ? data.pending_files.length
                    : undefined;

                const fromCountsPending = data?.counts?.pending ?? 0;

                setNotificationCount(
                    typeof fromPendingFiles === "number" ? fromPendingFiles : fromCountsPending
                );
            } catch (err) {
                console.error("❌ getFileSubmissionCounts hatası:", err);
                setNotificationCount(0);
            }
        };

        fetchCounts();
    }, []);


    return (
        <header className={styles.topBar}>
            <div className={styles.logo}>HASARLİNK</div>

            {/* DESKTOP TABS */}
            <nav className={`${styles.tabs} ${styles.desktopMenu}`}>
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `${styles.tab} ${isActive ? styles.active : ""}`
                    }
                >
                    Anasayfa
                </NavLink>

                <NavLink
                    to="/file-notifications"
                    className={({ isActive }) =>
                        `${styles.tab} ${isActive ? styles.active : ""}`
                    }
                >
                    Dosya Bildirimlerim
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        `${styles.tab} ${isActive ? styles.active : ""}`
                    }
                >
                    Profilim
                </NavLink>

                <NavLink
                    to="/contact"
                    className={({ isActive }) =>
                        `${styles.tab} ${isActive ? styles.active : ""}`
                    }
                >
                    İletişim
                </NavLink>

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `${styles.tab} ${isActive ? styles.active : ""}`
                    }
                >
                    Ayarlar
                </NavLink>
            </nav>

            {/* RIGHT GROUP: Notification + Logout */}
            <div className={styles.rightGroup}>
                {/* NOTIFICATION ICON (DESKTOP) */}
                <div
                    className={styles.notificationIconDesktop}
                    onClick={handleNotificationsClick}
                    role="button"
                    style={{ cursor: "pointer" }}
                >
                    <Bell size={22} />
                    <span className={styles.notificationBadge}>
                        {notificationCount}
                    </span>
                </div>

                {/* ÇIKIŞ YAP BUTTON */}
                <button
                    className={`${styles.contactBtn} ${styles.logoutBtn}`}
                    onClick={handleLogout}
                >
                    ÇIKIŞ YAP
                    <span className={styles.contactBtnIcon}>
                        <img src="/src/assets/images/right-icon-white.svg" alt="Sağ Ok" />
                    </span>
                </button>
            </div>

            {/* --- MOBILE RIGHT GROUP --- */}
            <div className={styles.mobileRightGroup}>
                <div
                    className={styles.notificationIconMobile}
                    onClick={handleNotificationsClick}
                    role="button"
                >
                    <Bell size={22} />
                    <span className={styles.notificationBadge}>
                        {notificationCount}
                    </span>
                </div>

                <div
                    className={styles.hamburger}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    ☰
                </div>
            </div>

            {/* MOBILE MENU */}
            {isMenuOpen && (
                <div className={styles.mobileMenu}>
                    <NavLink to="/" end onClick={() => setIsMenuOpen(false)}>
                        Anasayfa
                    </NavLink>
                    <NavLink
                        to="/file-notifications"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Dosya Bildirimlerim
                    </NavLink>
                    <NavLink to="/profile" onClick={() => setIsMenuOpen(false)}>
                        Profilim
                    </NavLink>
                    <NavLink to="/contact" onClick={() => setIsMenuOpen(false)}>
                        İletişim
                    </NavLink>
                    <NavLink to="/settings" onClick={() => setIsMenuOpen(false)}>
                        Ayarlar
                    </NavLink>

                    <button
                        className={styles.mobileLogout}
                        onClick={() => {
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