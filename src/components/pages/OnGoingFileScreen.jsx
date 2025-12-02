// src/screens/file/OnGoingFilesScreen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import apiService from "../../services/apiServices";
import styles from "../../styles/ongoing.module.css";
import Pagination from "../pagination/Pagination";
import LeftIconBlack from "../../assets/images/leftIconBlack.svg";
import FilterSection from "../filter/FilterSection";

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
      const datePart = dateStr.split(' ')[0];
      const [dd, mm, yyyy] = datePart.split('.');
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }

    // Eğer YYYY-MM-DD formatındaysa
    if (dateStr.includes('-')) {
      return dateStr.split(' ')[0];
    }

    return dateStr;
  };

  // Tarihi DD.MM.YYYY formatında göster
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "-";

    const datePart = dateStr.split(' ')[0];

    if (datePart.includes('.')) {
      return datePart;
    }

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

  return (
    <div className={styles.screenContainer}>
      <div className={styles.contentArea}>
        <div className={styles.rejectedHeader}>
          <h1 className={styles.pageTitle}>İşlemi Devam Edenler</h1>
        </div>
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
          <p className={styles.totalCount}>
            Toplam {totalCount} dosya bulundu.
          </p>
        )}

        <div className={styles.rejectedCard}>
          {isLoading ? (
            <div className={styles.rejectedLoading}>
              <div className={styles.rejectedSpinner} />
              <span>Yükleniyor...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className={styles.rejectedEmpty}>
              {fileNotifications.length === 0
                ? "Henüz işlemi devam eden dosya bulunmuyor."
                : "Filtreleme kriterlerinize uygun dosya bulunamadı."}
            </div>
          ) : (
            <div className={styles.rejectedList}>
              {filteredFiles.map((file) => (
                <div key={file.id} className={styles.rejectedItem}>
                  {/* 🔹 HEADER (Left data + Right Eye icon) */}
                  <div className={styles.rejectedHeaderRow}>
                    <div className={styles.rejectedLeft}>
                      <div className={styles.rejectedItemRow}>
                        <span className={styles.rejectedItemLabel}>Araç Plaka:</span>
                        <span className={styles.rejectedItemValue}>{file.vehicle_plate || "-"}</span>
                      </div>

                      <div className={styles.rejectedItemRow}>
                        <span className={styles.rejectedItemLabel}>Kaza Tarihi:</span>
                        <span className={styles.rejectedItemValue}>{file.accident_date || "-"}</span>
                      </div>

                      <div className={styles.rejectedItemRow}>
                        <span className={styles.rejectedItemLabel}>Araç Model:</span>
                        <span className={styles.rejectedItemValue}>{file.vehicle_model || "-"}</span>
                      </div>

                      <div className={styles.rejectedItemRow}>
                        <span className={styles.rejectedItemLabel}>Hasar Türü:</span>
                        <span className={styles.rejectedItemValue}>{file.damage_type || "-"}</span>
                      </div>

                      <div className={styles.rejectedItemRow}>
                        <span className={styles.rejectedItemLabel}>Tahmini Tutar:</span>
                        <span className={styles.rejectedItemValue}>
                          {file.estimated_amount ? `${file.estimated_amount} TL` : "-"}
                        </span>
                      </div>

                      <div className={styles.rejectedItemRow}>
                        <span className={styles.rejectedItemLabel}>Şirket:</span>
                        <span className={styles.rejectedItemValue}>{file.insurance_company_name || "-"}</span>
                      </div>

                      <div className={styles.rejectedItemRow}>
                        <span className={styles.rejectedItemLabel}>Oluşturulma:</span>
                        <span className={styles.rejectedItemValue}>{file.created_at_formatted || "-"}</span>
                      </div>
                    </div>

                    {/* 🔹 Eye chip sağ üstte */}
                    <button
                      type="button"
                      className={styles.detailChip}
                      onClick={() => handleFileDetail(file.id, file.file_number)}
                    >
                      <Eye className={styles.eyeIcon} size={18} strokeWidth={2.2} />
                      <span className={styles.detailText}>Dosya Detayı Gör</span>
                    </button>
                  </div>

                  {/* 🔹 DURUM BADGE */}
                  <div className={styles.rejectedItemBadge}>
                    <div className={`${styles.statusBadge} ${styles.pendingBadge}`}>
                      <span className={styles.processingBadgeText}>
                        Başvurunuz Beklemede
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />

        <div className={styles.btnArea}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <span className={styles.contactBtnIcon}>
              <img src={LeftIconBlack} alt="Geri" />
            </span>
            GERİ DÖN
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnGoingFilesScreen;