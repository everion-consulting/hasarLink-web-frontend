import React, { useState, useEffect } from "react";
import "../../styles/contact.css";

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
        <div className="contact-page">
            <div className="contact-header">
                <h1>İletişime Geç</h1>
                <p>
                    Aşağıdaki formu doldurarak bize istek, dilek, şikayet veya yardım
                    taleplerinizi iletebilirsiniz.
                </p>
            </div>

            <div className="contact-card">
                {/* Ad Soyad */}
                <label>Ad Soyad</label>
                <input
                    type="text"
                    placeholder="Ahmet Yılmaz"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />

                {/* Konu */}
                <label>Konu</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                    <option value="">Konu seçiniz</option>
                    <option value="istek">İstek</option>
                    <option value="sikayet">Şikayet</option>
                    <option value="yardim">Yardım</option>
                </select>

                {/* Mesaj */}
                <label>Mesaj</label>
                <textarea
                    placeholder="İletmek istediğiniz mesajınızı yazınız."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                ></textarea>
            </div>

            <div className="contact-buttons">
                <button className="back-btn">← Geri Dön</button>
                <button className="next-btn" onClick={handleSend}>
                    Devam Et →
                </button>
            </div>
        </div>
    );
}
