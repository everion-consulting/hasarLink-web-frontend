import React from "react";
import styles from "../../styles/Pagination.module.css";
import LeftIconBlack from "../../assets/images/arrow-left-black-pag.svg";
import RightIconBlack from "../../assets/images/arrow-right-black-pag.svg";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {

    return (
        <div className={styles.pagination}>
            <button
                className={`${styles.paginationButton} ${styles.prevBtn}`}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <span className={styles.paginationButtonIcon}>
                    <img src={LeftIconBlack} alt="Geri" />
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
                    <img src={RightIconBlack} alt="İleri" />
                </span>
            </button>
        </div>
    );
};

export default Pagination;