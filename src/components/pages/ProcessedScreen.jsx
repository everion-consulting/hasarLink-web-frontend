// src/components/pages/ProcessedScreen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

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
          <div>
            <p className={styles.fileNumber}>
              Araç Plaka: {data.vehicle_plate}
            </p>
            <p className={styles.fileNumber}>
              Kaza Tarihi: {data.accident_date}
            </p>
            <p className={styles.fileNumber}>
              Araç Model: {data.vehicle_model}
            </p>
            <p className={styles.insuranceInfo}>
              {data.insurance_company_name}{" "}
              <span>- {data.created_at?.slice(0, 10)}</span>
            </p>
          </div>

          <button
            type="button"
            className={styles.infoIconBtn}
            aria-label="Detay"
          >
            <InformationCircleIcon className={styles.infoIconSvg} />
          </button>
        </div>

        <div className={styles.statusRow}>
          <div
            className={`${styles.statusBadge} ${statusInfo.badgeClass}`}
          >
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
    // 🔴 Bildirim Yapılanlar ile aynı dış yapı
    <div className={`screen-container-drive ${styles.container}`}>
      <div className="content-area">
        {/* Geri ok */}
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          ←
        </button>

        {/* Başlık */}
        <h1 className={styles.headerTitleCentered}>İşleme Alınanlar</h1>

        {/* Büyük beyaz kart */}
        <div className="vehicle-form-card">
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
      </div>
    </div>
  );
};

export default ProcessedScreen;
