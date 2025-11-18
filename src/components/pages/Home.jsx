// src/components/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import apiService from "../../services/apiServices";

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
      monthly_opened: 0,
    },
    total_estimated_amount: 0,
    monthly_estimated_amount: 0,
  });

  // 🔥 mobildeki ile tamamen aynı endpoint
  async function fetchCounts() {
    try {
      const res = await apiService.getFileSubmissionCounts();

      if (!res?.success) {
        console.error("❌ Dosya sayıları alınamadı:", res?.message);
        return;
      }

      const data = res?.data?.data;

      setDashboardData({
        counts: data?.counts ?? dashboardData.counts,
        total_estimated_amount: data?.total_estimated_amount ?? 0,
        monthly_estimated_amount: data?.monthly_estimated_amount ?? 0,
      });
    } catch (error) {
      console.error("❌ FetchCounts Error:", error);
    }
  }

  // 🔥 mobildeki getProfileDetail
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

  const { counts, total_estimated_amount, monthly_estimated_amount } =
    dashboardData;

  return (
    <div className="dashboard">

      <div className="dash-grid">

        {/* YENİ DOSYA */}
        <div className="card card--new-file">
          <div className="card-title-sm">YENİ</div>
          <div className="card-title-lg">DOSYA</div>
          <button className="card-btn">BİLDİR</button>
        </div>

        {/* ONAYLANANLAR */}
        <div className="card card--approved">
          <h3 className="card-heading">ONAYLANANLAR</h3>
          <p className="card-count">
            <span className="card-count-number">{counts.total}</span> Dosya
          </p>
        </div>

        {/* BEKLEYENLER */}
        <div className="card card--pending">
          <h3 className="card-heading">BEKLEYENLER</h3>
          <p className="card-count">
            <span className="card-count-number">{counts.pending}</span> Dosya
          </p>
        </div>

        {/* TOPLAM TUTAR */}
        <div className="card card--amount">
          <h3 className="card-heading">Toplam Tutar</h3>
          <p className="amount-main">{total_estimated_amount} TL</p>
          <p className="amount-sub">Bu Ay {monthly_estimated_amount} TL</p>
        </div>

        {/* DEVAM EDENLER */}
        <div className="card card--ongoing">
          <h3 className="card-heading">DEVAM EDENLER</h3>
          <button className="card-btn card-btn--light">YÜKLE</button>
        </div>

        {/* TASLAKLAR */}
        <div className="card card--drafts">
          <h3 className="card-heading">TASLAK BİLDİRİMLERİM</h3>
          <button className="card-btn">TAMAMLA</button>
        </div>

        {/* REDDEDİLENLER */}
        <div className="card card--rejected">
          <h3 className="card-heading">REDDEDİLEN DOSYALAR</h3>
          <button className="card-btn card-btn--light">TÜMÜNÜ GÖR</button>
        </div>

        <div className="card card--bottom-left"></div>
        <div className="card card--bottom-right"></div>

      </div>
    </div>


  );
}
