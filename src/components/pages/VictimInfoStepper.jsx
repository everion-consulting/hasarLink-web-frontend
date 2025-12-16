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
    useEffect(() => {
    if (locationState?.victimData) {
      console.log("🟢 Düzenleme modunda — eski victimData forma set edildi:", locationState.victimData);

      setFormValues(prev => ({
        ...prev,
        ...locationState.victimData
      }));

      if (locationState.victimData?.isCompany !== undefined) {
        setIsCompany(locationState.victimData.isCompany);
      }
    }
  }, []);

  useEffect(() => {
    if (locationState?.victimData) {
      const victim = { ...locationState.victimData };

      if (victim.victim_birth_date && victim.victim_birth_date.includes("-")) {
        const [y, m, d] = victim.victim_birth_date.split("-");
        victim.victim_birth_date = `${d}.${m}.${y}`;
      }

      setFormValues(victim);
    }
  }, [locationState]);


  console.log('🔍 VictimInfoStepper - Gelen parametreler:', {
    kazaNitelik,
    selectedCompany,
    insuranceSource,
    samePerson,
    karsiSamePerson
  });

  const [isCompany, setIsCompany] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [formValid, setFormValid] = useState(false);   // 🔥 VALID STATE BURADA

  const steps = samePerson
    ? ['Mağdur Bilgileri', 'Araç Bilgileri']
    : ['Mağdur Bilgileri', 'Sürücü Bilgileri', 'Araç Bilgileri'];

  const victimFields = getVictimFields(isCompany, selectedCompany);

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

    const editMode = locationState.editMode || false;
    const returnTo = locationState.returnTo || null;
    const returnStep = locationState.returnStep || null;

    // 🎯 Eğer düzenle modundaysan → StepInfo’ya geri gönder!
    if (editMode && returnTo) {
      navigate(`/${returnTo}`, {
        state: {
          ...locationState,
          victimData: transformedValues,
          startStep: returnStep || 2
        }
      });

      return; // ❗ normal akışı durdur
    }

    // 🚀 Normal akış
    navigate('/driver-info', {
      state: {
        ...locationState,
        victimData: transformedValues,
        kazaNitelik,
        selectedCompany,
        insuranceSource,
        samePerson,
        karsiSamePerson,
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