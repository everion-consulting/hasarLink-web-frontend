import React, { useState, useEffect } from 'react';
import './../../styles/victimInfoScreen.css'; 
import FormRenderer from '../forms/FormRenderer';
import { getVictimFields } from '../../constants/victimFields';
import Stepper from '../stepper/Stepper';

const VictimInfoStepper = ({ samePerson = false }) => {
  const [isCompany, setIsCompany] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formValues, setFormValues] = useState({});

  // samePerson durumuna göre adımları belirle
  const steps = samePerson
    ? ['Mağdur Bilgileri', 'Araç Bilgileri']
    : ['Mağdur Bilgileri', 'Sürücü Bilgileri', 'Araç Bilgileri'];

  // victimFields'dan form alanlarını al
  const victimFields = getVictimFields(isCompany);

  // Şirket durumu değiştiğinde form değerlerini güncelle
  useEffect(() => {
    setFormValues(prev => ({
      ...prev,
      isCompany: isCompany
    }));
  }, [isCompany]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Form gönderimi/tamamlandı
      console.log('Form Tamamlandı!', formValues);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      console.log('Geri Dön (Önceki Sayfaya)');
    }
  };

  const handleFormSubmit = (values) => {
    console.log('Form verileri:', values);
    
    // Transform işlemlerini uygula
    const transformedValues = { ...values };
    victimFields.forEach(field => {
      if (field.transform && typeof field.transform === 'function' && values[field.name]) {
        transformedValues[field.name] = field.transform(values[field.name]);
      }
    });
    
    setFormValues(prev => ({ ...prev, ...transformedValues }));
    handleNext();
  };

  const renderVictimTypeSwitch = () => (
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
  );

  const renderFormFooter = ({ submit, allValid }) => (
    <div className="form-footer-web">
      <button 
        className="back-button-web" 
        onClick={handleBack}
        type="button"
      >
        <span className="arrow-icon-left">←</span> GERİ DÖN
      </button>
      <button 
        className="next-button-web" 
        onClick={submit}
        disabled={!allValid}
        type="button"
      >
        DEVAM ET <span className="arrow-icon">➔</span>
      </button>
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
          {currentStep === 1 && (
            <div className="form-section-content">
              {renderVictimTypeSwitch()}
              <FormRenderer
                fields={victimFields}
                values={formValues}
                setValues={setFormValues}
                onSubmit={handleFormSubmit}
                submitLabel="DEVAM ET"
                renderFooter={renderFormFooter}
              />
            </div>
          )}
          
          {currentStep === 2 && !samePerson && (
            <div className="form-renderer-container">
              <p>Sürücü Bilgileri Formu - victimFields benzeri yapı ile genişletilebilir</p>
            </div>
          )}
          
          {((samePerson && currentStep === 2) || (!samePerson && currentStep === 3)) && (
            <div className="form-renderer-container">
              <p>Araç Bilgileri Formu - victimFields benzeri yapı ile genişletilebilir</p>
            </div>
          )}

          {/* Sadece 1. adımda FormRenderer kullanılıyor, diğer adımlar için placeholder */}
          {currentStep !== 1 && (
            <div className="form-footer-web">
              <button className="back-button-web" onClick={handleBack}>
                <span className="arrow-icon-left">←</span> GERİ DÖN
              </button>
              <button className="next-button-web" onClick={handleNext}>
                DEVAM ET <span className="arrow-icon">➔</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VictimInfoStepper;