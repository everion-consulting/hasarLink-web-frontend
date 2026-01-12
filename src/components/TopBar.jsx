import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AuthAPI from "../services/authAPI";
import coreService from "../services/coreService";
import styles from "../styles/topbar.module.css";
import { Bell } from "lucide-react";
import RightIcon from "../components/images/rightIcon.svg";
import HasarLinkLogo from "../assets/images/hasarlinklogo.svg";

export default function TopBar() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const tabsRef = useRef(null);
    const indicatorRef = useRef(null);

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
        const fetchUnread = async () => {
            try {
                const res = await coreService.getUnreadNotificationsCount();

                if (!res?.success) {
                    console.error("❌ Unread notification alınamadı:", res?.message);
                    setNotificationCount(0);
                    return;
                }

                // Backend'den gelen yapıya göre uyarlayabilirsin
                // Örn: { success: true, data: { unread_count: 5 } }
                const data = res?.data ?? {};
                const count =
                    data.unread_count ?? // tercih edilen
                    data.count ??         // belki böyle dönüyordur
                    0;

                setNotificationCount(count);
            } catch (err) {
                console.error("❌ getUnreadNotificationsCount hatası:", err);
                setNotificationCount(0);
            }
        };
        fetchUnread();

        const handleNotificationsUpdate = () => {
            fetchUnread();
        };

        window.addEventListener("notificationsUpdated", handleNotificationsUpdate);
        return () => {
            window.removeEventListener("notificationsUpdated", handleNotificationsUpdate);
        };
    }, []);

    const moveIndicatorToEl = (el) => {
        if (!el || !tabsRef.current || !indicatorRef.current) return;

        const parentRect = tabsRef.current.getBoundingClientRect();
        const rect = el.getBoundingClientRect();

        const left = rect.left - parentRect.left;
        const top = rect.top - parentRect.top;

        indicatorRef.current.style.transform = `translate(${left}px, ${top}px)`;
        indicatorRef.current.style.width = `${rect.width}px`;
        indicatorRef.current.style.height = `${rect.height}px`;
        indicatorRef.current.style.opacity = "1";
    };

    // İlk açılış + route değişince active tab'a oturt
    useLayoutEffect(() => {
        const activeEl = tabsRef.current?.querySelector(`.${styles.active}`);
        moveIndicatorToEl(activeEl || tabsRef.current?.querySelector(`.${styles.tab}`));
    });

    // Resize olunca indicator'ı yeniden hizala
    useEffect(() => {
        const onResize = () => {
            const activeEl = tabsRef.current?.querySelector(`.${styles.active}`);
            moveIndicatorToEl(activeEl);
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const handleMouseLeaveTabs = () => {
        const activeEl = tabsRef.current?.querySelector(`.${styles.active}`);
        moveIndicatorToEl(activeEl);
    };

    return (
        <header className={styles.topBar}>
            <div className={styles.logo}>
                <img src={HasarLinkLogo} alt="HasarLink" className={styles.logoIcon} />
                <span className={styles.logoText}>HASARLİNK</span>
            </div>

            {/* DESKTOP TABS */}
            <nav
                ref={tabsRef}
                className={`${styles.tabs} ${styles.desktopMenu}`}
                onMouseLeave={handleMouseLeaveTabs}
            >
                {/* sliding outline indicator */}
                <span ref={indicatorRef} className={styles.tabIndicator} />

                <NavLink
                    to="/"
                    end
                    className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ""}`}
                    onMouseEnter={(e) => moveIndicatorToEl(e.currentTarget)}
                    onFocus={(e) => moveIndicatorToEl(e.currentTarget)}
                >
                    Anasayfa
                </NavLink>

                <NavLink
                    to="/file-notifications"
                    className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ""}`}
                    onMouseEnter={(e) => moveIndicatorToEl(e.currentTarget)}
                    onFocus={(e) => moveIndicatorToEl(e.currentTarget)}
                >
                    Dosya Bildirimlerim
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ""}`}
                    onMouseEnter={(e) => moveIndicatorToEl(e.currentTarget)}
                    onFocus={(e) => moveIndicatorToEl(e.currentTarget)}
                >
                    Profilim
                </NavLink>

                <NavLink
                    to="/contact"
                    className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ""}`}
                    onMouseEnter={(e) => moveIndicatorToEl(e.currentTarget)}
                    onFocus={(e) => moveIndicatorToEl(e.currentTarget)}
                >
                    İletişim
                </NavLink>

                <NavLink
                    to="/settings"
                    className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ""}`}
                    onMouseEnter={(e) => moveIndicatorToEl(e.currentTarget)}
                    onFocus={(e) => moveIndicatorToEl(e.currentTarget)}
                >
                    Ayarlar
                </NavLink>

                <span
                    className={`${styles.tab} ${styles.tabDisabled}`}
                    title="Yakında"
                    aria-disabled="true"
                    onMouseEnter={(e) => moveIndicatorToEl(e.currentTarget)}
                    onFocus={(e) => moveIndicatorToEl(e.currentTarget)}
                >
                    Kredi Satın Al
                </span>

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
                        <img src={RightIcon} alt="Sağ Ok" />
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
                    <NavLink
                        to="#"
                        onClick={(e) => e.preventDefault()}
                        className={` ${styles.tabDisabled}`}
                        title="Yakında"
                        aria-disabled="true"
                    >
                        Kredi Satın Al
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
                            <img src={RightIcon} alt="Sağ Ok" />
                        </span>
                    </button>
                </div>
            )}
        </header>
    );
}