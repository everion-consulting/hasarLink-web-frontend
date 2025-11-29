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
import { toYYYYMMDD } from '../utils/formatter';
import styles from '../../styles/victimInfoScreen.module.css';

export default function InsuredMechanicStepperScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    const { profileDetail, fetchProfile } = useProfile();
    const [insuredValid, setInsuredValid] = useState(false);
    const [opposingValid, setOpposingValid] = useState(false);
    const [serviceValid, setServiceValid] = useState(false);

    console.log('🔍 FULL location.state:', JSON.stringify(location.state, null, 2));


    const {
        insuranceSource,
        karsiSamePerson,
        kazaNitelik,
        selectedCompany,
        samePerson,
        editMode = false,
        focusSection,
        returnTo,
        returnStep = 3
    } = location.state || {};

    console.log('🔍 Gelen parametreler:', {
        insuranceSource,
        karsiSamePerson,
        kazaNitelik,
        editMode,
        focusSection
    });

    const isTekliBizimKasko =
        kazaNitelik === "TEKLİ KAZA (BEYANLI)" && insuranceSource === "bizim kasko";

    const isCokluKarsiKasko =
        kazaNitelik === "ÇOKLU KAZA" && insuranceSource === "karsi kasko";

    const isCokluKarsiTrafik =
        kazaNitelik === "ÇOKLU KAZA" && insuranceSource === "karsi trafik";


    const shouldShowOpposingDriver = (insuranceSource === 'karsi trafik' || insuranceSource === 'karsi kasko') && karsiSamePerson === false;

    console.log('🔍 Karşı Sürücü Durumu:', {
        insuranceSource,
        karsiSamePerson,
        shouldShowOpposingDriver
    });


    const calculateSteps = () => {
        console.log('📊 calculateSteps çalıştı');
        console.log('  kazaNitelik:', kazaNitelik);
        console.log('  insuranceSource:', insuranceSource);
        console.log('  karsiSamePerson:', karsiSamePerson);
        console.log('  shouldShowOpposingDriver:', shouldShowOpposingDriver);


        if (isTekliBizimKasko) {
            console.log('✅ TEKLİ KAZA -> SADECE Servis');
            return ['Servis Bilgileri'];
        }


        if (shouldShowOpposingDriver) {
            console.log('✅ KARŞI TRAFİK + FARKLI KİŞİ -> Sigortalı + Karşı Sürücü + Servis');
            return ['Sigortalı Bilgileri', 'Karşı Sürücü Bilgileri', 'Servis Bilgileri'];
        }


        console.log('✅ DİĞER -> Sigortalı + Servis');
        return ['Sigortalı Bilgileri', 'Servis Bilgileri'];
    };

    const steps = calculateSteps();

    const [currentStep, setCurrentStep] = useState(() => {
        // Edit modunda focusSection'a göre başlangıç adımı - NATIVE'DEKİ MANTIK
        if (editMode && focusSection) {
            if (focusSection === 'insured_info') return 1;
            if (focusSection === 'karsi_driver_info') return 2;
            if (focusSection === 'service_info') {
                if (isTekliBizimKasko) return 1;
                if (shouldShowOpposingDriver) return 3;
                return 2;
            }
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


    const formatDateToDDMMYYYY = (dateStr) => {
        if (!dateStr) return '';

        if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
            return dateStr;
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [year, month, day] = dateStr.split('-');
            return `${day}.${month}.${year}`;
        }

        return dateStr;
    };

    // Profile verilerini yükle
    useEffect(() => {
        const loadProfileData = async () => {
            if (!profileDetail || Object.keys(profileDetail).length === 0) {
                console.log('📥 Profil verisi yok, yeniden yükleniyor...');
                await fetchProfile();
                return;
            }

            if (!isProfileLoaded) {
                console.log('✅ Profil verisi yüklendi:', profileDetail);
                setServiceData(prev => ({
                    ...prev,
                    repair_fullname: profileDetail.repair_fullname || '',
                    repair_birth_date: formatDateToDDMMYYYY(profileDetail.repair_birth_date) || '',
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
                const cities = res?.data?.results || res?.data || [];
                const options = cities.map((city) => ({
                    label: city.name,
                    value: city.name,
                }));
                setCityOptions(options);
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
            console.log('🔄 Route state verileri yükleniyor:', location.state);

            if (location.state.insuredData) {
                console.log('✅ insuredData yükleniyor:', location.state.insuredData);
                setInsuredData(location.state.insuredData);
            }
            if (location.state.serviceData) {
                console.log('✅ serviceData yükleniyor:', location.state.serviceData);
                setServiceData(prev => ({
                    ...prev,
                    ...location.state.serviceData
                }));
                setIsProfileLoaded(true);
            }
            if (location.state.opposingDriverData) {
                console.log('✅ opposingDriverData yükleniyor:', location.state.opposingDriverData);
                setOpposingDriverData(location.state.opposingDriverData);
            }
        }
    }, [location.state]);

    // 🔹 Sigortalı adımı için alanları senaryoya göre yeniden işle - NATIVE'DEKİ MANTIK
    const insuredFieldsForStep = useMemo(() => {
        // 1) Çoklu + Karşı Kasko → sadece plaka zorunlu
        if (isCokluKarsiKasko) {
            return insuredField.map(f => {
                if (f.type === "row" && Array.isArray(f.children)) {
                    return {
                        ...f,
                        children: f.children.map(child => ({
                            ...child,
                            required: child.name === "insured_plate",
                        })),
                    };
                }
                return {
                    ...f,
                    required: f.name === "insured_plate",
                };
            });
        }

        // 2) Çoklu + Karşı Trafik → TÜM alanlar zorunlu
        if (isCokluKarsiTrafik) {
            return insuredField.map(f => {
                if (f.type === "row" && Array.isArray(f.children)) {
                    return {
                        ...f,
                        children: f.children.map(child => ({
                            ...child,
                            required: true,
                        })),
                    };
                }
                return {
                    ...f,
                    required: true,
                };
            });
        }

        // 3) Diğer senaryolarda alanlar olduğu gibi kalsın
        return insuredField;
    }, [isCokluKarsiKasko, isCokluKarsiTrafik]);

    // Form submit handlers - NATIVE'DEKİ MANTIK
    const handleInsuredSubmit = (values) => {
        console.log('✅ Sigortalı formu tamamlandı:', values);
        setInsuredData(values);

        // Sonraki adıma geç - NATIVE'DEKİ MANTIK
        if (shouldShowOpposingDriver) {
            setCurrentStep(2); // Karşı sürücü bilgilerine geç
        } else {
            // Servis bilgilerine geç
            const serviceStepIndex = steps.findIndex(step => step === 'Servis Bilgileri');
            setCurrentStep(serviceStepIndex + 1);
        }
    };

    const handleOpposingDriverSubmit = (values) => {
        console.log('✅ Karşı sürücü formu tamamlandı:', values);
        setOpposingDriverData(values);

        // Servis bilgilerine geç
        const serviceStepIndex = steps.findIndex(step => step === 'Servis Bilgileri');
        setCurrentStep(serviceStepIndex + 1);
    };

    const handleServiceSubmit = async (values) => {
        console.log('✅ Servis formu tamamlandı:', values);
        setServiceData(values);


        try {
            const profileUpdateData = {
                repair_fullname: values.repair_fullname,
                repair_birth_date: toYYYYMMDD(values.repair_birth_date),
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


        const navigationState = {
            ...location.state,
            kazaNitelik,
            insuranceSource,
            selectedCompany,
            samePerson,
            karsiSamePerson,
            startStep: editMode ? returnStep : 3,


            insuredData: insuredData,
            serviceData: values,
            opposingDriverData: opposingDriverData,
        };

        console.log('🚀 handleServiceSubmit - navigation state:', navigationState);
        console.log('🔍 insuredData gönderiliyor:', insuredData);
        console.log('🔍 serviceData gönderiliyor:', values);
        console.log('🔍 opposingDriverData gönderiliyor:', opposingDriverData);

        // Düzenleme modunda mı?
        if (editMode) {
            const targetRoute = returnTo || 'step-info';
            navigate(`/${targetRoute}`, { state: navigationState });
        } else {
            navigate('/step-info', {
                state: {
                    ...navigationState,
                    startStep: 3
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
                {editMode ? 'GÜNCELLE' : 'DEVAM ET'} <span className={styles.arrowIcon}>➔</span>
            </button>
        </div>
    );

    // Özel validasyon için footer - NATIVE'DEKİ MANTIK
    const renderInsuredFormFooter = ({ submit, allValid }) => {
        // 👉 Çoklu + Karşı Kasko → sadece plaka kontrolü
        const onlyPlateValid =
            isCokluKarsiKasko &&
            insuredData?.insured_plate &&
            insuredData.insured_plate.trim().length > 0;

        // Butonun aktif olup olmamasını senaryoya göre ayarlıyoruz
        const stepValid =
            isCokluKarsiKasko
                ? onlyPlateValid                 // Çoklu + Karşı Kasko → plaka doluysa aktif
                : isCokluKarsiTrafik
                    ? true                         // Çoklu + Karşı Trafik → hep aktif, hata input altında
                    : allValid;                    // Diğer senaryolar → normal

        const handleNextPress = () => {
            // 1) Çoklu + Karşı Kasko → özel kural (sadece plaka zorunlu + alert)
            if (isCokluKarsiKasko) {
                if (!onlyPlateValid) {
                    alert("Eksik Bilgi: Lütfen plaka bilgisini doldurunuz.");
                    return;
                }
                handleInsuredSubmit(insuredData);
                return;
            }

            // 2) Çoklu + Karşı Trafik → ALERT YOK
            if (isCokluKarsiTrafik) {
                submit();
                return;
            }

            // 3) Diğer senaryolar → eski davranış (alert + allValid)
            if (!allValid) {
                alert("Eksik Bilgi: Lütfen tüm alanları doldurunuz.");
                return;
            }

            submit();
        };

        return (
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
                    onClick={handleNextPress}
                    disabled={!stepValid}
                    type="button"
                >
                    DEVAM ET <span className={styles.arrowIcon}>➔</span>
                </button>
            </div>
        );
    };


    const renderCurrentForm = () => {
        console.log('🎨 RENDER - currentStep:', currentStep, 'steps:', steps, 'shouldShowOpposingDriver:', shouldShowOpposingDriver);


        if (isTekliBizimKasko && currentStep === 1) {
            return (
                <FormRenderer
                    fields={serviceFields}
                    values={serviceData}
                    setValues={setServiceData}
                    onSubmit={handleServiceSubmit}
                    onFormChange={({ allValid }) => setServiceValid(allValid)}
                />
            );
        }


        if (currentStep === 1) {
            return (
                <FormRenderer
                    fields={insuredFieldsForStep}
                    values={insuredData}
                    setValues={setInsuredData}
                    onSubmit={handleInsuredSubmit}
                    onFormChange={({ allValid }) => setInsuredValid(allValid)}
                />
            );
        }


        if (currentStep === 2 && shouldShowOpposingDriver) {
            console.log('✅ Karşı sürücü formu render ediliyor');
            return (
                <FormRenderer
                    fields={opposingDriverFields}
                    values={opposingDriverData}
                    setValues={setOpposingDriverData}
                    onSubmit={handleOpposingDriverSubmit}
                    onFormChange={({ allValid }) => setOpposingValid(allValid)}
                />
            );
        }


        return (
            <FormRenderer
                fields={serviceFields}
                values={serviceData}
                setValues={setServiceData}
                onSubmit={handleServiceSubmit}
                onFormChange={({ allValid }) => setServiceValid(allValid)}
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

                {/* Bilgi notları - NATIVE'DEKİ MANTIK */}
                {isCokluKarsiKasko && currentStep === 1 && (
                    <div className={styles.infoNote}>
                        Bu adımda sadece sigortalı plaka bilgisini doldurmanız yeterlidir.
                    </div>
                )}

                {isCokluKarsiTrafik && currentStep === 1 && (
                    <div className={styles.infoNote}>
                        Bu adımda tüm alanların doldurulması zorunludur.
                    </div>
                )}

                <div className={styles.formCard}>
                    <div className={styles.formSectionContent}>
                        {renderCurrentForm()}
                    </div>
                </div>
                {/* === FOOTER === */}

                {currentStep === 1 && (
                    <FormFooter
                        onBack={handleBack}
                        onNext={() => {
                            const form = document.querySelector("form");
                            if (form) {
                                form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                            }
                        }}
                        disabled={!insuredValid}
                    />
                )}

                {currentStep === 2 && shouldShowOpposingDriver && (
                    <FormFooter
                        onBack={handleBack}
                        onNext={() => {
                            const form = document.querySelector("form");
                            if (form) {
                                form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                            }
                        }}
                        disabled={!opposingValid}
                    />
                )}

                {((currentStep === 2 && !shouldShowOpposingDriver) || currentStep === 3) && (
                    <FormFooter
                        onBack={handleBack}
                        onNext={() => {
                            const form = document.querySelector("form");
                            if (form) {
                                form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                            }
                        }}
                        disabled={!serviceValid}
                    />
                )}

            </div>
        </div>
    );
}