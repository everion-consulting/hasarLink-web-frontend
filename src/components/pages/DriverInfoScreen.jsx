import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FormRenderer from "../forms/FormRenderer";
import driverFields from "../../constants/driverFields";
import Stepper from '../stepper/Stepper';
import styles from './../../styles/victimInfoScreen.module.css';

export default function DriverInfoScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formValues, setFormValues] = useState({});

  const locationState = location.state || {};
  const { victimData, samePerson = false, editMode = false, returnTo, returnStep } = locationState;

  useEffect(() => {
    if (locationState?.driverData) {

      const oldData = { ...locationState.driverData };
      if (oldData.driver_birth_date && oldData.driver_birth_date.includes("-")) {
        const [y, m, d] = oldData.driver_birth_date.split("-");
        oldData.driver_birth_date = `${d}.${m}.${y}`;
      }

      setFormValues(oldData);
    }
  }, [locationState]);


  const steps = samePerson
    ? ['Mağdur Bilgileri', 'Araç Bilgileri']
    : ['Mağdur Bilgileri', 'Sürücü Bilgileri', 'Araç Bilgileri'];

  const currentStep = 2;

  const handleSubmit = (driverFormData) => {

    const transformedDriverData = { ...driverFormData };
    driverFields.forEach(field => {
      if (field.transform && typeof field.transform === 'function' && driverFormData[field.name]) {
        transformedDriverData[field.name] = field.transform(driverFormData[field.name]);
      }
    });

    const navigationState = {
      ...locationState,
      victimData,
      driverData: transformedDriverData,
      samePerson
    };

    if (editMode) {
      navigate(returnTo || '/step-info', {
        state: {
          ...navigationState,
          startStep: returnStep || 2
        }
      });
      return;
    }

    navigate('/driver-victim-stepper', { state: navigationState });
  };


  const handleBack = () => {
    navigate('/victim-info', {
      state: locationState
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