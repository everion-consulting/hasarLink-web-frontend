import React, { useState, useEffect } from 'react';
import './../../styles/victimInfoScreen.css'; 

const Stepper = ({ steps, currentStep }) => (
  <div className="stepper-container">
    {steps.map((step, index) => {
      const stepNumber = index + 1;
      return (
        <React.Fragment key={stepNumber}>
          <div className={`step-item ${stepNumber === currentStep ? 'active' : stepNumber < currentStep ? 'completed' : ''}`}>
            <div className="step-circle">{stepNumber}</div>
            <div className="step-label">
              {stepNumber === 1 && 'Mağdur Bilgileri'}
              {stepNumber === 2 && (steps.length === 2 ? 'Araç Bilgileri' : 'Sürücü Bilgileri')}
              {stepNumber === 3 && 'Araç Bilgileri'}
            </div>
          </div>
          {index < steps.length - 1 && <div className="step-line"></div>}
        </React.Fragment>
      );
    })}
  </div>
);

// --- Form Alanı Bileşeni Yer Tutucusu (Görseldeki tasarımı yansıtmak için) ---
const FormField = ({ label, placeholder, isDate = false, isFullWidth = false }) => (
  <div className="form-field-container">
    <div className="input-group">
      <input 
        type={isDate ? 'text' : 'text'} // Gerçekte 'date' veya 'email' vb. olmalı
        placeholder={placeholder} 
        className="form-input"
        // Görseldeki simgeler için ek bir simge bileşeni/div ekleyebilirsiniz
      />
    </div>
  </div>
);

const VictimInfoStepper = ({ samePerson = false }) => {
  const [isCompany, setIsCompany] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // samePerson durumuna göre adımları belirle
  const steps = samePerson
    ? ['Mağdur Bilgileri', 'Araç Bilgileri']
    : ['Mağdur Bilgileri', 'Sürücü Bilgileri', 'Araç Bilgileri'];

  const handleNext = () => {
    // Burada form doğrulama mantığı olmalıydı
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Form gönderimi/tamamlandı
      console.log('Form Tamamlandı!');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      console.log('Geri Dön (Önceki Sayfaya)');
    }
  };

  const renderVictimForm = () => (
    <div className="form-section-content">
      <div className="switch-main-container">
        <div 
          className={`switch-option ${!isCompany ? 'active-option' : ''}`}
          onClick={() => setIsCompany(false)}
        >
          Şahıs
        </div>
        <div 
          className={`switch-option ${isCompany ? 'active-option' : ''}`}
          onClick={() => setIsCompany(true)}
        >
          Şirket
        </div>
      </div>

      <div className="form-renderer-container">
        <FormField label="Ad Soyad" placeholder={isCompany ? 'Şirket Adı...' : 'Adınız ve soyadınız giriniz...'} />
        {!isCompany && <FormField label="Kimlik No" placeholder="T.C. Kimlik No..." />}
        <FormField label="E-Mail" placeholder="mailisim@gmail.com" />
        <FormField label="Telefon" placeholder="555-333-22-11" />
        {!isCompany && <FormField label="Doğum Tarihi" placeholder="11/22/3333" isDate={true} />}
        <FormField label="Poliçe Tecdit No" placeholder="TRC-2025-000987" />
        <FormField label="Sigortalı Poliçe No" placeholder="AXA-2024-123456" />
        <FormField label="Tescil Belge Seri No" placeholder="AB 123456" />
      </div>
    </div>
  );

  return (
    <div className="screen-container">
      <div className="content-area">
        <Stepper steps={steps} currentStep={currentStep} />

        <h2 className="section-title">
          {currentStep === 1 ? 'Mağdur Bilgileri' : 
           (samePerson && currentStep === 2) ? 'Araç Bilgileri' : 
           (!samePerson && currentStep === 2) ? 'Sürücü Bilgileri' : 
           'Araç Bilgileri'}
        </h2>
        
        <div className="form-card">
          {currentStep === 1 && renderVictimForm()}
          {currentStep === 2 && !samePerson && (
            <div className="form-renderer-container">
              {/* Sürücü Bilgileri Yer Tutucu */}
              <p>Sürücü Bilgileri Formu...</p>
            </div>
          )}
          {((samePerson && currentStep === 2) || (!samePerson && currentStep === 3)) && (
            <div className="form-renderer-container">
              {/* Araç Bilgileri Yer Tutucu */}
              <p>Araç Bilgileri Formu...</p>
            </div>
          )}

          <div className="form-footer-web">
            <button className="back-button-web" onClick={handleBack}>
              <span className="arrow-icon-left">←</span> GERİ DÖN
            </button>
            <button className="next-button-web" onClick={handleNext}>
              DEVAM ET <span className="arrow-icon">➔</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VictimInfoStepper;