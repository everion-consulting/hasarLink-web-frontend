// src/screens/file/RejectedFilesScreen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import apiService from "../../services/apiServices";


import "../../styles/rejectedFileScreen.css";     // sadece bu sayfaya özel stiller

const RejectedFilesScreen = () => {
  const navigate = useNavigate();

  const [fileNotifications, setFileNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // 📦 reddedilen dosyaları çek
  useEffect(() => {
    const getFileNotifications = async () => {
      try {
        setLoading(true);
        const res = await apiService.getRejectedSubmissions();

        if (!res.success) {
          console.error("❌ Reddedilen dosyalar alınamadı:", res.message);
          window.alert(res.message || "Reddedilen dosyalar alınamadı.");
          setFileNotifications([]);
          return;
        }

        const list = Array.isArray(res?.data)
          ? res.data
          : res?.data?.rejected_files || [];

        setFileNotifications(list);
      } catch (error) {
        console.error("Dosya bildirimleri alınırken hata:", error);
        window.alert("Reddedilen dosyalar alınırken bir hata oluştu.");
        setFileNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    getFileNotifications();
  }, []);

  // 📦 Dosya detayına git
  const handleFileDetail = (item) => {
    navigate(`/reddedilen-dosyalar-detay/${item.submission_id}`, {
      state: {
        from: "reddedilen-dosyalar",
        rejectedFields: item.fields || [],
      },
    });
  };

  const renderFileItem = (data) => (
    <div key={data.submission_id} className="rejected-item">
      <div className="rejected-item__row">
        <span className="rejected-item__label">Araç Plaka:</span>
        <span className="rejected-item__value">{data.plate || "-"}</span>
      </div>

      <div className="rejected-item__row">
        <span className="rejected-item__label">Tarih:</span>
        <span className="rejected-item__value">{data.date || "-"}</span>
      </div>

      <div className="rejected-item__badge">
        Red Nedeni: {data.message || "-"}
      </div>

      {!!data.fields?.length && (
        <div className="rejected-item__fields">
          <div className="rejected-item__fields-title">
            Eksik / Hatalı Alanlar:
          </div>
          <div className="rejected-item__fields-value">
            {data.fields.map((f) => f.label).join(", ")}
          </div>
        </div>
      )}

      <button
        type="button"
        className="rejected-item__link"
        onClick={() => handleFileDetail(data)}
      >
        Dosya Detayı Gör
      </button>
    </div>
  );

return (
    <div className="screen-container-drive">
      <div className="content-area">
        {/* Geri ok */}
        <button
          type="button"
          className="rejected-back-btn"
          onClick={() => navigate(-1)}
        >
          ←
        </button>

        <h1 className="page-title">Reddedilen Dosyalar</h1>

        <div className="vehicle-form-card rejected-card">
          {loading ? (
            <div className="rejected-loading">
              <div className="rejected-spinner" />
              <span>Yükleniyor...</span>
            </div>
          ) : fileNotifications.length === 0 ? (
            <div className="rejected-empty">
              Henüz reddedilen dosyanız bulunmuyor.
            </div>
          ) : (
            <div className="rejected-list">
              {fileNotifications.map(renderFileItem)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RejectedFilesScreen;