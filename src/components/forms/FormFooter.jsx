import React from "react";
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import "../../styles/formFooter.css";

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
          <ArrowLeftIcon className="icon" />
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
        <div className="icon-wrap">
          <ArrowRightIcon className="icon" />
        </div>
      </button>
    </div>
  );
};

export default FormFooter;