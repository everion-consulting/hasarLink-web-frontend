import React from "react";

import "../../styles/formFooter.css";

const FormFooter = ({ 
  onBack, 
  onNext, 
  nextLabel = "DEVAM ET", 
  backLabel = "GERİ DÖN", 
  disabled = false 
}) => {
  
  return (
    <div className={`form-footer ${isDark ? 'dark' : ''}`}>
      <button
        className="back-btn"
        onClick={onBack}
        type="button"
      >
        <div className="icon-wrap">
          <FaArrowLeft size={16} color="#000" />
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
          <FaArrowRight size={16} color="#ffffff" />
        </div>
      </button>
    </div>
  );
};

export default FormFooter;