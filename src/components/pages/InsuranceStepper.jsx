import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Users,
  Navigation,
  Shield,
  ArrowRight,
  Info,
  ArrowLeft
} from 'lucide-react';
import Stepper from '../stepper/Stepper';
import '../../styles/insuranceStepper.css';

export default function InsuranceStepper() {
  const navigate = useNavigate();
  const location = useLocation();

  // Route state'den gelen değerler
  const selectedCompany = location.state?.selectedCompany || null;
  const editMode = location.state?.editMode || false;
  const focusStep = location.state?.focusStep || 1;
  const preSelectedStep1 = location.state?.preSelectedStep1 || null;
  const preSelectedStep2 = location.state?.preSelectedStep2 || null;
  const returnTo = location.state?.returnTo || null;
  const returnStep = location.state?.returnStep || 1;
  const kazaNitelik = location.state?.kazaNitelik || null;

  // STEPLER
  const [currentStep, setCurrentStep] = useState(
    () => (editMode && focusStep) ? focusStep : 1
  );

  const [step1Selection, setStep1Selection] = useState(
    () => (editMode && preSelectedStep1) ? preSelectedStep1 : null
  );

  const [step2Selection, setStep2Selection] = useState(
    () => {
      // 🔥 TEKLİ KAZA İSE OTOMATİK "bizim kasko" SET ET
      if (kazaNitelik === 'TEKLİ KAZA (BEYANLI)') {
        return "bizim kasko";
      }
      return (editMode && preSelectedStep2) ? preSelectedStep2 : null;
    }
  );

  const [step3Selection, setStep3Selection] = useState(null);

  
  const stepNames =
    kazaNitelik === 'TEKLİ KAZA (BEYANLI)'
      ? ['Adım 1']
      : ['Adım 1', 'Adım 2', ...(step2Selection === 'karsi trafik' ? ['Adım 3'] : [])];

  // EditMode değerlerini yeniden yükle
  useEffect(() => {
    if (editMode) {
      setCurrentStep(focusStep || 1);
      setStep1Selection(preSelectedStep1);
      setStep2Selection(preSelectedStep2);
    }
  }, [editMode, focusStep, preSelectedStep1, preSelectedStep2]);

  // Ikon map'i
  const iconComponents = {
    user: User,
    users: Users,
    navigation: Navigation,
    shield: Shield,
  };

  // GERİ DÖN
  const handleBackPress = () => {
    const safeParams = {
      selectedCompany,
      kazaNitelik,
      samePerson: step1Selection === 'yes',
      insuranceSource: step2Selection,
      startStep: returnStep,
      driverData: location.state?.driverData || {},
      victimData: location.state?.victimData || {},
      vehicleData: location.state?.vehicleData || {},
      insuredData: location.state?.insuredData || {},
      mechanicData: location.state?.mechanicData || {},
      serviceData: location.state?.serviceData || {},
      damageData: location.state?.damageData || {},
      documents: location.state?.documents,
    };

    if (editMode && returnTo) {
      navigate(returnTo, { state: safeParams });
    } else if (currentStep === 1) {
      navigate(-1);
    } else {
      setCurrentStep(1);
    }
  };

  // OPTION CARD
  const OptionCard = ({ title, selected, onPress, iconName, subs }) => {
    const IconComponent = iconComponents[iconName] || User;

    return (
      <div
        className={`option-card ${selected ? 'selected' : ''}`}
        onClick={onPress}
      >
        <div className="option-content-wrapper">
          <IconComponent
            size={35}
            className={`option-icon ${selected ? 'selected' : ''}`}
          />
          <div className="option-text-content">
            <h3 className={`option-title ${selected ? 'selected' : ''}`}>
              {title}
            </h3>
            {subs && (
              <p className={`option-subs ${selected ? 'selected' : ''}`}>
                {subs}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ❗ ADIM 1 — TEKLİ KAZA İSE DİREKT BİZİM KASKO'YA GÖNDER
  const handleStep1Select = (option) => {
    setStep1Selection(option);

    // TEKLİ KAZA ÖZEL DAVRANIŞ
    if (kazaNitelik === 'TEKLİ KAZA (BEYANLI)') {
      const safeParams = {
        selectedCompany,
        kazaNitelik,
        samePerson: option === 'yes',
        insuranceSource: step2Selection,
        karsiSamePerson: step3Selection === 'yes',
        startStep: 1,
        driverData: location.state?.driverData || {},
        victimData: location.state?.victimData || {},
        vehicleData: location.state?.vehicleData || {},
        insuredData: location.state?.insuredData || {},
        mechanicData: location.state?.mechanicData || {},
        serviceData: location.state?.serviceData || {},
        damageData: location.state?.damageData || {},
        documents: location.state?.documents,
      };

      if (editMode && returnTo) {
        navigate(returnTo, { state: safeParams });
        return;
      }

      navigate('/step-info', { state: safeParams });
      return;
    }

    // NORMAL AKIŞ
    if (editMode && returnTo) {
      const safeParams = {
        selectedCompany,
        kazaNitelik,
        samePerson: option === 'yes',
        insuranceSource: step2Selection,
        startStep: returnStep,
        ...location.state,
      };
      navigate(returnTo, { state: safeParams });
    } else {
      setCurrentStep(2);
    }
  };

  // ADIM 2 NORMAL (TEKLİ KAZA HARİÇ)
  const handleStep2Select = (option) => {
    setStep2Selection(option);

    if (option === 'karsi trafik') {
      setCurrentStep(3);
      return;
    }

    const safeParams = {
      selectedCompany,
      kazaNitelik,
      samePerson: step1Selection === 'yes',
      insuranceSource: step2Selection,
      karsiSamePerson: step3Selection === 'yes',
      startStep: 1,
      driverData: location.state?.driverData || {},
      victimData: location.state?.victimData || {},
      vehicleData: location.state?.vehicleData || {},
      insuredData: location.state?.insuredData || {},
      mechanicData: location.state?.mechanicData || {},
      serviceData: location.state?.serviceData || {},
      damageData: location.state?.damageData || {},
      documents: location.state?.documents,
    };

    if (editMode && returnTo) {
      navigate(returnTo, { state: safeParams });
    } else {
      navigate('/step-info', { state: safeParams });
    }
  };

  // ADIM 3 - KARŞI TRAFİK İÇİN
  const handleStep3Select = (option) => {
    setStep3Selection(option);

    const safeParams = {
      selectedCompany,
      kazaNitelik,
      samePerson: step1Selection === 'yes',
      insuranceSource: step2Selection,
      karsiSamePerson: option === 'yes',
      startStep: 1,
      driverData: location.state?.driverData || {},
      victimData: location.state?.victimData || {},
      vehicleData: location.state?.vehicleData || {},
      insuredData: location.state?.insuredData || {},
      mechanicData: location.state?.mechanicData || {},
      serviceData: location.state?.serviceData || {},
      damageData: location.state?.damageData || {},
      documents: location.state?.documents,
    };

    if (editMode && returnTo) {
      navigate(returnTo, { state: safeParams });
    } else {
      navigate('/step-info', { state: safeParams });
    }
  };

  // DEVAM ET BUTONU İÇİN KONTROL
  const isAllChosen = kazaNitelik === 'TEKLİ KAZA (BEYANLI)'
    ? !!step1Selection
    : !!step1Selection && !!step2Selection;
  const handleContinue = () => {
    if (kazaNitelik === 'TEKLİ KAZA (BEYANLI)') return;

    const safeParams = {
      selectedCompany,
      kazaNitelik,
      samePerson: step1Selection === 'yes',
      insuranceSource: step2Selection,
      karsiSamePerson: step3Selection === 'yes',
      startStep: 1,
      driverData: location.state?.driverData || {},
      victimData: location.state?.victimData || {},
      vehicleData: location.state?.vehicleData || {},
      insuredData: location.state?.insuredData || {},
      mechanicData: location.state?.mechanicData || {},
      serviceData: location.state?.serviceData || {},
      damageData: location.state?.damageData || {},
      documents: location.state?.documents,
    };

    if (editMode && returnTo) {
      navigate(returnTo, { state: safeParams });
    } else {
      navigate('/step-info', { state: safeParams });
    }
  };

  return (
    <div className="insurance-stepper-page">
      <div className="stepper-scroll-container">
        <div className="stepper-cards-container">

          {/* === GÜNCELLENMİŞ SİGORTA KARTI - AccidentTypeScreen stili === */}
          {selectedCompany && (
            <div className="company-card-accident-insurance">
              <div className="company-card-content-insurance">
                <div className="company-text-content-insurance">
                  <div className="company-type-wrapper-insurance">
                    <span className="company-type-insurance">Sigorta<br />Şirketi</span>
                  </div>
                  <h2 className="company-name-accident-insurance">
                    {selectedCompany.name}
                  </h2>
                </div>

                {selectedCompany.photo && (
                  <img
                    src={selectedCompany.photo}
                    alt={selectedCompany.name}
                    className="company-logo-img"
                  />
                )}
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="progress-card">
            {/* TEKLİ KAZA İSE STEPPER GÖRÜNMESİN */}
            {kazaNitelik !== 'TEKLİ KAZA (BEYANLI)' && (
              <div className="stepper-wrapper">
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

            {/* Başlık */}
            <h2 className="step-question">
              {currentStep === 1
                ? 'Sürücü Bilgisi ile Mağdur Bilgisi Aynı Mı?'
                : currentStep === 2
                  ? 'Sigorta Nereden Açılıyor?'
                  : 'Karşı Ruhsat Sahibi ve Sürücü Aynı Kişi Mi?'}
            </h2>

            {/* Seçenekler */}
            <div className="options-grid">
              {/* ADIM 1 */}
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

              {/* ADIM 2 — TEKLİ KAZA İSE GİZLENİR */}
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
                    iconName="shield"
                  />
                  <OptionCard
                    title="Karşı Kasko"
                    selected={step2Selection === 'karsi kasko'}
                    onPress={() => handleStep2Select('karsi kasko')}
                    iconName="shield"
                  />
                </>
              )}

              {/* ADIM 3 */}
              {currentStep === 3 && (
                <>
                  <OptionCard
                    title="Evet, aynı kişi"
                    subs="Karşı tarafın ruhsat sahibi ve sürücüsü aynı"
                    selected={step3Selection === 'yes'}
                    onPress={() => handleStep3Select('yes')}
                    iconName="user"
                  />
                  <OptionCard
                    title="Hayır, farklı kişi"
                    subs="Karşı tarafın ruhsat sahibi ve sürücüsü farklı"
                    selected={step3Selection === 'no'}
                    onPress={() => handleStep3Select('no')}
                    iconName="users"
                  />
                </>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="form-footer-buttons">
              <button
                className="back-button-web"
                onClick={handleBackPress}
              >
                <div className="button-icon-wrapper">
                  <ArrowLeft size={18} strokeWidth={2.0} />
                </div>
                <span>GERİ DÖN</span>
              </button>

              {/* Devam */}
              <button
                className={`continue-button-web ${(!isAllChosen && kazaNitelik !== 'TEKLİ KAZA (BEYANLI)') ? 'disabled' : ''}`}
                onClick={handleContinue}
                disabled={!isAllChosen && kazaNitelik !== 'TEKLİ KAZA (BEYANLI)'}
              >
                <span>{editMode ? 'KAYDET' : 'DEVAM ET'}</span>
                <div className="button-icon-wrapper">
                  <ArrowRight size={18} strokeWidth={2.0} />
                </div>
              </button>
            </div>
          </div>

          {/* Bilgi Kartı */}
          <div className="info-card">
            <Info size={20} className="info-icon" />
            <p className="info-text">
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