import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiServices";
import "../../styles/FileNotifications.css"; 

const FileNotifications = () => {
  const [fileNotifications, setFileNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFileNotifications = async () => {
      try {
        const res = await apiService.getAllSubmissions();
        if (!res.success) {
          console.error("Dosya bildirimleri alınırken hata oluştu:", res.message);
          return;
        }
        setFileNotifications(res?.data.results || []);
      } catch (error) {
        console.error("Dosya bildirimleri alınırken hata oluştu:", error);
      }
    };

    fetchFileNotifications();
  }, []);

  const handleFileDetail = (fileId) => {
    navigate(`/file-detail/${fileId}`);
  };

  const renderFileItem = (data) => {
    const statusMap = {
      PENDING: { text: "Başvurunuz Beklemede", className: "status-pending" },
      IN_PROGRESS: { text: "Başvurunuz İşleme Alındı", className: "status-in-progress" },
      REJECTED: { text: "Başvurunuz Reddedildi", className: "status-rejected" },
      COMPLETED: { text: "Başvurunuz Tamamlandı", className: "status-completed" },
      ERROR: { text: "Sigorta Şirketi Bakımda", className: "status-error" },
    };

    const statusInfo = statusMap[data.status] || { text: "Durum Bilinmiyor", className: "status-unknown" };

    return (
      <li key={data.id} className="file-item">
        <div className="file-details">
          <p><strong>Araç Plaka:</strong> {data.vehicle_plate || "-"}</p>
          <p><strong>Kaza Tarihi:</strong> {data.accident_date?.slice(0, 10) || "-"}</p>
          <p><strong>Araç Model:</strong> {data.vehicle_model || "-"}</p>
          <p>{data.insurance_company_name || "-"} - {data.accident_date?.slice(0, 10) || ""}</p>
        </div>
        <div className="file-status-row">
          <div className={`file-status ${statusInfo.className}`}>
            {statusInfo.text}
          </div>
          <button className="file-detail-button" onClick={() => handleFileDetail(data.id)}>
            Dosya Detayı Gör
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className="file-notifications">
      <h1>Dosya Bildirimlerim</h1>
      <ul className="file-list">
        {fileNotifications.length > 0 ? (
          fileNotifications.map(renderFileItem)
        ) : (
          <p>Henüz dosya bildiriminiz yok.</p>
        )}
      </ul>
    </div>
  );
};

export default FileNotifications;