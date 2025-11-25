import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './../../styles/victimInfoScreen.module.css';
import FormRenderer from '../forms/FormRenderer';
import { getVictimFields } from '../../constants/victimFields';
import Stepper from '../stepper/Stepper';
import FormFooter from '../forms/FormFooter';

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
              renderFooter={({ submit, allValid }) => (
                <FormFooter
                  onBack={handleBack}
                  onNext={submit}
                  disabled={!allValid}
                />
              )}
            />

          </div>
        </div>
      </div>
    </div>
  );
};

export default VictimInfoStepper;