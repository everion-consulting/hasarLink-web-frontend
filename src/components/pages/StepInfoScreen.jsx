import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/StepInfo.css';
import step from '.././images/step.png';
import BirIcon from '.././images/birIcon.svg';
import IkiIcon from '.././images/ikiIcon.svg';
import UcIcon from '.././images/ucIcon.svg';
import { formatPlate, maskPhone, toYYYYMMDD } from '../utils/formatter';
import apiService from '../../services/apiServices';
import { ArrowUpRightIcon, ArrowUpLeftIcon } from '@heroicons/react/24/outline';
import { ArrowUpLeft } from 'lucide-react';

export default function StepInfoScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = location.state || {};

  const startStep = params?.startStep || 2;
  const selectedCompany = params?.selectedCompany || null;
  const samePerson = params?.samePerson || false;
  const karsiSamePerson = params?.karsiSamePerson || null;
  const insuranceSource = params?.insuranceSource || null;
  const kazaNitelik = params?.kazaNitelik || null;

  // Form verilerini doğru şekilde al
  const [driverData, setDriverData] = useState(params?.driverData || {});
  const [victimData, setVictimData] = useState(params?.victimData || {});
  const [vehicleData, setVehicleData] = useState(params?.vehicleData || {});
  const [insuredData, setInsuredData] = useState(params?.insuredData || {});
  const [mechanicData, setMechanicData] = useState(params?.mechanicData || {});
  const [serviceData, setServiceData] = useState(params?.serviceData || {});
  const [damageData, setDamageData] = useState(params?.damageData || {});
  const [opposingDriverData, setOpposingDriverData] = useState(params?.opposingDriverData || {});

  const [currentStep, setCurrentStep] = useState(startStep);
  const [isAllChosen, setIsAllChosen] = useState(true);
  const [isStepApproved, setIsStepApproved] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);

  // 🔥 YENİ: Step 2 için özel state
  const [step2Data, setStep2Data] = useState({
    victimData: params?.victimData || {},
    driverData: params?.driverData || {},
    vehicleData: params?.vehicleData || {}
  });

  useEffect(() => {
    // Step 2 verilerini güncelle
    setStep2Data({
      victimData: victimData,
      driverData: driverData,
      vehicleData: vehicleData
    });
  }, [victimData, driverData, vehicleData]);

  const createSubmission = async () => {
    try {
      const payload = {
        nature_new: kazaNitelik,
        insurance_company: selectedCompany?.id || null,
        is_driver_victim_same: samePerson,
        is_insured_opposing_driver_same: !!karsiSamePerson,
        insurance_source: insuranceSource,
        is_completed: false,
      };

      const res = await apiService.createSubmission(payload);
      console.log("📡 CREATE yanıtı:", res);

      if (!res.success) {
        console.error("❌ Submission oluşturulamadı:", res.message);
        alert(res.message || "Submission oluşturulamadı.");
        return null;
      }

      const data = res.data;
      if (data?.id) {
        setSubmissionId(data.id);
        localStorage.setItem("submissionId", String(data.id));
        console.log("✅ Submission oluşturuldu:", data.id);
        return data.id;
      } else {
        console.warn("⚠️ CREATE içinde id bulunamadı!");
        return null;
      }
    } catch (err) {
      console.error("❌ CREATE Error:", err.message);
      return null;
    }
  };

  useEffect(() => {
    if (submissionId) {
      console.log("🆕 submissionId state güncellendi:", submissionId);
    }
  }, [submissionId]);

  const updateSubmission = async () => {
    const savedId = submissionId || localStorage.getItem("submissionId");
    console.log("🔎 submissionId (state/localStorage):", savedId, " currentStep:", currentStep);

    if (!savedId) {
      console.log("⛔ Submission ID bulunamadı");
      return;
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      const [day, month, year] = dateStr.split(/[./-]/);
      return `${year}-${month}-${day}`;
    };

    try {
      let payload = {};

      // 🔥 SADECE STEP 2 VERİLERİNİ GÖNDER
      if (currentStep === 2) {
        payload = {
          victim_fullname: victimData.victim_fullname,
          victim_tc: victimData.victim_tc,
          victim_birth_date: toYYYYMMDD(victimData.victim_birth_date),
          victim_mail: victimData.victim_mail,
          victim_phone: victimData.victim_phone,
          victim_iban: victimData.victim_iban,

          // Sürücü bilgileri (eğer farklı kişi ise)
          ...(!samePerson && {
            driver_fullname: driverData.driver_fullname,
            driver_tc: driverData.driver_tc,
            driver_mail: driverData.driver_mail,
            driver_phone: driverData.driver_phone,
            driver_birth_date: toYYYYMMDD(driverData.driver_birth_date),
          }),

          // Araç bilgileri
          vehicle_brand: vehicleData.vehicle_brand,
          vehicle_model: vehicleData.vehicle_model,
          vehicle_type: vehicleData.vehicle_type,
          vehicle_usage_type: vehicleData.vehicle_usage_type,
          vehicle_plate: vehicleData.vehicle_plate,
          vehicle_year: vehicleData.vehicle_year,
          vehicle_sub_model: vehicleData.vehicle_sub_model,
          vehicle_license_no: vehicleData.vehicle_license_no,
          vehicle_chassis_no: vehicleData.vehicle_chassis_no,
          vehicle_engine_no: vehicleData.vehicle_engine_no,

          is_completed: false,
        };
      }

      console.log(`📤 UPDATE Submission ${savedId} Payload:`, payload);
      const res = await apiService.updateSubmission(savedId, payload);
      console.log("📡 UPDATE yanıtı:", res);

      if (!res.success) {
        console.error("❌ UPDATE başarısız:", res.message);
        alert(res.message || "Submission güncellenemedi.");
        return null;
      }

      return res?.data;
    } catch (err) {
      console.error("❌ UPDATE Error:", err.message);
    }
  };

  const handleStepApprove = async () => {
    const existingId = submissionId || localStorage.getItem("submissionId");

    if (!existingId) {
      console.log("🆕 Yeni submission oluşturuluyor...");
      const newId = await createSubmission();
      if (newId) setSubmissionId(newId);
    } else {
      console.log("🟡 Mevcut submission bulundu, güncelleme yapılıyor:", existingId);
      await updateSubmission();
    }

    setIsStepApproved(true);
  };

  const renderStepIcon = () => {
    switch (currentStep) {
      case 1:
        return <img src={BirIcon} width={62} height={56} alt="Step 1" />
      case 2:
        return <img src={IkiIcon} width={62} height={56} alt="Step 2" />
      case 3:
        return <img src={UcIcon} width={62} height={56} alt="Step 3" />;
      default:
        return null;
    }
  };

  // 🔥 YENİ: Step 2 için özel içerik
  const getStep2Content = () => {
    return {
      title: 'Kişi ve Araç Bilgileri',
      sections: [
        {
          title: 'Mağdur Bilgileri',
          editKey: 'victim_info',
          data: [
            { label: 'Ad Soyad', value: step2Data.victimData.victim_fullname || '' },
            { label: 'Kimlik No', value: step2Data.victimData.victim_tc || '' },
            { label: 'E-Mail', value: step2Data.victimData.victim_mail || '' },
            { label: 'Telefon No', value: step2Data.victimData.victim_phone || '' },
            { label: 'Doğum Tarihi', value: step2Data.victimData.victim_birth_date || '' },
            { label: 'Sigortalı Poliçe No', value: step2Data.victimData.insured_policy_no || '' },
            { label: 'Poliçe Tecdit No', value: step2Data.victimData.policy_no || '' },
            { label: 'Tescil Belge Seri No', value: step2Data.victimData.registrationNo || '' }
          ]
        },
        ...(!samePerson
          ? [
            {
              title: 'Sürücü Bilgileri',
              editKey: 'driver_info',
              data: [
                { label: 'Ad Soyad', value: step2Data.driverData.driver_fullname || '' },
                { label: 'Kimlik No', value: step2Data.driverData.driver_tc || '' },
                { label: 'E-Mail', value: step2Data.driverData.driver_mail || '' },
                { label: 'Telefon No', value: step2Data.driverData.driver_phone || '' },
                { label: 'Doğum Tarihi', value: step2Data.driverData.driver_birth_date || '' }
              ]
            }
          ]
          : []),
        {
          title: 'Mağdur Araç Bilgileri',
          editKey: 'vehicle_info',
          data: [
            { label: 'Araç Markası', value: step2Data.vehicleData.vehicle_brand || '' },
            { label: 'Araç Türü', value: step2Data.vehicleData.vehicle_type || '' },
            { label: 'Model', value: step2Data.vehicleData.vehicle_model || '' },
            { label: 'Ruhsat Seri No', value: step2Data.vehicleData.vehicle_license_no || '' },
            { label: 'Şasi No', value: step2Data.vehicleData.vehicle_chassis_no || '' },
            { label: 'Motor No', value: step2Data.vehicleData.vehicle_engine_no || '' },
            { label: 'Model Yılı', value: step2Data.vehicleData.vehicle_year || '' },
            { label: 'Kullanım Tarzı', value: step2Data.vehicleData.vehicle_usage_type || '' },
            { label: 'Mağdur Araç Plaka', value: formatPlate(step2Data.vehicleData.vehicle_plate) || '' }
          ]
        }
      ]
    };
  };

  const handleBackPress = () => {
    if (isStepApproved) {
      setIsStepApproved(false);
    } else {
      navigate('/driver-victim-stepper', {
        state: {
          ...params,
          returnTo: 'StepInfoScreen',
          vehicleData: step2Data.vehicleData
        }
      });
    }
  };

  const handleContinuePress = async () => {
    if (!isStepApproved) {
      await handleStepApprove();
      return;
    }

    // Step 2 onaylandıktan sonra Step 3'e geç
    navigate('/insured-mechanic-stepper', {
      state: {
        ...params,
        victimData: step2Data.victimData,
        driverData: step2Data.driverData,
        vehicleData: step2Data.vehicleData,
        startStep: 3
      }
    });
  };

  const handleFinalApprove = async () => {
    await updateSubmission();
    const randomFileNumber = `AXA-2025-${Math.floor(10000 + Math.random() * 90000)}`;

    navigate('/success-screen', {
      state: {
        fileName: randomFileNumber,
        companyName: selectedCompany?.name,
        selectedCompany,
        samePerson,
        insuranceSource,
        ...step2Data
      }
    });
  };

  const ApprovedStepComponent = () => (
    <div className="approved-container">
      <div className="approved-card">
        <img src={step} className="onay-icon" alt="Onay" />
        <div className="approved-message">
          <div className="approved-message-text">
            Girdiğiniz bilgiler onaylanmıştır
          </div>
        </div>
      </div>
    </div>
  );

  // 🔥 YENİ: Resimdeki tasarıma uygun form kartı
  const FormCardComponent = () => {
    const stepContent = getStep2Content();

    return (
      <div className="form-card three-column">
        {stepContent.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="section-box">
            <div className="content-box">
              <div className="section-title">{section.title}</div>

              <div className="data-container">
                {section.data.map((item, itemIndex) => (
                  <div key={itemIndex} className="data-row">
                    <div className="label-value-pair">
                      <div className="data-label">{item.label}:</div>
                      <div className={`data-value ${item.label === 'Mağdur Araç Plaka' ? 'red-text' : ''}`}>
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="edit-button-container">
                <button
                  className="edit-link"
                  onClick={() => handleEditPress(section)}
                >
                  Düzenle
                </button>
              </div>

            </div>
          </div>
        ))}

        {/* ONAYLA butonu */}
        <div className="stepinfo-footer">
          <button className="approve-button" onClick={handleStepApprove}>
            <div className="approve-button-text">
              ONAYLA
              <span className="approve-icon-wrapper">
                <ArrowUpRightIcon className="approve-icon" />
              </span>
            </div>
          </button>
        </div>




      </div>
    );
  };

  const handleEditPress = (section) => {
    if (isStepApproved) return;

    const editKey = section.editKey;

    switch (editKey) {
      case 'victim_info':
      case 'driver_info':
      case 'vehicle_info':
        navigate('/driver-victim-stepper', {
          state: {
            ...params,
            editMode: true,
            focusSection: editKey,
            returnTo: 'StepInfoScreen',
            victimData: step2Data.victimData,
            driverData: step2Data.driverData,
            vehicleData: step2Data.vehicleData
          }
        });
        break;
      default:
        alert('Bu bölüm henüz düzenlenemiyor.');
        break;
    }
  };

  useEffect(() => {
    if (params) {
      console.log("🔁 StepInfoScreen parametreleri yenilendi:", params);
      if (params.driverData) setDriverData(params.driverData);
      if (params.victimData) setVictimData(params.victimData);
      if (params.vehicleData) setVehicleData(params.vehicleData);
    }
  }, [params]);

  return (
    <div className="step-info-container">
      <div className="scroll-view">
        <div className="page-title">Adım Adım Dosyanı Oluştur</div>

        {/* Form kartı - ORTADA */}
        {isStepApproved ? <ApprovedStepComponent /> : <FormCardComponent />}

        {/* ADIM [02] bölümü - RESİMDEKİ GİBİ FORMDAN SONRA ALTTA */}
        <div className="step-bottom-section">
          <div className="step-header">
            <div className="step-title">ADIM</div>
            <div className="step-icon-container">
              {renderStepIcon()}
            </div>
          </div>
          <div className="step-info">
            Bu adımda Sigortalı Kişi ve Araç ve Tamirci/Servis Bilgilerini dolduracaksınız.
          </div>

          {/* KÜÇÜK BUTONLAR - ADIMIN ALTINDA */}
          <div className="small-buttons-container">
            <button className="small-back-button" onClick={handleBackPress}>
              <div className="approve-button-text-back">
                <span className="approve-icon-wrapper">
                  <ArrowUpLeftIcon className="approve-icon-back" />
                </span>
                GERİ DÖN

              </div>
            </button>
            <button
              className="small-continue-button"
              onClick={handleContinuePress}

            >
              <div className="approve-button-text">
                DEVAM ET
                <span className="approve-icon-wrapper">
                  <ArrowUpRightIcon className="approve-icon" />
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}