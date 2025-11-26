import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Stepper from '../stepper/Stepper';
import FormRenderer from '../forms/FormRenderer';
import FormFooter from '../forms/FormFooter';
import insuredField from '../../constants/insuredField';
import serviceField from '../../constants/serviceField';
import opposingDriverFields from '../../constants/opposingDriverFields';
import { useProfile } from '../../context/ProfileContext';
import apiService from '../../services/apiServices';
import styles from '../../styles/victimInfoScreen.module.css';

export default function InsuredMechanicStepperScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    const { profileDetail } = useProfile();


    console.log('🔍 FULL location.state:', JSON.stringify(location.state, null, 2));

    const {
        insuranceSource,
        karsiSamePerson,
        kazaNitelik,
        selectedCompany,
        samePerson
    } = location.state || {};

    const [currentStep, setCurrentStep] = useState(1);
    const [insuredData, setInsuredData] = useState({});
    const [serviceData, setServiceData] = useState({});
    const [opposingDriverData, setOpposingDriverData] = useState({});
    const [cityOptions, setCityOptions] = useState([]);

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

    // Debug log
    console.log('🔍 InsuredMechanicStepperScreen MOUNTED');
    console.log('📦 location.state:', location.state);
    console.log('  kazaNitelik:', kazaNitelik);
    console.log('  insuranceSource:', insuranceSource);
    console.log('  samePerson:', samePerson);
    console.log('  karsiSamePerson:', karsiSamePerson);

    // Dinamik step hesaplama
    const calculateSteps = () => {
        console.log('📊 calculateSteps çalıştı');
        console.log('  kazaNitelik:', kazaNitelik);
        console.log('  insuranceSource:', insuranceSource);
        console.log('  samePerson:', samePerson);

        // Senaryo 1: Tekli Kaza → Sadece Servis
        if (kazaNitelik === 'TEKLİ KAZA (BEYANLI)') {
            console.log('✅ SENARYO 1: Tekli Kaza');
            return ['Servis Bilgileri'];
        }

        // Senaryo 2: İkili Kaza + Sürücü=Mağdur Aynı → Sigortalı + Servis
        if (kazaNitelik === 'İKİLİ KAZA' && samePerson) {
            console.log('✅ SENARYO 2: İkili Kaza');
            return ['Sigortalı Bilgileri', 'Servis Bilgileri'];
        }

        // Senaryo 3: Çoklu Kaza + Karşı Kasko + Aynı Kişi → Sigortalı + Servis (sadece plaka zorunlu)
        if (kazaNitelik === 'ÇOKLU KAZA' && insuranceSource === 'karsi kasko' && samePerson) {
            console.log('✅ SENARYO 3: Çoklu Kaza + Karşı Kasko');
            return ['Sigortalı Bilgileri', 'Servis Bilgileri'];
        }

        // Senaryo 4: Çoklu Kaza + Karşı Trafik + Farklı Kişi → Sigortalı + Karşı Sürücü + Servis
        if (kazaNitelik === 'ÇOKLU KAZA' && insuranceSource === 'karsi trafik' && !samePerson) {
            console.log('✅ SENARYO 4: Çoklu Kaza + Karşı Trafik');
            return ['Sigortalı Bilgileri', 'Karşı Araç Sürücüsü Bilgileri', 'Servis Bilgileri'];
        }

        // Default: Sigortalı + Servis
        console.log('⚠️ DEFAULT SENARYO - Bu olmamalı!');
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
        if (profileDetail && Object.keys(profileDetail).length > 0) {
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
        }
    }, [profileDetail]);

    useEffect(() => {
        const fetchAllCities = async () => {
            try {
                const res = await apiService.getCities();
                console.log("🌍 raw city response:", res);

                // axios ise:
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
                setServiceData(location.state.serviceData);
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
                    case 'karsi_driver_info':
                        setCurrentStep(2);
                        break;
                    case 'service_info':
                        setCurrentStep(steps.length);
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

        // Senaryo 4: Karşı sürücü bilgisi gerekiyorsa step 2'ye git
        if (kazaNitelik === 'ÇOKLU KAZA' && insuranceSource === 'karsi trafik' && !samePerson) {
            setCurrentStep(2);
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleOpposingDriverSubmit = (values) => {
        setOpposingDriverData(values);
        setCurrentStep(currentStep + 1);
    };

    const handleServiceSubmit = (values) => {
        setServiceData(values);

        // Düzenleme modunda mı?
        if (location.state?.editMode) {
            const returnTo = location.state?.returnTo || 'StepInfoScreen';
            const returnStep = location.state?.returnStep || 3;

            navigate(`/${returnTo}`, {
                state: {
                    ...location.state,
                    startStep: returnStep,
                    insuredData,
                    opposingDriverData,
                    serviceData: values,
                }
            });
        } else {
            // Normal akış: StepInfoScreen'e git
            navigate('/step-info', {
                state: {
                    ...location.state,
                    startStep: 3,
                    insuredData,
                    opposingDriverData,
                    serviceData: values,
                }
            });
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

        // Diğer senaryolar: Tüm alanlar zorunlu (veya field'da tanımlı olduğu gibi)
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

    return (
        <div className={styles.screenContainer}>
            <div className={styles.contentArea}>
                <Stepper steps={steps} currentStep={currentStep} />

                <h2 className={styles.sectionTitle}>
                    {steps[currentStep - 1]}
                </h2>

                <div className={styles.formCard}>
                    <div className={styles.formSectionContent}>
                        {console.log('🎨 RENDER - currentStep:', currentStep, 'kazaNitelik:', kazaNitelik)}

                        {/* Senaryo 1: Tekli Kaza - Sadece Servis */}
                        {kazaNitelik === 'TEKLİ KAZA (BEYANLI)' && currentStep === 1 && (
                            <>
                                {console.log('✅ Rendering TEKLI KAZA form')}
                                <FormRenderer
                                    fields={serviceFields}
                                    values={serviceData}
                                    setValues={setServiceData}
                                    onSubmit={handleServiceSubmit}
                                    renderFooter={renderFormFooter}
                                />
                            </>
                        )}

                        {/* Senaryo 2, 3, 4: Sigortalı Bilgileri (Step 1) */}
                        {kazaNitelik !== 'TEKLİ KAZA (BEYANLI)' && currentStep === 1 && (
                            <FormRenderer
                                fields={getAdjustedFields(insuredField)}
                                values={insuredData}
                                setValues={setInsuredData}
                                onSubmit={handleInsuredSubmit}
                                renderFooter={renderFormFooter}
                            />
                        )}

                        {/* Senaryo 4: Karşı Sürücü Bilgileri (Step 2) */}
                        {kazaNitelik === 'ÇOKLU KAZA' &&
                            insuranceSource === 'karsi trafik' &&
                            !samePerson &&
                            currentStep === 2 && (
                                <FormRenderer
                                    fields={opposingDriverFields}
                                    values={opposingDriverData}
                                    setValues={setOpposingDriverData}
                                    onSubmit={handleOpposingDriverSubmit}
                                    renderFooter={renderFormFooter}
                                />
                            )}

                        {/* Servis Bilgileri - Tüm senaryolarda son adım */}
                        {currentStep === steps.length && kazaNitelik !== 'TEKLİ KAZA (BEYANLI)' && (
                            <FormRenderer
                                fields={serviceFields}
                                values={serviceData}
                                setValues={setServiceData}
                                onSubmit={handleServiceSubmit}
                                renderFooter={renderFormFooter}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
