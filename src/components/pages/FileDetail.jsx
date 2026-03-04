import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiService from "../../services/apiServices";
import submissionService from "../../services/submissionService";
import styles from "../../styles/FileDetail.module.css";
import LeftIconBlack from "../../assets/images/leftIconBlack.svg";
import { FILE_TYPE_LABEL_MAP } from "../../constants/filesTypes";


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
    const fetchFileDetail = async () => {
      try {
        const res = await apiService.getSubmissionDetail(fileId);

        if (!res.success) {
          window.alert(res.message || "Dosya detayı alınırken hata oluştu.");
          return;
        }

        const data = res?.data;
        setFileData(data);

        // 🔥 BURASI YENİ
        if (Array.isArray(data?.files)) {
          const grouped = {};

          data.files.forEach((f) => {
            if (!grouped[f.file_type]) grouped[f.file_type] = [];

            grouped[f.file_type].push({
              id: f.id,
              url: f.file_url,
              name: f.name,
              uploaded_at: f.uploaded_at,
            });
          });

          setFileImages(grouped);
        }

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

  const normalizeUrl = (url) => {
    if (!url) return "";
    const s = String(url).trim();
    if (!s) return "";
    return s.startsWith("http://") || s.startsWith("https://") ? s : `https://${s}`;
  };

  // Tarihi DD.MM.YYYY formatına çevir
  const formatDate = (dateString) => {
    if (!dateString) return null;

    // ISO 8601 formatı: "2026-01-03T10:00:00+03:00" veya "2026-01-03"
    let datePart = dateString.toString().trim();

    // T varsa T'den önceki kısmı al
    if (datePart.includes('T')) {
      datePart = datePart.split('T')[0];
    }
    // Boşluk varsa boşluktan önceki kısmı al
    else if (datePart.includes(' ')) {
      datePart = datePart.split(' ')[0];
    }

    // YYYY-MM-DD formatını DD.MM.YYYY'ye çevir
    if (datePart.length >= 10 && datePart.includes('-')) {
      const [year, month, day] = datePart.split('-');
      return `${day}.${month}.${year}`;
    }

    // Zaten DD.MM.YYYY formatındaysa olduğu gibi dön
    if (datePart.includes('.')) {
      return datePart;
    }

    return datePart;
  };

  const renderInfoRow = (label, value) => {
    if (!value) return null;
    return (
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{label}:</span>
        <span className={styles.infoValue}>{value}</span>
      </div>
    );
  };

  const turkishFixMap = {
    sigortali: "sigortalı",
    surucu: "sürücü",
    karsi: "karşı",
    magdur: "mağdur",
    ehliyet: "ehliyeti",
    ruhsat: "ruhsat",
    taraf: "taraf",
    arac: "araç",
  };

  const formatFileTypeLabel = (typeKey) => {
    return typeKey
      .split("_")
      .map((word) => {
        const lower = word.toLowerCase();
        const fixed = turkishFixMap[lower] || lower;
        return fixed.charAt(0).toUpperCase() + fixed.slice(1);
      })
      .join(" ");
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
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Sigorta Sorgulama:</span>

          <span className={styles.infoValue}>
            {fileData?.incurance_query_link ? (
              <a
                href={normalizeUrl(fileData.incurance_query_link)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link} // istersen css ile güzelleştir
                onClick={(e) => e.stopPropagation()}
              >
                Sorgulama ekranını aç
              </a>
            ) : (
              <span className={styles.mutedText}>Link tanımlı değil</span>
            )}
          </span>
        </div>


        {renderInfoRow("Oluşturulma Tarihi", formatDate(fileData.created_at))}
        {renderInfoRow("İşlenme Tarihi", formatDate(fileData.processed_at))}
        {renderInfoRow("Tamamlanma Tarihi", formatDate(fileData.completed_at))}
        {renderInfoRow("Dosya No:", fileData.folder_no)}
        {renderInfoRow("Eksper Bilgisi:", fileData.exper_informations)}

        <div className={styles.separator}></div>

        <h2 className={styles.sectionTitle}>Sürücü Bilgileri</h2>
        {renderInfoRow("Ad Soyad", fileData.driver_fullname)}
        {renderInfoRow("Doğum Tarihi", formatDate(fileData.driver_birth_date))}
        {renderInfoRow("Email", fileData.driver_mail)}
        {renderInfoRow("Telefon", fileData.driver_phone)}
        {renderInfoRow("TC", fileData.driver_tc)}

        <div className={styles.separator}></div>

        <h2 className={styles.sectionTitle}>Mağdur Bilgileri</h2>
        {renderInfoRow("Ad Soyad", fileData.victim_fullname)}
        {renderInfoRow("Doğum Tarihi", formatDate(fileData.victim_birth_date))}
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
        {(() => {
          // Backend'den gelen accident_date'i parse et
          // Format: "2026-01-03T10:00:00+03:00" (ISO 8601)
          const accidentDateTime = fileData.accident_date;
          let accidentDate = null;
          let accidentTime = null;

          if (accidentDateTime) {
            const dateStr = accidentDateTime.toString().trim();

            // ISO 8601 formatı: "YYYY-MM-DDTHH:MM:SS+03:00" veya "YYYY-MM-DDTHH:MM:SSZ"
            if (dateStr.includes('T')) {
              const parts = dateStr.split('T');
              if (parts.length >= 2) {
                accidentDate = formatDate(parts[0]); // YYYY-MM-DD -> DD.MM.YYYY
                // Saat kısmından sadece HH:MM al (timezone'u atla)
                const timePart = parts[1];
                if (timePart) {
                  // "10:00:00+03:00" veya "10:00:00Z" -> "10:00"
                  const timeOnly = timePart.split(/[+\-Z]/)[0]; // +, -, Z karakterinden önceki kısım
                  accidentTime = timeOnly.slice(0, 5); // HH:MM
                }
              }
            } else if (dateStr.includes(' ')) {
              // Eski format: "YYYY-MM-DD HH:MM:SS"
              const parts = dateStr.split(' ');
              if (parts.length >= 2) {
                accidentDate = formatDate(parts[0]); // YYYY-MM-DD -> DD.MM.YYYY
                accidentTime = parts[1]?.slice(0, 5); // HH:MM
              }
            } else {
              // Sadece tarih varsa
              accidentDate = formatDate(dateStr.slice(0, 10));
            }
          }

          return (
            <>
              {renderInfoRow("Kaza Tarihi", accidentDate)}
              {renderInfoRow("Kaza Saati", accidentTime)}
            </>
          );
        })()}
        {renderInfoRow("Kaza Yeri", fileData.accident_location)}

        <div className={styles.separator}></div>

        <h2 className={styles.sectionTitle}>Yüklenen Dosyalar</h2>

        <div className={styles.imagesGrid}>
          {(() => {
            // Hiç dosya yoksa
            const hasAnyFile = Object.values(fileImages).some(
              (arr) => Array.isArray(arr) && arr.length > 0
            );

            if (!hasAnyFile) {
              return (
                <p className={styles.noFiles}>
                  Henüz yüklenmiş dosya bulunmuyor.
                </p>
              );
            }

            // FILE_TYPES sırasına göre kategorileri gezelim
            // (constants/fileTypes içinde tanımlı olduğunu varsayıyorum)
            const TYPE_KEYS_IN_ORDER = Object.keys(fileImages);
            // Eğer FILE_TYPES array’in varsa:
            // import { FILE_TYPES, FILE_TYPE_LABEL_MAP } ...
            // const TYPE_KEYS_IN_ORDER = FILE_TYPES.map((t) => t.id);

            return (
              <>
                {TYPE_KEYS_IN_ORDER.map((typeKey) => {
                  const files = fileImages[typeKey] || [];
                  if (!files.length) return null;

                  const typeLabel =
                    FILE_TYPE_LABEL_MAP[typeKey.toLowerCase()] ||
                    FILE_TYPE_LABEL_MAP[typeKey] ||
                    typeKey;

                  return (
                    <div key={typeKey} className={styles.fileTypeBlock}>

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
                              <h3 className={styles.fileTypeHeader}>{formatFileTypeLabel(typeLabel)}</h3>

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
                  );
                })}
              </>
            );
          })()}
        </div>



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
