import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Success from '../images/sonresim.png';
import styles from '../../styles/successScreen.module.css';
import BackIcon from "../../components/images/back.svg";
import ContinueIcon from "../../components/images/continue.svg";

const SuccessScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state || {};

    const fileName = state.fileName ?? 'AXA–2025–00123';
    const companyName =
        state.companyName ??
        state.selectedCompany?.name ??
        state.selectedCompany?.company_name ??
        '';

   const documentCount = (() => {
  if (typeof state.documentCount === "number") return state.documentCount;

  const stored = localStorage.getItem("total");
  const n = stored ? parseInt(stored, 10) : 0;
  console.log("SuccessScreen stored total:", localStorage.getItem("total"));

  return Number.isFinite(n) ? n : 0;
})();

    const handleGoHome = () => {
        localStorage.removeItem("total");
        navigate('/', { replace: true });
    };

    const handleNewFile = () => {
        localStorage.removeItem("submissionId");
        localStorage.removeItem("total");
        navigate('/insurance-select', { replace: true });
    };


    return (
        <div className={styles.successWrapper}>
            <div className={styles.successCard}>

                <h1 className={styles.successTitle}>TEBRİKLER!</h1>
                <p className={styles.successSubtitle}>İşleminiz başarıyla tamamlandı.</p>

                {/* Bilgi kutuları */}
                <div className={styles.infoGrid}>

                    <div className={`${styles.infoBox} ${styles.fullWidthBox}`}>

                        <span className={styles.infoLabel}>Sigorta Şirketi</span>
                        <span className={styles.infoValue}>{companyName}</span>
                    </div>

                    <div className={`${styles.infoBox} ${styles.fullWidthBox}`}>
                        <span className={styles.infoLabel}>Evraklar</span>
                        <span className={styles.infoValue}>{documentCount} Evrak Yüklendi</span>
                    </div>
                </div>


                {/* Resim */}
                <div className={styles.successImageArea}>
                    <img
                        src={Success}
                        className={styles.successIllustration}
                        alt="success-illustration"
                    />
                </div>

                <div className={styles.footerButtonsColumn}>

                    {/* ANA SAYFAYA DÖN */}
                    <button
                        className={styles.backBtn}
                        onClick={handleGoHome}
                    >
                        <div className={styles.iconCircle}>
                            <img src={BackIcon} alt="geri" />
                        </div>

                        <span className={styles.btnText}>ANA SAYFAYA DÖN</span>
                    </button>

                    {/* YENİ DOSYA BİLDİR */}
                    <button
                        className={styles.nextBtn}
                        onClick={handleNewFile}
                    >
                        <span className={styles.btnText}>YENİ DOSYA BİLDİR</span>

                        <div className={styles.iconCircle}>
                            <img src={ContinueIcon} alt="devam" />
                        </div>
                    </button>

                </div>

            </div>
        </div>
    );
};

export default SuccessScreen;
