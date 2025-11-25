import React from "react";
import BackIcon from "../../components/images/back.svg";
import ContinueIcon from "../../components/images/continue.svg";
import styles from "../../styles/formFooter.module.css";

const FormFooter = ({
  onBack,
  onNext,
  nextLabel = "DEVAM ET",
  backLabel = "GERİ DÖN",
  disabled = false,
  dark = false,
}) => {
  return (
    <div className={`${styles.formFooter} ${dark ? styles.dark : ""}`}>
      
      {/* GERİ DÖN */}
      <button
        className={styles.backBtn}
        onClick={onBack}
        type="button"
      >
        <div className={styles.iconWrap}>
          <div className={styles.iconCircle}>
            <img src={BackIcon} alt="Geri" />
          </div>
        </div>
        <span className={styles.backText}>{backLabel}</span>
      </button>

      {/* DEVAM ET */}
      <button
        className={`${styles.nextBtn} ${disabled ? styles.disabled : ""}`}
        disabled={disabled}
        onClick={onNext}
        type="button"
      >
        <span className={styles.nextText}>{nextLabel}</span>

        <div className={styles.iconCircle}>
          <img src={ContinueIcon} alt="Devam" />
        </div>
      </button>

    </div>
  );
};

export default FormFooter;
