import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiServices";
import styles from "../../styles/FileNotifications.module.css";
import { Eye } from "lucide-react";

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
      PENDING: { text: "Başvurunuz Beklemede", className: styles.statusPending },
      IN_PROGRESS: { text: "Başvurunuz İşleme Alındı", className: styles.statusInProgress },
      REJECTED: { text: "Başvurunuz Reddedildi", className: styles.statusRejected },
      COMPLETED: { text: "Başvurunuz Tamamlandı", className: styles.statusCompleted },
      ERROR: { text: "Sigorta Şirketi Bakımda", className: styles.statusError },
    };

    const statusInfo = statusMap[data.status] || {
      text: "Durum Bilinmiyor",
      className: styles.statusUnknown,
    };

    return (
      <li key={data.id} className={styles.fileItem}>
        <div className={styles.fileDetails}>
          {/* 🔹 ÜST SATIR: Plaka solda, chip sağda */}
          <div className={styles.fileTopRow}>
            <p>
              <strong>Araç Plaka:</strong> {data.vehicle_plate || "-"}
            </p>

            <button
              className={styles.detailChip}
              onClick={() => handleFileDetail(data.id)}
            >
              <Eye className={styles.eyeIcon} size={18} strokeWidth={2.2} />
              <span className={styles.detailText}>Dosya Detayı Gör</span>
            </button>
          </div>

          {/* 🔹 Diğer bilgiler altta */}
          <p><strong>Kaza Tarihi:</strong> {data.accident_date?.slice(0, 10) || "-"}</p>
          <p><strong>Araç Model:</strong> {data.vehicle_model || "-"}</p>
          <p>{data.insurance_company_name || "-"} - {data.accident_date?.slice(0, 10) || ""}</p>
        </div>

        <div className={styles.fileStatusRow}>
          <div className={`${styles.fileStatus} ${statusInfo.className}`}>
            {statusInfo.text}
          </div>
        </div>
      </li>
    );
  };


  return (
    <div className={styles.fileNotifications}>
      <h1>Dosya Bildirimlerim</h1>

      <ul className={styles.fileList}>
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
