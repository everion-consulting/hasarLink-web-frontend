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
        <div className="card card--new-file">
          <div>
            <img src={dosyaBildirIcon} alt="Dosya Bildir İkon" />
          </div>
          <div className="card-title-sm">YENİ</div>
          <div className="card-title-lg">DOSYA</div>
          <button className="card-btn" onClick={() => navigate('/new-file')}>
            BİLDİR
          </button>
        </div>

        {/* ONAYLANANLAR */}
        <div className="card card--approved">
          <h3 className="card-heading">ONAYLANANLAR</h3>
          <p className="card-count">
            <span className="card-count-number">{counts.completed}</span> Dosya
          </p>
          <div>
            <img src={onaylananlarIcon} alt="Onaylananlar İkon" />
          </div>
        </div>

        {/* ONAY BEKLEYENLER */}
        <div className="card card--pending">
          <h3 className="card-heading">ONAY BEKLEYENLER</h3>
          <p className="card-count">
            <span className="card-count-number">{counts.pending}</span> Dosya
          </p>
          <div>
            <img src={onayBekleyenlerIcon} alt="Onay Bekleyenler İkon" />
          </div>
        </div>

        {/* TALEP EDİLEN TOPLAM TUTAR */}
        <div className="card card--amount">
          <h3 className="card-heading">TALEP EDİLEN TOPLAM TUTAR</h3>
          <p className="amount-main">{formatAmount(total_estimated_amount)} TL</p>
          <p className="amount-sub">
            Bu Ay {formatAmount(monthly_estimated_amount)} TL
          </p>
          <div>
            <img src={TalepEdilenIcon} alt="Talep Edilen Toplam İkon" />
          </div>
        </div>

        {/* TASLAK BİLDİRİMLERİM */}
        <div className="card card--drafts">
          <h3 className="card-heading">TASLAK BİLDİRİMLERİM ({favourite_insurance_companies.length})</h3>
          <div className="drafts-logos">
            {favourite_insurance_companies.length > 0 ? (
              favourite_insurance_companies.slice(0, 3).map((company, index) => (
                <div key={index} className="draft-logo">
                  {/* Sigorta şirketi logosu buraya gelecek */}
                  <img src={company.logo} alt={company.name || company} />
                </div>
              ))
            ) : (
              <div className="draft-logo-placeholder">Taslak yok</div>
            )}
          </div>
          <div>
            <img src={TaslakBildirimlerIcon} alt="Taslak Bildirimlerim İkon" />
          </div>
        </div>

        {/* REDDEDİLEN DOSYALAR */}
        <div className="card card--rejected">
          <h3 className="card-heading">Reddedilen Dosyalar</h3>
          <p className="card-count">
            <span className="card-count-number">{counts.rejected}</span> Dosya
          </p>
          <button
            className="card-btn card-btn--light"
            onClick={() => navigate('/rejected')}
          >
            TÜMÜNÜ GÖR
          </button>
        </div>

        {/* DEVAM EDENLER */}
        <div className="card card--ongoing">
          <h3 className="card-heading">DEVAM EDENLER</h3>
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
          <button className="card-btn card-btn--light" onClick={() => navigate('/upload')}>
            YÜKLE
          </button>
        </div>

        {/* ALT SAĞ BÜYÜK KART */}
        <div className="card card--bottom-right">
          <h3 className="card-heading">TOPLAM İŞLEM</h3>
          <p className="card-count">
            <span className="card-count-number">{counts.total}</span> Dosya
          </p>
        </div>
      </div>
    </div>
  );
}