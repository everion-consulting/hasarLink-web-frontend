import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './../../styles/victimInfoScreen.css'; 
import FormRenderer from '../forms/FormRenderer';
import { getVictimFields } from '../../constants/victimFields';
import Stepper from '../stepper/Stepper';

const VictimInfoStepper = ({ samePerson = false }) => {
  const navigate = useNavigate();
  const [isCompany, setIsCompany] = useState(false);
  const [formValues, setFormValues] = useState({});

  const steps = samePerson
    ? ['Mağdur Bilgileri', 'Araç Bilgileri']
    : ['Mağdur Bilgileri', 'Sürücü Bilgileri', 'Araç Bilgileri'];

  const victimFields = getVictimFields(isCompany);

  useEffect(() => {
    setFormValues(prev => ({
      ...prev,
      isCompany: isCompany
    }));
  }, [isCompany]);

  const handleBack = () => {
    navigate(-1); // Bir önceki sayfaya dön
  };

  const handleFormSubmit = (values) => {
    console.log('Mağdur Form verileri:', values);
    
    // Transform işlemlerini uygula
    const transformedValues = { ...values };
    victimFields.forEach(field => {
      if (field.transform && typeof field.transform === 'function' && values[field.name]) {
        transformedValues[field.name] = field.transform(values[field.name]);
      }
    });
    
    setFormValues(prev => ({ ...prev, ...transformedValues }));
    
    // Mağdur bilgileri tamamlandıktan sonra DriverInfoScreen'e yönlendir
    console.log('Navigating to /driver-info');
    navigate('/driver-info', { 
      state: { 
        victimData: transformedValues,
        samePerson 
      } 
    });
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
        <Stepper steps={steps} currentStep={1} />

        <h2 className="section-title">Mağdur Bilgileri</h2>
        
        <div className="form-card">
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
        </div>
      </div>
    </div>
  );
};

export default VictimInfoStepper;