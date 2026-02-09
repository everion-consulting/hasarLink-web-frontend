import React, { useState, useEffect } from "react";
import styles from "../../styles/settings.module.css";
import darkStyles from "../../styles/settingsdark.module.css";
import { Bell, Sun, Moon, MoreVertical, PlusCircle, ChevronRight, CreditCard, Trash2, X, Edit } from "lucide-react";
import CustomSwitch from "./CustomSwitch.jsx";
import { useTheme } from "../tema/theme-context.jsx";

export default function Settings() {
    const [notificationSettings, setNotificationSettings] = useState({
        caseUpdates: true,
        campaignAnnouncements: false,
        smsNotifications: true,
        emailNotifications: true
    });

    const { isDark, toggleTheme } = useTheme();
    const [savedCards, setSavedCards] = useState([]);
    const [showAddCardModal, setShowAddCardModal] = useState(false);
    const [showCardMenu, setShowCardMenu] = useState(null);
    const [editingCard, setEditingCard] = useState(null);
    const themeStyles = isDark ? darkStyles : styles;

    const [newCard, setNewCard] = useState({
        cardName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        bankName: ""
    });

    // Kayıtlı kartları yükle
    useEffect(() => {
        const cards = JSON.parse(localStorage.getItem('savedCards') || '[]');
        setSavedCards(cards);
    }, []);

    // Bildirim ayarı toggle
    const toggleSetting = (key) => {
        setNotificationSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleCardInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "cardNumber") {
            const cleaned = value.replace(/\s/g, "");
            if (cleaned.length <= 16) {
                const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
                setNewCard({ ...newCard, [name]: formatted });
            }
            return;
        }

        if (name === "expiryDate") {
            const cleaned = value.replace(/\D/g, "");
            if (cleaned.length <= 4) {
                const formatted = cleaned.length >= 2
                    ? `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
                    : cleaned;
                setNewCard({ ...newCard, [name]: formatted });
            }
            return;
        }

        if (name === "cvv") {
            if (value.length <= 3) {
                setNewCard({ ...newCard, [name]: value.replace(/\D/g, "") });
            }
            return;
        }

        setNewCard({ ...newCard, [name]: value });
    };

    const handleAddCard = (e) => {
        e.preventDefault();

        if (editingCard) {
            // Düzenleme modu
            const cardToUpdate = {
                ...editingCard,
                bankName: newCard.bankName,
                cardName: newCard.cardName,
                cardNumber: newCard.cardNumber,
                expiryDate: newCard.expiryDate,
                lastFourDigits: newCard.cardNumber.replace(/\s/g, "").slice(-4),
                maskedNumber: `**** **** **** ${newCard.cardNumber.replace(/\s/g, "").slice(-4)}`
            };

            const updatedCards = savedCards.map(card =>
                card.id === editingCard.id ? cardToUpdate : card
            );
            setSavedCards(updatedCards);
            localStorage.setItem('savedCards', JSON.stringify(updatedCards));
            setEditingCard(null);
        } else {
            // Yeni kart ekleme
            const cardToSave = {
                id: Date.now(),
                bankName: newCard.bankName,
                cardName: newCard.cardName,
                cardNumber: newCard.cardNumber,
                expiryDate: newCard.expiryDate,
                lastFourDigits: newCard.cardNumber.replace(/\s/g, "").slice(-4),
                maskedNumber: `**** **** **** ${newCard.cardNumber.replace(/\s/g, "").slice(-4)}`
            };

            const updatedCards = [...savedCards, cardToSave];
            setSavedCards(updatedCards);
            localStorage.setItem('savedCards', JSON.stringify(updatedCards));
        }

        // Formu temizle
        setNewCard({
            cardName: "",
            cardNumber: "",
            expiryDate: "",
            cvv: "",
            bankName: ""
        });
        setShowAddCardModal(false);
    };

    const handleDeleteCard = (cardId) => {
        const updatedCards = savedCards.filter(card => card.id !== cardId);
        setSavedCards(updatedCards);
        localStorage.setItem('savedCards', JSON.stringify(updatedCards));
        setShowCardMenu(null);
    };

    const handleEditCard = (card) => {
        setEditingCard(card);
        setNewCard({
            bankName: card.bankName,
            cardName: card.cardName,
            cardNumber: card.cardNumber,
            expiryDate: card.expiryDate,
            cvv: ""
        });
        setShowCardMenu(null);
        setShowAddCardModal(true);
    };

    return (
        <div className={themeStyles.settingsPage}>

            <div className={themeStyles.settingsCardArea}>
                {/* ---------- KAPSAYICI CARD ---------- */}
                <div className={themeStyles.settingsCard}>

                    {/* ---------- BİLDİRİM TERCİHLERİ ---------- */}
                    <div className={themeStyles.section}>
                        <h2 className={themeStyles.sectionTitle}>Bildirim Tercihleri</h2>
                        <p className={themeStyles.sectionDescription}>
                            Hangi bildirimleri almak istediğinizi buradan seçebilirsiniz.
                        </p>

                        <div className={themeStyles.listCard}>

                            <div className={themeStyles.listItem}>
                                <span>Dosya Durum Güncellemeleri</span>
                                <CustomSwitch
                                    value={notificationSettings.caseUpdates}
                                    onChange={() => toggleSetting("caseUpdates")}
                                />
                            </div>

                            <div className={themeStyles.listItem}>
                                <span>Kampanya / Duyuru Bildirimleri</span>
                                <CustomSwitch
                                    value={notificationSettings.campaignAnnouncements}
                                    onChange={() => toggleSetting("campaignAnnouncements")}
                                />
                            </div>

                            <div className={themeStyles.listItem}>
                                <span>SMS Bildirimleri</span>
                                <CustomSwitch
                                    value={notificationSettings.smsNotifications}
                                    onChange={() => toggleSetting("smsNotifications")}
                                />
                            </div>

                            <div className={themeStyles.listItem}>
                                <span>E-Mail Bildirimleri</span>
                                <CustomSwitch
                                    value={notificationSettings.emailNotifications}
                                    onChange={() => toggleSetting("emailNotifications")}
                                />
                            </div>

                        </div>
                    </div>

                </div>

                {/* ---------- ÖDEME AYARLARI CARD ---------- */}
                <div className={themeStyles.settingsCard}>
                    <div className={themeStyles.section}>
                        <h2 className={themeStyles.sectionTitle}>Ödeme Ayarları</h2>
                        <p className={themeStyles.sectionDescription}>
                            Kayıtlı ödeme yöntemlerini görüntüleyebilir veya yeni kart ekleyebilirsiniz.
                        </p>

                        <button
                            className={themeStyles.addCardBtn}
                            onClick={() => setShowAddCardModal(true)}
                        >
                            <PlusCircle size={20} />
                            Yeni Kart Ekle
                            <ChevronRight size={20} />
                        </button>

                        {savedCards.length > 0 ? (
                            <div className={themeStyles.cardList}>
                                {savedCards.map(card => (
                                    <div key={card.id} className={themeStyles.cardItem}>
                                        <div className={themeStyles.cardIcon}>
                                            <CreditCard size={24} />
                                        </div>
                                        <div className={themeStyles.cardInfo}>
                                            <span className={themeStyles.bankName}>{card.bankName}</span>
                                            <p className={themeStyles.cardNumber}>{card.maskedNumber}</p>
                                            <p className={themeStyles.cardHolder}>{card.cardName}</p>
                                        </div>
                                        <button
                                            className={themeStyles.cardMenuBtn}
                                            onClick={() => setShowCardMenu(showCardMenu === card.id ? null : card.id)}
                                        >
                                            <MoreVertical size={20} />
                                        </button>

                                        {showCardMenu === card.id && (
                                            <div className={themeStyles.cardMenu}>
                                                <button
                                                    className={themeStyles.editBtn}
                                                    onClick={() => handleEditCard(card)}
                                                >
                                                    <Edit size={16} />
                                                    Kartı Düzenle
                                                </button>
                                                <button
                                                    className={themeStyles.deleteBtn}
                                                    onClick={() => handleDeleteCard(card.id)}
                                                >
                                                    <Trash2 size={16} />
                                                    Kartı Sil
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={themeStyles.noCards}>Kayıtlı kart bulunmuyor</p>
                        )}
                    </div>

                </div>

                {/* ---------- KARANLIK MOD CARD ---------- */}
                <div className={themeStyles.settingsCard}>
                    <div className={themeStyles.section}>
                        <h2 className={themeStyles.sectionTitle}>Karanlık Mod</h2>
                        <p className={themeStyles.sectionDescription}>
                            Uygulama temasını değiştirmek için karanlık modu açıp kapatabilirsiniz.
                        </p>

                        <div className={themeStyles.darkModeCard}>
                            <div className={themeStyles.darkModeRow}>
                                <Sun size={22} />
                                <span>Karanlık Mod</span>
                                <Moon size={22} />
                            </div>

                            <CustomSwitch value={isDark} onChange={toggleTheme} />
                        </div>
                    </div>
                </div>
            </div>

            {/* KART EKLEME MODAL */}
            {showAddCardModal && (
                <div className={themeStyles.modalOverlay} onClick={() => {
                    setShowAddCardModal(false);
                    setEditingCard(null);
                }}>
                    <div className={themeStyles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={themeStyles.modalHeader}>
                            <h2>{editingCard ? "Kartı Düzenle" : "Yeni Kart Ekle"}</h2>
                            <button
                                className={themeStyles.closeBtn}
                                onClick={() => {
                                    setShowAddCardModal(false);
                                    setEditingCard(null);
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddCard} className={themeStyles.cardForm}>
                            <div className={themeStyles.formGroup}>
                                <label>Banka Adı</label>
                                <input
                                    type="text"
                                    name="bankName"
                                    value={newCard.bankName}
                                    onChange={handleCardInputChange}
                                    placeholder="Garanti BBVA"
                                    required
                                />
                            </div>

                            <div className={themeStyles.formGroup}>
                                <label>Kart Üzerindeki İsim</label>
                                <input
                                    type="text"
                                    name="cardName"
                                    value={newCard.cardName}
                                    onChange={handleCardInputChange}
                                    placeholder="AD SOYAD"
                                    required
                                />
                            </div>

                            <div className={themeStyles.formGroup}>
                                <label>Kart Numarası</label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={newCard.cardNumber}
                                    onChange={handleCardInputChange}
                                    placeholder="0000 0000 0000 0000"
                                    required
                                />
                            </div>

                            <div className={themeStyles.formRow}>
                                <div className={themeStyles.formGroup}>
                                    <label>Son Kullanma</label>
                                    <input
                                        type="text"
                                        name="expiryDate"
                                        value={newCard.expiryDate}
                                        onChange={handleCardInputChange}
                                        placeholder="MM/YY"
                                        required
                                    />
                                </div>

                                <div className={themeStyles.formGroup}>
                                    <label>CVV</label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        value={newCard.cvv}
                                        onChange={handleCardInputChange}
                                        placeholder="000"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={themeStyles.modalButtons}>
                                <button
                                    type="button"
                                    className={themeStyles.cancelBtn}
                                    onClick={() => {
                                        setShowAddCardModal(false);
                                        setEditingCard(null);
                                    }}
                                >
                                    İptal
                                </button>
                                <button type="submit" className={themeStyles.saveBtn}>
                                    {editingCard ? "Değişiklikleri Kaydet" : "Kartı Kaydet"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}