import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FormRenderer from "../forms/FormRenderer";
import driverFields from "../../constants/driverFields";
import Stepper from '../stepper/Stepper';
import styles from './../../styles/victimInfoScreen.module.css';

export default function DriverInfoScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formValues, setFormValues] = useState({});

  // Location'dan gelen verileri al
  const { victimData, samePerson = false } = location.state || {};

  const steps = samePerson
    ? ['Mağdur Bilgileri', 'Araç Bilgileri']
    : ['Mağdur Bilgileri', 'Sürücü Bilgileri', 'Araç Bilgileri'];

  const currentStep = 2; // Sürücü bilgileri 2. adım
  
  const handleSubmit = (driverData) => {
    const payload = { 
      victim: victimData, 
      driver: driverData 
    };
    console.log("Driver Info:", payload);
    
    // Sonraki adıma geçiş (Araç Bilgileri)
    navigate('/driver-victim-stepper', { 
      state: { 
        victimData,
        driverData,
        samePerson 
      } 
    });
  };

  const handleBack = () => {
    navigate('/victim-info'); // Mağdur bilgilerine geri dön
  };

  const renderFormFooter = ({ submit, allValid }) => (
    <div className={styles.formFooterWeb}>
      <button 
        className={styles.backButtonWeb} 
        onClick={handleBack}
        type="button"
      >
        <span className={styles.arrowIconLeft}>←</span> GERİ DÖN
      </button>
      <button 
        className={styles.nextButtonWeb} 
        onClick={submit}
        disabled={!allValid}
        type="button"
      >
        DEVAM ET <span className={styles.arrowIcon}>➔</span>
      </button>
    </div>
  );

  return (
    <div className={styles.screenContainer}>
      <div className={styles.contentArea}>
        <Stepper steps={steps} currentStep={currentStep} />

        <h2 className={styles.sectionTitle}>Sürücü Bilgileri</h2>
        
        <div className={styles.formCard}>
          <div className={styles.formSectionContent}>
            <FormRenderer
              fields={driverFields}
              values={formValues}
              setValues={setFormValues}
              onSubmit={handleSubmit}
              submitLabel="DEVAM ET"
              renderFooter={renderFormFooter}
            />
          </div>
        </div>
      </div>
    </div>
  );
}