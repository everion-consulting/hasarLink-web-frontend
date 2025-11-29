// src/screens/file/RejectedFilesScreen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import apiService from "../../services/apiServices";

// MODULE CSS
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
      <div className={styles.rejectedItemRow}>
        <span className={styles.rejectedItemLabel}>Araç Plaka:</span>
        <span className={styles.rejectedItemValue}>{data.plate || "-"}</span>
      </div>

      <div className={styles.rejectedItemRow}>
        <span className={styles.rejectedItemLabel}>Tarih:</span>
        <span className={styles.rejectedItemValue}>{data.date || "-"}</span>
      </div>

      <div className={styles.rejectedItemBadge}>
        Red Nedeni: {data.message || "-"}
      </div>

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

      <button
        type="button"
        className={styles.rejectedItemLink}
        onClick={() => handleFileDetail(data)}
      >
        Dosya Detayı Gör
      </button>
    </div>
  );

  return (
    <div className="screen-container-drive">
      <div className="content-area">

        <div className={styles.rejectedHeader}>
          <button
            type="button"
            className={styles.rejectedBack}
            onClick={() => navigate(-1)}
          >
            ←
          </button>

          <h1 className="page-title">Reddedilen Dosyalar</h1>
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
      </div>
    </div>
  );
};

export default RejectedFilesScreen;
