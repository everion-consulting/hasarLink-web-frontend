import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Success from '../images/sonresim.png';
import styles from '../../styles/successScreen.module.css';

const SuccessScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        fileName = 'AXA–2025–00123',
        companyName = location.state?.selectedCompany?.name || '',
        documentCount = 6
    } = location.state || {};

    const handleGoHome = () => navigate('/', { replace: true });
    const handleNewFile = () => {
        localStorage.removeItem("submissionId");
        navigate('/insurance-select', { replace: true });
    };

    return (
        <div className={styles.successWrapper}>
            <div className={styles.successCard}>

                <h1 className={styles.successTitle}>TEBRİKLER!</h1>
                <p className={styles.successSubtitle}>İşleminiz başarıyla tamamlandı.</p>

                {/* Bilgi kutuları */}
                <div className={styles.infoBox}>
                    <span className={styles.infoLabel}>Dosya No</span>
                    <span className={styles.infoValue}>{fileName}</span>
                </div>

                <div className={styles.infoBox}>
                    <span className={styles.infoLabel}>Sigorta Şirketi</span>
                    <span className={styles.infoValue}>{companyName}</span>
                </div>

                <div className={styles.infoBox}>
                    <span className={styles.infoLabel}>Evraklar</span>
                    <span className={styles.infoValue}>{documentCount} Evrak Yüklendi</span>
                </div>

                {/* Resim */}
                <div className={styles.successImageArea}>
                    <img 
                        src={Success} 
                        className={styles.successIllustration} 
                        alt="success-illustration" 
                    />
                </div>

                {/* Butonlar */}
                <div className={styles.buttonArea}>
                    <button className={`${styles.btn} ${styles.btnBack}`} onClick={handleGoHome}>
                        <ArrowLeft size={18} />
                        ANA SAYFAYA DÖN
                    </button>

                    <button className={`${styles.btn} ${styles.btnFile}`} onClick={handleNewFile}>
                        YENİ DOSYA BİLDİR
                        <ArrowRight size={18} />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SuccessScreen;
