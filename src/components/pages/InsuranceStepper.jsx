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

  console.log('🔍 InsuranceStepper - Gelen kazaNitelik:', kazaNitelik);

  // STEPLER
  const [currentStep, setCurrentStep] = useState(
    () => (editMode && focusStep) ? focusStep : 1
  );

  const [step1Selection, setStep1Selection] = useState(
    () => (editMode && preSelectedStep1) ? preSelectedStep1 : null
  );

  const [step2Selection, setStep2Selection] = useState(
    () => {
      if (editMode && preSelectedStep2) {
        return preSelectedStep2;
      }
      return null;
    }
  );

  const [step3Selection, setStep3Selection] = useState(null);

  const stepNames =
    kazaNitelik === 'TEKLİ KAZA (BEYANLI)'
      ? ['Adım 1']
      : ['Adım 1', 'Adım 2', ...(step2Selection === 'karsi trafik' ? ['Adım 3'] : [])];

  // ✅ DEVAM ET BUTONU İÇİN KONTROL
  const isAllChosen = kazaNitelik === 'TEKLİ KAZA (BEYANLI)'
    ? !!step1Selection
    : !!step1Selection && !!step2Selection;

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

  // ❗ ADIM 1 — TEKLİ KAZA İÇİN ÖZEL DAVRANIŞ
  const handleStep1Select = (option) => {
    setStep1Selection(option);

  
    const safeParams = {
      // Temel parametreler
      kazaNitelik: kazaNitelik, // Açıkça belirt
      selectedCompany: selectedCompany,
      samePerson: option === 'yes',
      insuranceSource: kazaNitelik === 'TEKLİ KAZA (BEYANLI)' ? 'bizim kasko' : step2Selection,
      karsiSamePerson: step3Selection === 'yes',
      startStep: 1,

      // Diğer state değerleri
      ...location.state // Geri kalan her şey
    };

    console.log('🚀 StepInfo\'ya gönderilen kazaNitelik:', safeParams.kazaNitelik);

    if (kazaNitelik === 'TEKLİ KAZA (BEYANLI)') {
      if (editMode && returnTo) {
        navigate(returnTo, { state: safeParams });
      } else {
        navigate('/step-info', { state: safeParams });
      }
      return;
    }

    // NORMAL AKIŞ (İkili/Çoklu Kaza)
    if (editMode && returnTo) {
      const safeParams = {
        ...location.state, 
        kazaNitelik, 
        selectedCompany,
        samePerson: option === 'yes',
        insuranceSource: step2Selection,
        startStep: returnStep,
      };

      console.log('🔧 Edit mode - returnTo:', safeParams);
      navigate(returnTo, { state: safeParams });
    } else {
      // ✅ Normal modda step 2'ye geçiyoruz
      console.log('➡️ Step 2\'ye geçiliyor, kazaNitelik:', kazaNitelik);
      setCurrentStep(2);
    }
  };

  // ADIM 2 NORMAL (TEKLİ KAZA HARİÇ)
 
  const handleStep2Select = (option) => {
    console.log("🔄 Step2 seçildi:", option);
    setStep2Selection(option);

    
    const safeParams = {
      kazaNitelik: kazaNitelik,
      selectedCompany: selectedCompany,
      samePerson: step1Selection === 'yes',
      insuranceSource: option,
      karsiSamePerson: step3Selection === 'yes',
      startStep: 1,
      ...location.state
    };

    console.log("🔍 Step2'de kazaNitelik:", safeParams.kazaNitelik);

    if (option === 'karsi trafik') {
      setCurrentStep(3);
      return;
    }

    if (editMode && returnTo) {
      navigate(returnTo, { state: safeParams });
    } else {
      navigate('/step-info', { state: safeParams });
    }
  };

 
  const handleStep3Select = (option) => {
    console.log("🔄 Step3 seçildi:", option);
    setStep3Selection(option);

    const safeParams = {
      kazaNitelik: kazaNitelik,
      selectedCompany: selectedCompany,
      samePerson: step1Selection === 'yes',
      insuranceSource: step2Selection,
      karsiSamePerson: option === 'yes',
      startStep: 1,
      ...location.state
    };

    console.log("🔍 Step3'te kazaNitelik:", safeParams.kazaNitelik);

    if (editMode && returnTo) {
      navigate(returnTo, { state: safeParams });
    } else {
      navigate('/step-info', { state: safeParams });
    }
  };
  // GERİ DÖN
  const handleBackPress = () => {
    const safeParams = {
      ...location.state, 
      kazaNitelik, 
      selectedCompany,
      samePerson: step1Selection === 'yes',
      insuranceSource: step2Selection,
      startStep: returnStep,
    };

    if (editMode && returnTo) {
      navigate(returnTo, { state: safeParams });
    } else if (currentStep === 1) {
      navigate(-1);
    } else {
      setCurrentStep(1);
    }
  };

  // DEVAM ET BUTONU
  const handleContinue = () => {
    if (kazaNitelik === 'TEKLİ KAZA (BEYANLI)') return;

    const safeParams = {
      ...location.state, 
      kazaNitelik, 
      selectedCompany,
      samePerson: step1Selection === 'yes',
      insuranceSource: step2Selection,
      karsiSamePerson: step3Selection === 'yes',
      startStep: 1,
    };

    console.log("🚀 Continue butonu - StepInfo'ya gönderilen params:", safeParams);

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