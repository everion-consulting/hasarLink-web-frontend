// src/screens/file/MonthlyFilesDetailScreen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/monthlyFiles.module.css";
import apiService from "../../services/apiServices";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Eye } from "lucide-react";

const MonthlyFilesDetailScreen = () => {
  const navigate = useNavigate();

  const [fileNotifications, setFileNotifications] = useState([]);   // tüm kayıtlar
  const [displayedFiles, setDisplayedFiles] = useState([]);         // filtre+sayfalama sonrası

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchText, setSearchText] = useState("");

  const itemsPerPage = 20;

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
    const getFileNotifications = async () => {
      try {
        const res = await apiService.getMonthlySubmissions();
        console.log("Monthly Files Response:", res);

        if (res?.success) {
          const payload = res?.data?.queryset || res?.data || [];

          const safeArray = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.results)
            ? payload.results
            : [];

          const normalized = safeArray.map((data) => ({
            id: data.submission_id,
            vehicle_plate: data.plate ?? "-",
            insurance_company_name: data.insurance_company_name ?? "-",
            vehicle_model: data.vehicle_model ?? "-",
            accident_date: data.accident_date ?? "-",
            created_at: data.created_at ?? "-",
            status: data.status ?? "IN_PROGRESS",
            file_number: data.file_number ?? "-",
          }));

          setFileNotifications(normalized);
        } else {
          alert(res?.message || "Bekleyen dosyalar alınamadı.");
        }
      } catch (error) {
        console.error("Dosya bildirimleri alınırken hata oluştu:", error);
        alert("Dosya bildirimleri alınırken bir hata oluştu.");
      }
    };

    getFileNotifications();
  }, []);

  // 🔥 Filtre + sayfalama
  useEffect(() => {
    let filtered = [...fileNotifications];

    // Tarih filtresi (created_at'e göre, yoksa accident_date)
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

  const handleFileDetail = (fileId, fileNumber) => {
    console.log(`Dosya Detayı: ${fileNumber} (ID: ${fileId})`);
    navigate(`/file-detail/${fileId}`, {
      state: {
        fileId,
        fileNumber,
        fromScreen: "MonthlyFilesDetailScreen",
        toScreen: "FileDetail",
      },
    });
  };

  const renderFileItem = (data) => {
    const statusMap = {
      PENDING: {
        text: "Başvurunuz Beklemede",
        badgeClass: styles.pendingBadge,
      },
      IN_PROGRESS: {
        text: "Başvurunuz İnceleniyor",
        badgeClass: styles.processingBadge,
      },
      COMPLETED: {
        text: "Başvurunuz Tamamlandı",
        badgeClass: styles.approvedBadge,
      },
      REJECTED: {
        text: "Başvurunuz Reddedildi",
        badgeClass: styles.rejectedBadge,
      },
    };

    const statusInfo =
      statusMap[data.status] || {
        text: "Durum Bilinmiyor",
        badgeClass: styles.processingBadge,
      };

    return (
      <div key={data.id} className={styles.fileCard}>
        <div className={styles.fileHeader}>
          <div className={styles.fileDetails}>
            <p className={styles.fileText}>
              <span className={styles.fileLabel}>Araç Plaka:</span>{" "}
              {data.vehicle_plate}
            </p>
            <p className={styles.fileText}>
              <span className={styles.fileLabel}>Kaza Tarihi:</span>{" "}
              {data.accident_date}
            </p>
            <p className={styles.fileText}>
              <span className={styles.fileLabel}>Araç Model:</span>{" "}
              {data.vehicle_model}
            </p>

            <p className={styles.insuranceInfo}>
              <strong>{data.insurance_company_name}</strong> –{" "}
              {data.created_at?.slice(0, 10)}
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
              className={styles.infoIcon}
              onClick={() => console.log("Info clicked", data.id)}
            >
              <InformationCircleIcon width={20} height={20} />
            </button>
          </div>
        </div>

        <div className={styles.statusRow}>
          <div className={`${styles.statusBadge} ${statusInfo.badgeClass}`}>
            <span className={styles.statusBadgeText}>{statusInfo.text}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.screenContainerDrive}>
      <div className={styles.contentArea}>
        <div className={styles.container}>
          <main className={styles.content}>
            <div className={styles.listWrapper}>
              <h1 className={styles.pageTitle}>Bu Ay Bildirilen Dosyalar</h1>

              {/* 🔥 TASLAK/İŞLEME ALINANLAR İLE AYNI FİLTRE ALANI */}
              <div className={styles.filterSection}>
                <div className={styles.filterRow}>
                  {/* TARİH FİLTRESİ */}
                  <div className={styles.filterGroup}>
                    <label
                      htmlFor="selectedDate"
                      className={styles.filterLabel}
                    >
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

              {displayedFiles.length > 0 ? (
                displayedFiles.map(renderFileItem)
              ) : (
                <div className={styles.emptyState}>
                  <p>
                    {fileNotifications.length > 0
                      ? "Filtreye uyan dosya bulunamadı."
                      : "Henüz dosya bildiriminiz yok."}
                  </p>
                </div>
              )}

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
            </div>
          </main>
        </div>

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

export default MonthlyFilesDetailScreen;
