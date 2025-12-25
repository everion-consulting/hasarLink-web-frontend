import React, { useState } from "react";
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

  const [formValues, setFormValues] = useState(driverData);
  const [formValid, setFormValid] = useState(false); 

  const steps = ['Mağdur Bilgileri', 'Sürücü Bilgileri', 'Araç Bilgileri'];
  const currentStep = 2;

  const handleSubmit = (driverFormData) => {
    // Transform işlemleri
    const transformedDriverData = { ...driverFormData };
    driverFields.forEach(field => {
      if (field.transform && typeof field.transform === "function" && driverFormData[field.name]) {
        transformedDriverData[field.name] = field.transform(driverFormData[field.name]);
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
            <FormRenderer
              fields={driverFields}
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