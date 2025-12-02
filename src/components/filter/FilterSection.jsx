import React from "react";
import styles from "../../styles/FilterSection.module.css";

const FilterSection = ({
    selectedDate,
    setSelectedDate,
    searchText,
    setSearchText,
    onFilter,
    onClear
}) => {
    return (
        <div className={styles.filterSection}>
            <div className={styles.filterRow}>

                {/* TARİH */}
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

                {/* GENEL ARAMA */}
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Genel Arama:</label>

                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            placeholder="Plaka, şirket, tarih..."
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
                        onClick={onFilter}
                        disabled={!selectedDate && !searchText}
                    >
                        Filtrele
                    </button>

                    <button
                        className={styles.clearFilterButton}
                        onClick={onClear}
                        disabled={!selectedDate && !searchText}
                    >
                        Filtreyi Temizle
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterSection;