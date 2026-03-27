import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { findIlIdByName, findIlceIdByName, getIlName, getIlceName } from '../../constants/ilIlceData';

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
    const [insuredData, setInsuredData] = useState({});
    const [serviceData, setServiceData] = useState({});

    // Toggle geçişlerinde önceki değerleri sakla (geri dönüşte restore etmek için)
    const prevInsuredTcRef = useRef(location.state?.insuredData?.insured_tc || "");
    const prevForeignInsuredTcRef = useRef(location.state?.insuredData?.foreign_insured_tc || "");
    const prevOpposingTcRef = useRef("");
    const prevForeignOpposingTcRef = useRef("");
    const prevInsuredFieldsBeforeCompanyRef = useRef({});
    const [cityOptions, setCityOptions] = useState([]);
    const [isProfileLoaded, setIsProfileLoaded] = useState(false);



    const routeState = location.state || {};

    // ================= AI DOCUMENT =================
    const aiDocuments = routeState?.aiDocuments || [];

    // // --- FIND SIGORTALI EHLİYET ---
    // const insuredLicenseAI = useMemo(() => {
    //     if (!Array.isArray(aiDocuments)) return null;

    //     return aiDocuments.find(
    //         d => d.folder_name === "sigortali_arac_ehliyet"
    //     ) || null;
    // }, [aiDocuments]);

    // --- FIND SIGORTALI RUHSAT ---
    const insuredLicensePlateAI = useMemo(() => {
        if (!Array.isArray(aiDocuments)) return null;

        return aiDocuments.find(
            d => d.folder_name === "sigortali_arac_ruhsat"
        ) || null;
    }, [aiDocuments]);

    // --- FIND KARŞI SÜRÜCÜ EHLİYET ---
    const opposingDriverLicenseAI = useMemo(() => {
        if (!Array.isArray(aiDocuments)) return null;

        return aiDocuments.find(
            d => d.folder_name === "karsi_taraf_surucu_ehliyet"
        ) || null;
    }, [aiDocuments]);



    const mapInsuredFromLicense = (doc) => {
        const d = doc?.data;
        if (!d) return {};

        const formatDate = (v) => {
            // "16.04.2007" → "2007-04-16"
            if (/^\d{2}\.\d{2}\.\d{4}$/.test(v)) {
                const [day, month, year] = v.split(".");
                return `${year}-${month}-${day}`;
            }
            return v || "";
        };

        return {
            insured_tc: d.tc_no || "",
            insured_fullname: `${d.ad || ""} ${d.soyad || ""}`.trim(),
            insured_birth_date: formatDate(d.dogum_tarihi),
            isForeign: false
        };
    };

    const mapPlateFromRuhsat = (doc) => {
        const d = doc?.data;
        if (!d) return {};

        const plate =
            d.plaka ||
            d.arac_plaka ||
            d.plate ||
            "";

        const tcVkn = (d.tc_vkn || "").replace(/\D/g, "");

        const mapped = {
            insured_plate: plate.toUpperCase().replace(/\s+/g, " ").trim()
        };

        // 🔥 11 hane → Şahıs
        if (tcVkn.length === 11) {
            return {
                ...mapped,
                insured_tc: tcVkn,
                insured_fullname: d.ruhsat_sahibi || ""
            };
        }

        // 🔥 10 hane → Şirket
        if (tcVkn.length === 10) {
            return {
                ...mapped,
                company_tax_number: tcVkn,
                company_name: d.ruhsat_sahibi || ""
            };
        }

        return mapped;
    };

    const mapOpposingFromLicense = (doc) => {
        const d = doc?.data;
        if (!d) return {};

        const formatDate = (v) => {
            if (/^\d{2}\.\d{2}\.\d{4}$/.test(v)) return v;

            if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
                const [y, m, d] = v.split("-");
                return `${d}.${m}.${y}`;
            }

            return "";
        };


        return {
            opposing_driver_tc: d.tc_no || "",
            opposing_driver_fullname: `${d.ad || ""} ${d.soyad || ""}`.trim(),
            opposing_driver_birth_date: formatDate(d.dogum_tarihi),
            isForeign: false
        };
    };



    // // --- APPLY ---
    // useEffect(() => {
    //     if (!insuredLicenseAI) return;

    //     console.log("🧠 SIGORTALI EHLİYET AI:", insuredLicenseAI);

    //     const mapped = mapInsuredFromLicense(insuredLicenseAI);

    //     console.log("🧩 MAPPED INSURED:", mapped);

    //     setInsuredData(prev => fillEmptyFrom(prev, mapped));
    //     setIsInsuredForeign(false);
    // }, [insuredLicenseAI]);

    useEffect(() => {
        if (!insuredLicensePlateAI) return;

        console.log("🧠 SIGORTALI RUHSAT AI:", insuredLicensePlateAI);

        const mapped = mapPlateFromRuhsat(insuredLicensePlateAI);
        const tcVkn = insuredLicensePlateAI?.data?.tc_vkn?.replace(/\D/g, "") || "";

        // 🔥 SWITCH OTOMATİK SEÇİM
        if (tcVkn.length === 11) {
            setIsCompany(false);
            setIsInsuredForeign(false);
        }

        if (tcVkn.length === 10) {
            setIsCompany(true);
            setIsInsuredForeign(false);
        }

        console.log("🧩 RUHSAT MAPPED:", mapped);

        setInsuredData(prev => fillEmptyFrom(prev, mapped));

    }, [insuredLicensePlateAI]);

    useEffect(() => {
        if (!opposingDriverLicenseAI) return;

        console.log("🧠 KARŞI SÜRÜCÜ EHLİYET AI (STEP 2):", opposingDriverLicenseAI);

        const mapped = mapOpposingFromLicense(opposingDriverLicenseAI);

        setOpposingDriverData(prev =>
            fillEmptyFrom(prev, mapped)
        );

        setIsOpposingForeign(false);
    }, [opposingDriverLicenseAI]);





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

    const AXA_COMPANY_ID = 52;

    const isAXA =
        selectedCompany?.id === AXA_COMPANY_ID ||
        selectedCompany === AXA_COMPANY_ID;



    const serviceFields = useMemo(() => {
        return serviceField
            .map((f) => {
                if (f.type === "row") {
                    return {
                        ...f,
                        children: f.children.filter((child) => {
                            if (
                                ["service_mah", "service_sk", "service_bina_no"].includes(child.name)
                            ) {
                                return isAXA; // 🔥 SADECE AXA
                            }
                            return true;
                        }),
                    };
                }

                if (
                    ["service_mah", "service_sk", "service_bina_no"].includes(f.name)
                ) {
                    return isAXA ? f : null;
                }

                return f;
            })
            .filter(Boolean);
    }, [isAXA]);


    useEffect(() => {
        if (!isAXA) {
            setServiceData((prev) => ({
                ...prev,
                service_mah: "",
                service_sk: "",
                service_bina_no: "",
            }));
        }
    }, [isAXA]);

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

        setInsuredData((prev) => {
            if (nextIsForeign) {
                // TC -> Yabancı: mevcut TC'yi sakla, yabancı TC'yi restore et
                prevInsuredTcRef.current = prev.insured_tc || "";
                return {
                    ...prev,
                    isForeign: true,
                    insured_tc: "",
                    foreign_insured_tc: prevForeignInsuredTcRef.current || prev.foreign_insured_tc || "",
                };
            }
            // Yabancı -> TC: mevcut yabancı TC'yi sakla, TC'yi restore et
            prevForeignInsuredTcRef.current = prev.foreign_insured_tc || "";
            return {
                ...prev,
                isForeign: false,
                foreign_insured_tc: "",
                insured_tc: prevInsuredTcRef.current || prev.insured_tc || "",
            };
        });
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
                // TC -> Yabancı: mevcut TC'yi sakla
                prevOpposingTcRef.current = prev.opposing_driver_tc || "";
                return {
                    ...prev,
                    isForeign: true,
                    opposing_driver_tc: "",
                    opposing_foreign_driver_tc: prevForeignOpposingTcRef.current || prev.opposing_foreign_driver_tc || "",
                };
            }
            // Yabancı -> TC: mevcut yabancı TC'yi sakla
            prevForeignOpposingTcRef.current = prev.opposing_foreign_driver_tc || "";
            return {
                ...prev,
                isForeign: false,
                opposing_foreign_driver_tc: "",
                opposing_driver_tc: prevOpposingTcRef.current || prev.opposing_driver_tc || "",
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

        const resolvedCityId =
            findIlIdByName(draftServiceData.service_city)
            || findIlIdByName(profileDetail.service_city)
            || "";

        setServiceData(prev => ({
            ...prev,
            insurance_company: selectedCompany?.name || selectedCompany || "",
            // Draft'ta (prev veya draftServiceData) zaten değer varsa dokunma, yoksa profil'den al
            service_name: prev.service_name || draftServiceData.service_name || profileDetail.service_name || "",
            service_phone: prev.service_phone || draftServiceData.service_phone || profileDetail.service_phone || "",
            service_city: prev.service_city || resolvedCityId,
            service_state_city_city: prev.service_state_city_city || (() => {
                const ilId =
                    findIlIdByName(draftServiceData.service_city)
                    || findIlIdByName(profileDetail.service_city);

                return ilId
                    ? (
                        findIlceIdByName(ilId, draftServiceData.service_state_city_city)
                        || findIlceIdByName(ilId, profileDetail.service_state)
                        || ""
                    )
                    : "";
            })(),

            service_address: prev.service_address || draftServiceData.service_address || profileDetail.service_address || "",
            service_tax_no: prev.service_tax_no || draftServiceData.service_tax_no || profileDetail.service_tax_no || "",
            service_iban: prev.service_iban || draftServiceData.service_iban || profileDetail.service_iban || "",
            service_iban_name: prev.service_iban_name || draftServiceData.service_iban_name || profileDetail.service_iban_name || "",
            repair_fullname: prev.repair_fullname || profileDetail.repair_fullname || "",
            repair_birth_date: prev.repair_birth_date || formatDateToDDMMYYYY(profileDetail.repair_birth_date) || "",
            repair_tc: prev.repair_tc || profileDetail.repair_tc || "",
            repair_phone: prev.repair_phone || profileDetail.repair_phone || "",
            repair_area_code: prev.repair_area_code || profileDetail.repair_area_code || ""
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
                setInsuredData(prev =>
                    Object.keys(prev).length > 0
                        ? prev
                        : location.state.insuredData
                );
            }

            if (location.state.serviceData) {
                console.log('✅ serviceData yükleniyor:', location.state.serviceData);
                setServiceData(prev => overwriteOnlyFilled(prev, location.state.serviceData));
            }

            if (location.state.opposingDriverData) {
                setOpposingDriverData(prev =>
                    Object.keys(prev).length > 0
                        ? prev
                        : location.state.opposingDriverData
                );
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
            const isAXA =
                (selectedCompany?.name || selectedCompany) === "AXA";
            const profileUpdateData = {
                repair_fullname: values.repair_fullname,
                repair_birth_date: toYYYYMMDD(values.repair_birth_date),
                repair_tc: values.repair_tc,
                repair_phone: values.repair_phone,
                service_name: values.service_name,
                service_phone: values.service_phone,
                service_city: getIlName(values.service_city) || values.service_city,
                service_state: getIlceName(values.service_state_city_city) || values.service_state_city_city,
                service_address: values.service_address,
                service_tax_no: values.service_tax_no,
                service_iban: values.service_iban,
                service_iban_name: values.service_iban_name,
                repair_area_code: values.repair_area_code,
                ...(isAXA
                    ? {
                        service_mah: values.service_mah,
                        service_sk: values.service_sk,
                        service_bina_no: values.service_bina_no,
                        service_address: ""
                    }
                    : {
                        service_address: values.service_address,
                        service_mah: "",
                        service_sk: "",
                        service_bina_no: ""
                    })
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

        const mergedValues = {
            ...values,
            insurance_company: selectedCompany?.name || selectedCompany || ""
        };

        setServiceData(mergedValues);

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
            navigate("/step-info", {
                state: {
                    ...location.state,
                    insuredData: Object.keys(insuredData).length > 0 ? insuredData : location.state?.insuredData,
                    opposingDriverData: Object.keys(opposingDriverData).length > 0 ? opposingDriverData : location.state?.opposingDriverData,
                    serviceData: Object.keys(serviceData).length > 0 ? serviceData : location.state?.serviceData,
                    startStep: location.state?.returnStep || 3,
                },
            });
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



    useEffect(() => {
        console.log("🧪 insuredData FINAL:", insuredData);
    }, [insuredData]);


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
                onClick={() => {
                    setIsCompany(false);
                    // Şahıs'a geri dönüldü: önceki şahıs alanlarını restore et
                    setInsuredData((prev) => ({
                        ...prev,
                        ...prevInsuredFieldsBeforeCompanyRef.current,
                    }));
                }}
            >
                Şahıs
            </div>
            <div
                className={`${styles.switchOption} ${isCompany ? styles.activeOption : ''}`}
                onClick={() => {
                    setIsCompany(true);

                    // Şirket seçildi: şahıs alanlarını sakla, TC/Yabancı switch kapansın
                    setInsuredData((prev) => {
                        prevInsuredFieldsBeforeCompanyRef.current = {
                            insured_tc: prev.insured_tc || "",
                            insured_fullname: prev.insured_fullname || "",
                            foreign_insured_tc: prev.foreign_insured_tc || "",
                            insured_birth_date: prev.insured_birth_date || "",
                        };
                        return {
                            ...prev,
                            isForeign: false,
                            foreign_insured_tc: "",
                        };
                    });
                    setIsInsuredForeign(false);
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
                        key={`opposing-${isOpposingForeign}-${opposingDriverLicenseAI?.id || "ai"}`}
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