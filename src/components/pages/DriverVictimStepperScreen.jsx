import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../../styles/DriveVictimStepper.module.css';
import FormRenderer from '../forms/FormRenderer';
import vehicleFields from '../../constants/vehicleFields';
import Stepper from '../stepper/Stepper';
import FormFooter from '../forms/FormFooter';

const DriverVictimStepperScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formValid, setFormValid] = useState(false);

  // ✅ Location.state'den TÜM verileri al
  const locationState = location.state || {};

  const {
    victimData = {},
    driverData = {},
    samePerson = false,
    selectedCompany,
    insuranceSource,
    kazaNitelik,
    karsiSamePerson,
    vehicleData: existingVehicleData,
  } = locationState;

  console.log('🔍 DriverVictimStepper - Gelen location.state:', locationState);
  console.log('🔍 DriverVictimStepper - victimData:', victimData);
  console.log('🔍 DriverVictimStepper - driverData:', driverData);

  const [vehicleData, setVehicleData] = useState(
    existingVehicleData || {
      vehicle_brand: '',
      vehicle_type: '',
      vehicle_model: '',
      vehicle_license_no: '',
      vehicle_chassis_no: '',
      vehicle_engine_no: '',
      vehicle_year: '',
      vehicle_plate: '',
      vehicle_usage_type: ''
    }
  );

  useEffect(() => {
    console.log('🚗 vehicleData güncellendi:', vehicleData);
  }, [vehicleData]);

  const handleSetVehicleData = (newData) => {
    console.log('📝 setVehicleData çağrıldı:', newData);

    if (typeof newData === 'function') {
      setVehicleData(prevData => {
        const result = newData(prevData);
        console.log('📝 Function sonucu:', result);
        return result;
      });
    } else {
      setVehicleData(newData);
    }
  };

  const steps = samePerson
    ? ['Mağdur Bilgileri', 'Araç Bilgileri']
    : ['Mağdur Bilgileri', 'Sürücü Bilgileri', 'Araç Bilgileri'];

  const currentStep = samePerson ? 2 : 3;

  const handleBack = () => {
    navigate(-1, {
      state: locationState  // Geri giderken tüm state'i koru
    });
  };

  const handleVehicleSubmit = (vehicleFormData) => {
    console.log("🚗 Vehicle Form Tamamlandı:", vehicleFormData);
    console.log("📦 Mevcut victimData:", victimData);
    console.log("📦 Mevcut driverData:", driverData);

    // Transform işlemlerini uygula
    const transformedVehicleData = { ...vehicleFormData };
    vehicleFields.forEach(field => {
      if (field.transform && typeof field.transform === 'function' && vehicleFormData[field.name]) {
        transformedVehicleData[field.name] = field.transform(vehicleFormData[field.name]);
      }
    });

    // ✅ KRİTİK: Tüm verileri birleştir ve StepInfo'ya gönder
    const completeData = {
      // Mevcut tüm location.state'i koru
      ...locationState,

      // Form verilerini ekle/güncelle
      victimData: victimData,           // ✅ victimData'yı muhafaza et
      driverData: driverData,           // ✅ driverData'yı muhafaza et
      vehicleData: transformedVehicleData,  // ✅ Yeni vehicle verisini ekle

      // StepInfo için gerekli
      startStep: 2,
    };

    console.log("🚀 DriverVictimStepper -> StepInfo'ya gönderilen TÜM veriler:", completeData);
    console.log("📍 victimData korundu mu?", completeData.victimData);
    console.log("📍 driverData korundu mu?", completeData.driverData);
    console.log("📍 vehicleData:", completeData.vehicleData);

    navigate("/step-info", {
      state: completeData
    });
  };

  const renderFormFooter = ({ submit, allValid }) => (
    <div className={styles.formFooterWeb}>
      <button className={styles.backButtonWeb} onClick={handleBack} type="button">
        <span className={styles.arrowIconLeft}>←</span> GERİ DÖN
      </button>
      <button
        className={styles.nextButtonWeb}
        onClick={submit}
        disabled={!allValid}
        type="button"
      >
        FORMU TAMAMLA <span className={styles.arrowIcon}>➔</span>
      </button>
    </div>
  );

  return (
    <div className={styles.screenContainerDrive}>
      <div className={styles.contentArea}>
        <Stepper steps={steps} currentStep={currentStep} />

        <h2 className={styles.sectionTitle}>Araç Bilgileri</h2>

        <div className={styles.vehicleFormCard}>
          <div className={styles.vehicleFormSectionContent}>
            <FormRenderer
              key="vehicle"
              fields={vehicleFields}
              values={vehicleData}
              setValues={handleSetVehicleData}
              onSubmit={handleVehicleSubmit}
              onFormChange={({ allValid }) => setFormValid(allValid)}
            />
          </div>
        </div>
        <FormFooter
          onBack={handleBack}
          onNext={() => {
            const form = document.querySelector("form");
            if (form) {
              form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
            }
          }}
          disabled={!formValid}
        />
      </div>
    </div>
  );
};

export default DriverVictimStepperScreen;