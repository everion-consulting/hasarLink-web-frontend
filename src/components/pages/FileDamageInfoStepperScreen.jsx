// src/screens/file/FileDamageInfoStepperScreen.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormRenderer from "../forms/FormRenderer";
import damageInforFields from "../../constants/damageInfoFields";
import apiService from "../../services/apiServices";
import Stepper from "../stepper/Stepper";
import FormFooter from "../forms/FormFooter";
import { findIlIdByName, findIlceIdByName } from "../../constants/ilIlceData";

import styles from "../../styles/fileDamageStepperScreen.module.css";

const FileDamageInfoStepperScreen = () => {
  const [damageData, setDamageData] = useState({});
  const [formValid, setFormValid] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state || {};

  /* ----------------------------------
     ŞEHİR VERİLERİ
  ---------------------------------- */
  /** OCR'dan gelen il adını dropdown id'sine çevir */
  const resolveIlId = (cityName) => {
    if (!cityName) return "";
    return findIlIdByName(cityName) || "";
  };

  useEffect(() => {
    if (routeState.damageData) {
      const incomingData = { ...routeState.damageData };

      // Eğer accident_datetime varsa, accident_date ve accident_time'a ayır
      if (incomingData.accident_datetime && !incomingData.accident_date && !incomingData.accident_time) {
        const [datePart, timePart] = String(incomingData.accident_datetime).split(" ");
        if (datePart) {
          incomingData.accident_date = datePart;
        }
        if (timePart) {
          incomingData.accident_time = timePart;
        }
      }

      setDamageData(incomingData);
    }
  }, [routeState.damageData]);

  /* ----------------------------------
     TUTANAKTAN OTOMATİK DOLDUR
  ---------------------------------- */
  const aiDocuments = routeState?.aiDocuments || [];
  const tutanak = aiDocuments.find(
    d => d.doc_type === "Kaza Tespit Tutanağı"
  )?.data;

  useEffect(() => {
    if (!tutanak?.genel_bilgiler) return;

    const g = tutanak.genel_bilgiler;
    const ilId = resolveIlId(g.il);

    setDamageData(prev => ({
      ...prev,
      accident_date: g.kaza_tarihi || "",
      accident_time: g.kaza_saati || "",
      accident_city: ilId || g.il || "",
      accident_district: ilId ? (findIlceIdByName(ilId, g.ilce) || g.ilce || "") : (g.ilce || ""),
      accident_address: g.mahalle_cadde || "",
      accident_description:
        tutanak.arac_a?.beyan ||
        tutanak.kaza_olus_ve_kroki?.kroki_yorumu ||
        "",
    }));
  }, [tutanak]);

  /* ----------------------------------
     FORM SUBMIT → STEP INFO
  ---------------------------------- */
  const handleSubmitDamageInfo = values => {
    const processedValues = { ...values };
    if (values.accident_date || values.accident_time) {
      const datePart = values.accident_date || "";
      const timePart = values.accident_time || "";
      if (datePart && timePart) {
        processedValues.accident_datetime = `${datePart} ${timePart}`;
      } else if (datePart) {
        // Sadece tarih varsa, saat olmadan kaydetme (backend'e göndermeden önce kontrol edilecek)
        processedValues.accident_datetime = datePart;
      }
    }
    setDamageData(processedValues);
    navigate("/step-info", {
      state: {
        ...routeState,
        damageData: values,
        startStep: 4,
      },
    });
  };

  return (
    <div className={styles.contentArea}>
      <Stepper steps={["Hasar Bilgileri"]} currentStep={1} />

      <h1 className={styles.sectionTitle}>Hasar Bilgileri</h1>

      <div className={styles.formCard}>
        <FormRenderer
          fields={damageInforFields}
          values={damageData}
          setValues={setDamageData}
          onSubmit={handleSubmitDamageInfo}
          onFormChange={({ allValid }) => setFormValid(allValid)}
        />
      </div>

      <FormFooter
        onBack={() => {
          const currentDamageData = Object.keys(damageData).length > 0 ? damageData : routeState.damageData;
          navigate("/step-info", {
            state: {
              ...routeState,
              damageData: currentDamageData,
              startStep: routeState.returnStep || 3,
            },
          });
        }}
        onNext={() =>
          document
            .querySelector("form")
            ?.dispatchEvent(new Event("submit", { bubbles: true }))
        }
        disabled={!formValid}
      />
    </div>
  );
};

export default FileDamageInfoStepperScreen;
