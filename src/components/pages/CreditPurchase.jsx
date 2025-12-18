import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/creditPurchase.module.css";
import { CreditCard, Sparkles, CheckCircle } from "lucide-react";
import apiService from "../../services/apiServices";

export default function CreditPurchase() {
    const navigate = useNavigate();
    const [remainingCredits, setRemainingCredits] = useState(0);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const infoRef = useRef(null);
    const [infoVisible, setInfoVisible] = useState(false);

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const response = await apiService.getProfileDetail();
                if (response?.success) {
                    const credits = response?.data?.credits ?? response?.data?.data?.credits ?? 0;
                    setRemainingCredits(credits);
                    console.log("✅ Mevcut kredi:", credits);
                }
            } catch (error) {
                console.error("Kredi bilgisi alınamadı:", error);
            }
        };
        fetchCredits();
    }, []);

    useEffect(() => {
        const el = infoRef.current;
        if (!el) return;

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInfoVisible(true);
                    io.disconnect(); // 1 kere oynasın
                }
            },
            { threshold: 0.2 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, []);

    const steps = [
        { no: 1, title: "Kredi Satın Alın", desc: "Size uygun kredi paketini seçin ve güvenli ödeme ile satın alın" },
        { no: 2, title: "Dosya Bildirin", desc: "Her dosya bildirimi için 1 kredi kullanılır" },
        { no: 3, title: "Taslak Oluşturun", desc: "Krediniz bitse bile taslak oluşturabilirsiniz" },
        { no: 4, title: "Krediler Bitmez", desc: "Satın aldığınız kredilerin son kullanma tarihi yoktur" },
    ];

    const creditPackages = [
        {
            id: 1,
            credits: 10,
            price: 99,
            popular: false,
            features: ["10 Dosya Bildirimi", "Standart Destek"]
        },
        {
            id: 2,
            credits: 25,
            price: 219,
            popular: true,
            features: ["25 Dosya Bildirimi", "Öncelikli Destek", "%12 İndirim"]
        },
        {
            id: 3,
            credits: 50,
            price: 399,
            popular: false,
            features: ["50 Dosya Bildirimi", "Öncelikli Destek", "%20 İndirim"]
        },
        {
            id: 4,
            credits: 100,
            price: 699,
            popular: false,
            features: ["100 Dosya Bildirimi", "Premium Destek", "%30 İndirim"]
        }
    ];

    const handlePurchase = (pkg) => {
        setSelectedPackage(pkg);
        // Ödeme sayfasına yönlendir
        navigate("/kredi-odeme", {
            state: { package: pkg }
        });
    };

    return (
        <div className={styles.creditPurchaseContainer}>
            <div className={styles.headerSection}>
                <div className={styles.headerContent}>
                    <h1 className={styles.pageTitle}>
                        Kredi Satın Al
                        <Sparkles className={styles.headerIcon} size={48} />
                    </h1>
                    <p className={styles.pageSubtitle}>
                        Dosya bildirimleriniz için kredi satın alın ve işlemlerinizi kesintisiz sürdürün
                    </p>
                </div>

                <div className={styles.currentCredits}>
                    <CreditCard size={32} />
                    <div className={styles.creditInfo}>
                        <span className={styles.creditLabel}>Mevcut Krediniz</span>
                        <span className={styles.creditCount}>{remainingCredits} Kredi</span>
                    </div>
                </div>
            </div>

            <div className={styles.packagesGrid}>
                {creditPackages.map((pkg) => (
                    <div
                        key={pkg.id}
                        className={`${styles.packageCard} ${pkg.popular ? styles.popular : ""}`}
                    >
                        {pkg.popular && (
                            <div className={styles.popularBadge}>
                                <Sparkles size={16} />
                                En Popüler
                            </div>
                        )}

                        <div className={styles.packageHeader}>
                            <h3 className={styles.packageCredits}>{pkg.credits} Kredi</h3>
                            <div className={styles.packagePrice}>
                                <span className={styles.priceAmount}>{pkg.price} TL</span>
                                <span className={styles.pricePerCredit}>
                                    ({(pkg.price / pkg.credits).toFixed(2)} TL/kredi)
                                </span>
                            </div>
                        </div>

                        <ul className={styles.featuresList}>
                            {pkg.features.map((feature, index) => (
                                <li key={index} className={styles.featureItem}>
                                    <CheckCircle size={18} className={styles.checkIcon} />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            className={`${styles.purchaseBtn} ${pkg.popular ? styles.popularBtn : ""}`}
                            onClick={() => handlePurchase(pkg)}
                        >
                            Satın Al
                        </button>
                    </div>
                ))}
            </div>

            <div ref={infoRef}
                className={`${styles.infoSection} ${infoVisible ? styles.infoVisible : ""}`}>
                <h2 className={styles.infoTitle}>Kredi Sistemi Nasıl Çalışır?</h2>
                <div className={styles.infoGrid}>
                    {steps.map((s, i) => (
                        <div
                            key={s.no}
                            className={styles.infoCard}
                            style={{ animationDelay: `${i * 120}ms` }}
                        >
                            <div className={styles.infoNumber}>{s.no}</div>
                            <h3>{s.title}</h3>
                            <p>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
