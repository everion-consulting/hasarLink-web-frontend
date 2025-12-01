import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Eye } from "lucide-react";

import apiService from "../../services/apiServices";
import styles from "../../styles/processed.module.css";

const ProcessedScreen = () => {
  const navigate = useNavigate();

  const [fileNotifications, setFileNotifications] = useState([]);   
  const [displayedFiles, setDisplayedFiles] = useState([]);         

 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchText, setSearchText] = useState("");

  const itemsPerPage = 20;

 
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

  
  const formatDateToYYYYMMDD = (dateStr) => {
    if (!dateStr) return "";

    const datePart = dateStr.split(" ")[0]; 

    
    if (datePart.includes(".")) {
      const [dd, mm, yyyy] = datePart.split(".");
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }

   
    if (datePart.includes("-")) {
      return datePart;
    }

    return dateStr;
  };

  
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "-";

    const datePart = dateStr.split(" ")[0];

    
    if (datePart.includes(".")) {
      return datePart;
    }

    
    if (datePart.includes("-")) {
      const [yyyy, mm, dd] = datePart.split("-");
      return `${dd}.${mm}.${yyyy}`;
    }

    return dateStr;
  };

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

          const normalized = safeArray.map((data) => {
            const createdRaw = data.created_at ?? "-";
            const accidentRaw = data.accident_date ?? "-";

            return {
              id: data.submission_id ?? Math.random().toString(),
              vehicle_plate: data.plate ?? "-",
              insurance_company_name: data.insurance_company_name ?? "-",
              vehicle_model: data.vehicle_model ?? "-",

              accident_date: accidentRaw,
              accident_date_formatted: formatDateForDisplay(accidentRaw),

              created_at: createdRaw,
              created_at_formatted: formatDateForDisplay(createdRaw),
              created_at_yyyy_mm_dd: formatDateToYYYYMMDD(createdRaw),

              status: data.status ?? "IN_PROGRESS",
              file_number: data.file_number ?? "-",
            };
          });

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

  
  useEffect(() => {
    let filtered = [...fileNotifications];

    // 🔹 Tarih filtresi (öncelik created_at, yoksa accident_date)
    if (selectedDate) {
      filtered = filtered.filter((file) => {
        const baseDate =
          file.created_at_yyyy_mm_dd ||
          (file.accident_date ? file.accident_date.slice(0, 10) : "");
        return baseDate === selectedDate;
      });
    }

  
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
    // 🔹 Filtre uygula -> sayfayı 1'e çek
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedDate("");
    setSearchText("");
    setCurrentPage(1);
  };

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
          <div className={styles.fileDetails}>
            <p>
              <strong>Araç Plaka:</strong> {data.vehicle_plate}
            </p>
            <p>
              <strong>Kaza Tarihi:</strong> {data.accident_date_formatted || "-"}
            </p>
            <p>
              <strong>Araç Model:</strong> {data.vehicle_model}
            </p>

            <p>
              <strong>{data.insurance_company_name}</strong>
              <span> - {data.created_at_formatted}</span>
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.detailChip}
              onClick={() => handleFileDetail(data.id, data.file_number)}
            >
              <Eye className={styles.eyeIcon} size={18} strokeWidth={2.2} />
              <span className={styles.detailText}>Dosya Detayı Gör</span>
            </button>

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
          <div className={`${styles.statusBadge} ${statusInfo.badgeClass}`}>
            <span className={statusInfo.textClass}>{statusInfo.text}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.screenContainerDrive}>
      <div className={styles.contentArea}>
        <h1 className={styles.headerTitleCentered}>İşleme Alınanlar</h1>

       
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
          <p className={styles.totalCount}>
            Toplam {totalCount} dosya bulundu.
          </p>
        )}

        <div className={styles.vehicleFormCard}>
          {displayedFiles.length > 0 ? (
            <div className={styles.listWrapper}>
              {displayedFiles.map(renderFileItem)}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>
                {fileNotifications.length > 0
                  ? "Filtreye uyan dosya bulunamadı."
                  : "Henüz dosya bildiriminiz yok."}
              </p>
            </div>
          )}
        </div>

        {/* SAYFALAMA */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationButton}
              onClick={() =>
                setCurrentPage((prev) => Math.max(1, prev - 1))
              }
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
                setCurrentPage((prev) =>
                  Math.min(totalPages, prev + 1)
                )
              }
              disabled={currentPage === totalPages}
            >
              Sonraki →
            </button>
          </div>
        )}

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

export default ProcessedScreen;
