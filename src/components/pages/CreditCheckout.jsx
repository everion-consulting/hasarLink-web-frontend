import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../styles/creditCheckout.module.css";
import { CreditCard, Lock, CheckCircle, ArrowLeft } from "lucide-react";

export default function CreditCheckout() {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedPackage = location.state?.package;

    const [formData, setFormData] = useState({
        cardName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        billingAddress: "",
        city: "",
        postalCode: ""
    });

    const [processing, setProcessing] = useState(false);

    // Eğer paket bilgisi yoksa geri yönlendir
    if (!selectedPackage) {
        navigate("/kredi-satin-al");
        return null;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Kart numarası formatı (16 hane, 4'lük gruplar)
        if (name === "cardNumber") {
            const cleaned = value.replace(/\s/g, "");
            if (cleaned.length <= 16) {
                const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
                setFormData({ ...formData, [name]: formatted });
            }
            return;
        }

        // Son kullanma tarihi formatı (MM/YY)
        if (name === "expiryDate") {
            const cleaned = value.replace(/\D/g, "");
            if (cleaned.length <= 4) {
                const formatted = cleaned.length >= 2 
                    ? `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
                    : cleaned;
                setFormData({ ...formData, [name]: formatted });
            }
            return;
        }

        // CVV (3 hane)
        if (name === "cvv") {
            if (value.length <= 3) {
                setFormData({ ...formData, [name]: value.replace(/\D/g, "") });
            }
            return;
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        // TODO: Backend entegrasyonu eklenecek
        setTimeout(() => {
            setProcessing(false);
            alert(`${selectedPackage.credits} kredi başarıyla satın alındı! (Demo)`);
            navigate("/");
        }, 2000);
    };

    return (
        <div className={styles.checkoutContainer}>
            <button 
                className={styles.backButton}
                onClick={() => navigate("/kredi-satin-al")}
            >
                <ArrowLeft size={20} />
                Geri Dön
            </button>

            <div className={styles.checkoutGrid}>
                {/* SOL TARAF - Ödeme Formu */}
                <div className={styles.paymentSection}>
                    <div className={styles.sectionHeader}>
                        <Lock size={24} />
                        <h2>Güvenli Ödeme</h2>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.paymentForm}>
                        <div className={styles.formGroup}>
                            <label>Kart Üzerindeki İsim</label>
                            <input
                                type="text"
                                name="cardName"
                                value={formData.cardName}
                                onChange={handleInputChange}
                                placeholder="AD SOYAD"
                                required
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Kart Numarası</label>
                            <div className={styles.cardInputWrapper}>
                                <CreditCard size={20} className={styles.inputIcon} />
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={formData.cardNumber}
                                    onChange={handleInputChange}
                                    placeholder="0000 0000 0000 0000"
                                    required
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Son Kullanma Tarihi</label>
                                <input
                                    type="text"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    placeholder="MM/YY"
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>CVV</label>
                                <input
                                    type="text"
                                    name="cvv"
                                    value={formData.cvv}
                                    onChange={handleInputChange}
                                    placeholder="000"
                                    required
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.divider}></div>

                        <h3 className={styles.subTitle}>Fatura Adresi</h3>

                        <div className={styles.formGroup}>
                            <label>Adres</label>
                            <textarea
                                name="billingAddress"
                                value={formData.billingAddress}
                                onChange={handleInputChange}
                                placeholder="Fatura adresinizi giriniz"
                                required
                                className={styles.textarea}
                                rows={3}
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Şehir</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="İstanbul"
                                    required
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Posta Kodu</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleInputChange}
                                    placeholder="34000"
                                    required
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className={styles.submitButton}
                            disabled={processing}
                        >
                            {processing ? "İşleniyor..." : `${selectedPackage.price} TL Öde`}
                        </button>

                        <div className={styles.securityNote}>
                            <Lock size={16} />
                            <span>256-bit SSL ile güvenli ödeme</span>
                        </div>
                    </form>
                </div>

                {/* SAĞ TARAF - Sipariş Özeti */}
                <div className={styles.summarySection}>
                    <h2 className={styles.summaryTitle}>Sipariş Özeti</h2>

                    <div className={styles.packageSummary}>
                        <div className={styles.packageBadge}>
                            <CheckCircle size={24} />
                        </div>
                        <h3 className={styles.packageName}>{selectedPackage.credits} Kredi Paketi</h3>
                        <p className={styles.packageDesc}>
                            {selectedPackage.credits} adet dosya bildirimi hakkı
                        </p>
                    </div>

                    <div className={styles.summaryDetails}>
                        <div className={styles.summaryRow}>
                            <span>Kredi Sayısı</span>
                            <strong>{selectedPackage.credits} Kredi</strong>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Birim Fiyat</span>
                            <span>{(selectedPackage.price / selectedPackage.credits).toFixed(2)} TL/kredi</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Ara Toplam</span>
                            <span>{selectedPackage.price} TL</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>KDV (%20)</span>
                            <span>{(selectedPackage.price * 0.2).toFixed(2)} TL</span>
                        </div>
                        <div className={styles.divider}></div>
                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>Toplam</span>
                            <strong>{(selectedPackage.price * 1.2).toFixed(2)} TL</strong>
                        </div>
                    </div>

                    <div className={styles.featuresList}>
                        <h4>Paket Özellikleri</h4>
                        <ul>
                            {selectedPackage.features.map((feature, index) => (
                                <li key={index}>
                                    <CheckCircle size={16} />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.guaranteeBox}>
                        <Lock size={20} />
                        <div>
                            <strong>Güvenli Ödeme Garantisi</strong>
                            <p>Tüm ödemeleriniz SSL ile şifrelenir</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
