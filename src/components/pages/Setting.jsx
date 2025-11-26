import React, { useState, useEffect } from "react";
import styles from "../../styles/settings.module.css";
import { Bell, Sun, Moon, MoreVertical } from "lucide-react";
import CustomSwitch from "./CustomSwitch.jsx";

export default function Settings() {
    const [notificationSettings, setNotificationSettings] = useState({
        caseUpdates: true,
        campaignAnnouncements: false,
        smsNotifications: true,
        emailNotifications: true
    });

    const [isDark, setIsDark] = useState(false);

    // Bildirim ayarı toggle
    const toggleSetting = (key) => {
        setNotificationSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className={styles.settingsPage}>

            <div className={styles.settingsCardArea}>
                {/* ---------- KAPSAYICI CARD ---------- */}
                <div className={styles.settingsCard}>

                    {/* ---------- BİLDİRİM TERCİHLERİ ---------- */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Bildirim Tercihleri</h2>
                        <p className={styles.sectionDescription}>
                            Hangi bildirimleri almak istediğinizi buradan seçebilirsiniz.
                        </p>

                        <div className={styles.listCard}>

                            <div className={styles.listItem}>
                                <span>Dosya Durum Güncellemeleri</span>
                                <CustomSwitch
                                    value={notificationSettings.caseUpdates}
                                    onChange={() => toggleSetting("caseUpdates")}
                                />
                            </div>

                            <div className={styles.listItem}>
                                <span>Kampanya / Duyuru Bildirimleri</span>
                                <CustomSwitch
                                    value={notificationSettings.campaignAnnouncements}
                                    onChange={() => toggleSetting("campaignAnnouncements")}
                                />
                            </div>

                            <div className={styles.listItem}>
                                <span>SMS Bildirimleri</span>
                                <CustomSwitch
                                    value={notificationSettings.smsNotifications}
                                    onChange={() => toggleSetting("smsNotifications")}
                                />
                            </div>

                            <div className={styles.listItem}>
                                <span>E-Mail Bildirimleri</span>
                                <CustomSwitch
                                    value={notificationSettings.emailNotifications}
                                    onChange={() => toggleSetting("emailNotifications")}
                                />
                            </div>

                        </div>
                    </div>
                    {/* ------------------------------------------------------------------
                   📝 ÖDEME AYARLARI / KREDİ KARTI BÖLÜMÜ
                   Mobil uygulamada mevcut olan kart listesi, kart ekleme,
                   CVV - expiry date alanlarını içeren uzun bölüm.
                   
                   WEB SÜRÜMÜNDE ŞU AN DEVRE DIŞI.
                   Eğer bu kısmı da web için istiyorsan BLOCK'u aktif hâle getiririm.
                ------------------------------------------------------------------ */}

                    {/*
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Ödeme Ayarları</h2>
                    <p className={styles.sectionDescription}>
                        Kayıtlı ödeme yöntemlerini görüntüleyebilir veya yeni kart ekleyebilirsiniz.
                    </p>

                    <button className={styles.addCardBtn}>
                        <PlusCircle size={20} />
                        Yeni Kart Ekle
                        <ChevronRight size={20} />
                    </button>

                    <div className={styles.cardList}>
                        {cards.map(card => (
                            <div key={card.id} className={styles.cardItem}>
                                <div className={styles.cardHeader}>
                                    <span>{card.bankName}</span>
                                    <MoreVertical size={20} />
                                </div>
                                <p>{card.cardNumber}</p>
                                <p>{card.holderName}</p>
                            </div>
                        ))}
                    </div>
                </div>
                */}

                </div>

                <div className={styles.settingsCard}>
                    {/* ---------- KARANLIK MOD ---------- */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Karanlık Mod</h2>
                        <p className={styles.sectionDescription}>
                            Uygulama temasını değiştirmek için karanlık modu açıp kapatabilirsiniz.
                        </p>

                        <div className={styles.darkModeCard}>
                            <div className={styles.darkModeRow}>
                                <Sun size={22} />
                                <span>Karanlık Mod</span>
                                <Moon size={22} />
                            </div>

                            <CustomSwitch value={isDark} onChange={() => setIsDark(!isDark)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}