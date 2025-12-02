import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Users,
  Navigation,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Info
} from 'lucide-react';
import Stepper from '../stepper/Stepper';
import styles from '../../styles/InsuranceStepper.module.css';
import FormFooter from '../forms/FormFooter';

export default function InsuranceStepper() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedCompany = location.state?.selectedCompany || null;
  const editMode = location.state?.editMode || false;
  const focusStep = location.state?.focusStep || 1;
  const preSelectedStep1 = location.state?.preSelectedStep1 || null;
  const preSelectedStep2 = location.state?.preSelectedStep2 || null;
  const preSelectedStep3 = location.state?.preSelectedStep3 || null;
  const returnTo = location.state?.returnTo || null;
  const returnStep = location.state?.returnStep || 1;
  const kazaNitelik = location.state?.kazaNitelik || null;

  const [currentStep, setCurrentStep] = useState(
    () => (editMode && focusStep) ? focusStep : 1
  );

  const [step1Selection, setStep1Selection] = useState(
    () => (editMode && preSelectedStep1) ? preSelectedStep1 : null
  );

  const [step2Selection, setStep2Selection] = useState(
    () => {
      if (kazaNitelik === 'TEKLİ KAZA (BEYANLI)') {
        return "bizim kasko";
      }
      return (editMode && preSelectedStep2) ? preSelectedStep2 : null;
    }
  );

  const [step3Selection, setStep3Selection] = useState(() => {
    if (!editMode) return null;
    if (preSelectedStep3 === 'yes') return 'yes';
    if (preSelectedStep3 === 'no') return 'no';
    return null;
  });


  const stepNames =
    kazaNitelik === 'TEKLİ KAZA (BEYANLI)'
      ? ['Adım 1']
      : ['Adım 1', 'Adım 2', ...(step2Selection === 'karsi trafik' || step2Selection === 'karsi kasko'
        ? ['Adım 3']
        : [])
      ];

  useEffect(() => {
    if (editMode) {
      setCurrentStep(focusStep || 1);
    }
  }, [editMode, focusStep]);

  const iconComponents = {
    user: User,
    users: Users,
    navigation: Navigation,
    shieldCheck: ShieldCheck,
    shieldAlert: ShieldAlert,
    userCheck: UserCheck,
    userX: UserX
  };

  const getSafeParams = useCallback((s1 = step1Selection, s2 = step2Selection, s3 = step3Selection) => {
    return {
      selectedCompany,
      kazaNitelik,
      samePerson: s1 === 'yes',
      insuranceSource: s2,
      karsiSamePerson: s3 === 'yes',
      startStep: returnStep || 1,
      driverData: location.state?.driverData || {},
      victimData: location.state?.victimData || {},
      vehicleData: location.state?.vehicleData || {},
      insuredData: location.state?.insuredData || {},
      mechanicData: location.state?.mechanicData || {},
      serviceData: location.state?.serviceData || {},
      damageData: location.state?.damageData || {},
      opposingDriverData: location.state?.opposingDriverData || {},
      documents: location.state?.documents,
    };
  }, [selectedCompany, kazaNitelik, location.state, returnStep, step1Selection, step2Selection, step3Selection]);

  const handleBackPress = () => {
    if (editMode && returnTo) {
      navigate(returnTo, { state: getSafeParams() });
    } else if (currentStep === 1) {
      navigate(-1);
    } else {
      setCurrentStep(1);
    }
  };

  const OptionCard = ({ title, selected, onPress, iconName, subs }) => {
    const IconComponent = iconComponents[iconName] || User;

    return (
      <div
        className={`${styles.optionCard} ${selected ? styles.selected : ''}`}
        onClick={onPress}
      >
        <div className={styles.optionContentWrapper}>
          <IconComponent
            size={35}
            className={`${styles.optionIcon} ${selected ? styles.selected : ''}`}
          />
          <div className={styles.optionTextContent}>
            <h3 className={`${styles.optionTitle} ${selected ? styles.selected : ''}`}>
              {title}
            </h3>
            {subs && (
              <p className={`${styles.optionSubs} ${selected ? styles.selected : ''}`}>
                {subs}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleStep1Select = (option) => {
    setStep1Selection(option);
  };

  const handleStep2Select = (option) => {
    setStep2Selection(option);
  };

  const handleStep3Select = (option) => {
    setStep3Selection(option);
  };

  const isAllChosenForCurrentStep =
    currentStep === 1 ? !!step1Selection
      : currentStep === 2 ? !!step2Selection
        : currentStep === 3 ? !!step3Selection
          : false;

  const handleContinue = () => {

    // 🔥 Düzenleme modunda kullanıcı seçim yapar yapmaz direkt onay sayfasına git
    if (editMode) {
      const safeParams = getSafeParams(step1Selection, step2Selection, step3Selection);
      navigate('/step-info', { state: safeParams });   
      return;
    }

    // Tekli kaza durumu:
    if (kazaNitelik === 'TEKLİ KAZA (BEYANLI)' && step1Selection) {
      const safeParams = getSafeParams(step1Selection, step2Selection, step3Selection);

      navigate('/step-info', { state: safeParams });
      return;
    }

    // Normal Akış:
    if (currentStep === 1 && step1Selection) {
      setCurrentStep(2);
    } else if (currentStep === 2 && step2Selection) {
      if (step2Selection === 'karsi trafik' || step2Selection === 'karsi kasko') {
        setCurrentStep(3);
      } else {
        const safeParams = getSafeParams(step1Selection, step2Selection, step3Selection);
        navigate('/step-info', { state: safeParams });
      }
    } else if (currentStep === 3 && step3Selection) {
      const safeParams = getSafeParams(step1Selection, step2Selection, step3Selection);
      navigate('/step-info', { state: safeParams });
    }
  };


  return (
    <div className={styles.insuranceStepperPage}>
      <div className={styles.stepperScrollContainer}>
        <div className={styles.stepperCardsContainer}>

          {selectedCompany && (
            // Şirket Kartı
            <div className={styles.companyCardAccidentInsurance}>
              <div className={styles.companyCardContentInsurance}>
                <div className={styles.companyTextContentInsurance}>
                  <div className={styles.companyTypeWrapperInsurance}>
                    <span className={styles.companyTypeInsurance}>Sigorta<br />Şirketi</span>
                  </div>
                </div>

                {selectedCompany.photo && (
                  <img
                    src={selectedCompany.photo}
                    alt={selectedCompany.name}
                    className={styles.companyLogoImg}
                  />
                )}
              </div>

              {/* Koyu Mavi Alt Şerit */}
              <div className={styles.companyNameFooter}>
                <h2 className={styles.companyNameAccidentInsuranceFooter}>
                  {selectedCompany.name}
                </h2>
              </div>
            </div>
          )}

          <div className={styles.progressCard}>
            {kazaNitelik !== 'TEKLİ KAZA (BEYANLI)' && (
              <div className={styles.stepperWrapper}>
                <Stepper
                  steps={stepNames}
                  currentStep={currentStep}
                  onStepPress={(step) => {
                    if (editMode || step <= currentStep) {
                      setCurrentStep(step);
                    }
                  }}
                />
              </div>
            )}

            <h2 className={styles.stepQuestion}>
              {currentStep === 1
                ? 'Sürücü Bilgisi ile Mağdur Bilgisi Aynı Mı?'
                : currentStep === 2
                  ? 'Sigorta Nereden Açılıyor?'
                  : 'Karşı Ruhsat Sahibi ve Sürücü Aynı Kişi Mi?'}
            </h2>

            <div className={styles.optionsGrid}>
              {currentStep === 1 && (
                <>
                  <OptionCard
                    title="Evet, aynı kişi"
                    subs="Sürücü ve Mağdur bilgileri aynı"
                    selected={step1Selection === 'yes'}
                    onPress={() => handleStep1Select('yes')}
                    iconName="user"
                  />
                  <OptionCard
                    title="Hayır, farklı kişi"
                    subs="Sürücü ve Mağdur bilgileri farklı"
                    selected={step1Selection === 'no'}
                    onPress={() => handleStep1Select('no')}
                    iconName="users"
                  />
                </>
              )}

              {currentStep === 2 && kazaNitelik !== 'TEKLİ KAZA (BEYANLI)' && (
                <>
                  <OptionCard
                    title="Karşı Trafik"
                    selected={step2Selection === 'karsi trafik'}
                    onPress={() => handleStep2Select('karsi trafik')}
                    iconName="navigation"
                  />

                  <OptionCard
                    title="Bizim Kasko"
                    selected={step2Selection === 'bizim kasko'}
                    onPress={() => handleStep2Select('bizim kasko')}
                    iconName="shieldCheck"
                  />

                  <OptionCard
                    title="Karşı Kasko"
                    selected={step2Selection === 'karsi kasko'}
                    onPress={() => handleStep2Select('karsi kasko')}
                    iconName="shieldAlert"
                  />
                </>
              )}

              {currentStep === 3 && (
                <>
                  <OptionCard
                    title="Evet, aynı kişi"
                    subs="Karşı tarafın ruhsat sahibi ve sürücüsü aynı"
                    selected={step3Selection === 'yes'}
                    onPress={() => handleStep3Select('yes')}
                    iconName="userCheck"
                  />

                  <OptionCard
                    title="Hayır, farklı kişi"
                    subs="Karşı tarafın ruhsat sahibi ve sürücüsü farklı"
                    selected={step3Selection === 'no'}
                    onPress={() => handleStep3Select('no')}
                    iconName="userX"
                  />
                </>
              )}
            </div>
          </div>

          {/* --- BUTONLAR --- */}
          <FormFooter
            onBack={() => navigate(-1)}
            onNext={handleContinue}
            nextLabel="DEVAM ET"
            backLabel="GERİ DÖN"
            disabled={!isAllChosenForCurrentStep}
          />

          <div className={styles.infoCard}>
            <Info size={20} className={styles.infoIcon} />
            <p className={styles.infoText}>
              Bilgi: Şirketler adına yapılan işlemlerde mağdur bilgisi ile
              sürücü bilgisi farklı kabul edilir. Bu nedenle "Hayır, farklı kişi"
              seçeneğini kullanınız.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}