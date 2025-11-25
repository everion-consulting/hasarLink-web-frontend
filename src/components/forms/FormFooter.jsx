import React from "react";
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import BackIcon from "../../components/images/back.svg";
import ContinueIcon from "../../components/images/continue.svg";
import styles from "../../styles/formFooter.module.css";

const FormFooter = ({
  onBack,
  onNext,
  nextLabel = "DEVAM ET",
  backLabel = "GERİ DÖN",
  disabled = false
}) => {

  return (
    <div className="form-footer">
      <button
        className="back-btn"
        onClick={onBack}
        type="button"
      >
        <div className="icon-wrap">
          <div className={styles.iconCircle}>
            <img src={BackIcon} alt="Geri" />
          </div>
        </div>
        <span className="back-text">{backLabel}</span>
      </button>

      <button
        className={`next-btn ${disabled ? 'disabled' : ''}`}
        disabled={disabled}
        onClick={onNext}
        type="button"
      >
        <span className="next-text">{nextLabel}</span>
        <div className={styles.iconCircle}>
          <img src={ContinueIcon} alt="Devam" />
        </div>
      </button>
    </div>
  );
};

export default FormFooter;