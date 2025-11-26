import React, { useState, useEffect, useRef } from "react";
import styles from "../../styles/contact.module.css";
import { ChevronDown, MessageSquare, User, HelpCircle } from "lucide-react";

export default function Contact() {
    const [fullName, setFullName] = useState("");
    const [subject, setSubject] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [message, setMessage] = useState("");

    const dropdownRef = useRef(null);

    useEffect(() => {
        const name = localStorage.getItem("userName");
        if (name) setFullName(name);
    }, []);

    // Dropdown dışına tıklanınca kapat
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        }

        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen]);

    const handleSend = () => {
        if (!fullName || !subject || !message) {
            alert("Lütfen tüm alanları doldurunuz.");
            return;
        }
        alert("Mesajınız gönderildi!");
    };

    return (
        <div className={styles.contactPage}>
            <div className={styles.contactHeader}>
                <h1>İletişime Geç</h1>
                <p>
                    Aşağıdaki formu doldurarak bize istek, dilek, şikayet veya yardım
                    taleplerinizi iletebilirsiniz.
                </p>
            </div>

            <div className={styles.contactCard}>

                {/* Ad Soyad */}
                <label>Ad Soyad</label>
                <div className={styles.inputBox}>
                    <User className={styles.inputIcon} size={18} />
                    <input
                        type="text"
                        placeholder="Ahmet Yılmaz"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                </div>

                {/* Konu (Custom Dropdown) */}
                <label>Konu</label>

                <div className={styles.dropdownWrapper} ref={dropdownRef}>
                    <div
                        className={styles.dropdown}
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <HelpCircle className={styles.inputIcon} size={18} />

                        <span className={subject ? styles.selected : styles.placeholder}>
                            {subject || "Konu seçiniz"}
                        </span>

                        <ChevronDown
                            className={`${styles.chevron} ${dropdownOpen ? styles.rotate : ""}`}
                            size={20}
                        />
                    </div>

                    {dropdownOpen && (
                        <div className={styles.dropdownMenu}>
                            <div onClick={() => { setSubject("İstek"); setDropdownOpen(false); }}>
                                İstek
                            </div>
                            <div onClick={() => { setSubject("Şikayet"); setDropdownOpen(false); }}>
                                Şikayet
                            </div>
                            <div onClick={() => { setSubject("Yardım"); setDropdownOpen(false); }}>
                                Yardım
                            </div>
                        </div>
                    )}
                </div>

                {/* Mesaj */}
                <label>Mesaj</label>
                <div className={styles.textareaBox}>
                    <MessageSquare className={styles.textareaIcon} size={18} />
                    <textarea
                        placeholder="İletmek istediğiniz mesajınızı yazınız."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                </div>

            </div>

            <div className={styles.contactButtons}>

                {/* Geri Dön */}
                <button className={styles.backBtn}>
                    <span className={styles.contactBtnIcon}>
                        <img src="/src/assets/images/left-icon-black.svg" alt="Geri Dön Ok" />
                    </span>
                    GERİ DÖN
                </button>

                {/* Devam Et */}
                <button className={styles.nextBtn} onClick={handleSend}>
                    DEVAM ET
                    <span className={styles.contactBtnIcon}>
                        <img src="/src/assets/images/right-icon-white.svg" alt="Devam Et Ok" />
                    </span>
                </button>

            </div>

        </div>
    );
}