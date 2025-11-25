import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/dashboard.module.css";
import apiService from "../../services/apiServices";
import dosyaBildirIcon from "../../assets/images/dosyaBildir.svg";
import TaslakBildirimlerIcon from "../../assets/images/taslakBildirimler.svg";
import TalepEdilenIcon from "../../assets/images/talepEdilen.svg";
import onaylananlarIcon from "../../assets/images/onaylananlar.svg";
import onayBekleyenlerIcon from "../../assets/images/onayBekleyenler.svg";

export default function Dashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    counts: {
      not_completed: 0,
      in_progress: 0,
      pending: 0,
      rejected: 0,
      total: 0,
      completed: 0,
      this_month_total: 0,
    },
    pending_files: [],
    total_estimated_amount: 0,
    monthly_estimated_amount: 0,
    total_favourite_companies: 0,
    favourite_insurance_companies: [],
  });

  const [loading, setLoading] = useState(true);

  async function fetchCounts() {
    try {
      setLoading(true);
      const res = await apiService.getFileSubmissionCounts();

      if (!res?.success) {
        console.error("❌ Dosya sayıları alınamadı:", res?.message);
        return;
      }

      const data = res?.data;

      setDashboardData({
        counts: {
          not_completed: data?.counts?.not_completed ?? 0,
          in_progress: data?.counts?.in_progress ?? 0,
          pending: data?.counts?.pending ?? 0,
          rejected: data?.counts?.rejected ?? 0,
          total: data?.counts?.total ?? 0,
          completed: data?.counts?.completed ?? 0,
          this_month_total: data?.counts?.this_month_total ?? 0,
        },
        pending_files: data?.pending_files ?? [],
        total_estimated_amount: data?.total_estimated_amount ?? 0,
        monthly_estimated_amount: data?.monthly_estimated_amount ?? 0,
        total_favourite_companies: data?.total_favourite_companies ?? 0,
        favourite_insurance_companies: data?.favourite_insurance_companies ?? [],
      });
    } catch (error) {
      console.error("❌ FetchCounts Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile() {
    try {
      const res = await apiService.getProfileDetail();
      if (!res?.success) {
        console.error("❌ Profil alınamadı:", res?.message);
      }
    } catch (error) {
      console.error("❌ Profil Hatası:", error);
    }
  }

  useEffect(() => {
    fetchCounts();
    fetchProfile();
  }, []);

  const {
    counts,
    total_estimated_amount,
    monthly_estimated_amount,
    favourite_insurance_companies
  } = dashboardData;

  const formatAmount = (amount) =>
    new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashGrid}>

        {/* YENİ DOSYA */}
        <div className={`${styles.cardDashboard} ${styles.cardNewFile}`}>
          <img src={dosyaBildirIcon} alt="Dosya Bildir İkon" className={styles.dosyaBildirIcon}/>
          <div className={styles.cardDashboardTitleSm}>YENİ</div>
          <div className={styles.cardDashboardTitleLg}>DOSYA</div>
          <button className={styles.cardDashboardBtn} onClick={() => navigate('/insurance-select')}>
            BİLDİR
          </button>
        </div>

        {/* ONAYLANANLAR */}
        <div className={`${styles.cardDashboard} ${styles.cardApproved}`}>
          <h3 className={styles.cardDashboardHeading}>ONAYLANANLAR</h3>
          <p className={styles.cardDashboardCount}>
            <span className={styles.cardDashboardCountNumber}>{counts.completed}</span> Dosya
          </p>
          <img src={onaylananlarIcon} className={styles.cardStatusIcon} alt="İkon" />
        </div>

        {/* ONAY BEKLEYENLER */}
        <div className={`${styles.cardDashboard} ${styles.cardPending}`}>
          <h3 className={styles.cardDashboardHeading}>ONAY BEKLEYENLER</h3>
          <p className={styles.cardDashboardCount}>
            <span className={styles.cardDashboardCountNumber}>{counts.pending}</span> Dosya
          </p>
          <img src={onayBekleyenlerIcon} className={styles.cardStatusIcon} alt="İkon" />
        </div>

        {/* TALEP EDİLEN TOPLAM TUTAR */}
        <div className={`${styles.cardDashboard} ${styles.cardAmount}`}>
          <h3 className={styles.cardDashboardHeading}>TALEP EDİLEN TOPLAM TUTAR</h3>

          <p className={styles.amountMain}>{formatAmount(total_estimated_amount)} TL</p>
          <p className={styles.amountSub}>Bu Ay {formatAmount(monthly_estimated_amount)} TL</p>

          <img src={TalepEdilenIcon} className={styles.cardRequestedIcon} alt="İkon" />
        </div>

        {/* TASLAK BİLDİRİMLERİM */}
        <div className={`${styles.cardDashboard} ${styles.cardDrafts}`}>
          <h3 className={styles.cardDashboardHeading}>
            TASLAK BİLDİRİMLERİM ({favourite_insurance_companies.length})
          </h3>

          <div className={styles.innerCard}>
            <div className={styles.draftsLogos}>
              {[1, 2, 3].map((_, i) => (
                <div key={i} className={styles.draftLogo} />
              ))}
            </div>

            <img
              src={TaslakBildirimlerIcon}
              alt="Taslak Bildirimlerim"
              className={styles.draftsIllustration}
            />
          </div>
        </div>

        {/* REDDEDİLEN DOSYALAR */}
        <div className={`${styles.cardDashboard} ${styles.cardRejected}`}>
          <h3 className={styles.cardDashboardHeading}>Reddedilen Dosyalar</h3>
          <p className={styles.cardDashboardCount}>
            <span className={styles.cardDashboardCountNumber}>{counts.rejected}</span> Dosya
          </p>

          <button
            className={`${styles.cardDashboardBtn} ${styles.cardDashboardBtnLight}`}
            onClick={() => navigate('/rejected')}
          >
            TÜMÜNÜ GÖR
          </button>
        </div>

        {/* DEVAM EDENLER */}
        <div className={`${styles.cardDashboard} ${styles.cardOngoing}`}>
          <h3 className={styles.cardDashboardHeading}>DEVAM EDENLER</h3>

          <ul className={styles.ongoingList}>
            {counts.in_progress > 0 ? (
              <>
                <li>Devam eden dosya sayısı: {counts.in_progress}</li>
                <li>Tamamlanmamış: {counts.not_completed}</li>
                <li>Bu ay açılan: {counts.this_month_total}</li>
              </>
            ) : (
              <li>Devam eden dosya bulunmuyor</li>
            )}
          </ul>

          <button
            className={`${styles.cardDashboardBtn} ${styles.cardDashboardBtnLight}`}
            onClick={() => navigate('/upload')}
          >
            YÜKLE
          </button>
        </div>

        {/* ALT SAĞ BÜYÜK KART */}
        <div className={`${styles.cardDashboard} ${styles.cardBottomRight}`}>
          <h3 className={styles.cardDashboardHeading}>TOPLAM İŞLEM</h3>
          <p className={styles.cardDashboardCount}>
            <span className={styles.cardDashboardCountNumber}>{counts.total}</span> Dosya
          </p>
        </div>

      </div>
    </div>
  );
}