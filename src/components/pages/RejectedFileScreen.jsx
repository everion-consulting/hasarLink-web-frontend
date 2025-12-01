// src/screens/file/RejectedFilesScreen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react"; 
import apiService from "../../services/apiServices";
import styles from "../../styles/rejectedFileScreen.module.css";

const RejectedFilesScreen = () => {
  const navigate = useNavigate();

  const [fileNotifications, setFileNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getFileNotifications = async () => {
      try {
        setLoading(true);
        const res = await apiService.getRejectedSubmissions();

        if (!res.success) {
          window.alert(res.message || "Reddedilen dosyalar alınamadı.");
          setFileNotifications([]);
          return;
        }

        const list = Array.isArray(res?.data)
          ? res.data
          : res?.data?.rejected_files || [];

        setFileNotifications(list);
      } catch (error) {
        window.alert("Reddedilen dosyalar alınırken bir hata oluştu.");
        setFileNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    getFileNotifications();
  }, []);

  const handleFileDetail = (item) => {
    navigate(`/reddedilen-dosyalar-detay/${item.submission_id}`, {
      state: {
        from: "reddedilen-dosyalar",
        rejectedFields: item.fields || [],
      },
    });
  };

  const renderFileItem = (data) => (
    <div key={data.submission_id} className={styles.rejectedItem}>

      {/* 🔹 HEADER (Left data + Right Eye icon) */}
      <div className={styles.rejectedHeaderRow}>
        <div className={styles.rejectedLeft}>
          <div className={styles.rejectedItemRow}>
            <span className={styles.rejectedItemLabel}>Araç Plaka:</span>
            <span className={styles.rejectedItemValue}>{data.plate || "-"}</span>
          </div>

          <div className={styles.rejectedItemRow}>
            <span className={styles.rejectedItemLabel}>Tarih:</span>
            <span className={styles.rejectedItemValue}>{data.date || "-"}</span>
          </div>
        </div>

        {/* 🔹 Eye chip sağ üstte */}
        <button
          type="button"
          className={styles.detailChip}
          onClick={() => handleFileDetail(data)}
        >
          <Eye className={styles.eyeIcon} size={18} strokeWidth={2.2} />
          <span className={styles.detailText}>Dosya Detayı Gör</span>
        </button>
      </div>

      {/* 🔹 RED NEDENİ */}
      <div className={styles.rejectedItemBadge}>
        Red Nedeni: {data.message || "-"}
      </div>

      {/* 🔹 Fields */}
      {!!data.fields?.length && (
        <div className={styles.rejectedItemFields}>
          <div className={styles.rejectedItemFieldsTitle}>
            Eksik / Hatalı Alanlar:
          </div>
          <div className={styles.rejectedItemFieldsValue}>
            {data.fields.map((f) => f.label).join(", ")}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.screenContainer}>
      <div className={styles.contentArea}>
        <div className={styles.rejectedHeader}>
          <h1 className={styles.pageTitle}>Reddedilen Dosyalar</h1>
        </div>

        <div className={styles.rejectedCard}>
          {loading ? (
            <div className={styles.rejectedLoading}>
              <div className={styles.rejectedSpinner} />
              <span>Yükleniyor...</span>
            </div>
          ) : fileNotifications.length === 0 ? (
            <div className={styles.rejectedEmpty}>
              Henüz reddedilen dosyanız bulunmuyor.
            </div>
          ) : (
            <div className={styles.rejectedList}>
              {fileNotifications.map(renderFileItem)}
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

export default RejectedFilesScreen;