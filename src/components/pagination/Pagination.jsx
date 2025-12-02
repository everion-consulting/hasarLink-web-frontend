import React from "react";
import styles from "../../styles/Pagination.module.css";
import LeftIconBlack from "../../assets/images/leftIconBlack.svg";
import RightIconWhite from "../images/rightIcon.svg";

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
                    <img src="/src/assets/images/right-icon-white.svg" alt="Gönder" />
                </span>
            </button>
        </div>
    );
};

export default Pagination;