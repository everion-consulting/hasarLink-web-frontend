import React from "react";
import styles from "../../styles/Pagination.module.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className={styles.pagination}>
            <button
                className={`${styles.paginationButton} ${styles.prevBtn}`}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <span className={styles.paginationButtonIcon}>
                    <img src="/src/assets/images/arrow-left-black-pag.svg" alt="Geri" />
                </span>
                Önceki Sayfa
            </button>

            <div className={styles.paginationInfo}>
                Sayfa {currentPage} / {totalPages}
            </div>

            <button
                className={`${styles.paginationButton} ${styles.nextBtn}`}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Sonraki Sayfa
                <span className={styles.paginationButtonIcon}>
                    <img src="/src/assets/images/arrow-right-black-pag.svg" alt="Gönder" />
                </span>
            </button>
        </div>
    );
};

export default Pagination;