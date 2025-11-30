// src/components/pages/ProcessedScreen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Eye } from "lucide-react"; // 🔹 EKLENDİ

import apiService from "../../services/apiServices";
import styles from "../../styles/processed.module.css";

const ProcessedScreen = () => {
  const navigate = useNavigate();
  const [fileNotifications, setFileNotifications] = useState([]);

  useEffect(() => {
    const getFileNotifications = async () => {
      try {
        const res = await apiService.getNotifiedSubmissions();
        console.log("✅ Web API yanıtı (processed):", res?.data || res);

        if (res?.success) {
          const payload = res?.data?.queryset || res?.data || [];

          const safeArray = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.results)
              ? payload.results
              : [];

          const normalized = safeArray.map((data) => ({
            id: data.submission_id ?? Math.random().toString(),
            vehicle_plate: data.plate ?? "-",
            insurance_company_name: data.insurance_company_name ?? "-",
            vehicle_model: data.vehicle_model ?? "-",
            accident_date: data.accident_date ?? "-",
            created_at: data.created_at ?? "-",
            status: data.status ?? "IN_PROGRESS",
            file_number: data.file_number ?? "-",
          }));

          setFileNotifications(normalized);
        } else {
          window.alert(res?.message || "İşleme alınan dosyalar alınamadı.");
        }
      } catch (error) {
        console.error("❌ Dosya bildirimleri alınırken hata:", error);
        window.alert("İşleme alınan dosyalar alınırken bir hata oluştu.");
      }
    };

    getFileNotifications();
  }, []);

  const handleFileDetail = (fileId, fileNumber) => {
    navigate(`/file-detail/${fileId}`, {
      state: {
        fileId,
        fileNumber,
        fromScreen: "ProcessedScreen",
      },
    });
  };

  const renderFileItem = (data) => {
    const statusMap = {
      IN_PROGRESS: {
        text: "Başvurunuz İşlemde",
        badgeClass: styles.processingBadge,
        textClass: styles.processingBadgeText,
      },
      PENDING: {
        text: "Başvurunuz Beklemede",
        badgeClass: styles.processingBadge,
        textClass: styles.processingBadgeText,
      },
    };

    const statusInfo =
      statusMap[data.status] || {
        text: "Durum Bilinmiyor",
        badgeClass: styles.processingBadge,
        textClass: styles.processingBadgeText,
      };

    return (
      <div key={data.id} className={styles.fileContainer}>
        <div className={styles.fileHeader}>

          {/* 🔹 FileDetails düzenlendi */}
          <div className={styles.fileDetails}>
            <p><strong>Araç Plaka:</strong> {data.vehicle_plate}</p>
            <p><strong>Kaza Tarihi:</strong> {data.accident_date}</p>
            <p><strong>Araç Model:</strong> {data.vehicle_model}</p>

            <p>
              <strong>{data.insurance_company_name}</strong>
              <span> - {data.created_at?.slice(0, 10)}</span>
            </p>
          </div>

          {/* 🔹 Sağ üst Eye Chip + Info Icon */}
          <div className={styles.headerActions}>

            {/* Eye Chip */}
            <button
              className={styles.detailChip}
              onClick={() =>
                handleFileDetail(data.id, data.file_number)
              }
            >
              <Eye className={styles.eyeIcon} size={18} strokeWidth={2.2} />
              <span className={styles.detailText}>Dosya Detayı Gör</span>
            </button>

            {/* Info Icon */}
            <button
              type="button"
              className={styles.infoIconBtn}
              aria-label="Detay"
            >
              <InformationCircleIcon className={styles.infoIconSvg} />
            </button>
          </div>
        </div>

        <div className={styles.statusRow}>
          <div className={`${styles.statusBadge} ${statusInfo.badgeClass}`}>
            <span className={statusInfo.textClass}>{statusInfo.text}</span>
          </div>

          <button
            type="button"
            className={styles.detailLink}
            onClick={() => handleFileDetail(data.id, data.file_number)}
          >
            <span className={styles.detailLinkText}>Dosya Detayı Gör</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.screenContainerDrive}>
      <div className={styles.contentArea}>

        <h1 className={styles.headerTitleCentered}>İşleme Alınanlar</h1>

        <div className={styles.vehicleFormCard}>
          {fileNotifications.length > 0 ? (
            <div className={styles.listWrapper}>
              {fileNotifications.map(renderFileItem)}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>Henüz dosya bildiriminiz yok.</p>
            </div>
          )}
        </div>

        <div className={styles.btnArea}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <span className={styles.contactBtnIcon}>
              <img src="/src/assets/images/left-icon-black.svg" alt="Geri" />
            </span>
            GERİ DÖN
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProcessedScreen;