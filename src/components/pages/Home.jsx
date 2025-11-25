import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
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
    pending_files,
    favourite_insurance_companies
  } = dashboardData;

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="dashboard">

      <div className="dash-grid">
        {/* YENİ DOSYA */}
        <div className="card-dashboard card--new-file">
          <div>
            <img src={dosyaBildirIcon} alt="Dosya Bildir İkon" />
          </div>
          <div className="card-dashboard-title-sm">YENİ</div>
          <div className="card-dashboard-title-lg">DOSYA</div>
          <button 
            className="card-dashboard-btn" 
            onClick={handleNewFileClick} // 🔥 Değiştirildi
          >
            BİLDİR
          </button>
        </div>

        {/* ONAYLANANLAR */}
        <div className="card-dashboard card--approved">
          <h3 className="card-dashboard-heading">ONAYLANANLAR</h3>
          <p className="card-dashboard-count">
            <span className="card-dashboard-count-number">{counts.completed}</span> Dosya
          </p>
          <div>
            <img src={onaylananlarIcon} alt="Onaylananlar İkon" className="card-status-icon"/>
          </div>
        </div>

        {/* ONAY BEKLEYENLER */}
        <div className="card-dashboard card--pending">
          <h3 className="card-dashboard-heading">ONAY BEKLEYENLER</h3>
          <p className="card-dashboard-count">
            <span className="card-dashboard-count-number">{counts.pending}</span> Dosya
          </p>
          <div>
            <img src={onayBekleyenlerIcon} alt="Onay Bekleyenler İkon" className="card-status-icon"/>
          </div>
        </div>

        {/* TALEP EDİLEN TOPLAM TUTAR */}
        <div className="card-dashboard card--amount">
          <h3 className="card-dashboard-heading">TALEP EDİLEN TOPLAM TUTAR</h3>
          <p className="amount-main">{formatAmount(total_estimated_amount)} TL</p>
          <p className="amount-sub">
            Bu Ay {formatAmount(monthly_estimated_amount)} TL
          </p>
          <div>
            <img src={TalepEdilenIcon} alt="Talep Edilen Toplam İkon" className="card-requested-icon"/>
          </div>
        </div>

        {/* TASLAK BİLDİRİMLERİM */}
        <div className="card-dashboard card--drafts">
          <h3 className="card-dashboard-heading">
            TASLAK BİLDİRİMLERİM ({favourite_insurance_companies.length})
          </h3>

          <div className="inner-card">
            <div className="drafts-logos">
              {/* Her zaman 3 kutu gözüksün */}
              {[1, 2, 3].map((box, index) => (
                <div key={index} className="draft-logo">
                  {/* Şimdilik içerik yok, sadece boş kutu */}
                </div>
              ))}
            </div>

            <img
              src={TaslakBildirimlerIcon}
              alt="Taslak Bildirimlerim İkon"
              className="drafts-illustration"
            />
          </div>
        </div>


        {/* REDDEDİLEN DOSYALAR */}
        <div className="card-dashboard card--rejected">
          <h3 className="card-dashboard-heading">Reddedilen Dosyalar</h3>
          <p className="card-dashboard-count">
            <span className="card-dashboard-count-number">{counts.rejected}</span> Dosya
          </p>
          <button
            className="card-dashboard-btn card-dashboard-btn--light"
            onClick={() => navigate('/rejected')}
          >
            TÜMÜNÜ GÖR
          </button>
        </div>

        {/* DEVAM EDENLER */}
        <div className="card-dashboard card--ongoing">
          <h3 className="card-dashboard-heading">DEVAM EDENLER</h3>
          <ul className="ongoing-list">
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
          <button className="card-dashboard-btn card-dashboard-btn--light" onClick={() => navigate('/upload')}>
            YÜKLE
          </button>
        </div>

        {/* ALT SAĞ BÜYÜK KART */}
        <div className="card-dashboard card--bottom-right">
          <h3 className="card-dashboard-heading">TOPLAM İŞLEM</h3>
          <p className="card-dashboard-count">
            <span className="card-dashboard-count-number">{counts.total}</span> Dosya
          </p>
        </div>
      </div>
    </div>
  );
}