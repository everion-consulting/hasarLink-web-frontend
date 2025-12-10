import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiService from "../../services/apiServices";
import submissionService from "../../services/submissionService";
import styles from "../../styles/FileDetail.module.css";
import LeftIconBlack from "../../assets/images/leftIconBlack.svg";

const FileDetail = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();

  const [fileData, setFileData] = useState(null);
  const [fileImages, setFileImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);


  const statusMap = {
    PENDING: "Beklemede",
    IN_PROGRESS: "İşlemde",
    REJECTED: "Reddedildi",
    COMPLETED: "Tamamlandı",
  };

  useEffect(() => {
    const fetchSubmissionFiles = async () => {
      try {
        if (!fileId) return;

        const res = await submissionService.getSubmissionFiles(fileId);

        if (!res.success) {
          console.error("❌ Dosya görselleri alınamadı:", res.message);
          window.alert(res.message || "Dosya görselleri alınırken hata oluştu.");
          return;
        }

        console.log("📸 Dosya görselleri:", res.data);

        // 🔹 API'den gelen asıl payload
        // fetchData -> res.data
        // viewset -> { success: true, data: { files: [...] } }
        const payload = res.data?.data || res.data;

        const filesArray = Array.isArray(payload?.files)
          ? payload.files
          : Array.isArray(payload?.results)
            ? payload.results
            : [];

        console.log("📂 Çözümlenmiş filesArray:", filesArray);

        // 🔹 Görselleri file_type'a göre grupla
        const grouped = {};
        filesArray.forEach((f) => {
          if (!grouped[f.file_type]) grouped[f.file_type] = [];
          grouped[f.file_type].push({
            id: f.id,
            url: f.file_url,
            name: f.name,
            uploaded_at: f.uploaded_at,
          });
        });

        setFileImages(grouped);
      } catch (err) {
        console.error("❌ Görsel fetch hatası:", err);
      }
    };

    fetchSubmissionFiles();
  }, [fileId]);



  useEffect(() => {
    const fetchFileDetail = async () => {
      try {
        const res = await apiService.getSubmissionDetail(fileId);

        if (!res.success) {
          console.error("❌ Dosya detayı alınamadı:", res.message);
          // web'te Alert yok, window.alert kullan
          window.alert(res.message || "Dosya detayı alınırken hata oluştu.");
          return;
        }

        console.log("✅ Dosya Detayı:", res?.data);
        setFileData(res?.data);   // 🔥 asıl eksik olan satır buydu
      } catch (err) {
        console.error("❌ Hata:", err);
      } finally {
        setLoading(false);
      }
    };

    if (fileId) {
      fetchFileDetail();
    }
  }, [fileId]);


  const renderInfoRow = (label, value) => {
    if (!value) return null;
    return (
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{label}:</span>
        <span className={styles.infoValue}>{value}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.fileDetailContainer}>
        <div className={styles.loading}>Yükleniyor...</div>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className={styles.fileDetailContainer}>
        <p className={styles.noData}>Veri bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className={styles.fileDetailContainer}>
      <h1 className={styles.pageTitle}>Dosya Detayı</h1>

      <div className={styles.detailCard}>
        <h2 className={styles.sectionTitle}>Dosya Bilgileri</h2>
        {renderInfoRow("Durum", statusMap[fileData.status])}
        {renderInfoRow("Sigorta Şirketi", fileData.insurance_company_name)}
        {renderInfoRow("Oluşturulma Tarihi", fileData.created_at?.slice(0, 10))}
        {renderInfoRow("İşlenme Tarihi", fileData.processed_at?.slice(0, 10))}
        {renderInfoRow("Tamamlanma Tarihi", fileData.completed_at?.slice(0, 10))}
        {renderInfoRow("Atanan Memur", fileData.assigned_officer)}

        <div className={styles.separator}></div>

        <h2 className={styles.sectionTitle}>Sürücü Bilgileri</h2>
        {renderInfoRow("Ad Soyad", fileData.driver_fullname)}
        {renderInfoRow("Doğum Tarihi", fileData.driver_birth_date)}
        {renderInfoRow("Email", fileData.driver_mail)}
        {renderInfoRow("Telefon", fileData.driver_phone)}
        {renderInfoRow("TC", fileData.driver_tc)}

        <div className={styles.separator}></div>

        <h2 className={styles.sectionTitle}>Mağdur Bilgileri</h2>
        {renderInfoRow("Ad Soyad", fileData.victim_fullname)}
        {renderInfoRow("Doğum Tarihi", fileData.victim_birth_date)}
        {renderInfoRow("İBAN", fileData.victim_iban)}
        {renderInfoRow("Email", fileData.victim_mail)}
        {renderInfoRow("Telefon", fileData.victim_phone)}
        {renderInfoRow("TC", fileData.victim_tc)}

        <div className={styles.separator}></div>

        <h2 className={styles.sectionTitle}>Araç Bilgileri</h2>
        {renderInfoRow("Plaka", fileData.vehicle_plate)}
        {renderInfoRow("Araç Markası", fileData.vehicle_brand)}
        {renderInfoRow("Araç Modeli", fileData.vehicle_model)}
        {renderInfoRow("Şasi No", fileData.vehicle_chassis_no)}
        {renderInfoRow("Motor No", fileData.vehicle_engine_no)}
        {renderInfoRow("Ruhsat Seri No", fileData.vehicle_license_no)}
        {renderInfoRow("Araç Türü", fileData.vehicle_type)}
        {renderInfoRow("Araç Kullanım Türü", fileData.vehicle_usage_type)}
        {renderInfoRow("Model Yılı", fileData.vehicle_year)}

        <div className={styles.separator}></div>

        <h2 className={styles.sectionTitle}>Kaza Bilgileri</h2>
        {renderInfoRow("Kaza Tarihi", fileData.accident_date?.slice(0, 10))}
        {renderInfoRow("Kaza Yeri", fileData.accident_location)}

        <div className={styles.separator}></div>

        <h2 className={styles.sectionTitle}>Yüklenen Dosyalar</h2>

        {Object.keys(fileImages).length === 0 ? (
          <p className={styles.noFiles}>Henüz yüklenmiş dosya bulunmuyor.</p>
        ) : (
          Object.entries(fileImages).map(([type, files]) => (
            <div key={type} className={styles.fileTypeSection}>
              <h3 className={styles.fileTypeTitle}>{type.toUpperCase()}</h3>

              <div className={styles.fileImagesGrid}>
                {files.map((f) => {
                  const isPdf =
                    (f.name && f.name.toLowerCase().endsWith(".pdf")) ||
                    (f.url && f.url.toLowerCase().includes(".pdf"));

                  const handleClick = () => {
                    if (isPdf) {
                      window.open(f.url, "_blank");
                    } else {
                      setSelectedImage(f.url);
                    }
                  };

                  return (
                    <button
                      key={f.id}
                      type="button"
                      className={styles.fileCard}
                      onClick={handleClick}
                    >
                      {isPdf ? (
                        <div className={styles.pdfThumb}>📄</div>
                      ) : (
                        <img
                          src={f.url}
                          alt={f.name}
                          className={styles.fileThumbnail}
                        />
                      )}

                      <span className={styles.fileName}>
                        {f.name || (isPdf ? "PDF Dosya" : "Dosya")}
                      </span>

                      {isPdf && (
                        <span className={styles.fileHint}>
                          Tıkla, yeni sekmede aç
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}


      </div>

      <div className={styles.bottomButtons}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <span className={styles.contactBtnIcon}>
            <img src={LeftIconBlack} alt="Geri" />
          </span>
          GERİ DÖN
        </button>
      </div>

      {selectedImage && (
        <div className={styles.imageModal} onClick={() => setSelectedImage(null)}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeModal}
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>

            <img
              src={selectedImage}
              alt="Büyük Görsel"
              className={styles.modalImage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDetail;
