import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Stepper from '../stepper/Stepper';
import FormRenderer from '../forms/FormRenderer';
import FormFooter from '../forms/FormFooter';
import insuredField from '../../constants/insuredFields';
import serviceField from '../../constants/serviceField';
import opposingDriverFields from '../../constants/opposingDriverFields';
import { useProfile } from '../../context/ProfileContext';
import apiService from '../../services/apiServices';
import styles from '../../styles/victimInfoScreen.module.css';

export default function InsuredMechanicStepperScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    const { profileDetail, fetchProfile } = useProfile();

    console.log('🔍 FULL location.state:', JSON.stringify(location.state, null, 2));

   
    const [routeParams, setRouteParams] = useState({
        insuranceSource: location.state?.insuranceSource || null,
        karsiSamePerson: location.state?.karsiSamePerson || null,
        kazaNitelik: location.state?.kazaNitelik || null,
        selectedCompany: location.state?.selectedCompany || null,
        samePerson: location.state?.samePerson || false,
    });

  
    useEffect(() => {
        if (location.state) {
            console.log('🔄 Route params güncelleniyor:', location.state);
            setRouteParams({
                insuranceSource: location.state.insuranceSource || null,
                karsiSamePerson: location.state.karsiSamePerson || null,
                kazaNitelik: location.state.kazaNitelik || null,
                selectedCompany: location.state.selectedCompany || null,
                samePerson: location.state.samePerson || false,
            });
        }
    }, [location.state]);

    const { insuranceSource, karsiSamePerson, kazaNitelik, selectedCompany, samePerson } = routeParams;

    const [currentStep, setCurrentStep] = useState(() => {
        if (location.state?.editMode && location.state?.focusSection) {
            if (location.state.focusSection === 'service_info') {
                return location.state.kazaNitelik === 'TEKLİ KAZA (BEYANLI)' ? 1 : 2;
            }
            return 1;
        }
        return 1;
    });

    const [insuredData, setInsuredData] = useState({});
    const [serviceData, setServiceData] = useState({});
    const [opposingDriverData, setOpposingDriverData] = useState({});
    const [cityOptions, setCityOptions] = useState([]);
    const [isProfileLoaded, setIsProfileLoaded] = useState(false);

    const serviceFields = useMemo(() => {
        return serviceField.map(f => {
            if (f.type === 'row') {
                return {
                    ...f,
                    children: f.children.map(child =>
                        child.name === 'service_city'
                            ? { ...child, options: cityOptions }
                            : child
                    ),
                };
            }

            return f.name === 'service_city'
                ? { ...f, options: cityOptions }
                : f;
        });
    }, [cityOptions]);

    console.log('🔍 InsuredMechanicStepperScreen MOUNTED');
    console.log('📦 routeParams:', routeParams);
    console.log('  kazaNitelik:', kazaNitelik);
    console.log('  insuranceSource:', insuranceSource);
    console.log('  samePerson:', samePerson);
    console.log('  karsiSamePerson:', karsiSamePerson);
    console.log('  currentStep:', currentStep);

    // 🔥 DİNAMİK STEP HESAPLAMA - İSTENİLEN MANTIK
    const calculateSteps = () => {
        console.log('📊 calculateSteps çalıştı');
        console.log('  kazaNitelik:', kazaNitelik);
        console.log('  insuranceSource:', insuranceSource);

        // 🔥 TEKLİ KAZA → Sadece Servis
        if (kazaNitelik === 'TEKLİ KAZA (BEYANLI)') {
            console.log('✅ TEKLİ KAZA -> SADECE Servis');
            return ['Servis Bilgileri'];
        }

        // 🔥 İKİLİ KAZA → Sigortalı + Servis
        if (kazaNitelik === 'İKİLİ KAZA') {
            console.log('✅ İKİLİ KAZA -> Sigortalı + Servis');
            return ['Sigortalı Bilgileri', 'Servis Bilgileri'];
        }

        // 🔥 ÇOKLU KAZA → Sigortalı + Servis
        if (kazaNitelik === 'ÇOKLU KAZA') {
            console.log('✅ ÇOKLU KAZA -> Sigortalı + Servis');
            return ['Sigortalı Bilgileri', 'Servis Bilgileri'];
        }

        // Default fallback
        console.log('⚠️ DEFAULT -> Sigortalı + Servis');
        return ['Sigortalı Bilgileri', 'Servis Bilgileri'];
    };

    const steps = calculateSteps();

    // Zorunlu alan kontrolü - Senaryo 3 için
    const isPlateOnlyRequired = () => {
        return kazaNitelik === 'ÇOKLU KAZA' &&
            insuranceSource === 'karsi kasko' &&
            samePerson;
    };

    // Profile verilerini yükle
    useEffect(() => {
        const loadProfileData = async () => {
            // Eğer profileDetail yoksa, fetchProfile ile yükle
            if (!profileDetail || Object.keys(profileDetail).length === 0) {
                console.log('📥 Profil verisi yok, yeniden yükleniyor...');
                await fetchProfile();
                return;
            }

            // ProfileDetail varsa serviceData'ya yükle
            if (!isProfileLoaded) {
                console.log('✅ Profil verisi yüklendi:', profileDetail);
                setServiceData(prev => ({
                    ...prev,
                    repair_fullname: profileDetail.repair_fullname || '',
                    repair_birth_date: profileDetail.repair_birth_date || '',
                    repair_tc: profileDetail.repair_tc || '',
                    repair_phone: profileDetail.repair_phone || '',
                    service_name: profileDetail.service_name || '',
                    service_phone: profileDetail.service_phone || '',
                    service_city: profileDetail.service_city || '',
                    service_state_city_city: profileDetail.service_state || '',
                    service_address: profileDetail.service_address || '',
                    service_tax_no: profileDetail.service_tax_no || '',
                    service_iban: profileDetail.service_iban || '',
                    service_iban_name: profileDetail.service_iban_name || '',
                }));
                setIsProfileLoaded(true);
            }
        };

        loadProfileData();
    }, [profileDetail, fetchProfile, isProfileLoaded]);

    useEffect(() => {
        const fetchAllCities = async () => {
            try {
                const res = await apiService.getCities();
                console.log("🌍 raw city response:", res);

                const cities = res?.data?.results || res?.data || [];

                const options = cities.map((city) => ({
                    label: city.name,
                    value: city.name,
                }));

                setCityOptions(options);
                console.log("🌍 cityOptions (mapped):", options);
            } catch (err) {
                console.error('❌ Şehir verileri alınamadı:', err);
                setCityOptions([]);
            }
        };

        fetchAllCities();
    }, []);

    // Route parametrelerinden verileri yükle
    useEffect(() => {
        if (location.state) {
            if (location.state.insuredData) {
                setInsuredData(location.state.insuredData);
            }
            if (location.state.serviceData) {
                setServiceData(prev => ({
                    ...prev,
                    ...location.state.serviceData
                }));
                setIsProfileLoaded(true); // Route'tan gelen veri varsa profil yüklendi say
            }
            if (location.state.opposingDriverData) {
                setOpposingDriverData(location.state.opposingDriverData);
            }

            // Edit modunda ise ilgili adıma git
            if (location.state.editMode && location.state.focusSection) {
                switch (location.state.focusSection) {
                    case 'insured_info':
                        setCurrentStep(1);
                        break;
                    case 'service_info':
                        if (location.state.kazaNitelik === 'TEKLİ KAZA (BEYANLI)') {
                            setCurrentStep(1);
                        } else {
                            setCurrentStep(2);
                        }
                        break;
                    default:
                        setCurrentStep(1);
                }
            }
        }
    }, [location.state]);

    // Form submit handlers
    const handleInsuredSubmit = (values) => {
        setInsuredData(values);
        // Sigortalı sonrası her zaman Servis'e git
        setCurrentStep(currentStep + 1);
    };

    const handleServiceSubmit = async (values) => {
        setServiceData(values);

        // 🔥 Profil güncelleme
        try {
            const profileUpdateData = {
                repair_fullname: values.repair_fullname,
                repair_birth_date: values.repair_birth_date,
                repair_tc: values.repair_tc,
                repair_phone: values.repair_phone,
                service_name: values.service_name,
                service_phone: values.service_phone,
                service_city: values.service_city,
                service_state: values.service_state_city_city,
                service_address: values.service_address,
                service_tax_no: values.service_tax_no,
                service_iban: values.service_iban,
                service_iban_name: values.service_iban_name,
            };

            console.log('📤 Profil güncelleniyor:', profileUpdateData);
            const res = await apiService.updateProfileDetail(profileUpdateData);
            
            if (res.success) {
                console.log('✅ Profil başarıyla güncellendi');
            } else {
                console.error('❌ Profil güncellenemedi:', res.message);
            }
        } catch (error) {
            console.error('❌ Profil güncelleme hatası:', error);
        }

        // 🔥 KRİTİK: routeParams içindeki değerleri kullan
        const navigationState = {
            ...location.state,
            // 🔥 routeParams'tan değerleri açıkça ekle
            kazaNitelik,
            insuranceSource,
            selectedCompany,
            samePerson,
            karsiSamePerson,
            startStep: location.state?.editMode ? (location.state?.returnStep || 3) : 3,
            insuredData,
            serviceData: values,
        };

        console.log('🚀 handleServiceSubmit - navigation state:', navigationState);

        // Düzenleme modunda mı?
        if (location.state?.editMode) {
            const returnTo = location.state?.returnTo || 'step-info';
            navigate(`/${returnTo}`, { state: navigationState });
        } else {
            // 🔥 DEĞİŞİKLİK BURADA: Normal akışta hasar bilgileri sayfasına git
            navigate('/hasar-bilgileri', { state: navigationState });
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigate(-1);
        }
    };

    // Zorunlu alan ayarlaması
    const getAdjustedFields = (fields) => {
        if (isPlateOnlyRequired() && fields === insuredField) {
            // Scenario 3: Sadece plaka zorunlu, diğerleri opsiyonel
            return fields.map(field => {
                if (field.type === 'row') {
                    return {
                        ...field,
                        children: field.children.map(child => ({
                            ...child,
                            required: false
                        }))
                    };
                }
                return {
                    ...field,
                    required: field.name === 'insured_plate'
                };
            });
        }

        return fields;
    };

    const renderFormFooter = ({ submit, allValid }) => (
        <div className={styles.formFooterWeb}>
            <button
                className={styles.backButtonWeb}
                onClick={handleBack}
                type="button"
            >
                <span className={styles.arrowIconLeft}>←</span> GERİ DÖN
            </button>
            <button
                className={styles.nextButtonWeb}
                onClick={submit}
                disabled={!allValid}
                type="button"
            >
                {location.state?.editMode ? 'GÜNCELLE' : 'DEVAM ET'} <span className={styles.arrowIcon}>➔</span>
            </button>
        </div>
    );

    // 🔥 BASİTLEŞTİRİLMİŞ RENDER MANTIGI
    const renderCurrentForm = () => {
        console.log('🎨 RENDER - currentStep:', currentStep, 'kazaNitelik:', kazaNitelik, 'steps:', steps);

        // 🔥 TEKLİ KAZA → Sadece Servis
        if (kazaNitelik === 'TEKLİ KAZA (BEYANLI)') {
            console.log('✅ TEKLİ KAZA -> Servis formu');
            return (
                <FormRenderer
                    fields={serviceFields}
                    values={serviceData}
                    setValues={setServiceData}
                    onSubmit={handleServiceSubmit}
                    renderFooter={renderFormFooter}
                />
            );
        }

        // 🔥 İKİLİ/ÇOKLU KAZA → Step 1: Sigortalı, Step 2: Servis
        if (currentStep === 1) {
            console.log('✅ Step 1 -> Sigortalı formu');
            return (
                <FormRenderer
                    fields={getAdjustedFields(insuredField)}
                    values={insuredData}
                    setValues={setInsuredData}
                    onSubmit={handleInsuredSubmit}
                    renderFooter={renderFormFooter}
                />
            );
        }

        if (currentStep === 2) {
            console.log('✅ Step 2 -> Servis formu');
            return (
                <FormRenderer
                    fields={serviceFields}
                    values={serviceData}
                    setValues={setServiceData}
                    onSubmit={handleServiceSubmit}
                    renderFooter={renderFormFooter}
                />
            );
        }

        // Fallback
        console.log('⚠️ FALLBACK -> Servis formu');
        return (
            <FormRenderer
                fields={serviceFields}
                values={serviceData}
                setValues={setServiceData}
                onSubmit={handleServiceSubmit}
                renderFooter={renderFormFooter}
            />
        );
    };

    return (
        <div className={styles.screenContainer}>
            <div className={styles.contentArea}>
                <Stepper steps={steps} currentStep={currentStep} />

                <h2 className={styles.sectionTitle}>
                    {steps[currentStep - 1]}
                </h2>

                <div className={styles.formCard}>
                    <div className={styles.formSectionContent}>
                        {renderCurrentForm()}
                    </div>
                </div>
            </div>
        </div>
    );
}