import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiServices";
import styles from "../../styles/FileNotifications.module.css";
import { Eye } from "lucide-react";

const FileNotifications = () => {
  const [fileNotifications, setFileNotifications] = useState([]);   // tüm kayıtlar
  const [displayedFiles, setDisplayedFiles] = useState([]);         // filtre + sayfalama sonucu

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
        const res = await apiService.getAllSubmissions();

        if (!res.success) {
          console.error("Dosya bildirimleri alınırken hata oluştu:", res.message);
          return;
        }

        const raw = res?.data?.results || res?.data || [];
        setFileNotifications(Array.isArray(raw) ? raw : []);
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
            <p>
              <strong>Araç Plaka:</strong> {data.vehicle_plate || "-"}
            </p>

            <button
              className={styles.detailChip}
              onClick={() => handleFileDetail(data.id)}
            >
              <Eye className={styles.eyeIcon} size={18} strokeWidth={2.2} />
              <span className={styles.detailText}>Dosya Detayı Gör</span>
            </button>
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

      {/* 🔥 TASLAK / İŞLEME ALINANLAR İLE AYNI FİLTRE ALANI */}
      <div className={styles.filterSection}>
        <div className={styles.filterRow}>
          {/* TARİH FİLTRESİ */}
          <div className={styles.filterGroup}>
            <label htmlFor="selectedDate" className={styles.filterLabel}>
              Tarih Seçin:
            </label>

            <div className={styles.inputWrapper}>
              <input
                type="date"
                id="selectedDate"
                className={styles.filterDate}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          {/* GENEL ARAMA FİLTRESİ */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Genel Arama:</label>

            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Plaka, şirket, tarih, model..."
                className={styles.filterDate}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>

          {/* BUTONLAR */}
          <div className={styles.buttonGroup}>
            <button
              className={styles.filterButton}
              onClick={handleFilterChange}
              disabled={!selectedDate && !searchText}
            >
              Filtrele
            </button>
            <button
              className={styles.clearFilterButton}
              onClick={handleClearFilters}
              disabled={!selectedDate && !searchText}
            >
              Filtreyi Temizle
            </button>
          </div>
        </div>
      </div>

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

      {/* SAYFALAMA */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            ← Önceki
          </button>

          <div className={styles.paginationInfo}>
            Sayfa {currentPage} / {totalPages}
          </div>

          <button
            className={styles.paginationButton}
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            Sonraki →
          </button>
        </div>
      )}
    </div>
  );
};

export default FileNotifications;
