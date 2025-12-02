// src/components/pages/NotifiedScreen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Eye } from "lucide-react";
import LeftIconBlack from "../../assets/images/leftIconBlack.svg";
import apiService from "../../services/apiServices";
import styles from "../../styles/notified.module.css";

const NotifiedScreen = () => {
  const navigate = useNavigate();

  // DATA STATES
  const [originalData, setOriginalData] = useState([]);
  const [filteredList, setFilteredList] = useState([]);

  // FILTER STATES
  const [selectedDate, setSelectedDate] = useState("");
  const [searchText, setSearchText] = useState("");

  // ===========================
  // Normalizasyon
  // ===========================
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

  // ===========================
  // TARİH FORMAT FONKSİYONLARI
  // ===========================

  // "29.11.2025" → "2025-11-29"
  const formatDateToYYYYMMDD = (dateStr) => {
    if (!dateStr) return "";

    if (dateStr.includes(".")) {
      const datePart = dateStr.split(" ")[0];
      const [dd, mm, yyyy] = datePart.split(".");
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }

    if (dateStr.includes("-")) {
      return dateStr.split(" ")[0];
    }

    return dateStr;
  };

  // "2025-11-29" → "29.11.2025"
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "-";

    const datePart = dateStr.split(" ")[0];

    if (datePart.includes(".")) return datePart;

    if (datePart.includes("-")) {
      const [yyyy, mm, dd] = datePart.split("-");
      return `${dd}.${mm}.${yyyy}`;
    }

    return dateStr;
  };

  // ===========================
  // BACKEND'TEN DATA ÇEK
  // ===========================
  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await apiService.getCompletedSubmissions();

        const payload = res?.data?.queryset || res?.data || [];

        const safeArray = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.results)
            ? payload.results
            : [];

        const parsed = safeArray.map((item) => ({
          id: item.submission_id ?? Math.random().toString(),
          vehicle_plate: item.plate ?? "-",
          insurance_company_name: item.insurance_company_name ?? "-",
          vehicle_model: item.vehicle_model ?? "-",
          accident_date: item.accident_date ?? "-",
          created_at: item.created_at ?? "-",
          created_at_formatted: formatDateForDisplay(item.created_at),
          created_at_yyyy_mm_dd: formatDateToYYYYMMDD(item.created_at),
          status: item.status ?? "COMPLETED",
          file_number: item.file_number ?? "-"
        }));

        setOriginalData(parsed);
        setFilteredList(parsed);

      } catch (e) {
        console.error("Hata:", e);
      }
    };

    fetchList();
  }, []);

  // ===========================
  // FİLTRE UYGULA
  // ===========================
  const applyFilters = () => {
    let list = [...originalData];

    // TARİH
    if (selectedDate) {
      list = list.filter(
        (x) => x.created_at_yyyy_mm_dd === selectedDate
      );
    }

    // GENEL ARAMA
    if (searchText.trim() !== "") {
      const n = normalize(searchText);

      list = list.filter((x) => {
        const combined = normalize(
          `${x.vehicle_plate} ${x.insurance_company_name} ${x.vehicle_model} ${x.accident_date} ${x.created_at}`
        );
        return combined.includes(n);
      });
    }

    setFilteredList(list);
  };

  const clearFilters = () => {
    setSelectedDate("");
    setSearchText("");
    setFilteredList(originalData);
  };

  const handleFileDetail = (fileId, fileNumber) => {
    navigate(`/file-detail/${fileId}`, {
      state: { fileId, fileNumber, fromScreen: "NotifiedScreen" },
    });
  };

  // ===========================
  // KART RENDER
  // ===========================
  const renderFileItem = (data) => {
    const statusMap = {
      COMPLETED: {
        text: "Başvurunuz Tamamlandı",
        badgeClass: styles.approvedBadge,
        textClass: styles.approvedBadgeText,
      },
      REJECTED: {
        text: "Başvurunuz Reddedildi",
        badgeClass: styles.approvedBadgeRisk,
        textClass: styles.approvedBadgeText,
      }
    };

    const statusInfo = statusMap[data.status] || statusMap.COMPLETED;

    return (
      <div key={data.id} className={styles.fileContainer}>
        <div className={styles.fileHeader}>
          <div className={styles.fileDetails}>
            <p><strong>Araç Plaka:</strong> {data.vehicle_plate}</p>
            <p><strong>Kaza Tarihi:</strong> {data.accident_date}</p>
            <p><strong>Araç Model:</strong> {data.vehicle_model}</p>
            <p className={styles.insuranceInfo}>
              {data.insurance_company_name}
              <span> - {data.created_at_formatted}</span>
            </p>
          </div>

          {/* SAĞ ÜST - EYE CHIP */}
          <div className={styles.headerActions}>
            <button
              className={styles.detailChip}
              onClick={() => handleFileDetail(data.id, data.file_number)}
            >
              <Eye className={styles.eyeIcon} size={18} />
              <span className={styles.detailText}>Dosya Detayı Gör</span>
            </button>

            <button className={styles.infoIconBtn}>
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

  // ===========================
  // JSX
  // ===========================
  return (
    <div className={styles.screenContainerDrive}>
      <div className={styles.contentArea}>
        <h1 className={styles.headerTitleCentered}>Bildirim Yapılanlar</h1>

        {/* FILTER BAR */}
        <div className={styles.filterSection}>
          <div className={styles.filterRow}>

            {/* TARİH */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Tarih Seçin:</label>
              <div className={styles.inputWrapper}>
                <input
                  type="date"
                  value={selectedDate}
                  className={styles.filterDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            {/* GENEL ARAMA */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Genel Arama:</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  placeholder="Plaka, şirket, model..."
                  value={searchText}
                  className={styles.filterDate}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
            </div>

            {/* BUTONLAR */}
            <div className={styles.buttonGroup}>
              <button
                className={styles.filterButton}
                disabled={!selectedDate && !searchText}
                onClick={applyFilters}
              >
                Filtrele
              </button>

              <button
                className={styles.clearFilterButton}
                disabled={!selectedDate && !searchText}
                onClick={clearFilters}
              >
                Filtreyi Temizle
              </button>
            </div>
          </div>
        </div>

        {/* SAYI */}
        {filteredList.length > 0 && (
          <p className={styles.totalCount}>
            Toplam {filteredList.length} dosya bulundu.
          </p>
        )}

        {/* LİSTE */}
        <div className={styles.vehicleFormCard}>
          {filteredList.length > 0 ? (
            <div className={styles.listWrapper}>
              {filteredList.map(renderFileItem)}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>Filtreye uygun kayıt bulunamadı.</p>
            </div>
          )}
        </div>

        {/* GERİ */}
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

export default NotifiedScreen;