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
  
  console.log('🔍 VictimInfoStepper - Gelen parametreler:', {
    kazaNitelik,
    selectedCompany,
    insuranceSource,
    samePerson,
    karsiSamePerson
  });

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
    navigate(-1);
  };

  const handleFormSubmit = (values) => {
    console.log('✅ VictimInfoStepper - Ham form verileri:', values);
    
    // Transform işlemlerini uygula
    const transformedValues = { ...values };
    
    victimFields.forEach(field => {
      if (field.transform && typeof field.transform === 'function' && values[field.name]) {
        console.log(`🔄 VictimInfo - Transforming ${field.name}:`, values[field.name]);
        transformedValues[field.name] = field.transform(values[field.name]);
        console.log(`✅ VictimInfo - Transform sonrası ${field.name}:`, transformedValues[field.name]);
      }
    });

    console.log('✅ VictimInfoStepper - Transform sonrası victimData:', transformedValues);

    // ✅ Tüm parametreleri bir sonraki adıma ilet
    const navigationState = {
      // Mevcut location.state'i koru
      ...locationState,
      
      // Transform edilmiş victim verisini ekle
      victimData: transformedValues,
      
      // Temel parametreler (eğer locationState'de yoksa)
      kazaNitelik: kazaNitelik,
      selectedCompany: selectedCompany,
      insuranceSource: insuranceSource,
      samePerson: samePerson,
      karsiSamePerson: karsiSamePerson,
    };

    console.log('🚀 VictimInfo -> DriverInfo\'ya gönderilen TÜM state:', navigationState);
    console.log('📍 victimData:', navigationState.victimData);

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