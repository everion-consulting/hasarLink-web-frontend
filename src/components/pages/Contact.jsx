import React, { useState, useEffect } from "react";
import styles from "../../styles/contact.module.css";

export default function Contact() {
    const [fullName, setFullName] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const name = localStorage.getItem("userName");
        if (name) setFullName(name);
    }, []);

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
                <label>Ad Soyad</label>
                <input
                    type="text"
                    placeholder="Ahmet Yılmaz"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />

                <label>Konu</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                    <option value="">Konu seçiniz</option>
                    <option value="istek">İstek</option>
                    <option value="sikayet">Şikayet</option>
                    <option value="yardim">Yardım</option>
                </select>

                <label>Mesaj</label>
                <textarea
                    placeholder="İletmek istediğiniz mesajınızı yazınız."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                ></textarea>
            </div>

            <div className={styles.contactButtons}>
                <button className={styles.backBtn}>← Geri Dön</button>
                <button className={styles.nextBtn} onClick={handleSend}>
                    Devam Et →
                </button>
            </div>
        </div>
    );
}