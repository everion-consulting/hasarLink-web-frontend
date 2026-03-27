// src/screens/file/RejectedFilesScreen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import apiService from "../../services/apiServices";
import styles from "../../styles/rejectedFileScreen.module.css";
import Pagination from "../pagination/Pagination";
import LeftIconBlack from "../../assets/images/leftIconBlack.svg";
import FilterSection from "../filter/FilterSection";

const RejectedFilesScreen = () => {
  const navigate = useNavigate();

  const [fileNotifications, setFileNotifications] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

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

  // Tarihi YYYY-MM-DD formatına çevir
  const formatDateToYYYYMMDD = (dateStr) => {
    if (!dateStr) return "";

    if (dateStr.includes('.')) {
      const datePart = dateStr.split(' ')[0];
      const [dd, mm, yyyy] = datePart.split('.');
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }

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

        const normalized = list.map((data) => ({
          ...data,
          id: data.submission_id ?? Math.random().toString(),
          plate: data.plate || "-",
          date: data.date || "-",
          message: data.message || "-",
          fields: data.fields || [],
          // Tarih formatları
          date_formatted: formatDateForDisplay(data.date),
          date_yyyy_mm_dd: formatDateToYYYYMMDD(data.date),
        }));

        setFileNotifications(normalized);
      } catch (error) {
        window.alert("Reddedilen dosyalar alınırken bir hata oluştu.");
        setFileNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    getFileNotifications();
  }, []);

  // Filtreleme
  useEffect(() => {
    applyFilters();
  }, [fileNotifications, searchText, selectedDate, currentPage]);

  const applyFilters = () => {
    let filtered = [...fileNotifications];

    // Tarih filtresi
    if (selectedDate) {
      filtered = filtered.filter((file) => {
        const fileDate = file.date_yyyy_mm_dd;
        return fileDate === selectedDate;
      });
    }

    // Genel arama filtresi
    if (searchText.trim() !== "") {
      const normalizedSearch = normalize(searchText);
      filtered = filtered.filter((file) => {
        const combined = normalize(
          `${file.plate} ${file.message} ${file.date}`
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

  const handleFileDetail = (item) => {
    navigate(`/reddedilen-dosyalar-detay/${item.submission_id}`, {
      state: {
        from: "reddedilen-dosyalar",
        // Fields sadece dolu ise gönder, boş ise fallback'e git
        ...(item.fields && item.fields.length > 0 && { rejectedFields: item.fields }),
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
            <span className={styles.rejectedItemValue}>{data.date_formatted || "-"}</span>
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
          {loading ? (
            <div className={styles.rejectedLoading}>
              <div className={styles.rejectedSpinner} />
              <span>Yükleniyor...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className={styles.rejectedEmpty}>
              {fileNotifications.length === 0
                ? "Henüz reddedilen dosyanız bulunmuyor."
                : "Filtreleme kriterlerinize uygun dosya bulunamadı."}
            </div>
          ) : (
            <div className={styles.rejectedList}>
              {filteredFiles.map(renderFileItem)}
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

export default RejectedFilesScreen;