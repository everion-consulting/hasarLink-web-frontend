import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiServices";
import styles from "../../styles/FileNotifications.module.css";
import { Eye } from "lucide-react";
import Pagination from "../pagination/Pagination.jsx";
import FilterSection from "../filter/FilterSection.jsx";

const FileNotifications = () => {
  const [fileNotifications, setFileNotifications] = useState([]);   // tüm kayıtlar
  const [displayedFiles, setDisplayedFiles] = useState([]);         // filtre + sayfalama sonucu
  const [rejectionReasonsById, setRejectionReasonsById] = useState({});
  const [rejectedSubmissionIdById, setRejectedSubmissionIdById] = useState({});
  const [rejectedFieldsById, setRejectedFieldsById] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchText, setSearchText] = useState("");

  const itemsPerPage = 20;
  const navigate = useNavigate();

  // Türkçe karakter normalize
  const normalize = (str) =>
    str
      ?.toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c");

  useEffect(() => {
    const fetchFileNotifications = async () => {
      try {
        const [submissionsRes, rejectedRes] = await Promise.all([
          apiService.getAllSubmissions(),
          apiService.getRejectedSubmissions(),
        ]);

        if (!submissionsRes.success) {
          console.error("Dosya bildirimleri alınırken hata oluştu:", submissionsRes.message);
          return;
        }

        const raw = submissionsRes?.data?.results || submissionsRes?.data || [];
        setFileNotifications(Array.isArray(raw) ? raw : []);

        if (rejectedRes?.success) {
          const rejectedRaw = Array.isArray(rejectedRes?.data)
            ? rejectedRes.data
            : rejectedRes?.data?.rejected_files || [];

          const nextReasons = {};
          const nextSubmissionIds = {};
          const nextRejectedFields = {};

          rejectedRaw.forEach((item) => {
            const reason =
              item?.rejection_reason ||
              item?.reject_reason ||
              item?.rejected_reason ||
              item?.rejectionReason ||
              item?.message ||
              item?.rejected_message ||
              item?.reason;

            if (!reason || typeof reason !== "string" || !reason.trim()) {
              return;
            }

            const keys = [
              item?.submission_id,
              item?.id,
              item?.submission,
              item?.file_submission_id,
            ].filter(Boolean);

            const canonicalSubmissionId =
              item?.submission_id ||
              item?.submission ||
              item?.file_submission_id ||
              item?.id;

            const normalizedFields = Array.isArray(item?.fields) ? item.fields : [];

            keys.forEach((key) => {
              const normalizedKey = String(key);

              if (typeof reason === "string" && reason.trim()) {
                nextReasons[normalizedKey] = reason.trim();
              }

              if (canonicalSubmissionId) {
                nextSubmissionIds[normalizedKey] = String(canonicalSubmissionId);
              }

              nextRejectedFields[normalizedKey] = normalizedFields;
            });
          });

          setRejectionReasonsById(nextReasons);
          setRejectedSubmissionIdById(nextSubmissionIds);
          setRejectedFieldsById(nextRejectedFields);
        }
      } catch (error) {
        console.error("Dosya bildirimleri alınırken hata oluştu:", error);
      }
    };

    fetchFileNotifications();
  }, []);

  // 🔥 Filtre + sayfalama
  useEffect(() => {
    let filtered = [...fileNotifications];

    // Tarih filtresi -> created_at varsa onu, yoksa accident_date
    if (selectedDate) {
      filtered = filtered.filter((file) => {
        const baseDate = (file.created_at || file.accident_date) ?? "";
        const fileDate = baseDate.slice(0, 10);
        return fileDate === selectedDate;
      });
    }

    // Genel arama filtresi
    if (searchText.trim() !== "") {
      const n = normalize(searchText);

      filtered = filtered.filter((file) => {
        const combined = normalize(
          `${file.vehicle_plate} ${file.accident_date} ${file.insurance_company_name} ${file.vehicle_model} ${file.created_at}`
        );
        return combined.includes(n);
      });
    }

    const total = filtered.length;
    setTotalCount(total);

    const totalPagesCalc = total > 0 ? Math.ceil(total / itemsPerPage) : 1;
    setTotalPages(totalPagesCalc);

    const safePage = Math.min(currentPage, totalPagesCalc);
    const startIndex = (safePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    setDisplayedFiles(filtered.slice(startIndex, endIndex));
  }, [fileNotifications, selectedDate, searchText, currentPage]);

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedDate("");
    setSearchText("");
    setCurrentPage(1);
  };

  const handleFileDetail = (fileId) => {
    navigate(`/file-detail/${fileId}`);
  };

  const handleRejectedFileEdit = (data) => {
    const submissionId =
      rejectedSubmissionIdById[String(data?.id)] ||
      rejectedSubmissionIdById[String(data?.submission_id)] ||
      rejectedSubmissionIdById[String(data?.submission)] ||
      rejectedSubmissionIdById[String(data?.file_submission_id)] ||
      data?.submission_id ||
      data?.id ||
      data?.submission ||
      data?.file_submission_id;

    if (!submissionId) {
      return;
    }

    const rejectedFields =
      rejectedFieldsById[String(data?.id)] ||
      rejectedFieldsById[String(data?.submission_id)] ||
      rejectedFieldsById[String(data?.submission)] ||
      rejectedFieldsById[String(data?.file_submission_id)] ||
      data?.fields ||
      data?.rejected_fields ||
      [];

    navigate(`/reddedilen-dosyalar-detay/${submissionId}`, {
      state: {
        from: "reddedilen-dosyalar",
        rejectedFields,
      },
    });
  };

  const getRejectionReason = (data) => {
    const candidate =
      data?.rejection_reason ||
      data?.reject_reason ||
      data?.rejected_reason ||
      data?.rejectionReason ||
      data?.message ||
      data?.rejected_message ||
      data?.reason;

    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }

    const linkedReason =
      rejectionReasonsById[String(data?.id)] ||
      rejectionReasonsById[String(data?.submission_id)] ||
      rejectionReasonsById[String(data?.submission)] ||
      rejectionReasonsById[String(data?.file_submission_id)] ||
      "";

    return linkedReason;
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
          {/* ÜST SATIR: Plaka solda, chip sağda */}
          <div className={styles.fileTopRow}>
            <div className={styles.fileMainInfo}>
              {data.folder_no && (
                <p>
                  <strong>Dosya No:</strong> {data.folder_no}
                </p>
              )}

              {data.exper_informations && (
                <p>
                  <strong>Exper Bilgisi:</strong> {data.exper_informations}
                </p>
              )}

              <p>
                <strong>Araç Plaka:</strong> {data.vehicle_plate || "-"}
              </p>
            </div>

            <div className={styles.fileActionGroup}>
              <button
                className={styles.detailChip}
                onClick={() => handleFileDetail(data.id)}
              >
                <Eye className={styles.eyeIcon} size={18} strokeWidth={2.2} />
                <span className={styles.detailText}>Dosya Detayı Gör</span>
              </button>

              {data.status === "REJECTED" && (
                <button
                  className={`${styles.detailChip} ${styles.rejectedEditChip}`}
                  onClick={() => handleRejectedFileEdit(data)}
                >
                  <span className={styles.detailText}>Reddedilen Dosyayı Duzenle</span>
                </button>
              )}
            </div>
          </div>

          {/* Diğer bilgiler altta */}
          <p>
            <strong>Kaza Tarihi:</strong> {data.accident_date?.slice(0, 10) || "-"}
          </p>
          <p>
            <strong>Araç Model:</strong> {data.vehicle_model || "-"}
          </p>
          <p>
            <strong>{data.insurance_company_name || "-"}</strong>{" "}
            - {(data.created_at || data.accident_date || "").slice(0, 10)}
          </p>

          {data.status === "REJECTED" && (
            <p className={styles.rejectionReason}>
              <strong>Red Nedeni:</strong> {getRejectionReason(data) || "Belirtilmedi"}
            </p>
          )}
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

      {/* Filter Section */}
      <FilterSection
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        searchText={searchText}
        setSearchText={setSearchText}
        onFilter={handleFilterChange}
        onClear={handleClearFilters}
      />

      {totalCount > 0 && (
        <p className={styles.totalCount}>Toplam {totalCount} dosya bulundu.</p>
      )}

      <ul className={styles.fileList}>
        {displayedFiles.length > 0 ? (
          displayedFiles.map(renderFileItem)
        ) : (
          <p>
            {fileNotifications.length > 0
              ? "Filtreye uyan dosya bulunamadı."
              : "Henüz dosya bildiriminiz yok."}
          </p>
        )}
      </ul>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};

export default FileNotifications;
