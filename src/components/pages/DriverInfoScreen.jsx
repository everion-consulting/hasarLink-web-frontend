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

  // ✅ Location'dan gelen TÜM verileri al
  const locationState = location.state || {};
  const { victimData, samePerson = false } = locationState;
  
  console.log('🔍 DriverInfo - Gelen location.state:', locationState);
  console.log('🔍 DriverInfo - victimData:', victimData);

  const steps = samePerson
    ? ['Mağdur Bilgileri', 'Araç Bilgileri']
    : ['Mağdur Bilgileri', 'Sürücü Bilgileri', 'Araç Bilgileri'];

  const currentStep = 2; // Sürücü bilgileri 2. adım

  const handleSubmit = (driverFormData) => {
    console.log("✅ DriverInfo - Driver form verileri:", driverFormData);
    console.log("📦 DriverInfo - Mevcut victimData:", victimData);

    // Transform işlemlerini uygula
    const transformedDriverData = { ...driverFormData };
    driverFields.forEach(field => {
      if (field.transform && typeof field.transform === 'function' && driverFormData[field.name]) {
        transformedDriverData[field.name] = field.transform(driverFormData[field.name]);
      }
    });

    console.log("✅ DriverInfo - Transform sonrası driverData:", transformedDriverData);

    // ✅ KRİTİK: Tüm location.state'i koruyarak driver-victim-stepper'a gönder
    const navigationState = {
      ...locationState,           // TÜM mevcut state'i koru (kazaNitelik, selectedCompany, insuranceSource vs.)
      victimData: victimData,     // victimData'yı muhafaza et
      driverData: transformedDriverData,  // Yeni driver verisini ekle
      samePerson: samePerson
    };

    console.log("🚀 DriverInfo -> VehicleInfo'ya gönderilen TÜM state:", navigationState);
    console.log("📍 victimData korundu mu?", navigationState.victimData);

    navigate('/driver-victim-stepper', {
      state: navigationState
    });
  };

  const handleBack = () => {
    navigate('/victim-info', { 
      state: locationState  // Geri dönerken de tüm state'i koru
    });
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