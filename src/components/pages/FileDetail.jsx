import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiService from "../../services/apiServices";
import submissionService from "../../services/submissionService";
import styles from "../../styles/FileDetail.module.css";
import LeftIconBlack from "../../assets/images/leftIconBlack.svg";
import DocumentDetailIcon from "../../assets/images/documentDetail.svg";
import KazaIcon from "../../assets/images/kazaicon.svg";
import ExperIcon from "../../assets/images/expericon.svg";
import SurucuIcon from "../../assets/images/surucuicon.svg";
import MagdurIcon from "../../assets/images/magduricon.svg";
import AracIcon from "../../assets/images/aracicon.svg";
import BelgeIcon from "../../assets/images/belgeicon.svg";
import { FILE_TYPE_LABEL_MAP } from "../../constants/filesTypes";
import WorkflowTimeline from "../workflow/WorkflowTimeline";
import ExpertAssignmentPanel from "../workflow/ExpertAssignmentPanel";
import InsurancePaymentPanel from "../workflow/InsurancePaymentPanel";
import { useProfile } from "../../context/ProfileContext";
import { useSubmissionSocket } from "../../utils/useSubmissionSocket";


const FileDetail = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { profileData } = useProfile();

  const [fileData, setFileData] = useState(null);
  const [fileImages, setFileImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const applyFileData = useCallback((data) => {
    setFileData(data);
    if (Array.isArray(data?.files)) {
      const grouped = {};
      data.files.forEach((f) => {
        if (!grouped[f.file_type]) grouped[f.file_type] = [];
        grouped[f.file_type].push({ id: f.id, url: f.file_url, name: f.name, uploaded_at: f.uploaded_at });
      });
      setFileImages(grouped);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    const res = await apiService.getSubmissionDetail(fileId);
    if (res.success) applyFileData(res.data);
  }, [fileId, applyFileData]);

  // WebSocket: workflow_stage veya exper_informations değişince güncelle
  useSubmissionSocket(fileId, useCallback((wsData) => {
    if (!wsData) return;
    setFileData(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        workflow_stage: wsData.workflow_stage,
        workflow_stage_display: wsData.workflow_stage_display,
        exper_informations: wsData.exper_informations ?? prev.exper_informations,
        ...(wsData.status ? { status: wsData.status } : {}),
        ...(wsData.insurance_company_date !== undefined ? { insurance_company_date: wsData.insurance_company_date } : {}),
        ...(wsData.payment_problem_reason !== undefined ? { payment_problem_reason: wsData.payment_problem_reason } : {}),
      };
      // Admin'den gelen verilerle ilgili aşamalarda tam veriyi çek
      const adminStages = [
        "SIGORTA_SIRKETINDEN_VERILEN_ODEME_TARIHI",
        "ODEME_ALDINIZ_MI",
        "ODEME_SORUNU_KONTROL_EDILIYOR",
      ];
      if (adminStages.includes(wsData.workflow_stage)) {
        setTimeout(() => handleRefresh(), 500);
      }
      return updated;
    });
  }, [handleRefresh]));


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

        applyFileData(res.data);

      } catch (err) {
        console.error("❌ Hata:", err);
      } finally {
        setLoading(false);
      }
    };

    if (fileId) {
      fetchFileDetail();
    }
  }, [fileId, applyFileData]);




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
      <div key={label} className={styles.infoRow}>
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

      {/* ── Özet Kart ─────────────────────────────────────── */}
      <div className={styles.summaryCard}>
        <div className={styles.cardHeader}>
          <div className={styles.leftSection}>
            <div className={styles.iconBox}><img src={DocumentDetailIcon} alt="Dosya" style={{ width: 28, height: 28 }} /></div>
            <div>
              <h3 className={styles.title}>Dosya Detayı</h3>
              <p className={styles.company}>{fileData.insurance_company_name}</p>
            </div>
          </div>
          <div className={styles.statusBadge}>
            <span className={styles.statusDot} />
            {fileData.workflow_stage_display || statusMap[fileData.status] || fileData.status}
          </div>
        </div>

        <div className={styles.cardDivider} />

        <div className={styles.cardContent}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Sigorta Sorgulama</span>
            {fileData?.incurance_query_link ? (
              <a
                href={normalizeUrl(fileData.incurance_query_link)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                Ekranı Aç ↗
              </a>
            ) : (
              <span className={styles.mutedText}>Link yok</span>
            )}
          </div>

          <div className={styles.divider} />

          <div className={styles.infoItem}>
            <span className={styles.label}>Oluşturulma Tarihi</span>
            <span className={styles.value}>{formatDate(fileData.created_at) || "—"}</span>
          </div>

          <div className={styles.divider} />

          <div className={styles.infoItem}>
            <span className={styles.label}>İşlenme Tarihi</span>
            <span className={styles.value}>{formatDate(fileData.processed_at) || "—"}</span>
          </div>

          <div className={styles.divider} />

          <div className={styles.infoItem}>
            <span className={styles.label}>Tamamlanma Tarihi</span>
            <span className={styles.value}>{formatDate(fileData.completed_at) || "—"}</span>
          </div>
        </div>
      </div>

      <div className={styles.detailCard}>

        <WorkflowTimeline
          submissionId={fileId}
          fileData={fileData}
          userRole={profileData?.user_type}
          repairStages={fileData.repair_stages || []}
          onRepairStagesUpdate={(data) =>
            setFileData((prev) => ({ ...prev, repair_stages: data }))
          }
          onRefresh={handleRefresh}
        />
        <div className={styles.separator}></div>

        {/* ── TARAF BİLGİLERİ ─────────────────────────────────────────── */}
        {(() => {
          const driverRows = [
            { label: "Ad Soyad", value: fileData.driver_fullname },
            { label: "Doğum Tarihi", value: formatDate(fileData.driver_birth_date) },
            { label: "Telefon", value: fileData.driver_phone },
            { label: "Email", value: fileData.driver_mail },
            { label: "T.C. No", value: fileData.driver_tc },
          ].filter((r) => r.value);

          const victimRows = [
            { label: "Ad Soyad", value: fileData.victim_fullname },
            { label: "Doğum Tarihi", value: formatDate(fileData.victim_birth_date) },
            { label: "Telefon", value: fileData.victim_phone },
            { label: "Email", value: fileData.victim_mail },
            { label: "İBAN", value: fileData.victim_iban },
            { label: "T.C. No", value: fileData.victim_tc },
          ].filter((r) => r.value);

          const vehicleRows = [
            { label: "Plaka", value: fileData.vehicle_plate },
            { label: "Marka", value: fileData.vehicle_brand },
            { label: "Model", value: fileData.vehicle_model },
            { label: "Şasi No", value: fileData.vehicle_chassis_no },
            { label: "Motor No", value: fileData.vehicle_engine_no },
            { label: "Ruhsat", value: fileData.vehicle_license_no },
            { label: "Tür", value: fileData.vehicle_type },
            { label: "Kullanım Türü", value: fileData.vehicle_usage_type },
            { label: "Model Yılı", value: fileData.vehicle_year },
          ].filter((r) => r.value);

          // Sürücü = mağdursa (aynı kişi) sürücü kartını gösterme
          const driverSameAsVictim =
            driverRows.length > 0 &&
            victimRows.length > 0 &&
            fileData.driver_tc &&
            fileData.victim_tc &&
            fileData.driver_tc === fileData.victim_tc;

          const showDriver = driverRows.length > 0 && !driverSameAsVictim;
          const showVictim = victimRows.length > 0;
          const showVehicle = vehicleRows.length > 0;

          const hasAny = showDriver || showVictim || showVehicle || true; // eksper her zaman

          return hasAny ? (
            <>
              <h2 className={styles.sectionTitle}>Taraf Bilgileri</h2>
              <div className={styles.partyGrid}>

                {/* Eksper Ataması — her zaman göster */}
                <div className={styles.partyCard}>
                  <div className={styles.partyCardHeader}>
                    <div className={styles.partyIconBox} style={{ background: "#FBC02D80" }}>
                      <img src={ExperIcon} alt="" style={{ width: 24, height: 24 }} />
                    </div>
                    <div>
                      <div className={styles.partyCardTitle}>Eksper Ataması</div>
                      <div className={styles.partyCardSub}>Atanan uzman</div>
                    </div>
                  </div>
                  <div className={styles.partyDivider} />
                  <ExpertAssignmentPanel
                    submissionId={fileId}
                    assignment={fileData.expert_assignment}
                    experInformations={fileData.exper_informations}
                    onUpdate={() => handleRefresh()}
                  />
                </div>

                {/* Araç Bilgileri */}
                {showVehicle && (
                  <div className={styles.partyCard}>
                    <div className={styles.partyCardHeader}>
                      <div className={styles.partyIconBox} style={{ background: "#43A04780" }}>
                        <img src={AracIcon} alt="" style={{ width: 24, height: 24 }} />
                      </div>
                      <div>
                        <div className={styles.partyCardTitle}>Araç Bilgileri</div>
                        <div className={styles.partyCardSub}>Hasar gören araç</div>
                      </div>
                    </div>
                    <div className={styles.partyDivider} />
                    {vehicleRows.map((r) => renderInfoRow(r.label, r.value))}
                  </div>
                )}

                {/* Sürücü Bilgileri — her zaman göster, boşsa mağdur verisiyle doldur */}
                {(() => {
                  const effectiveDriverRows = driverRows.length > 0
                    ? driverRows
                    : victimRows; // sürücü boşsa mağdur verisini kullan
                  return (
                    <div className={styles.partyCard}>
                      <div className={styles.partyCardHeader}>
                        <div className={styles.partyIconBox} style={{ background: "#608BC180" }}>
                          <img src={SurucuIcon} alt="" style={{ width: 24, height: 24 }} />
                        </div>
                        <div>
                          <div className={styles.partyCardTitle}>Sürücü Bilgileri</div>
                          <div className={styles.partyCardSub}>
                            {driverRows.length === 0 && victimRows.length > 0
                              ? "Sürücü ve mağdur aynı kişi"
                              : "Kazaya karışan sürücü"}
                          </div>
                        </div>
                      </div>
                      <div className={styles.partyDivider} />
                      {effectiveDriverRows.map((r) => renderInfoRow(r.label, r.value))}
                    </div>
                  );
                })()}

                {/* Mağdur Bilgileri */}
                {showVictim && (
                  <div className={styles.partyCard}>
                    <div className={styles.partyCardHeader}>
                      <div className={styles.partyIconBox} style={{ background: "#C6282880" }}>
                        <img src={MagdurIcon} alt="" style={{ width: 24, height: 24 }} />
                      </div>
                      <div>
                        <div className={styles.partyCardTitle}>
                          {driverSameAsVictim ? "Sürücü / Mağdur Bilgileri" : "Mağdur Bilgileri"}
                        </div>
                        <div className={styles.partyCardSub}>
                          {driverSameAsVictim ? "Sürücü ve mağdur aynı kişi" : "Zarar gören taraf"}
                        </div>
                      </div>
                    </div>
                    <div className={styles.partyDivider} />
                    {victimRows.map((r) => renderInfoRow(r.label, r.value))}
                  </div>
                )}

              </div>
            </>
          ) : null;
        })()}

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

          const kazaRows = [
            { label: "Kaza Tarihi", value: accidentDate },
            { label: "Kaza Saati", value: accidentTime },
            { label: "Kaza Yeri", value: fileData.accident_location },
            { label: "Kaza İli", value: fileData.accident_city },
            { label: "Kaza İlçesi", value: fileData.accident_district },
          ].filter((r) => r.value);

          return (
            <div className={styles.partyCard} style={{ marginBottom: 24 }}>
              <div className={styles.partyCardHeader}>
                <div className={styles.partyIconBox} style={{ background: "#C6282880" }}>
                  <img src={KazaIcon} alt="" style={{ width: 24, height: 24 }} />
                </div>
                <div>
                  <div className={styles.partyCardTitle}>Kaza Detayları</div>
                  <div className={styles.partyCardSub}>Olay tarihi ve saati</div>
                </div>
              </div>
              <div className={styles.partyDivider} />
              {kazaRows.length > 0 ? (
                <div className={styles.kazaBoxGrid}>
                  {kazaRows.map((r) => (
                    <div key={r.label} className={styles.kazaBox}>
                      <span className={styles.kazaBoxLabel}>{r.label}</span>
                      <span className={styles.kazaBoxValue}>{r.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#94a3b8", fontSize: 14 }}>Kaza bilgisi girilmemiş.</p>
              )}
            </div>
          );
        })()}

        <div className={styles.separator}></div>

        <h2 className={styles.sectionTitle}>Yüklenen Dosyalar</h2>

        {(() => {
          const allFiles = Object.entries(fileImages).flatMap(([typeKey, files]) =>
            (files || []).map((f) => ({
              ...f,
              typeKey,
              typeLabel:
                FILE_TYPE_LABEL_MAP[typeKey.toLowerCase()] ||
                FILE_TYPE_LABEL_MAP[typeKey] ||
                typeKey,
            }))
          );

          if (!allFiles.length) {
            return (
              <p className={styles.noFiles}>
                Henüz yüklenmiş dosya bulunmuyor.
              </p>
            );
          }

          return (
            <div className={styles.partyCard} style={{ marginBottom: 24 }}>
              <div className={styles.partyCardHeader}>
                <div className={styles.partyIconBox} style={{ background: "#A647FF80" }}>
                  <img src={BelgeIcon} alt="" style={{ width: 24, height: 24 }} />
                </div>
                <div>
                  <div className={styles.partyCardTitle}>Belgeler</div>
                  <div className={styles.partyCardSub}>{allFiles.length} dosya yüklendi</div>
                </div>
              </div>
              <div className={styles.partyDivider} />
              <div className={styles.uploadedFilesGrid}>
                {allFiles.map((f) => {
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
                      className={styles.uploadedFileItem}
                      onClick={handleClick}
                    >
                      {isPdf ? (
                        <div className={styles.uploadedPdfThumb}>📄</div>
                      ) : (
                        <img
                          src={f.url}
                          alt={f.name}
                          className={styles.uploadedThumb}
                        />
                      )}
                      <span className={styles.uploadedFileName}>
                        {f.name || (isPdf ? "PDF Dosya" : "Dosya")}
                      </span>
                      <span className={styles.uploadedFileType}>
                        {formatFileTypeLabel(f.typeLabel)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}



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
