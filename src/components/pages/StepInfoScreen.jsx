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

export default function StepInfoScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = location.state || {};

  const startStep = params?.startStep || 1;
  const selectedCompany = params?.selectedCompany || null;
  const samePerson = params?.samePerson || false;
  const karsiSamePerson = params?.karsiSamePerson || null;
  const rawInsuranceSource = params?.insuranceSource || null;
  const kazaNitelik = params?.kazaNitelik || null;

  // EKRANDA KULLANACAĞIMIZ ASIL DEĞER
  const insuranceSource =
    kazaNitelik === "TEKLİ KAZA (BEYANLI)" ? "bizim kasko" : rawInsuranceSource;

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

  const isTekliBizimKasko =
    kazaNitelik === "TEKLİ KAZA (BEYANLI)" &&
    insuranceSource === "bizim kasko";

  const isCokluKarsiKasko =
    kazaNitelik === "ÇOKLU KAZA" &&
    insuranceSource === "karsi kasko";

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

    try {
      let payload = {};

      if (currentStep === 1) {
        payload = {
          nature_new: kazaNitelik,
          insurance_company: selectedCompany?.id || null,
          is_driver_victim_same: samePerson,
          insurance_source: insuranceSource,
          is_completed: false,
        };
      } else if (currentStep === 2) {
        payload = {
          victim_fullname: victimData.victim_fullname,
          victim_tc: victimData.victim_tc,
          victim_birth_date: toYYYYMMDD(victimData.victim_birth_date),
          victim_mail: victimData.victim_mail,
          victim_phone: victimData.victim_phone,
          victim_iban: victimData.victim_iban,
          is_completed: false,
        };

        if (!samePerson) {
          payload = {
            ...payload,
            driver_fullname: driverData.driver_fullname,
            driver_tc: driverData.driver_tc,
            driver_mail: driverData.driver_mail,
            driver_phone: driverData.driver_phone,
            driver_birth_date: toYYYYMMDD(driverData.driver_birth_date),
          };
        }

        payload = {
          ...payload,
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
        };
      } else if (currentStep === 3) {
        payload = {
          insured_fullname: insuredData.insured_fullname,
          insured_tc: insuredData.insured_tc,
          insured_birth_date: insuredData.insured_birth_date,
          insured_phone: insuredData.insured_phone,
          insured_mail: insuredData.insured_mail,
          insured_plate: insuredData.insured_plate,
          insured_policy_no: insuredData.insured_policy_no,
          insured_file_no: insuredData.insured_file_no,
          repair_fullname: mechanicData.repair_fullname,
          repair_birth_date: mechanicData.repair_birth_date,
          repair_tc: mechanicData.repair_tc,
          repair_phone: mechanicData.repair_phone,
          service_name: serviceData.service_name,
          service_tax_no: serviceData.service_tax_no,
          service_phone: serviceData.service_phone,
          service_state_city_city: serviceData.service_state_city_city,
          service_city: serviceData.service_city,
          service_address: serviceData.service_address,
          service_iban: serviceData.service_iban,
          service_iban_name: serviceData.service_iban_name,
          is_completed: false,
        };

        if (insuranceSource === "karsi trafik" && karsiSamePerson === false) {
          payload = {
            ...payload,
            opposing_driver_fullname: opposingDriverData.opposing_driver_fullname || "",
            opposing_driver_tc: opposingDriverData.opposing_driver_tc || "",
            opposing_driver_phone: opposingDriverData.opposing_driver_phone || "",
            opposing_driver_mail: opposingDriverData.opposing_driver_mail || "",
            opposing_driver_birth_date: toYYYYMMDD(opposingDriverData.opposing_driver_birth_date) || "",
          };
        }
      } else if (currentStep === 4) {
        let accidentDate = null;
        if (damageData.accident_datetime) {
          const [datePart, timePart] = damageData.accident_datetime.split(" ");
          if (datePart && timePart) {
            const [dd, mm, yyyy] = datePart.split(".");
            accidentDate = `${yyyy}-${mm}-${dd} ${timePart}`;
          }
        }
        payload = {
          damage_type: damageData.damage_type,
          damage_description: damageData.damage_description,
          accident_city: damageData.accident_city,
          accident_district: damageData.accident_district,
          accident_date: accidentDate,
          policy_no: damageData.policy_no,
          estimated_damage_amount: damageData.estimated_damage_amount,
          official_report_type: damageData.official_report_type,
          is_completed: true,
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
    if (currentStep === 2 && isCokluKarsiKasko) {
      const plate = vehicleData?.vehicle_plate?.trim?.();
      if (!plate) {
        alert("Eksik Bilgi", "Çoklu kaza ve karşı kasko durumunda mağdur araç plaka bilgisi zorunludur.");
        return;
      }
    }

    const existingId = submissionId || localStorage.getItem("submissionId");

    if (currentStep === 1) {
      if (existingId) {
        console.log("🟡 Mevcut submission bulundu, güncelleme yapılıyor:", existingId);
        await updateSubmission();
      } else {
        console.log("🆕 Yeni submission oluşturuluyor...");
        const newId = await createSubmission();
        if (newId) setSubmissionId(newId);
      }
    } else {
      await updateSubmission();
    }

    setIsStepApproved(true);
  };

  const renderStepIcon = () => {
    switch (currentStep) {
      case 1:
        return <img src={BirIcon} width={62} height={56} alt="Step 1" />;
      case 2:
        return <img src={IkiIcon} width={62} height={56} alt="Step 2" />;
      case 3:
        return <img src={UcIcon} width={62} height={56} alt="Step 3" />;
      default:
        return null;
    }
  };

  const getStepContent = () => {
    const hasKarsiTrafik = insuranceSource === 'karsi trafik';

    switch (currentStep) {
      case 1:
        return {
          title: 'Temel Bilgiler',
          sections: [
            {
              title: 'Kaza Niteliği',
              editKey: 'nature_new',
              data: [
                {
                  label: '', value:
                    kazaNitelik === 'TEKLİ KAZA (BEYANLI)'
                      ? 'TEKLİ KAZA (BEYANLI)'
                      : kazaNitelik === 'İKİLİ KAZA'
                        ? 'İKİLİ KAZA'
                        : kazaNitelik === 'ÇOKLU KAZA'
                          ? 'ÇOKLU KAZA'
                          : 'Seçiniz'
                }
              ]
            },
            {
              title: 'Seçilen Sigorta Şirketi',
              editKey: 'insurance_company',
              data: [
                { label: '', value: selectedCompany?.name || 'Seçiniz' },
                { label: '', value: selectedCompany?.code || '' }
              ]
            },
            {
              title: 'Sürücü Bilgisi İle Mağdur Bilgisi Aynı Mı?',
              editKey: 'same_person',
              data: [
                { label: '', value: samePerson ? 'Evet, aynı.' : 'Hayır, farklı.' }
              ]
            },
            {
              title: 'Sigorta Nereden Açılıyor?',
              editKey: 'insurance_source',
              data: [
                {
                  label: '',
                  value:
                    insuranceSource === 'karsi trafik'
                      ? 'Karşı Trafik'
                      : insuranceSource === 'bizim kasko'
                        ? 'Bizim Kasko'
                        : insuranceSource === 'karsi kasko'
                          ? 'Karşı Kasko'
                          : 'Seçiniz'
                }
              ]
            },
            ...(insuranceSource === 'karsi trafik'
              ? [
                {
                  title: 'Karşı Ruhsat Sahibi ve Sürücü Bilgisi Aynı Mı?',
                  editKey: 'is_insured_opposing_driver_same',
                  data: [
                    {
                      label: '',
                      value: karsiSamePerson
                        ? 'Evet, aynı.'
                        : karsiSamePerson === false
                          ? 'Hayır, farklı.'
                          : 'Seçiniz'
                    }
                  ]
                }
              ]
              : [])
          ]
        };

      case 2:
        return {
          title: 'Kişi ve Araç Bilgileri',
          sections: [
            {
              title: 'Mağdur Bilgileri',
              editKey: 'victim_info',
              data: [
                { label: 'Ad Soyad', value: victimData.victim_fullname || 'Seçiniz' },
                { label: 'Kimlik No', value: victimData.victim_tc || 'Seçiniz' },
                { label: 'E-Mail', value: victimData.victim_mail || 'Seçiniz' },
                { label: 'Telefon No', value: victimData.victim_phone || 'Seçiniz' },
                { label: 'Doğum Tarihi', value: victimData.victim_birth_date || 'Seçiniz' },
                { label: 'Sigortalı Poliçe No', value: victimData.insured_policy_no || 'Seçiniz' },
                { label: 'Poliçe Tecdit No', value: victimData.policy_no || 'Seçiniz' },
                { label: 'Tescil Belge Seri No', value: victimData.registrationNo || 'Seçiniz' }
              ]
            },
            ...(!samePerson
              ? [
                {
                  title: 'Sürücü Bilgileri',
                  editKey: 'driver_info',
                  data: [
                    { label: 'Ad Soyad', value: driverData.driver_fullname || 'Seçiniz' },
                    { label: 'Kimlik No', value: driverData.driver_tc || 'Seçiniz' },
                    { label: 'E-Mail', value: driverData.driver_mail || 'Seçiniz' },
                    { label: 'Telefon No', value: driverData.driver_phone || 'Seçiniz' },
                    { label: 'Doğum Tarihi', value: driverData.driver_birth_date || 'Seçiniz' }
                  ]
                }
              ]
              : []),
            {
              title: 'Mağdur Araç Bilgileri',
              editKey: 'vehicle_info',
              data: [
                { label: 'Araç Markası', value: formatPlate(vehicleData.vehicle_brand) || 'Seçiniz' },
                { label: 'Araç Türü', value: vehicleData.vehicle_type || 'Seçiniz' },
                { label: 'Model', value: formatPlate(vehicleData.vehicle_model) || 'Seçiniz' },
                { label: 'Ruhsat Seri No', value: formatPlate(vehicleData.vehicle_license_no) || 'Seçiniz' },
                { label: 'Şasi No', value: formatPlate(vehicleData.vehicle_chassis_no) || 'Seçiniz' },
                { label: 'Motor No', value: formatPlate(vehicleData.vehicle_engine_no) || 'Seçiniz' },
                { label: 'Model Yılı', value: vehicleData.vehicle_year || 'Seçiniz' },
                { label: 'Mağdur Araç Plaka', value: formatPlate(vehicleData.vehicle_plate) || 'Seçiniz' },
                { label: 'Araç Kullanım Türü', value: vehicleData.vehicle_usage_type || 'Seçiniz' }
              ]
            }
          ]
        };

      case 3:
        return {
          title: 'Sigortalı ve Servis Bilgileri',
          sections: [
            {
              title: 'Sigortalı Bilgileri',
              editKey: 'insured_info',
              data: [
                { label: 'Ad Soyad', value: insuredData.insured_fullname || 'Seçiniz' },
                { label: 'TC No', value: insuredData.insured_tc || 'Seçiniz' },
                { label: 'Doğum Tarihi', value: insuredData.insured_birth_date || 'Seçiniz' },
                { label: 'Telefon', value: insuredData.insured_phone || 'Seçiniz' },
                { label: 'E-Mail', value: insuredData.insured_mail || 'Seçiniz' },
                { label: 'Poliçe No', value: formatPlate(insuredData.insured_policy_no) || 'Seçiniz' },
                { label: 'Araç Plaka', value: formatPlate(insuredData.insured_plate) || 'Seçiniz' },
                { label: 'Ruhsat No', value: formatPlate(insuredData.insuredCarDocNo) || 'Seçiniz' },
              ]
            },
            ...(hasKarsiTrafik
              ? [
                {
                  title: 'Karşı Taraf Sürücü Bilgileri',
                  editKey: 'karsi_driver_info',
                  data: [
                    { label: 'Ad Soyad', value: opposingDriverData.opposing_driver_fullname || 'Seçiniz' },
                    { label: 'TC No', value: opposingDriverData.opposing_driver_tc || 'Seçiniz' },
                    { label: 'Telefon', value: opposingDriverData.opposing_driver_phone || 'Seçiniz' },
                    { label: 'E-Mail', value: opposingDriverData.opposing_driver_mail || 'Seçiniz' },
                    { label: 'Doğum Tarihi', value: opposingDriverData.opposing_driver_birth_date || 'Seçiniz' },
                  ]
                }
              ]
              : []),
            {
              title: 'Servis Bilgileri',
              editKey: 'service_info',
              data: [
                { label: 'Ad Soyad', value: mechanicData.repair_fullname || 'Seçiniz' },
                { label: 'Doğum Tarihi', value: mechanicData.repair_birth_date || 'Seçiniz' },
                { label: 'TC No', value: mechanicData.repair_tc || 'Seçiniz' },
                { label: 'Telefon', value: maskPhone(mechanicData.repair_phone) || 'Seçiniz' },
                { label: 'IBAN', value: serviceData.service_iban || 'Seçiniz' },
                { label: 'IBAN Adı', value: serviceData.service_iban_name || 'Seçiniz' },
                { label: 'Servis Adı', value: serviceData.service_name || 'Seçiniz' },
                { label: 'İl', value: serviceData.service_city || 'Seçiniz' },
                { label: 'İlçe', value: serviceData.service_state_city_city || 'Seçiniz' },
                { label: 'Adres', value: serviceData.service_address || 'Seçiniz' },
                { label: 'Servis No', value: serviceData.service_tax_no || 'Seçiniz' },
              ]
            }
          ]
        };

      case 4:
        return {
          title: 'Hasar Bilgileri ve Evrak Yükleme',
          sections: [
            {
              title: 'Hasar Bilgileri',
              editKey: 'damage_info',
              data: [
                { label: 'Hasar Türü', value: damageData.damage_type || 'Seçiniz' },
                { label: 'Hasar Bölgesi', value: damageData.damage_description || 'Seçiniz' },
                {
                  label: 'Kaza Yeri',
                  value: damageData.accident_city && damageData.accident_district
                    ? `${damageData.accident_city} / ${damageData.accident_district}`
                    : 'Seçiniz'
                },
                { label: 'Kaza Tarihi', value: damageData.accident_date || 'Seçiniz' },
                { label: 'Poliçe No', value: formatPlate(damageData.policy_no) || 'Seçiniz' },
                { label: 'Tahmini Hasar Tutarı', value: damageData.estimated_damage_amount || 'Seçiniz' },
                { label: 'Tutanak Türü', value: damageData.official_report_type || 'Seçiniz' },
              ]
            },
            {
              title: 'Evrak Yükleme Alanı',
              editKey: 'documents',
              data: [
                { label: 'Tutanak', value: params?.documents?.olayYeri?.length ? 'Yüklendi' : 'Seçiniz' },
                { label: 'Anlaşmalı Tutanak', value: params?.documents?.tutanaklar?.length ? 'Yüklendi' : 'Seçiniz' },
                { label: 'Mağdur Araç Ehliyet', value: params?.documents?.surucuBelgesi?.length ? 'Yüklendi' : 'Seçiniz' },
                { label: 'Mağdur Araç Ruhsat', value: params?.documents?.ruhsat?.length ? 'Yüklendi' : 'Seçiniz' },
                { label: 'Karşı Sigortalı Araç Ehliyet', value: params?.documents?.surucuBelgesi?.length ? 'Yüklendi' : 'Seçiniz' },
                { label: 'Karşı Sigortalı Araç Ruhsat', value: params?.documents?.ruhsat?.length ? 'Yüklendi' : 'Seçiniz' },
                { label: 'Fotoğraflar', value: params?.documents?.fotograflar ? 'Yüklendi' : 'Seçiniz' },
                { label: 'Diğer', value: params?.documents?.diger ? 'Yüklendi' : 'Seçiniz' },
              ]
            }
          ]
        };

      default:
        return { title: '', sections: [] };
    }
  };

  const handleBackPress = () => {
    if (currentStep === 1) {
      navigate('/first-screen', { ...params });
      return;
    }
    if (isStepApproved) {
      setIsStepApproved(false);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  };

  const handleContinuePress = async () => {
    if (!isStepApproved) {
      await handleStepApprove();
      return;
    }

    switch (currentStep) {
      case 1:
        navigate('/victim-info', { ...params });
        break;
      case 2:
        navigate('/insured-mechanic-stepper', {
          ...params,
          insuranceSource,
          karsiSamePerson,
          kazaNitelik,
        });
        break;
      case 3:
        navigate('/file-damage-info-stepper', { ...params });
        break;
      case 4:
        handleFinalApprove();
        break;
      default:
        break;
    }
  };

  const handleFinalApprove = async () => {
    await updateSubmission();

    const randomFileNumber = `AXA-2025-${Math.floor(10000 + Math.random() * 90000)}`;

    const uploadedDocuments = params?.documents
      ? Object.values(params.documents)
        .flat()
        .filter(item => item)
        .length
      : 0;

    console.log("📦 Yüklü evrak sayısı:", uploadedDocuments);

    navigate('/success-screen', {
      fileName: randomFileNumber,
      companyName: selectedCompany?.name || params?.companyName,
      documentCount: uploadedDocuments,
      selectedCompany,
      samePerson,
      insuranceSource,
      driverData,
      victimData,
      vehicleData,
      insuredData,
      serviceData,
      damageData,
      mechanicData,
      documents: params?.documents,
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

  const FormCardComponent = () => (
    <div className="form-card">
      {getStepContent().sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="section-box">
          <div className="content-box">
            <div className="section-title-step">{section.title}</div>

            <div className="data-container">
              {section.data.map((item, itemIndex) => (
                (item.value !== undefined && item.value !== null) && (
                  <div key={itemIndex} className="data-row">
                    <div className="label-value-pair">
                      {item.label ? (
                        <div className="data-label">
                          {item.label}
                          {item.label === 'Mağdur Araç Plaka' && isCokluKarsiKasko && (
                            <span style={{ color: 'red' }}> *</span>
                          )}:
                        </div>
                      ) : (
                        <div className="data-label">{'\u00A0'}</div>
                      )}
                      <div
                        className="data-value"
                        style={item.label === 'Mağdur Araç Plaka' ? { color: 'red' } : {}}
                      >
                        {item.value}
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>

            <div className="edit-button-container">
              {kazaNitelik === "TEKLİ KAZA (BEYANLI)" && section.editKey === "insurance_source" ? (
                <div className="disabled-edit-info">
                  Tekli kaza seçtiğiniz için bu alan düzenlenemez.
                </div>
              ) : (
                <button
                  className="edit-button"
                  onClick={() => handleEditPress(section)}
                >
                  <span className="edit-button-text">Düzenle</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="approve-section">
        <button
          className="approve-button"
          onClick={currentStep === 4 ? handleFinalApprove : handleStepApprove}
        >
          <span className="approve-button-text">ONAYLA</span>
          <div className="approve-icon-wrapper">
            <ArrowUpRightIcon className="approve-icon" />
          </div>
        </button>
      </div>
    </div>
  );

  const handleEditPress = (section) => {
    if (isStepApproved) return;

    const editKey = section.editKey;
    const baseParams = {
      kazaNitelik,
      selectedCompany,
      samePerson,
      karsiSamePerson,
      insuranceSource,
      driverData,
      victimData,
      vehicleData,
      insuredData,
      serviceData,
      damageData,
      mechanicData,
      documents: params?.documents
    };

    switch (editKey) {
      case 'nature_new':
        navigate('/accident-type', {
          ...baseParams,
          kazaNitelik: kazaNitelik || null,
        });
        break;
      case 'insurance_company':
        navigate('/first-screen', { ...baseParams, returnTo: 'StepInfoScreen', returnStep: currentStep });
        break;
      case 'same_person':
      case 'insurance_source':
        if (kazaNitelik === "TEKLİ KAZA (BEYANLI)") {
          alert("Düzenleme Yapılamaz", "Tekli kaza seçtiğiniz için sigorta kaynağı otomatik olarak 'Bizim Kasko' olarak belirlenmiştir ve değiştirilemez.");
          return;
        }
        navigate('/insurance-stepper', {
          ...baseParams,
          editMode: true,
          focusStep: 2,
          preSelectedStep1: samePerson ? 'yes' : 'no',
          preSelectedStep2: insuranceSource,
          returnTo: 'StepInfoScreen',
          returnStep: currentStep
        });
        break;
      case 'is_insured_opposing_driver_same':
        navigate('/insurance-stepper', {
          ...baseParams,
          editMode: true,
          focusStep: 3,
          preSelectedStep3: karsiSamePerson ? 'yes' : 'no',
          returnTo: 'StepInfoScreen',
          returnStep: currentStep
        });
        break;
      case 'victim_info':
      case 'driver_info':
      case 'vehicle_info':
        navigate('/victim-info', {
          ...baseParams,
          editMode: true,
          focusSection: editKey,
          returnTo: 'StepInfoScreen',
          returnStep: currentStep
        });
        break;
      case 'insured_info':
      case 'mechanic_info':
      case 'karsi_driver_info':
      case 'service_info':
        navigate('/insured-mechanic-stepper', {
          ...baseParams,
          editMode: true,
          focusSection: editKey,
          returnTo: 'StepInfoScreen',
          returnStep: currentStep
        });
        break;
      case 'damage_info':
        navigate('/file-damage-info-stepper', {
          ...baseParams,
          editMode: true,
          focusSection: editKey,
          returnTo: 'StepInfoScreen',
          returnStep: currentStep
        });
        break;
      case 'documents':
        navigate('/file-damage-info-stepper', {
          ...baseParams,
          editMode: true,
          directToDocuments: true,
          returnTo: 'StepInfoScreen',
          returnStep: currentStep
        });
        break;
      default:
        alert('Bilgi', 'Bu bölüm henüz düzenlenemiyor.');
        break;
    }
  };

  useEffect(() => {
    if (params) {
      console.log("🔁 StepInfoScreen parametreleri yenilendi:", params);
      if (params.driverData) setDriverData(params.driverData);
      if (params.victimData) setVictimData(params.victimData);
      if (params.vehicleData) setVehicleData(params.vehicleData);
      if (params.insuredData) setInsuredData(params.insuredData);
      if (params.mechanicData) setMechanicData(params.mechanicData);
      if (params.serviceData) setServiceData(params.serviceData);
      if (params.damageData) setDamageData(params.damageData);
    }
  }, [params]);

  return (
    <div className="step-info-container">
      <div className="scroll-view">
        <div className="page-title">Adım Adım Dosyanı Oluştur</div>

        {isStepApproved ? <ApprovedStepComponent /> : <FormCardComponent />}

        <div className="step-info-section">
          {currentStep !== 4 && (
            <div className="step-header">
              <div className="step-title">ADIM</div>
              {renderStepIcon()}
            </div>
          )}

          <div className="step-info">
            {currentStep === 1 && (isStepApproved
              ? 'Bu adımda Mağdur/Sürücü ve Araç Bilgilerini dolduracaksınız.'
              : 'Bu adımda Mağdur/Sürücü ve Araç Bilgilerini dolduracaksınız.')}
            {currentStep === 2 && (isStepApproved
              ? 'Bu adımda Mağdur Bilgilerini dolduracaksınız.'
              : 'Bu adımda Mağdur Bilgilerini dolduracaksınız.')}
            {currentStep === 3 && (isStepApproved
              ? 'Bu adımda Sigortalı Kişi ve Araç ve Tamirci/Servis Bilgilerini dolduracaksınız.'
              : 'Bu adımda Sigortalı Kişi ve Araç ve Tamirci/Servis Bilgilerini dolduracaksınız.')}
            {currentStep === 4 && (isStepApproved
              ? 'Tüm bilgileri doldurdunuz onaylıyor musunuz?'
              : 'Tüm bilgileri doldurdunuz onaylıyor musunuz?')}
          </div>
        </div>
      </div>

      <div className="footer">
        <div className="button-container">
          <button className="back-button" onClick={handleBackPress}>
            <div className="back-button-content">
              <div className="back-icon-wrapper">
                <ArrowUpLeftIcon className="back-icon" />
              </div>
              <span className="back-button-text">GERİ DÖN</span>
            </div>
          </button>

          <button
            className={`continue-button ${!isAllChosen ? 'disabled' : ''}`}
            onClick={handleContinuePress}
            disabled={!isAllChosen}
          >
            <div className="continue-button-content">
              <span className={`continue-button-text ${!isAllChosen ? 'disabled' : ''}`}>
                {isStepApproved
                  ? (currentStep === 4 ? 'TAMAMLA' : 'DEVAM ET')
                  : (currentStep === 4 ? 'ONAYLA' : 'DEVAM ET')}
              </span>
              <div className="continue-icon-wrapper">
                <ArrowUpRightIcon className="continue-icon" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}