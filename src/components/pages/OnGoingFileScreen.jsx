// src/screens/file/OnGoingFilesScreen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Eye } from "lucide-react"; // 🔹 EKLENDİ
import apiService from "../../services/apiServices";
import styles from "../../styles/ongoing.module.css";

const OnGoingFilesScreen = () => {
  const navigate = useNavigate();
  const [fileNotifications, setFileNotifications] = useState([]);

  useEffect(() => {
    const getFileNotifications = async () => {
      try {
        const res = await apiService.getPendingSubmissions();
        console.log("✅ Web API yanıtı (pending):", res?.data || res);

        if (res?.success) {
          // backend: res.data.pending_files bekliyoruz
          const payload =
            res?.data?.pending_files ||
            res?.data?.results ||
            res?.data ||
            [];

          const safeArray = Array.isArray(payload?.results)
            ? payload.results
            : Array.isArray(payload)
              ? payload
              : [];

          const normalized = safeArray.map((data) => ({
            id: data.submission_id ?? Math.random().toString(),
            vehicle_plate: data.plate ?? "-",
            insurance_company_name: data.insurance_company_name ?? "-",
            vehicle_model: data.vehicle_model ?? "-",
            accident_date: data.accident_date ?? "-",
            created_at: data.created_at ?? "-",
            status: "PENDING",
            file_number: data.file_number ?? "-",
          }));

          setFileNotifications(normalized);
        } else {
          window.alert(res?.message || "Bekleyen dosyalar alınamadı.");
        }
      } catch (error) {
        console.error("❌ Dosya bildirimleri alınırken hata:", error);
        window.alert("Bekleyen dosyalar alınırken bir hata oluştu.");
      }
    };

    getFileNotifications();
  }, []);

  const handleFileDetail = (fileId, fileNumber) => {
    navigate(`/file-detail/${fileId}`, {
      state: {
        fileId,
        fileNumber,
        fromScreen: "OnGoingFilesScreen",
      },
    });
  };

  const renderFileItem = (data) => {
    const statusInfo = {
      text: "Başvurunuz Beklemede",
      badgeClass: styles.pendingBadge,
      textClass: styles.processingBadgeText,
    };

    return (
      <div key={data.id} className={styles.fileContainer}>
        <div className={styles.fileHeader}>
          <div className={styles.fileDetails}>
            <p>
              <strong>Araç Plaka:</strong> {data.vehicle_plate}
            </p>

            <p>
              <strong>Kaza Tarihi:</strong> {data.accident_date}
            </p>

            <p>
              <strong>Araç Model:</strong> {data.vehicle_model}
            </p>

            <p>
              <strong>{data.insurance_company_name}</strong>
              <span> - {data.created_at?.slice(0, 10)}</span>
            </p>
          </div>

          {/* EK: Sağ üstte Eye chip + mevcut info butonu */}
          <div className={styles.headerActions}>
            {/* Eye chip – hover’da “Dosya Detayı Gör” açılır */}
            <button
              type="button"
              className={styles.detailChip}
              onClick={() =>
                handleFileDetail(data.id, data.file_number)
              }
            >
              <Eye className={styles.eyeIcon} size={18} strokeWidth={2.2} />
              <span className={styles.detailText}>Dosya Detayı Gör</span>
            </button>

            {/* Senin mevcut info butonun – HİÇ DEĞİŞMEDİ, sadece wrapper içine alındı */}
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
          <div
            className={`${styles.statusBadge} ${statusInfo.badgeClass}`}
          >
            <span className={statusInfo.textClass}>
              {statusInfo.text}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    // Arkaplan + kart yapısı diğer sayfalarla aynı
    <div className={`${styles.screenContainerDrive} ${styles.container}`}>
      <div className={styles.contentArea}>
        {/* Başlık */}
        <h1 className={styles.headerTitleCentered}>
          İşlemi Devam Edenler
        </h1>

        {/* Büyük beyaz kart */}
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

export default OnGoingFilesScreen;