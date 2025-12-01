// src/screens/file/OnGoingFilesScreen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Eye, Search, X, Calendar } from "lucide-react";
import apiService from "../../services/apiServices";
import styles from "../../styles/ongoing.module.css";

const OnGoingFilesScreen = () => {
  const navigate = useNavigate();
  const [fileNotifications, setFileNotifications] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 10;

  // Türkçe karakter normalize fonksiyonu
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

  // Verileri getir
  useEffect(() => {
    fetchFilesData();
  }, []);

  // Filtreleme
  useEffect(() => {
    applyFilters();
  }, [fileNotifications, searchText, selectedDate, currentPage]);

  // Tarihi YYYY-MM-DD formatına çevir (DD.MM.YYYY -> YYYY-MM-DD)
  const formatDateToYYYYMMDD = (dateStr) => {
    if (!dateStr) return "";

    // Eğer DD.MM.YYYY formatındaysa (örn: "29.11.2025")
    if (dateStr.includes('.')) {
      const datePart = dateStr.split(' ')[0]; // "29.11.2025 20:12" -> "29.11.2025"
      const [dd, mm, yyyy] = datePart.split('.');
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }

    // Eğer YYYY-MM-DD formatındaysa
    if (dateStr.includes('-')) {
      return dateStr.split(' ')[0]; // "2025-11-29 20:12:00" -> "2025-11-29"
    }

    return dateStr;
  };

  // Tarihi DD.MM.YYYY formatında göster
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "-";

    // Sadece tarih kısmını al
    const datePart = dateStr.split(' ')[0];

    // Eğer DD.MM.YYYY formatındaysa
    if (datePart.includes('.')) {
      return datePart;
    }

    // Eğer YYYY-MM-DD formatındaysa
    if (datePart.includes('-')) {
      const [yyyy, mm, dd] = datePart.split('-');
      return `${dd}.${mm}.${yyyy}`;
    }

    return dateStr;
  };

  const fetchFilesData = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getPendingSubmissions();
      console.log("✅ Web API yanıtı (pending):", res?.data || res);

      if (res?.success) {
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

        console.log("📊 API'den gelen raw veriler:", safeArray);

        const normalized = safeArray.map((data) => ({
          id: data.submission_id ?? Math.random().toString(),
          vehicle_plate: data.plate ?? "-",
          insurance_company_name: data.insurance_company_name ?? "-",
          vehicle_model: data.vehicle_model ?? "-",
          vehicle_brand: data.vehicle_brand ?? "-",
          accident_date: data.accident_date ?? "-",
          created_at: data.created_at ?? "-",
          status: "PENDING",
          file_number: data.file_number ?? "-",
          damage_type: data.damage_type ?? "-",
          estimated_amount: data.estimated_damage_amount ?? "-",
          // API'den gelen created_at'i parse ediyoruz
          created_at_formatted: formatDateForDisplay(data.created_at),
          created_at_yyyy_mm_dd: formatDateToYYYYMMDD(data.created_at),
        }));

        console.log("📊 Formatlanmış veriler:", normalized);

        setFileNotifications(normalized);
      } else {
        console.warn("❌ API başarısız:", res?.message);
      }
    } catch (error) {
      console.error("❌ Dosya bildirimleri alınırken hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...fileNotifications];

    // Tarih filtresi
    if (selectedDate) {
      filtered = filtered.filter((file) => {
        const fileDate = file.created_at_yyyy_mm_dd;
        return fileDate === selectedDate;
      });
    }

    // Genel arama filtresi
    if (searchText.trim() !== "") {
      const normalizedSearch = normalize(searchText);
      filtered = filtered.filter((file) => {
        const combined = normalize(
          `${file.vehicle_plate} ${file.insurance_company_name} ${file.vehicle_model} ${file.vehicle_brand} ${file.accident_date} ${file.created_at} ${file.file_number} ${file.damage_type}`
        );
        return combined.includes(normalizedSearch);
      });
    }

    // Sayfalama uygula
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);

    setFilteredFiles(paginated);
    setTotalCount(filtered.length);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedDate('');
    setSearchText('');
    setCurrentPage(1);
  };

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
      <div key={data.id} className={styles.fileItem}>
        <div className={styles.fileTexts}>
          <p className={styles.fileText}>
            <strong>Araç Plaka: </strong>{data.vehicle_plate || "-"}
          </p>
          <p className={styles.fileText}>
            <strong>Kaza Tarihi: </strong>{data.accident_date || "-"}
          </p>
          <p className={styles.fileText}>
            <strong>Araç Model: </strong>{data.vehicle_model || "-"}
          </p>
          <p className={styles.fileText}>
            <strong>Hasar Türü: </strong>{data.damage_type || "-"}
          </p>
          <p className={styles.fileText}>
            <strong>Tahmini Tutar: </strong>{data.estimated_amount ? `${data.estimated_amount} TL` : "-"}
          </p>
          <p className={styles.fileText}>
            <strong>Şirket: </strong>{data.insurance_company_name || "-"}
          </p>
          <p className={styles.fileText}>
            <strong>Oluşturulma: </strong>{data.created_at_formatted || "-"}
          </p>
        </div>

        <div className={styles.statusRow}>
          <div className={`${styles.statusBadge} ${statusInfo.badgeClass}`}>
            <span className={statusInfo.textClass}>
              {statusInfo.text}
            </span>
          </div>
          
          <div className={styles.actions}>
            <button
              className={styles.detailButton}
              onClick={() => handleFileDetail(data.id, data.file_number)}
            >
              <Eye size={18} style={{ marginRight: 8 }} />
              Dosya Detayı Gör
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.onGoingFiles}>
      <h1 className={styles.title}>İşlemi Devam Edenler</h1>

      {/* Filter Section */}
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
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* GENEL ARAMA FİLTRESİ */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Genel Arama:</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Plaka, şirket, model..."
                className={styles.filterDate}
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* BUTTONS */}
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

      {/* GRID LIST → KARTLAR */}
      <ul className={styles.gridWrapper}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Dosyalar yükleniyor...</p>
          </div>
        ) : filteredFiles.length > 0 ? (
          filteredFiles.map((file) => (
            <li key={file.id} className={styles.fileItem}>
              <div className={styles.fileTexts}>
                <p className={styles.fileText}>
                  <strong>Araç Plaka: </strong>{file.vehicle_plate || "-"}
                </p>
                <p className={styles.fileText}>
                  <strong>Kaza Tarihi: </strong>{file.accident_date || "-"}
                </p>
                <p className={styles.fileText}>
                  <strong>Araç Model: </strong>{file.vehicle_model || "-"}
                </p>
                <p className={styles.fileText}>
                  <strong>Hasar Türü: </strong>{file.damage_type || "-"}
                </p>
                <p className={styles.fileText}>
                  <strong>Tahmini Tutar: </strong>{file.estimated_amount ? `${file.estimated_amount} TL` : "-"}
                </p>
                <p className={styles.fileText}>
                  <strong>Şirket: </strong>{file.insurance_company_name || "-"}
                </p>
                <p className={styles.fileText}>
                  <strong>Oluşturulma: </strong>{file.created_at_formatted || "-"}
                </p>
              </div>

              <div className={styles.statusRow}>
                <div className={`${styles.statusBadge} ${styles.pendingBadge}`}>
                  <span className={styles.processingBadgeText}>
                    Başvurunuz Beklemede
                  </span>
                </div>
                
                <div className={styles.actions}>
                  <button
                    className={styles.detailButton}
                    onClick={() => handleFileDetail(file.id, file.file_number)}
                  >
                    <Eye size={18} style={{ marginRight: 8 }} />
                    Dosya Detayı Gör
                  </button>
                </div>
              </div>
            </li>
          ))
        ) : (
          <p className={styles.noFileText}>
            {fileNotifications.length === 0 
              ? "Henüz işlemi devam eden dosya bulunmuyor." 
              : "Filtreleme kriterlerinize uygun dosya bulunamadı."}
          </p>
        )}
      </ul>

      {/* Pagination */}
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

      {/* Geri Dön Butonu */}
      <div className={styles.btnArea}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <span className={styles.contactBtnIcon}>
            <img src="/src/assets/images/left-icon-black.svg" alt="Geri" />
          </span>
          GERİ DÖN
        </button>
      </div>
    </div>
  );
};

export default OnGoingFilesScreen;