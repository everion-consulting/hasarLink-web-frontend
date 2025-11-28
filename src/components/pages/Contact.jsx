import React, { useState, useEffect, useRef } from "react";
import styles from "../../styles/contact.module.css";
import { ChevronDown, MessageSquare, Mail, HelpCircle } from "lucide-react";
import apiService from "../../services/apiServices";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Contact() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const dropdownRef = useRef(null);

    useEffect(() => {
        const storedEmail = localStorage.getItem("userEmail");
        if (storedEmail) setEmail(storedEmail);
    }, []);

    // Dropdown dışına tıklayınca kapansın
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);

    }, [dropdownOpen]);

    // FORM GÖNDER — BACKEND'E POST + TOAST
    const handleSend = async () => {
        if (!email.trim() || !subject.trim() || !message.trim()) {
            toast.error("Lütfen tüm alanları doldurunuz.");
            return;
        }

        const payload = {
            email,
            title: subject,
            message,
        };

        const loadingToast = toast.loading("Gönderiliyor...");

        const res = await apiService.sendContactForm(payload);

        toast.dismiss(loadingToast);

        if (res?.success) {
            toast.success("Mesajınız başarıyla gönderildi!");
            setSubject("");
            setMessage("");
            setDropdownOpen(false);
        } else {
            toast.error(res?.error || res?.message || "Mesaj gönderilemedi!");
        }
    };

    return (
        <div className={styles.contactPage}>
            <div className={styles.contactHeader}>
                <h1>İletişime Geç</h1>
                <p>
                    Aşağıdaki formu doldurarak bize istek, dilek, şikayet veya yardım taleplerinizi iletebilirsiniz.
                </p>
            </div>

            <div className={styles.contactCard}>

                {/* Mail */}
                <label>Mail</label>
                <div className={styles.inputBox}>
                    <Mail className={styles.inputIcon} size={18} />
                    <input
                        type="email"
                        placeholder="E-posta adresiniz"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Konu */}
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
                            <div onClick={() => { setSubject("İstek"); setDropdownOpen(false); }}>İstek</div>
                            <div onClick={() => { setSubject("Şikayet"); setDropdownOpen(false); }}>Şikayet</div>
                            <div onClick={() => { setSubject("Yardım"); setDropdownOpen(false); }}>Yardım</div>
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

            {/* Butonlar */}
            <div className={styles.contactButtons}>

                <button className={styles.backBtn} onClick={() => navigate(-1)}>
                    <span className={styles.contactBtnIcon}>
                        <img src="/src/assets/images/left-icon-black.svg" alt="Geri" />
                    </span>
                    GERİ DÖN
                </button>

                <button className={styles.nextBtn} onClick={handleSend}>
                    GÖNDER
                    <span className={styles.contactBtnIcon}>
                        <img src="/src/assets/images/right-icon-white.svg" alt="Gönder" />
                    </span>
                </button>

            </div>

        </div>
    );
}