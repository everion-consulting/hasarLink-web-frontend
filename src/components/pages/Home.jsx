import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/dashboard.module.css";
import apiService from "../../services/apiServices";
import dosyaBildirIcon from "../../assets/images/dosyaBildir.svg";
import TaslakBildirimlerIcon from "../../assets/images/taslakBildirimler.svg";
import TalepEdilenIcon from "../../assets/images/talepEdilen.svg";
import onaylananlarIcon from "../../assets/images/onaylananlar.svg";
import onayBekleyenlerIcon from "../../assets/images/onayBekleyenler.svg";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";



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
    recent_incomplete_companies: []
  });

  const [remainingCredits, setRemainingCredits] = useState(10); 
  const [loading, setLoading] = useState(true);
  const goToOngoing = () => {
    navigate("/ongoing-files");
  };

  async function fetchCounts() {
    try {
      const res = await apiService.getFileSubmissionCounts();

      if (!res?.success) {
        console.error("❌ Dosya sayıları alınamadı:", res?.message);
        // web tarafında Alert yok → window.alert kullan
        window.alert(res?.message || "Dosya sayıları alınamadı.");
        return;
      }

      const data = res?.data?.data || res?.data || {};

      setDashboardData({
        counts: data.counts ?? {
          not_completed: 0,
          in_progress: 0,
          pending: 0,
          rejected: 0,
          total: 0,
          completed: 0,
          this_month_total: 0,
        },
        pending_files: Array.isArray(data.pending_files) ? data.pending_files : [],
        total_estimated_amount: data.total_estimated_amount ?? 0,
        monthly_estimated_amount: data.monthly_estimated_amount ?? 0,
        // ✅ yeni alanlar
        total_favourite_companies: data.total_favourite_companies ?? 0,
        favourite_insurance_companies: Array.isArray(data.favourite_insurance_companies)
          ? data.favourite_insurance_companies
          : [],
        recent_incomplete_companies: Array.isArray(data.recent_incomplete_companies)
          ? data.recent_incomplete_companies
          : [],
      });
    } catch (err) {
      console.error("❌ fetchCounts hata:", err);
      setDashboardData({
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
        recent_incomplete_companies: [],
      });
    }
  }


  async function fetchDraftCount() {
    try {
      const res = await apiService.getDrafts();
      if (res?.success) {
        setDashboardData((prev) => ({
          ...prev,
          counts: {
            ...prev.counts,
          },
        }));
      } else {
        console.error("Taslak bildirimler alınamadı:", res?.message);
      }
    } catch (error) {
      console.error("Taslak bildirimler alınırken hata:", error);
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
    fetchDraftCount();
    fetchProfile();
  }, []);

  // 🔥 YENİ: Bildir butonuna tıklanınca submissionId'yi sil
  const handleNewFileClick = () => {
    // localStorage'dan submissionId'yi sil
    localStorage.removeItem("submissionId");
    console.log("🗑️ Dashboard: submissionId silindi");

    // InsuranceSelect sayfasına yönlendir
    navigate('/insurance-select');
  };

  const {
    counts,
    total_estimated_amount,
    monthly_estimated_amount,
    favourite_insurance_companies,
    recent_incomplete_companies
  } = dashboardData;

  const formatAmount = (amount) =>
    new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashGrid}>

        {/* YENİ DOSYA */}
        <div
          className={`${styles.cardDashboard} ${styles.cardNewFile}`}
          onClick={handleNewFileClick}
          style={{ cursor: "pointer" }}
        >
          <img
            src={dosyaBildirIcon}
            alt="Dosya Bildir İkon"
            className={styles.dosyaBildirIcon}
          />

          <div className={styles.cardDashboardTitleSm}>YENİ</div>
          <div className={styles.cardDashboardTitleLg}>DOSYA</div>

          {remainingCredits > 0 ? (
            <div className={styles.remainingCredits}>
              Kalan Kredi: <span className={styles.creditNumber}>{remainingCredits}</span>
            </div>
          ) : (
            <div className={styles.noCreditWarning}>
              Krediniz bitti! Dosya bildirmek için kredi satın alın
            </div>
          )}

          <button
            className={styles.cardDashboardBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleNewFileClick();
            }}
          >
            BİLDİR
          </button>
        </div>


        {/* Bildirimi Yapılanlar */}
        <div
          className={`${styles.cardDashboard} ${styles.cardApproved}`}
          onClick={() => navigate("/notified-screen")}
          style={{ cursor: "pointer" }}
        >
          <h3 className={styles.cardDashboardHeading}>BİLDİRİMİ YAPILANLAR</h3>

          <p className={styles.cardDashboardCount}>
            <span className={styles.cardDashboardCountNumber}>
              {dashboardData.counts.completed}
            </span>{" "}
            Dosya
          </p>

          <img
            src={onaylananlarIcon}
            className={styles.cardStatusIcon}
            alt="İkon"
          />
        </div>

        {/* İŞLEME ALINANLAR */}
        <div
          className={`${styles.cardDashboard} ${styles.cardPending}`}
          onClick={() => navigate("/processed-screen")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate("/processed-screen")}
        >
          <h3 className={styles.cardDashboardHeading}>İŞLEME ALINANLAR</h3>
          <p className={styles.cardDashboardCount}>
            <span className={styles.cardDashboardCountNumber}>
              {dashboardData.counts.in_progress ?? 0}
            </span>{" "}
            Dosya
          </p>
          <img
            src={onayBekleyenlerIcon}
            className={styles.cardStatusIcon}
            alt="İkon"
          />
        </div>


        {/* TALEP EDİLEN TOPLAM TUTAR */}
        <div className={`${styles.cardDashboard} ${styles.cardAmount}`}>
          <h3 className={styles.cardDashboardHeading}>TALEP EDİLEN TOPLAM TUTAR</h3>

          <p className={styles.amountMain}>{formatAmount(dashboardData.total_estimated_amount)} TL</p>
          <p className={styles.amountSub}>Bu Ay {formatAmount(dashboardData.monthly_estimated_amount)} TL</p>

          <img src={TalepEdilenIcon} className={styles.cardRequestedIcon} alt="İkon" />
        </div>

        {/* TASLAK BİLDİRİMLERİM */}
        <div className={`${styles.cardDashboard} ${styles.cardDrafts}`}>
          <h3 className={styles.cardDashboardHeading}>
            TASLAK BİLDİRİMLERİM ({dashboardData.counts.not_completed})
          </h3>

          <div className={styles.innerCard}>
            <div className={styles.draftsLogos}>
              {(dashboardData.recent_incomplete_companies ?? []).map((item) => (
                <div key={item.id} className={styles.draftLogo}>
                  <img className={styles.sigortaIcon} src={item.photo} alt={item.name} />
                </div>
              ))}
            </div>
            <img
              src={TaslakBildirimlerIcon}
              alt="Taslak Bildirimlerim"
              className={styles.draftsIllustration}
            />
          </div>

          <button
            className={styles.cardDashboardBtn}
            onClick={() => navigate('/draft-notifications')}
          >
            TAMAMLA
          </button>
        </div>

        {/* REDDEDİLEN DOSYALAR */}
        <div className={`${styles.cardDashboard} ${styles.cardRejected}`}>
          <h3 className={styles.cardDashboardHeading}>Reddedilen Dosyalar</h3>
          <p className={styles.cardDashboardCount}>
            <span className={styles.cardDashboardCountNumber}>{counts.rejected}</span> Dosya
          </p>

          <button
            className={`${styles.cardDashboardBtn} ${styles.cardDashboardBtnLight}`}
            onClick={() => navigate('/reddedilen-dosyalar')}
          >
            TÜMÜNÜ GÖR
          </button>
        </div>

        {/* DEVAM EDENLER */}
        <div
          className={`${styles.cardDashboard} ${styles.cardOngoing}`}
          onClick={goToOngoing}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && goToOngoing()}
        >
          <h3 className={styles.cardDashboardHeading}>DEVAM EDENLER</h3>

          <ul className={styles.ongoingList}>
            {counts.pending > 0 ? (
              <>
              
                <li>Devam eden dosya sayısı: {counts.pending}</li>

              </>
            ) : (
              <li>Devam eden dosya bulunmuyor</li>
            )}
          </ul>

          <button
            type="button"
            className={`${styles.cardDashboardBtn} ${styles.cardDashboardBtnLight}`}
            onClick={(e) => {
              e.stopPropagation();
              goToOngoing();
            }}
          >
            TÜMÜNÜ GÖR
          </button>


        </div>
        {/* BU AY AÇILAN DOSYA SAYISI */}
        <div
          className={`${styles.cardDashboard} ${styles.cardBottomRight}`}
          onClick={() => navigate("/monthly-files")}
          style={{ cursor: "pointer" }}
        >
          <div className={styles.cardBottomRightInner}>
            {/* SOL TARAF */}
            <div className={styles.cardBottomRightText}>
              <h3 className={styles.cardDashboardHeading}>
                BU AY AÇILAN DOSYA SAYISI
              </h3>

              <p className={`${styles.cardDashboardCount} ${styles.cardBottomRightCount}`}>
                <span className={styles.cardDashboardCountNumber}>
                  {counts.this_month_total ?? 0}
                </span>{" "}
                Dosya
              </p>
            </div>

            {/* SAĞ TARAF */}
            <div className={styles.cardBottomRightSide}>
              <CalendarDaysIcon width={50} height={50} color="#133E87" />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/monthly-files");
                }}
                className={`${styles.cardDashboardBtn} ${styles.cardDashboardBtnLight} ${styles.cardBottomRightButton}`}
              >
                TÜMÜNÜ GÖR
              </button>
            </div>
          </div>
        </div>




      </div>
    </div>
  );
}