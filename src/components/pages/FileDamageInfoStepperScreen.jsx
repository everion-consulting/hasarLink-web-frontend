// src/screens/file/FileDamageInfoStepperScreen.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormRenderer from "../forms/FormRenderer";
import damageInforFields from "../../constants/damageInfoFields";
import apiService from "../../services/apiServices";
import DocumentUploaderScreen from "./DocumentUploadScreen";
import Stepper from "../stepper/Stepper";
import FormFooter from "../forms/FormFooter";

import styles from "../../styles/fileDamageStepperScreen.module.css";

const FileDamageInfoStepperScreen = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [damageData, setDamageData] = useState({});
  const [cityOptions, setCityOptions] = useState([]);
  const [formValid, setFormValid] = useState(false);
  const [remainingCredits, setRemainingCredits] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state || {};
  const { directToDocuments = false } = routeState;

  const steps = ["Hasar Bilgileri", "Evrak Yükleme"];

  useEffect(() => {
    if (directToDocuments) {
      setCurrentStep(2);
    }
  }, [directToDocuments]);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await apiService.getProfileDetail();
        if (res?.success) {
          const credits = res?.data?.credits ?? res?.data?.data?.credits ?? 0;
          setRemainingCredits(credits);
          console.log("✅ FileDamageInfo - Kalan kredi:", credits);
        }
      } catch (error) {
        console.error("❌ Kredi bilgisi alınamadı:", error);
      }
    };
    fetchCredits();
  }, []);

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

        allCities = [...allCities, ...(data.results || [])];
        nextUrl = data.next;

        while (nextUrl) {
          const nextRes = await apiService.getCities(nextUrl);
          const nextData = nextRes.data;
          allCities = [...allCities, ...(nextData.results || [])];
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

  const toApiDate = (dateStr) => {
    if (!dateStr) return null;

    // date input genelde "YYYY-MM-DD" verir
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr))) return String(dateStr);

    // olur da "DD.MM.YYYY" gelirse
    if (String(dateStr).includes(".")) {
      const [dd, mm, yyyy] = String(dateStr).split(".");
      if (dd && mm && yyyy) return `${yyyy}-${mm}-${dd}`;
    }

    return null;
  };

  // FileDamageInfoStepperScreen.jsx içinde

const handleSubmitDamageInfo = (values) => {
  if (currentStep === 1) {
    const d = toApiDate(values?.accident_date); // "YYYY-MM-DD"
    const t = values?.accident_time;           // "HH:mm"

    const merged = d && t ? `${d}T${t}` : null; 

    const nextValues = {
      ...values,
      accident_datetime: merged, 
    };

    setDamageData(nextValues);
    setCurrentStep(2);
  }
};

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
    // Kredi kontrolü - dosya bildirilirken kredi olmalı
    if (remainingCredits <= 0) {
      alert("Krediniz bitti! Dosya bildirmek için kredi satın alın.");
      navigate("/kredi-satin-al");
      return;
    }

    navigate("/step-info", {
      state: {
        ...routeState,
        damageData,
        documents: data?.documents || {},
        startStep: 4,
      },
    });
  };

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
    <div>
      <div className={styles.contentArea}>
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepPress={handleStepClick}
        />

        <h1 className={styles.sectionTitle}>
          {currentStep === 1 ? "Hasar Bilgileri" : "Evrak Yükleme"}
        </h1>

        {/* Kredi Bilgisi */}
        {currentStep === 1 && (
          <div className={styles.creditInfoContainer}>
            {remainingCredits > 0 ? (
              <div className={styles.creditInfo}>
                Kalan Kredi: <span className={styles.creditCount}>{remainingCredits}</span>
              </div>
            ) : (
              <div className={styles.noCreditInfo}>
                Krediniz bitti! Dosya bildirmek için kredi satın alın. Dosyanız Taslak Olarak Oluşturulacaktır.
              </div>
            )}
          </div>
        )}

        {/* --- FORM KARTI --- */}
        <div className={styles.formCard}>
          <div className={styles.formCardSection}>
            {currentStep === 1 && (
              <FormRenderer
                fields={damageFieldsWithCities}
                values={damageData}
                setValues={setDamageData}
                onSubmit={handleSubmitDamageInfo}
                onFormChange={({ allValid }) => setFormValid(allValid)}
              />
            )}

            {currentStep === 2 && (
              <DocumentUploaderScreen
                damageData={damageData}
                onBack={handleBackPress}
                onContinue={handleDocumentsCompleted}
                routeState={{
                  ...routeState,
                  submissionId: localStorage.getItem("submissionId"),
                }}
              />
            )}
          </div>
        </div>

        {/* --- FORMUN TAM DIŞINDA FOOTER --- */}
        {currentStep === 1 && (
          <FormFooter
            onBack={handleBackPress}
            onNext={() => {
              const form = document.querySelector("form");
              if (form) {
                form.dispatchEvent(
                  new Event("submit", { cancelable: true, bubbles: true })
                );
              }
            }}
            disabled={!formValid}
          />
        )}
      </div>
    </div>
  );

};

export default FileDamageInfoStepperScreen;