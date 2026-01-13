import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Stepper from '../stepper/Stepper';
import FormRenderer from '../forms/FormRenderer';
import FormFooter from '../forms/FormFooter';
import { getInsuredFields } from '../../constants/insuredFields';
import serviceField from '../../constants/serviceField';
import opposingDriverFields from '../../constants/opposingDriverFields';
import { useProfile } from '../../context/ProfileContext';
import apiService from '../../services/apiServices';
import { toYYYYMMDD } from '../utils/formatter';
import styles from '../../styles/victimInfoScreen.module.css';

const isFilled = (v) => v !== null && v !== undefined && String(v).trim() !== "";

const fillEmptyFrom = (base, incoming) => {
    const out = { ...(base || {}) };
    Object.entries(incoming || {}).forEach(([k, v]) => {
        if (!isFilled(out[k]) && isFilled(v)) out[k] = v;
    });
    return out;
};

const overwriteOnlyFilled = (base, incoming) => {
    const out = { ...(base || {}) };
    Object.entries(incoming || {}).forEach(([k, v]) => {
        if (isFilled(v)) out[k] = v;
    });
    return out;
};


export default function InsuredMechanicStepperScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    const { profileDetail, fetchProfile } = useProfile();
    const [insuredValid, setInsuredValid] = useState(false);
    const [opposingValid, setOpposingValid] = useState(false);
    const [serviceValid, setServiceValid] = useState(false);
    const [isCompany, setIsCompany] = useState(false);
    const [opposingDriverData, setOpposingDriverData] = useState({});
    const [isOpposingForeign, setIsOpposingForeign] = useState(!!opposingDriverData?.isForeign);
    const [isInsuredForeign, setIsInsuredForeign] = useState(!!location.state?.insuredData?.isForeign);



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
    const [cityOptions, setCityOptions] = useState([]);
    const [isProfileLoaded, setIsProfileLoaded] = useState(false);


    const handleAreaCodeChange = (value) => {
        const onlyNumbers = value.replace(/\D/g, "").slice(0, 3);

        setServiceData((prev) => ({
            ...prev,
            repair_area_code: onlyNumbers,
        }));
    };

    const handleAreaCodeBlur = () => {
        const value = serviceData.repair_area_code;
        if (!value) return;

        if (value.length === 1) {
            setServiceData((prev) => ({
                ...prev,
                repair_area_code: `00${value}`,
            }));
        } else if (value.length === 2) {
            setServiceData((prev) => ({
                ...prev,
                repair_area_code: `0${value}`,
            }));
        }
    };

    const formatAreaCode = (value) => {
        if (!value) return "";

        const digits = value.replace(/\D/g, "").slice(0, 3);

        if (digits.length === 1) return `00${digits}`;
        if (digits.length === 2) return `0${digits}`;

        return digits;
    };



    const serviceFields = useMemo(() => {
        return serviceField.map((f) => {
            if (f.name === "repair_area_code") {
                return {
                    ...f,
                    maxLength: 3,
                    inputMode: "numeric",
                    onChange: (e, value) => handleAreaCodeChange(value),
                    onBlur: handleAreaCodeBlur,
                };
            }

            if (f.type === "row") {
                return {
                    ...f,
                    children: f.children.map((child) =>
                        child.name === "service_city"
                            ? { ...child, options: cityOptions }
                            : child.name === "repair_area_code"
                                ? {
                                    ...child,
                                    maxLength: 3,
                                    inputMode: "numeric",
                                    onChange: (e, value) => handleAreaCodeChange(value),
                                    onBlur: handleAreaCodeBlur,
                                }
                                : child
                    ),
                };
            }

            return f.name === "service_city"
                ? { ...f, options: cityOptions }
                : f;
        });
    }, [cityOptions, serviceData.repair_area_code]);



    const opposingTcFields = useMemo(
        () => opposingDriverFields.filter((f) => f.name !== "opposing_foreign_driver_tc"),
        []
    );

    const opposingForeignFields = useMemo(
        () => opposingDriverFields.filter((f) => f.name !== "opposing_driver_tc"),
        []
    );

    const activeOpposingFields = isOpposingForeign ? opposingForeignFields : opposingTcFields;

    const switchInsuredTab = (nextIsForeign) => {
        setIsInsuredForeign(nextIsForeign);

        setInsuredData((prev) => ({
            ...prev,
            isForeign: nextIsForeign,
            insured_tc: nextIsForeign ? "" : (prev.insured_tc || ""),
            foreign_insured_tc: nextIsForeign ? (prev.foreign_insured_tc || "") : "",
        }));
    };


    const renderOpposingDriverTypeSwitch = () => (
        <div className={styles.switchMainContainer}>
            <div
                className={`${styles.switchOption} ${!isOpposingForeign ? styles.activeOption : ""}`}
                onClick={() => switchOpposingTab(false)}
            >
                TC Sürücü
            </div>
            <div
                className={`${styles.switchOption} ${isOpposingForeign ? styles.activeOption : ""}`}
                onClick={() => switchOpposingTab(true)}
            >
                Yabancı Sürücü
            </div>
        </div>
    );



    const switchOpposingTab = (nextIsForeign) => {
        setIsOpposingForeign(nextIsForeign);

        setOpposingDriverData((prev) => {
            if (nextIsForeign) {
                return {
                    ...prev,
                    isForeign: true,
                    opposing_driver_tc: "",
                    opposing_foreign_driver_tc: prev.opposing_foreign_driver_tc || "",
                };
            }

            return {
                ...prev,
                isForeign: false,
                opposing_foreign_driver_tc: "",
                opposing_driver_tc: prev.opposing_driver_tc || "",
            };
        });
    };





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





    useEffect(() => {
        console.log('🔄 Component mount oldu, GÜNCEL profil yükleniyor...');
        fetchProfile();
    }, []);

    useEffect(() => {
        if (!profileDetail || Object.keys(profileDetail).length === 0) {
            return;
        }

        console.log('✅ GÜNCEL profil verisi yüklendi:', profileDetail);

        const draftServiceData = location.state?.serviceData || {};

        setServiceData(prev => ({
            ...prev,
            service_name: draftServiceData.service_name || profileDetail.service_name || "",
            service_phone: draftServiceData.service_phone || profileDetail.service_phone || "",
            service_city: draftServiceData.service_city || profileDetail.service_city || "",
            service_state_city_city: draftServiceData.service_state_city_city || profileDetail.service_state || "",
            service_address: draftServiceData.service_address || profileDetail.service_address || "",
            service_tax_no: draftServiceData.service_tax_no || profileDetail.service_tax_no || "",
            service_iban: draftServiceData.service_iban || profileDetail.service_iban || "",
            service_iban_name: draftServiceData.service_iban_name || profileDetail.service_iban_name || "",
            repair_fullname: profileDetail.repair_fullname || "",
            repair_birth_date: formatDateToDDMMYYYY(profileDetail.repair_birth_date) || "",
            repair_tc: profileDetail.repair_tc || "",
            repair_phone: profileDetail.repair_phone || "",
            repair_area_code: profileDetail.repair_area_code || ""
        }));

        console.log('📋 Profil bilgileri güncellendi:', {
            repair_fullname: profileDetail.repair_fullname,
            repair_birth_date: profileDetail.repair_birth_date,
            repair_tc: profileDetail.repair_tc,
            repair_phone: profileDetail.repair_phone
        });
    }, [profileDetail]);

    useEffect(() => {
        const fetchAllCities = async () => {
            try {
                let allCities = [];
                let currentUrl = null;

                const res = await apiService.getCities();

                if (res?.data?.results) {
                    allCities = [...res.data.results];
                    currentUrl = res.data.next;

                    while (currentUrl) {
                        const nextRes = await apiService.getCities(currentUrl);
                        if (nextRes?.data?.results) {
                            allCities = [...allCities, ...nextRes.data.results];
                            currentUrl = nextRes.data.next;
                        } else {
                            break;
                        }
                    }
                } else {
                    allCities = res?.data || [];
                }

                const options = allCities.map((city) => ({
                    label: city.name,
                    value: city.name,
                }));
                setCityOptions(options);
                console.log(`✅ Form: Toplam ${allCities.length} şehir yüklendi`);
            } catch (err) {
                console.error('❌ Şehir verileri alınamadı:', err);
                setCityOptions([]);
            }
        };

        fetchAllCities();
    }, []);

    useEffect(() => {
        if (location.state) {
            console.log('🔄 InsuredMechanic: location.key değişti, state yükleniyor:', location.key);

            if (location.state.insuredData) {
                console.log('✅ insuredData yükleniyor:', location.state.insuredData);
                setInsuredData(location.state.insuredData);
                if (location.state.insuredData.isCompany !== undefined) {
                    setIsCompany(location.state.insuredData.isCompany);
                }
            }
            if (location.state.serviceData) {
                console.log('✅ serviceData yükleniyor:', location.state.serviceData);
                setServiceData(prev => overwriteOnlyFilled(prev, location.state.serviceData));
            }
            if (location.state.opposingDriverData) {
                console.log('✅ opposingDriverData yükleniyor:', location.state.opposingDriverData);
                setOpposingDriverData(location.state.opposingDriverData);
            }
            if (location.state?.opposingDriverData?.isForeign !== undefined) {
                setIsOpposingForeign(!!location.state.opposingDriverData.isForeign);
            }
        }
    }, [location.key]);

    useEffect(() => {
        setInsuredData(prev => ({
            ...prev,
            isCompany: isCompany
        }));
        if (location.state?.insuredData?.isForeign !== undefined) {
            setIsInsuredForeign(!!location.state.insuredData.isForeign);
        }

    }, [isCompany]);

    // 🔹 Sigortalı adımı için alanları senaryoya göre yeniden işle - NATIVE'DEKİ MANTIK
    const insuredFieldsForStep = useMemo(() => {
        const fields = getInsuredFields(isCompany);

        // 1) Çoklu + Karşı Kasko → sadece plaka zorunlu
        if (isCokluKarsiKasko) {
            return fields.map(f => {
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
            return fields.map(f => {
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
        return fields;
    }, [isCokluKarsiKasko, isCokluKarsiTrafik, isCompany]);

    // Form submit handlers - NATIVE'DEKİ MANTIK
    const handleInsuredSubmit = (values) => {
        const merged = { ...insuredData, ...values, isForeign: isInsuredForeign, isCompany };

        const cleaned = isInsuredForeign
            ? { ...merged, insured_tc: "" }                 // yabancıysa TC sil
            : { ...merged, foreign_insured_tc: "" };        // TC ise yabancı sil

        console.log("✅ Sigortalı SUBMIT cleaned:", cleaned);

        setInsuredData(cleaned);

        if (shouldShowOpposingDriver) {
            setCurrentStep(2);
        } else {
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
                repair_area_code: values.repair_area_code
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

        const completeServiceData = {
            repair_fullname: values.repair_fullname,
            repair_birth_date: values.repair_birth_date,
            repair_tc: values.repair_tc,
            repair_phone: values.repair_phone,
            service_name: values.service_name,
            service_tax_no: values.service_tax_no,
            service_phone: values.service_phone,
            service_city: values.service_city,
            service_state_city_city: values.service_state_city_city,
            service_address: values.service_address,
            service_iban: values.service_iban,
            service_iban_name: values.service_iban_name,
            repair_area_code: values.repair_area_code
        };

        const navigationState = {
            ...location.state,
            kazaNitelik,
            insuranceSource,
            selectedCompany,
            samePerson,
            karsiSamePerson,
            startStep: editMode ? returnStep : 3,


            insuredData: (() => {
                const base = Object.keys(insuredData).length > 0 ? insuredData : (location.state?.insuredData || {});
                // ✅ yabancı/tc alanını kesinleştir
                return isInsuredForeign
                    ? { ...base, isForeign: true, insured_tc: "" }
                    : { ...base, isForeign: false, foreign_insured_tc: "" };
            })(),

            serviceData: completeServiceData,
            opposingDriverData: Object.keys(opposingDriverData).length > 0 ? opposingDriverData : location.state?.opposingDriverData || {},
        };

        console.log('🚀 handleServiceSubmit - navigation state:', navigationState);
        console.log('🔍 LOCAL insuredData:', Object.keys(insuredData).length, 'keys');
        console.log('🔍 LOCATION insuredData:', Object.keys(location.state?.insuredData || {}).length, 'keys');
        console.log('🔍 FINAL insuredData:', Object.keys(navigationState.insuredData).length, 'keys');
        console.log('🔍 LOCAL opposingDriverData:', Object.keys(opposingDriverData).length, 'keys');
        console.log('🔍 LOCATION opposingDriverData:', Object.keys(location.state?.opposingDriverData || {}).length, 'keys');
        console.log('🔍 FINAL opposingDriverData:', Object.keys(navigationState.opposingDriverData).length, 'keys');

        if (editMode) {
            const targetRoute = returnTo || '/step-info';
            const finalRoute = targetRoute.startsWith('/') ? targetRoute : `/${targetRoute}`;
            navigate(finalRoute, { state: navigationState });
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



    const renderInsuredTypeSwitch = () => (
        <div className={styles.switchMainContainer}>
            <div
                className={`${styles.switchOption} ${!isCompany ? styles.activeOption : ''}`}
                onClick={() => setIsCompany(false)}
            >
                Şahıs
            </div>
            <div
                className={`${styles.switchOption} ${isCompany ? styles.activeOption : ''}`}
                onClick={() => {
                    setIsCompany(true);

                    // ✅ şirket seçildiyse TC/Yabancı switch kapansın + alan temizlensin
                    setIsInsuredForeign(false);
                    setInsuredData((prev) => ({
                        ...prev,
                        isForeign: false,
                        foreign_insured_tc: "",
                    }));
                }}

            >
                Şirket
            </div>
        </div>
    );




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
                <>
                    {renderInsuredTypeSwitch()}
                    {!isCompany && renderInsuredForeignSwitch()}
                    <FormRenderer
                        key={`insured-${isCompany ? "company" : "individual"}-${isInsuredForeign ? "foreign" : "tc"}`}
                        fields={activeInsuredFields}
                        values={insuredData}
                        setValues={setInsuredData}
                        onSubmit={(values) => handleInsuredSubmit(values)}
                        onFormChange={({ allValid }) => setInsuredValid(allValid)}
                    />
                </>
            );
        }


        if (currentStep === 2 && shouldShowOpposingDriver) {
            return (
                <>
                    {renderOpposingDriverTypeSwitch()}

                    <FormRenderer
                        fields={activeOpposingFields}
                        values={opposingDriverData}
                        setValues={setOpposingDriverData}
                        onSubmit={(values) => {

                            const merged = { ...opposingDriverData, ...values, isForeign: isOpposingForeign };

                            const cleaned = isOpposingForeign
                                ? { ...merged, opposing_driver_tc: "" }
                                : { ...merged, opposing_foreign_driver_tc: "" };

                            handleOpposingDriverSubmit(cleaned);
                        }}
                        onFormChange={({ allValid }) => setOpposingValid(allValid)}
                    />
                </>
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

    const renderInsuredForeignSwitch = () => (
        <div className={styles.switchMainContainer}>
            <div
                className={`${styles.switchOption} ${!isInsuredForeign ? styles.activeOption : ""}`}
                onClick={() => switchInsuredTab(false)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && switchInsuredTab(false)}
            >
                TC
            </div>

            <div
                className={`${styles.switchOption} ${isInsuredForeign ? styles.activeOption : ""}`}
                onClick={() => switchInsuredTab(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && switchInsuredTab(true)}
            >
                Yabancı
            </div>
        </div>
    );

    const activeInsuredFields = useMemo(() => {
        const list = Array.isArray(insuredFieldsForStep) ? insuredFieldsForStep : [];

        const patchField = (f) => {
            if (f?.name === "insured_tc") return { ...f, required: !isInsuredForeign };
            if (f?.name === "foreign_insured_tc") return { ...f, required: isInsuredForeign };
            return f;
        };

        return list
            .map((f) => {

                if (f.type === "row" && Array.isArray(f.children)) {
                    const children = f.children
                        .filter((c) => (isInsuredForeign ? c.name !== "insured_tc" : c.name !== "foreign_insured_tc"))
                        .map(patchField);

                    return { ...f, children };
                }

                return patchField(f);
            })
            .filter((f) => {

                if (f.type === "row") return true;
                return isInsuredForeign ? f.name !== "insured_tc" : f.name !== "foreign_insured_tc";
            });
    }, [insuredFieldsForStep, isInsuredForeign]);


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

                {/* Tekli Kaza - Sadece Servis Formu */}
                {isTekliBizimKasko && currentStep === 1 && (
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

                {/* Sigortalı Formu (Tekli kaza değilse) */}
                {!isTekliBizimKasko && currentStep === 1 && (
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

                {/* Karşı Sürücü Formu */}
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

                {/* Servis Formu (Diğer senaryolar) */}
                {!isTekliBizimKasko && ((currentStep === 2 && !shouldShowOpposingDriver) || currentStep === 3) && (
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