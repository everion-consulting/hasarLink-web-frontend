import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FormRenderer from "../forms/FormRenderer";
import driverFields from "../../constants/driverFields";
import Stepper from '../stepper/Stepper';
import styles from './../../styles/victimInfoScreen.module.css';
import FormFooter from "../forms/FormFooter";

export default function DriverInfoScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state || {};
  const { victimData, driverData = {}, samePerson = false } = locationState;

  // Aynı kişi durumunda bu ekrana gelmemeli, ama yine de kontrol edelim
  if (samePerson) {
    console.warn("⚠️ Aynı kişi durumunda DriverInfoScreen'e gelinmemeli!");
    navigate('/driver-victim-stepper', { state: locationState });
    return null;
  }


  const [formValid, setFormValid] = useState(false);

  const [isForeign, setIsForeign] = useState(!!driverData?.isForeign);
  const [formValues, setFormValues] = useState({
    ...driverData,
    isForeign: !!driverData?.isForeign,
  });

  const steps = ['Mağdur Bilgileri', 'Sürücü Bilgileri', 'Araç Bilgileri'];
  const currentStep = 2;

  const tcFields = useMemo(
    () => driverFields.filter((f) => f.name !== "foreign_driver_tc"),
    []
  );

  const foreignFields = useMemo(
    () => driverFields.filter((f) => f.name !== "driver_tc"),
    []
  );

  const activeFields = isForeign ? foreignFields : tcFields;

  // ✅ VictimInfoStepper’daki gibi switch UI
  const renderDriverTypeSwitch = () => (
    <div className={styles.switchMainContainer}>
      <div
        className={`${styles.switchOption} ${!isForeign ? styles.activeOption : ""}`}
        onClick={() => switchTab(false)}
      >
        TC Sürücü
      </div>

      <div
        className={`${styles.switchOption} ${isForeign ? styles.activeOption : ""}`}
        onClick={() => switchTab(true)}
      >
        Yabancı Sürücü
      </div>
    </div>
  );

  const switchTab = (nextIsForeign) => {
    setIsForeign(nextIsForeign);

    setFormValues((prev) => {
      if (nextIsForeign) {
        // TC -> Yabancı
        return {
          ...prev,
          isForeign: true,
          driver_tc: "", // ✅ TC alanını temizle
          // yabancı alanı yoksa boş aç
          foreign_driver_tc: prev.foreign_driver_tc || "",
        };
      }

      // Yabancı -> TC
      return {
        ...prev,
        isForeign: false,
        foreign_driver_tc: "", // ✅ yabancı alanını temizle
        driver_tc: prev.driver_tc || "",
      };
    });
  };

  const handleSubmit = (driverFormData) => {
    // Transform işlemleri
    const merged = { ...formValues, ...driverFormData, isForeign };

    // ✅ diğer tabın kimliğini temizle (backend'e yanlış gitmesin)
    const cleaned = isForeign
      ? { ...merged, driver_tc: "" }
      : { ...merged, foreign_driver_tc: "" };

    const transformedDriverData = { ...cleaned };

    activeFields.forEach((field) => {
      if (field.transform && typeof field.transform === "function" && transformedDriverData[field.name]) {
        transformedDriverData[field.name] = field.transform(transformedDriverData[field.name]);
      }
    });
    const navigationState = {
      ...locationState,
      victimData: victimData,
      driverData: transformedDriverData,
      samePerson: samePerson
    };

    navigate('/driver-victim-stepper', {
      state: navigationState
    });
  };



  const handleBack = () => {
    navigate('/victim-info', {
      state: locationState
    });
  };

  return (
    <div className={styles.screenContainer}>
      <div className={styles.contentArea}>

        <Stepper steps={steps} currentStep={currentStep} />

        <h2 className={styles.sectionTitle}>Sürücü Bilgileri</h2>

        <div className={styles.formCard}>
          <div className={styles.formSectionContent}>
            {renderDriverTypeSwitch()}
            <FormRenderer
              fields={activeFields}
              values={formValues}
              setValues={setFormValues}
              onSubmit={handleSubmit}
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
}