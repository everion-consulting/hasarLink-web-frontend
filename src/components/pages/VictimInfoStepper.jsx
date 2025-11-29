import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './../../styles/victimInfoScreen.module.css';
import FormRenderer from '../forms/FormRenderer';
import { getVictimFields } from '../../constants/victimFields';
import Stepper from '../stepper/Stepper';
import FormFooter from '../forms/FormFooter';

const VictimInfoStepper = ({ samePerson = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state || {};
  const kazaNitelik = locationState.kazaNitelik;
  const selectedCompany = locationState.selectedCompany;
  const insuranceSource = locationState.insuranceSource;
  const karsiSamePerson = locationState.karsiSamePerson;

  const [isCompany, setIsCompany] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [formValid, setFormValid] = useState(false);   // 🔥 VALID STATE BURADA

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
    navigate(-1);
  };

  const handleFormSubmit = (values) => {
    console.log('✅ VictimInfoStepper - Ham form verileri:', values);

    const transformedValues = { ...values };

    victimFields.forEach(field => {
      if (field.transform && typeof field.transform === 'function' && values[field.name]) {
        transformedValues[field.name] = field.transform(values[field.name]);
      }
    });

    const navigationState = {
      ...locationState,
      victimData: transformedValues,
      kazaNitelik,
      selectedCompany,
      insuranceSource,
      samePerson,
      karsiSamePerson,
    };

    navigate('/driver-info', {
      state: navigationState
    });
  };

  const renderVictimTypeSwitch = () => (
    <div className={styles.switchMainContainer}>
      <div
        className={`${styles.switchOption} ${!isCompany ? styles.activeOption : ''}`}
        onClick={() => setIsCompany(false)}
      >
        Şahıs
      </div>
      <div
        className={`${styles.switchOption} ${isCompany ? styles.activeOption : ''}`}
        onClick={() => setIsCompany(true)}
      >
        Şirket
      </div>
    </div>
  );

  return (
    <div className={styles.screenContainer}>
      <div className={styles.contentArea}>

        <Stepper steps={steps} currentStep={1} />

        <h2 className={styles.sectionTitle}>Mağdur Bilgileri</h2>

        <div className={styles.formCard}>
          <div className={styles.formSectionContent}>
            {renderVictimTypeSwitch()}
            <FormRenderer
              fields={victimFields}
              values={formValues}
              setValues={setFormValues}
              onSubmit={handleFormSubmit}
              submitLabel="DEVAM ET"
              onFormChange={({ allValid }) => setFormValid(allValid)}
            />
          </div>
        </div>

        <FormFooter
          onBack={handleBack}
          onNext={() => {
            const form = document.querySelector('form');
            if (form) {
              form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
          }}
          disabled={!formValid}
        />

      </div>
    </div>
  );
};

export default VictimInfoStepper;