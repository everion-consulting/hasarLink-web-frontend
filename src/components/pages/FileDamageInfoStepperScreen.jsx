// src/screens/file/FileDamageInfoStepperScreen.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";


import FormRenderer from '../forms/FormRenderer';

import damageInforFields from '../../constants/damageInfoFields';


import apiService from '../../services/apiServices';
import DocumentUploaderScreen from "./DocumentUploadScreen";

import "../../styles/fileDamageStepperScreen.css";
import Stepper from "../stepper/Stepper";

const FileDamageInfoStepperScreen = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [damageData, setDamageData] = useState({});
    const [cityOptions, setCityOptions] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();
    const submissionId = localStorage.getItem("submissionId");


    // RN'deki route.params yerine
    const routeState = location.state || {};
    const { directToDocuments = false } = routeState;

    const steps = ["Hasar Bilgileri", "Evrak Yükleme"];

    // Direkt evrak ekranına gelmek istenirse
    useEffect(() => {
        if (directToDocuments) {
            setCurrentStep(2);
        }
    }, [directToDocuments]);

    // Şehirleri çek
    useEffect(() => {
        const fetchAllCities = async () => {
            try {
                let allCities = [];
                let nextUrl = null;

                const res = await apiService.getCities();
                const data = res.data;

                if (data.detail) {
                    setCityOptions([]);
                    return;
                }

                allCities = allCities.concat(data.results || []);
                nextUrl = data.next;

                while (nextUrl) {
                    const nextRes = await apiService.getCities(nextUrl);
                    const nextData = nextRes.data;
                    allCities = allCities.concat(nextData.results || []);
                    nextUrl = nextData.next;
                }

                const options = allCities.map((city) => ({
                    label: city.name,
                    value: city.name,
                }));

                setCityOptions(options);
            } catch (err) {
                console.error("❌ Şehir verileri alınamadı:", err);
                setCityOptions([]);
            }
        };

        fetchAllCities();
    }, []);

    // Step 1 submit
    const handleSubmitDamageInfo = (values) => {
        if (currentStep === 1) {
            setDamageData(values);
            setCurrentStep(2);
        }
    };

    // Stepper üzerinde tıklama (sadece geri gitmeye izin verelim)
    const handleStepClick = (stepIndex) => {
        if (stepIndex === currentStep) return;
        if (stepIndex < currentStep) {
            setCurrentStep(stepIndex);
        }
    };

    const handleBackPress = () => {
        if (currentStep === 1) {
            navigate(-1);
        } else {
            setCurrentStep(1);
        }
    };

    const handleDocumentsCompleted = (data) => {
        navigate("/step-info", {
            state: {
                ...routeState,
                damageData,
                documents: data?.documents || {},
                startStep: 4,
            },
        });
    };

    // accident_city için options inject
    const damageFieldsWithCities = damageInforFields.map((f) => {
        if (f.type === "row" && f.name === "accident_location_row") {
            return {
                ...f,
                children: f.children.map((child) =>
                    child.name === "accident_city"
                        ? { ...child, options: cityOptions }
                        : child
                ),
            };
        }
        return f;
    });

    return (
        <div>   {/* <<< BURADA className YOK */}
            {/* arka plan daireleri */}
            <div className="bg-circle bg-circle-1" />
            <div className="bg-circle bg-circle-2" />
            <div className="bg-circle bg-circle-3" />

            <div className="content-area">
                {/* ✅ Stepper önce */}
                <Stepper
                    steps={steps}
                    currentStep={currentStep}
                    onStepPress={handleStepClick}
                />

                <h1 className="page-title">
                    {currentStep === 1 ? "Hasar Bilgileri" : "Evrak Yükleme"}
                </h1>

                <div className="vehicle-form-card">
                    <div className="vehicle-form-section-content">
                        {currentStep === 1 && (
                            <FormRenderer
                                fields={damageFieldsWithCities}
                                values={damageData}
                                setValues={setDamageData}
                                onSubmit={handleSubmitDamageInfo}
                                renderFooter={({ submit, allValid }) => (
                                    <div className="form-footer-web">
                                        <button
                                            type="button"
                                            className="back-button-web"
                                            onClick={handleBackPress}
                                        >
                                            <span className="arrow-icon-left">←</span>
                                            GERİ DÖN
                                        </button>

                                        <button
                                            type="button"
                                            className="next-button-web"
                                            onClick={submit}
                                            disabled={!allValid}
                                        >
                                            DEVAM ET
                                            <span className="arrow-icon">↗</span>
                                        </button>
                                    </div>
                                )}
                            />
                        )}

                        {currentStep === 2 && (
                            <DocumentUploaderScreen
                                damageData={damageData}
                                onBack={handleBackPress}
                                onContinue={handleDocumentsCompleted}
                                routeState={{
                                    ...routeState,
                                    submissionId: localStorage.getItem("submissionId")
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );


};

export default FileDamageInfoStepperScreen;
