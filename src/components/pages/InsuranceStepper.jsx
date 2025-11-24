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
  
  // Route state'den gelen değerleri al
  const selectedCompany = location.state?.selectedCompany || null;
  const editMode = location.state?.editMode || false;
  const focusStep = location.state?.focusStep || 1;
  const preSelectedStep1 = location.state?.preSelectedStep1 || null;
  const preSelectedStep2 = location.state?.preSelectedStep2 || null;
  const preSelectedStep3 = location.state?.preSelectedStep3 || null;
  const returnTo = location.state?.returnTo || null;
  const returnStep = location.state?.returnStep || 1;
  const kazaNitelik = location.state?.kazaNitelik || null;

  const [currentStep, setCurrentStep] = useState(() => (editMode && focusStep) ? focusStep : 1);
  const [step1Selection, setStep1Selection] = useState(() => (editMode && preSelectedStep1) ? preSelectedStep1 : null);
  const [step2Selection, setStep2Selection] = useState(() => (editMode && preSelectedStep2) ? preSelectedStep2 : null);
  const [step3Selection, setStep3Selection] = useState(null);

  const stepNames = ['Adım 1', 'Adım 2', ...(step2Selection === 'karsi trafik' ? ['Adım 3'] : [])];

  useEffect(() => {
    if (editMode) {
      setCurrentStep(focusStep || 1);
      setStep1Selection(preSelectedStep1);
      setStep2Selection(preSelectedStep2);
    }
  }, [editMode, focusStep, preSelectedStep1, preSelectedStep2]);

  useEffect(() => {
    if (kazaNitelik === "TEKLİ KAZA (BEYANLI)") {
      console.log("Kaza Niteliği:", kazaNitelik);
      setStep2Selection("bizim kasko");
    }
  }, [kazaNitelik]);

  const iconComponents = {
    user: User,
    users: Users,
    navigation: Navigation,
    shield: Shield,
  };

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
      documents: location.state?.documents
    };

    if (editMode && returnTo) {
      navigate(returnTo, { state: safeParams });
    } else if (currentStep === 1) {
      navigate(-1);
    } else {
      setCurrentStep(1);
    }
  };

  const handleStep1Select = (option) => {
    setStep1Selection(option);

    if (editMode && returnTo) {
      const safeParams = {
        selectedCompany,
        kazaNitelik: option,
        samePerson: option === 'yes',
        insuranceSource: step2Selection || preSelectedStep2,
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
      navigate(returnTo, { state: safeParams });
    } else {
      setCurrentStep(2);
    }
  };

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
      insuranceSource: option,
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
    } else {
      navigate('/step-info', { state: safeParams });
    }
  };

  const handleContinue = () => {
    if (!step1Selection || !step2Selection) return;

    const commonParams = {
      selectedCompany,
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
      documents: location.state?.documents
    };

    if (step2Selection === 'karsi trafik' && currentStep === 3) {
      navigate('/step-info', { state: commonParams });
      return;
    }

    if (editMode && returnTo) {
      navigate(returnTo, {
        state: {
          ...commonParams,
          startStep: returnStep
        }
      });
    } else {
      navigate('/step-info', { state: commonParams });
    }
  };

  const isAllChosen = !!step1Selection && !!step2Selection;

  return (
    <div className="insurance-stepper-page">
      <div className="stepper-scroll-container">
        <div className="stepper-cards-container">

          {/* Sigorta Şirketi Kartı */}
          {selectedCompany && (
            <div className="company-display-card">
              <div className="company-card-content">
                <div>
                  <div className="company-type-wrapper">
                    <span className="company-type">Sigorta Şirketi</span>
                  </div>
                  <h2 className="company-name">{selectedCompany.name}</h2>
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

          {/* Ana Form Kartı */}
          <div className="progress-card">
            <div className="stepper-wrapper">
              <Stepper
                steps={stepNames}
                currentStep={currentStep}
                onStepPress={(step) => {
                  if (editMode || step <= Math.max(step1Selection ? 2 : 1, currentStep)) {
                    setCurrentStep(step);
                  }
                }}
              />
            </div>

            <h2 className="step-question">
              {currentStep === 1
                ? 'Sürücü Bilgisi ile Mağdur Bilgisi Aynı Mı?'
                : currentStep === 2
                  ? 'Sigorta Nereden Açılıyor?'
                  : 'Karşı Ruhsat Sahibi ve Sürücü Aynı Kişi Mi?'}
            </h2>

            <div className="options-grid">
              {currentStep === 1 ? (
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
              ) : currentStep === 2 ? (
                kazaNitelik === "TEKLİ KAZA (BEYANLI)" ? (
                  <div className="option-card selected auto-selected">
                    <div className="option-content-wrapper">
                      <Shield size={35} className="option-icon selected" />
                      <div className="option-text-content">
                        <h3 className="option-title selected">Bizim Kasko</h3>
                      </div>
                    </div>
                  </div>
                ) : (
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
                      onPress={() => setStep2Selection('karsi kasko')}
                      iconName="shield"
                    />
                  </>
                )
              ) : (
                <>
                  <OptionCard
                    title="Evet, aynı kişi"
                    subs="Karşı tarafın ruhsat sahibi ve sürücüsü aynı"
                    selected={step3Selection === 'yes'}
                    onPress={() => setStep3Selection('yes')}
                    iconName="user"
                  />
                  <OptionCard
                    title="Hayır, farklı kişi"
                    subs="Karşı tarafın ruhsat sahibi ve sürücüsü farklı"
                    selected={step3Selection === 'no'}
                    onPress={() => setStep3Selection('no')}
                    iconName="users"
                  />
                </>
              )}
            </div>

            {/* Footer Buttons - Form içinde */}
            <div className="form-footer-buttons">
              <button
                className="back-button-web"
                onClick={handleBackPress}
              >
                <ArrowLeft size={18} strokeWidth={2.0} />
                <span>GERİ DÖN</span>
              </button>

              <button
                className={`continue-button-web ${!isAllChosen ? 'disabled' : ''}`}
                onClick={handleContinue}
                disabled={!isAllChosen}
              >
                <span>{editMode ? 'KAYDET' : 'DEVAM ET'}</span>
                <ArrowRight size={18} strokeWidth={2.0} />
              </button>
            </div>
          </div>

          {/* Info Kartı */}
          <div className="info-card">
            <Info size={20} className="info-icon" />
            <p className="info-text">
              <strong>Bilgi:</strong> Şirketler adına yapılan işlemlerde mağdur bilgisi ile sürücü bilgisi farklı kabul edilir. 
              Bu nedenle "Hayır, farklı kişi" seçeneğini kullanınız.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}