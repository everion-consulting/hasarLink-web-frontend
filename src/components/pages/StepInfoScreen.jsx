import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from "../../styles/StepInfo.module.css";
import step from '.././images/step.png';
import BirIcon from '.././images/birIcon.svg';
import IkiIcon from '.././images/ikiIcon.svg';
import UcIcon from '.././images/ucIcon.svg';
import { formatPlate, maskPhone, toYYYYMMDD, toDDMMYYYY } from '../utils/formatter';
import apiService from '../../services/apiServices';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import FormFooter from '../forms/FormFooter';

export default function StepInfoScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Her render'da güncel location.state'i al
  const params = location.state || {};


  console.log("🔍 StepInfoScreen'e GELEN TÜM parametreler:", params);
  console.log("🔍 Gelen victimData:", params.victimData);
  console.log("🔍 Gelen driverData:", params.driverData);
  console.log("🔍 Gelen vehicleData:", params.vehicleData);

  const startStep = params?.startStep || 1;
  const selectedCompany = params?.selectedCompany || null;
  const samePerson = params?.samePerson || false;
  const karsiSamePerson =
    params?.karsiSamePerson === true
      ? true
      : params?.karsiSamePerson === false
        ? false
        : null;
  const rawInsuranceSource = params?.insuranceSource || null;
  const kazaNitelik = params?.kazaNitelik || null;

  const insuranceSource = (() => {
    if (kazaNitelik === "TEKLİ KAZA (BEYANLI)") {
      return "bizim kasko";
    }
    if (rawInsuranceSource && ["karsi trafik", "bizim kasko", "karsi kasko"].includes(rawInsuranceSource)) {
      return rawInsuranceSource;
    }
    return "bizim kasko";
  })();

  // ✅ State'leri params'tan başlat VE params değişince güncelle
  const [driverData, setDriverData] = useState({});
  const [victimData, setVictimData] = useState({});
  const [vehicleData, setVehicleData] = useState({});
  const [insuredData, setInsuredData] = useState({});
  const [mechanicData, setMechanicData] = useState({});
  const [serviceData, setServiceData] = useState({});
  const [damageData, setDamageData] = useState({});
  const [opposingDriverData, setOpposingDriverData] = useState({});

  const [currentStep, setCurrentStep] = useState(startStep);
  const [isAllChosen, setIsAllChosen] = useState(true);
  const [isStepApproved, setIsStepApproved] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);



  useEffect(() => {
    console.log("🔄 useEffect tetiklendi - params güncellendi");
    console.log("📦 Yeni params.victimData:", params.victimData);
    console.log("📦 Yeni params.driverData:", params.driverData);
    console.log("📦 Yeni params.vehicleData:", params.vehicleData);
    console.log("📦 Yeni params.serviceData:", params.serviceData); // ✅ BU SATIRI EKLEYİN
    console.log("📦 Yeni params.insuredData:", params.insuredData); // ✅ BU SATIRI EKLEYİN

    if (params.victimData) {
      console.log("✅ victimData güncelleniyor:", params.victimData);
      setVictimData(params.victimData);
    }
    if (params.driverData) {
      console.log("✅ driverData güncelleniyor:", params.driverData);
      setDriverData(params.driverData);
    }
    if (params.vehicleData) {
      console.log("✅ vehicleData güncelleniyor:", params.vehicleData);
      setVehicleData(params.vehicleData);
    }
    if (params.insuredData) {
      console.log("✅ insuredData güncelleniyor:", params.insuredData);
      setInsuredData(params.insuredData);
    }
    if (params.serviceData) {
      console.log("✅ serviceData güncelleniyor:", params.serviceData);
      setServiceData(params.serviceData);
      // ✅ serviceData'dan mechanicData'ya da aktarım yap
      setMechanicData(prev => ({
        ...prev,
        repair_fullname: params.serviceData.repair_fullname,
        repair_birth_date: params.serviceData.repair_birth_date,
        repair_tc: params.serviceData.repair_tc,
        repair_phone: params.serviceData.repair_phone,
      }));
    }
    if (params.mechanicData) setMechanicData(params.mechanicData);
    if (params.damageData) setDamageData(params.damageData);
    if (params.opposingDriverData) setOpposingDriverData(params.opposingDriverData);
  }, [location.state]);

  const isTekliBizimKasko =
    kazaNitelik === "TEKLİ KAZA (BEYANLI)" &&
    insuranceSource === "bizim kasko";

  const isCokluKarsiKasko =
    kazaNitelik === "ÇOKLU KAZA" &&
    insuranceSource === "karsi kasko";

  const createSubmission = async () => {
    try {

      const validInsuranceSources = {
        'karsi trafik': 'karsi trafik',
        'bizim kasko': 'bizim kasko',
        'karsi kasko': 'karsi kasko'
      };

      const apiInsuranceSource = validInsuranceSources[insuranceSource];

      const payload = {
        nature_new: kazaNitelik,
        insurance_company: selectedCompany?.id || null,
        is_driver_victim_same: samePerson,
        is_insured_opposing_driver_same: !!karsiSamePerson,
        insurance_source: apiInsuranceSource,
        is_completed: false,
      };

      console.log("📡 CREATE payload:", payload);

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
      alert("Submission oluşturulurken hata: " + err.message);
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
          insured_birth_date: toYYYYMMDD(insuredData.insured_birth_date),
          insured_phone: insuredData.insured_phone,
          insured_mail: insuredData.insured_mail,
          insured_plate: insuredData.insured_plate,
          insured_policy_no: insuredData.insured_policy_no,
          insured_file_no: insuredData.insured_file_no,
          repair_fullname: serviceData.repair_fullname,
          // repair_birth_date: toYYYYMMDD(mechanicData.repair_birth_date),
          repair_tc: serviceData.repair_tc,
          repair_phone: serviceData.repair_phone,
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
        alert("Eksik Bilgi: Çoklu kaza ve karşı kasko durumunda mağdur araç plaka bilgisi zorunludur.");
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
      // ✅ DİĞER TÜM ADIMLARDA UPDATE ÇAĞIR
      console.log(`📤 Step ${currentStep}: updateSubmission çağrılıyor...`);
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
                          : 'YOK'
                }
              ]
            },
            {
              title: 'Seçilen Sigorta Şirketi',
              editKey: 'insurance_company',
              data: [
                { label: '', value: selectedCompany?.name || 'YOK' },
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
                          : 'YOK'
                }
              ]
            },
            ...(rawInsuranceSource === 'karsi trafik' || insuranceSource === 'karsi trafik'
              ? [
                {
                  title: 'Karşı Ruhsat Sahibi ve Sürücü Bilgisi Aynı Mı?',
                  editKey: 'is_insured_opposing_driver_same',
                  data: [
                    {
                      label: '',
                      value:
                        karsiSamePerson === true
                          ? 'Evet, aynı.'
                          : karsiSamePerson === false
                            ? 'Hayır, farklı.'
                            : 'YOK'

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
                { label: 'Ad Soyad', value: victimData.victim_fullname || 'YOK' },
                { label: 'Kimlik No', value: victimData.victim_tc || 'YOK' },
                { label: 'E-Mail', value: victimData.victim_mail || 'YOK' },
                { label: 'Telefon No', value: victimData.victim_phone || 'YOK' },
                { label: 'Doğum Tarihi', value: victimData.victim_birth_date || 'YOK' },
              ]
            },
            ...(!samePerson
              ? [
                {
                  title: 'Sürücü Bilgileri',
                  editKey: 'driver_info',
                  data: [
                    { label: 'Ad Soyad', value: driverData.driver_fullname || 'YOK' },
                    { label: 'Kimlik No', value: driverData.driver_tc || 'YOK' },
                    { label: 'Telefon No', value: driverData.driver_phone || 'YOK' },
                    { label: 'Doğum Tarihi', value: driverData.driver_birth_date || 'YOK' }
                  ]
                }
              ]
              : []),
            {
              title: 'Mağdur Araç Bilgileri',
              editKey: 'vehicle_info',
              data: [
                { label: 'Araç Markası', value: formatPlate(vehicleData.vehicle_brand) || 'YOK' },
                { label: 'Araç Türü', value: vehicleData.vehicle_type || 'YOK' },
                { label: 'Model', value: formatPlate(vehicleData.vehicle_model) || 'YOK' },
                { label: 'Ruhsat Seri No', value: formatPlate(vehicleData.vehicle_license_no) || 'YOK' },
                { label: 'Şasi No', value: formatPlate(vehicleData.vehicle_chassis_no) || 'YOK' },
                { label: 'Motor No', value: formatPlate(vehicleData.vehicle_engine_no) || 'YOK' },
                { label: 'Model Yılı', value: vehicleData.vehicle_year || 'YOK' },
                { label: 'Mağdur Araç Plaka', value: formatPlate(vehicleData.vehicle_plate) || 'YOK' },
                { label: 'Araç Kullanım Türü', value: vehicleData.vehicle_usage_type || 'YOK' }
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
                { label: 'Ad Soyad', value: insuredData.insured_fullname || 'YOK' },
                { label: 'TC No', value: insuredData.insured_tc || 'YOK' },
                { label: 'Doğum Tarihi', value: insuredData.insured_birth_date || 'YOK' },
                { label: 'Telefon', value: insuredData.insured_phone || 'YOK' },
                { label: 'E-Mail', value: insuredData.insured_mail || 'YOK' },
                { label: 'Poliçe No', value: formatPlate(insuredData.insured_policy_no) || 'YOK' },
                { label: 'Araç Plaka', value: formatPlate(insuredData.insured_plate) || 'YOK' },
                { label: 'Ruhsat No', value: formatPlate(insuredData.insuredCarDocNo) || 'YOK' },
              ]
            },
            ...(hasKarsiTrafik && karsiSamePerson === false
              ? [
                {
                  title: 'Karşı Taraf Sürücü Bilgileri',
                  editKey: 'karsi_driver_info',
                  data: [
                    { label: 'Ad Soyad', value: opposingDriverData.opposing_driver_fullname || 'YOK' },
                    { label: 'TC No', value: opposingDriverData.opposing_driver_tc || 'YOK' },
                    { label: 'Telefon', value: opposingDriverData.opposing_driver_phone || 'YOK' },
                    { label: 'E-Mail', value: opposingDriverData.opposing_driver_mail || 'YOK' },
                    { label: 'Doğum Tarihi', value: opposingDriverData.opposing_driver_birth_date || 'YOK' },
                  ]
                }
              ]
              : []),
            {
              title: 'Servis Bilgileri',
              editKey: 'service_info',
              data: [
                { label: 'Ad Soyad', value: serviceData.repair_fullname || 'YOK' },
                { label: 'Doğum Tarihi', value: serviceData.repair_birth_date || 'YOK' },
                { label: 'TC No', value: serviceData.repair_tc || 'YOK' },
                { label: 'Telefon', value: maskPhone(serviceData.repair_phone) || 'YOK' },
                { label: 'IBAN', value: serviceData.service_iban || 'YOK' },
                { label: 'IBAN Adı', value: serviceData.service_iban_name || 'YOK' },
                { label: 'Servis Adı', value: serviceData.service_name || 'YOK' },
                { label: 'İl', value: serviceData.service_city || 'YOK' },
                { label: 'İlçe', value: serviceData.service_state_city_city || 'YOK' },
                { label: 'Adres', value: serviceData.service_address || 'YOK' },
                { label: 'Servis No', value: serviceData.service_tax_no || 'YOK' },
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
                { label: 'Hasar Türü', value: damageData.damage_type || 'YOK' },
                { label: 'Hasar Bölgesi', value: damageData.damage_description || 'YOK' },
                {
                  label: 'Kaza Yeri',
                  value: damageData.accident_city && damageData.accident_district
                    ? `${damageData.accident_city} / ${damageData.accident_district}`
                    : 'YOK'
                },
                { label: 'Kaza Tarihi', value: damageData.accident_date || 'YOK' },
                { label: 'Poliçe No', value: formatPlate(damageData.policy_no) || 'YOK' },
                { label: 'Tahmini Hasar Tutarı', value: damageData.estimated_damage_amount || 'YOK' },
                { label: 'Tutanak Türü', value: damageData.official_report_type || 'YOK' },
              ]
            },
            {
              title: 'Evrak Yükleme Alanı',
              editKey: 'documents',
              data: [
                { label: 'Tutanak', value: params?.documents?.olayYeri?.length ? 'Yüklendi' : 'YOK' },
                { label: 'Anlaşmalı Tutanak', value: params?.documents?.tutanaklar?.length ? 'Yüklendi' : 'YOK' },
                { label: 'Mağdur Araç Ehliyet', value: params?.documents?.surucuBelgesi?.length ? 'Yüklendi' : 'YOK' },
                { label: 'Mağdur Araç Ruhsat', value: params?.documents?.ruhsat?.length ? 'Yüklendi' : 'YOK' },
                { label: 'Karşı Sigortalı Araç Ehliyet', value: params?.documents?.surucuBelgesi?.length ? 'Yüklendi' : 'YOK' },
                { label: 'Karşı Sigortalı Araç Ruhsat', value: params?.documents?.ruhsat?.length ? 'Yüklendi' : 'YOK' },
                { label: 'Fotoğraflar', value: params?.documents?.fotograflar ? 'Yüklendi' : 'YOK' },
                { label: 'Diğer', value: params?.documents?.diger ? 'Yüklendi' : 'YOK' },
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
      navigate('/first-screen', {
        state: {
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
          opposingDriverData,
          documents: params?.documents
        }
      });
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

  // handleContinuePress fonksiyonunun düzeltilmiş case 2 bölümü:

  const handleContinuePress = async () => {
    if (!isStepApproved) {
      await handleStepApprove();
      return;
    }

    try {
      switch (currentStep) {
        case 1:
          navigate('/victim-info', {
            state: {
              kazaNitelik,
              insuranceSource,
              selectedCompany,
              samePerson,
              karsiSamePerson,
              driverData,
              victimData,
              vehicleData,
              insuredData,
              serviceData,
              damageData,
              mechanicData,
              opposingDriverData,
              documents: params?.documents,
            }
          });
          break;

        case 2:
          console.log('🚀 NAVIGATING TO insured-mechanic-stepper');

          const insuredNavigationState = {
            kazaNitelik,
            insuranceSource,
            samePerson,
            karsiSamePerson,
            selectedCompany,
            driverData,
            victimData,
            vehicleData,
            insuredData,
            serviceData,
            damageData,
            opposingDriverData,
            mechanicData,
            documents: params?.documents,
          };

          console.log('📦 Navigation state:', insuredNavigationState);

          navigate('/insured-mechanic-stepper', {
            state: insuredNavigationState
          });
          break;

        case 3:
          navigate('/hasar-bilgileri', { state: { ...params } });
          break;

        case 4:
          // ✅ 4. adımda direkt handleFinalApprove çağır
          console.log('🎯 Step 4: Final approve called');
          await handleFinalApprove();
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('❌ Navigation error:', error);
      alert('İşlem sırasında bir hata oluştu: ' + error.message);
    }
  };

  const handleFinalApprove = async () => {
    try {
      console.log('🎯 Final approve process started');

      // Önce submission'ı güncelle
      const updateResult = await updateSubmission();
      console.log('📝 Update result:', updateResult);

      const randomFileNumber = `AXA-2025-${Math.floor(10000 + Math.random() * 90000)}`;

      // Evrak sayısını hesapla
      const uploadedDocuments = params?.documents
        ? Object.values(params.documents)
          .flat()
          .filter(item => item && (item.file || item.preview)) // Hem file hem preview kontrolü
          .length
        : 0;

      console.log("📦 Yüklü evrak sayısı:", uploadedDocuments);
      console.log("🏢 Şirket adı:", selectedCompany?.name);

      // Success screen'e yönlendir
      console.log('🔄 Navigating to success screen...');

      navigate('/success', {
        state: {
          fileName: randomFileNumber,
          companyName: selectedCompany?.name || 'Bilinmiyor',
          documentCount: uploadedDocuments,
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
          opposingDriverData,
          documents: params?.documents,
        },
        replace: true // Önceki sayfaya geri dönüşü engeller
      });

    } catch (error) {
      console.error('❌ Final approve error:', error);
      alert('Son onaylama sırasında hata: ' + error.message);
    }
  };
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
      opposingDriverData,
      documents: params?.documents
    };

    console.log('🔧 EDIT baseParams:', baseParams);

    switch (editKey) {
      case 'nature_new':
        navigate('/accident-type', {
          state: {
            ...baseParams,
            kazaNitelik: kazaNitelik || null,
          }
        });
        break;
      case 'insurance_company':
        navigate('/insurance-select', {
          state: {
            ...baseParams,
            returnTo: 'StepInfoScreen',
            returnStep: currentStep
          }
        });
        break;
      case 'same_person':
      case 'insurance_source':
        if (kazaNitelik === "TEKLİ KAZA (BEYANLI)") {
          alert("Düzenleme Yapılamaz: Tekli kaza seçtiğiniz için sigorta kaynağı otomatik olarak 'Bizim Kasko' olarak belirlenmiştir ve değiştirilemez.");
          return;
        }
        navigate('/insurance-stepper', {
          state: {
            ...baseParams,
            editMode: true,
            focusStep: 2,
            preSelectedStep1: samePerson ? 'yes' : 'no',
            preSelectedStep2: insuranceSource,
            returnTo: '/step-info',
            returnStep: currentStep
          }
        });
        break;
      case 'is_insured_opposing_driver_same':
        navigate('/insurance-stepper', {
          state: {
            ...baseParams,
            editMode: true,
            focusStep: 3,
            preSelectedStep3: karsiSamePerson ? 'yes' : 'no',
            returnTo: '/step-info',
            returnStep: currentStep
          }
        });
        break;
      case 'victim_info':
      case 'driver_info':
      case 'vehicle_info':
        navigate('/victim-info', {
          state: {
            ...baseParams,
            editMode: true,
            focusSection: editKey,
            returnTo: 'step-info',
            returnStep: currentStep
          }
        });
        break;
      case 'insured_info':
      case 'mechanic_info':
      case 'karsi_driver_info':
      case 'service_info':
        console.log('🔧 EDIT -> insured-mechanic-stepper:', baseParams);
        navigate('/insured-mechanic-stepper', {
          state: {
            ...baseParams,
            editMode: true,
            focusSection: editKey,
            returnTo: 'step-info',
            returnStep: currentStep
          }
        });
        break;
      case 'damage_info':
        navigate('/file-damage-info-stepper', {
          state: {
            ...baseParams,
            editMode: true,
            focusSection: editKey,
            returnTo: 'step-info',
            returnStep: currentStep
          }
        });
        break;
      case 'documents':
        navigate('/file-damage-info-stepper', {
          state: {
            ...baseParams,
            editMode: true,
            directToDocuments: true,
            returnTo: 'step-info',
            returnStep: currentStep
          }
        });
        break;
      default:
        alert('Bilgi: Bu bölüm henüz düzenlenemiyor.');
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

  const ApprovedStepComponent = () => (
    <div className={styles.approvedContainer}>
      <div className={styles.approvedCard}>
        <img src={step} className={styles.onayIcon} alt="Onay" />
        <div className={styles.approvedMessage}>
          <div className={styles.approvedMessageText}>
            Girdiğiniz bilgiler onaylanmıştır
          </div>
        </div>
      </div>
    </div>
  );

  const FormCardComponent = () => (
    <div className={styles.formCard}>
      {getStepContent().sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className={styles.sectionBox}>
          <div className={styles.contentBox}>
            <div className={styles.sectionTitleStep}>{section.title}</div>

            <div className={styles.dataContainer}>
              {section.data.map((item, itemIndex) => (
                (item.value !== undefined && item.value !== null) && (
                  <div key={itemIndex} className={styles.dataRow}>
                    <div className={styles.labelValuePair}>
                      {item.label ? (
                        <div className={styles.dataLabel}>
                          {item.label}
                          {item.label === 'Mağdur Araç Plaka' && isCokluKarsiKasko && (
                            <span style={{ color: 'red' }}> *</span>
                          )}:
                        </div>
                      ) : (
                        <div className={styles.dataLabel}>{'\u00A0'}</div>
                      )}
                      <div
                        className={styles.dataValue}
                        style={item.label === 'Mağdur Araç Plaka' ? { color: 'red' } : {}}
                      >
                        {item.value}
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>

            <div className={styles.editButtonContainer}>
              {kazaNitelik === "TEKLİ KAZA (BEYANLI)" && section.editKey === "insurance_source" ? (
                <div className={styles.disabledEditInfo}>
                  Tekli kaza seçtiğiniz için bu alan düzenlenemez.
                </div>
              ) : (
                <button
                  className={styles.editButton}
                  onClick={() => handleEditPress(section)}
                >
                  <span className={styles.editButtonText}>Düzenle</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      <div className={styles.approveSection}>
        <button
          className={styles.approveButton}
          onClick={currentStep === 4 ? handleFinalApprove : handleStepApprove}
        >
          <span className={styles.approveButtonText}>ONAYLA</span>
          <div className={styles.approveIconWrapper}>
            <ArrowUpRightIcon className={styles.approveIcon} />
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.stepInfoContainer}>
      <div className={styles.scrollView}>
        <div className={styles.pageTitle}>Adım Adım Dosyanı Oluştur</div>

        {isStepApproved ? <ApprovedStepComponent /> : <FormCardComponent />}

        <div className={styles.stepInfoSection}>
          {currentStep !== 4 && (
            <div className={styles.stepHeader}>
              <div className={styles.stepTitle}>ADIM</div>
              {renderStepIcon()}
            </div>
          )}

          <div className={styles.stepInfo}>
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

      <FormFooter
        onBack={handleBackPress}
        onNext={handleContinuePress}
        nextLabel={isStepApproved
          ? (currentStep === 4 ? "TAMAMLA" : "DEVAM ET")
          : (currentStep === 4 ? "ONAYLA" : "DEVAM ET")
        }
        backLabel="GERİ DÖN"
        disabled={!isAllChosen}
      />
    </div>
  );

}