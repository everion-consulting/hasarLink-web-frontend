// src/screens/file/FileDamageInfoStepperScreen.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormRenderer from "../forms/FormRenderer";
import damageInforFields from "../../constants/damageInfoFields";
import apiService from "../../services/apiServices";
import Stepper from "../stepper/Stepper";
import FormFooter from "../forms/FormFooter";

import styles from "../../styles/fileDamageStepperScreen.module.css";

const FileDamageInfoStepperScreen = () => {
  const [damageData, setDamageData] = useState({});
  const [cityOptions, setCityOptions] = useState([]);
  const [formValid, setFormValid] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state || {};

  /* ----------------------------------
     ŞEHİR VERİLERİ
  ---------------------------------- */
  useEffect(() => {
    const fetchAllCities = async () => {
      try {
        let allCities = [];
        let nextUrl = null;

        const res = await apiService.getCities();
        let data = res.data;

        allCities.push(...(data.results || []));
        nextUrl = data.next;

        while (nextUrl) {
          const nextRes = await apiService.getCities(nextUrl);
          data = nextRes.data;
          allCities.push(...(data.results || []));
          nextUrl = data.next;
        }

        setCityOptions(
          allCities.map(city => ({
            label: city.name,
            value: city.name
          }))
        );
      } catch (err) {
        console.error("❌ Şehir verileri alınamadı:", err);
      }
    };

    fetchAllCities();
  }, []);

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
    if (!tutanak) return;

    setDamageData(prev => ({
      ...prev,
      accident_date: tutanak.genel_bilgiler?.kaza_tarihi || "",
      accident_time: tutanak.genel_bilgiler?.kaza_saati || "",
      accident_city: tutanak.genel_bilgiler?.il || "",
      accident_district: tutanak.genel_bilgiler?.ilce || "",
      accident_address: tutanak.genel_bilgiler?.mahalle_cadde || "",
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

  const damageFieldsWithCities = damageInforFields.map(f => {
    if (f.type === "row" && f.name === "accident_location_row") {
      return {
        ...f,
        children: f.children.map(child =>
          child.name === "accident_city"
            ? { ...child, options: cityOptions }
            : child
        ),
      };
    }
    return f;
  });

  return (
    <div className={styles.contentArea}>
      <Stepper steps={["Hasar Bilgileri"]} currentStep={1} />

      <h1 className={styles.sectionTitle}>Hasar Bilgileri</h1>

      <div className={styles.formCard}>
        <FormRenderer
          fields={damageFieldsWithCities}
          values={damageData}
          setValues={setDamageData}
          onSubmit={handleSubmitDamageInfo}
          onFormChange={({ allValid }) => setFormValid(allValid)}
        />
      </div>

      <FormFooter
        onBack={() => navigate(-1)}
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
