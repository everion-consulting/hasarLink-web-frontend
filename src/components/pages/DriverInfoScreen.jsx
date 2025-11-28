// DriverInfoScreen.jsx - TAMAMEN YENİDEN DÜZENLE
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

  // 🔥 KRİTİK: Tüm parametreleri location.state'den al
  const { 
    victimData, 
    samePerson = false,
    kazaNitelik,
    selectedCompany,
    insuranceSource,
    karsiSamePerson,
    // Diğer tüm parametreler
    ...otherParams
  } = location.state || {};

  console.log('🚗 DriverInfoScreen - Gelen parametreler:', {
    victimData,
    samePerson,
    kazaNitelik,
    selectedCompany,
    insuranceSource
  });

  const steps = samePerson
    ? ['Mağdur Bilgileri', 'Araç Bilgileri']
    : ['Mağdur Bilgileri', 'Sürücü Bilgileri', 'Araç Bilgileri'];

  const currentStep = 2;

  const handleSubmit = (driverData) => {
    console.log("🚗 Driver Info:", driverData);

    // 🔥 KRİTİK: TÜM parametreleri bir sonraki sayfaya aktar
    const navigationState = {
      // Temel parametreler
      kazaNitelik,
      selectedCompany,
      insuranceSource,
      samePerson,
      karsiSamePerson,
      
      // Form verileri
      victimData: victimData, // ✅ Victim verilerini koru
      driverData: driverData, // ✅ Yeni driver verileri
      
      // Diğer parametreler
      ...otherParams
    };

    console.log('📍 Navigating to /driver-victim-stepper with:', navigationState);

    navigate('/driver-victim-stepper', {
      state: navigationState
    });
  };

  const handleBack = () => {
    navigate(-1); // Bir önceki sayfaya dön
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