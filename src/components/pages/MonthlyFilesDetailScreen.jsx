// src/screens/file/MonthlyFilesDetailScreen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/monthlyFiles.module.css";
import apiService from "../../services/apiServices";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Eye } from "lucide-react";

const MonthlyFilesDetailScreen = () => {
  const navigate = useNavigate();
  const [fileNotifications, setFileNotifications] = useState([]);

  useEffect(() => {
    const getFileNotifications = async () => {
      try {
        const res = await apiService.getMonthlySubmissions();
        console.log("Monthly Files Response:", res);

        if (res?.success) {
          const payload = res?.data?.queryset || res?.data || [];

          const safeArray = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.results)
              ? payload.results
              : [];

          const normalized = safeArray.map((data) => ({
            id: data.submission_id,
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
          alert(res?.message || "Bekleyen dosyalar alınamadı.");
        }
      } catch (error) {
        console.error("Dosya bildirimleri alınırken hata oluştu:", error);
        alert("Dosya bildirimleri alınırken bir hata oluştu.");
      }
    };

    getFileNotifications();
  }, []);

  const handleFileDetail = (fileId, fileNumber) => {
    console.log(`Dosya Detayı: ${fileNumber} (ID: ${fileId})`);
    navigate(`/file-detail/${fileId}`, {
      state: {
        fileId,
        fileNumber,
        fromScreen: "MonthlyFilesDetailScreen",
        toScreen: "FileDetail",
      },
    });
  };

  const renderFileItem = (data) => {
    const statusMap = {
      PENDING: {
        text: "Başvurunuz Beklemede",
        badgeClass: styles.pendingBadge,
      },
      IN_PROGRESS: {
        text: "Başvurunuz İnceleniyor",
        badgeClass: styles.processingBadge,
      },
      COMPLETED: {
        text: "Başvurunuz Tamamlandı",
        badgeClass: styles.approvedBadge,
      },
      REJECTED: {
        text: "Başvurunuz Reddedildi",
        badgeClass: styles.rejectedBadge,
      },
    };

    const statusInfo =
      statusMap[data.status] || {
        text: "Durum Bilinmiyor",
        badgeClass: styles.processingBadge,
      };

    return (
      <div key={data.id} className={styles.fileCard}>
        <div className={styles.fileHeader}>
          <div className={styles.fileDetails}>
            <p className={styles.fileText}>
              <span className={styles.fileLabel}>Araç Plaka:</span> {data.vehicle_plate}
            </p>
            <p className={styles.fileText}>
              <span className={styles.fileLabel}>Kaza Tarihi:</span> {data.accident_date}
            </p>
            <p className={styles.fileText}>
              <span className={styles.fileLabel}>Araç Model:</span> {data.vehicle_model}
            </p>

            <p className={styles.insuranceInfo}>
              <strong>{data.insurance_company_name}</strong> – {data.created_at?.slice(0, 10)}
            </p>
          </div>

          {/* SAĞ ÜSTTE: Göz Chip + Info icon */}
          <div className={styles.headerActions}>

            {/* Eye chip */}
            <button
              className={styles.detailChip}
              onClick={() => handleFileDetail(data.id, data.file_number)}
            >
              <Eye className={styles.eyeIcon} size={18} strokeWidth={2.2} />
              <span className={styles.detailText}>Dosya Detayı Gör</span>
            </button>

            {/* Info icon */}
            <button
              type="button"
              className={styles.infoIcon}
              onClick={() => console.log("Info clicked", data.id)}
            >
              <InformationCircleIcon width={20} height={20} />
            </button>

          </div>
        </div>

        <div className={styles.statusRow}>
          <div className={`${styles.statusBadge} ${statusInfo.badgeClass}`}>
            <span className={styles.statusBadgeText}>{statusInfo.text}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.screenContainerDrive}>
      <div className={styles.contentArea}>
        <div className={styles.container}>
          {/* İçerik */}
          <main className={styles.content}>
            <div className={styles.listWrapper}>
              <h1 className={styles.pageTitle}>Bu Ay Bildirilen Dosyalar</h1>

              {fileNotifications.length > 0 ? (
                fileNotifications.map(renderFileItem)
              ) : (
                <div className={styles.emptyState}>
                  <p>Henüz dosya bildiriminiz yok.</p>
                </div>
              )}
            </div>
          </main>
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

export default MonthlyFilesDetailScreen;