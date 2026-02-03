import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FormRenderer from "../forms/FormRenderer";
import driverFields from "../../constants/driverFields";
import Stepper from "../stepper/Stepper";
import styles from "../../styles/victimInfoScreen.module.css";
import FormFooter from "../forms/FormFooter";

export default function DriverInfoScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state || {};
  const {
    victimData,
    driverData = {},
    samePerson = false,
    aiDocuments = [] 
  } = locationState;

  /* --------------------------------------------------
     Aynı kişi kontrolü
  -------------------------------------------------- */
  useEffect(() => {
    if (samePerson) {
      navigate("/driver-victim-stepper", { state: locationState });
    }
  }, [samePerson, navigate, locationState]);

  /* --------------------------------------------------
     🔍 SÜRÜCÜ EHLİYETİNİ BUL (GERÇEK VERİYE GÖRE)
  -------------------------------------------------- */
  const driverLicenseAI = useMemo(() => {
    return aiDocuments.find(
      (doc) =>
        doc.filename?.toLowerCase().includes("sürücü") &&
        doc.filename?.toLowerCase().includes("ehliyet")
    );
  }, [aiDocuments]);

  /* --------------------------------------------------
     🤖 AI → FORM MAPPING
  -------------------------------------------------- */
  const mapAiDriverDataToForm = (aiDoc) => {
    const d = aiDoc?.data;
    if (!d) return {};

    return {
      driver_fullname: `${d.ad || ""} ${d.soyad || ""}`.trim(),
      driver_tc: d.tc_no || "",
      driver_birth_date: d.dogum_tarihi || "",
      isForeign: false
    };
  };

  /* --------------------------------------------------
     FORM STATE
  -------------------------------------------------- */
  const [formValid, setFormValid] = useState(false);
  const [isForeign, setIsForeign] = useState(false);
  const [formValues, setFormValues] = useState({
    ...driverData,
    isForeign: false
  });

  /* --------------------------------------------------
     🔥 AI GELİNCE FORMU DOLDUR (KRİTİK NOKTA)
  -------------------------------------------------- */
  useEffect(() => {
    if (!driverLicenseAI) return;

    const aiData = mapAiDriverDataToForm(driverLicenseAI);

    setFormValues((prev) => ({
      ...prev,
      ...aiData,
      isForeign: false
    }));

    setIsForeign(false);
  }, [driverLicenseAI]);

  /* --------------------------------------------------
     FORM CONFIG
  -------------------------------------------------- */
  const steps = ["Mağdur Bilgileri", "Sürücü Bilgileri", "Araç Bilgileri"];
  const currentStep = 2;

  const tcFields = useMemo(
    () => driverFields.filter((f) => f.name !== "foreign_driver_tc"),
    []
  );

  const foreignFields = useMemo(
    () => driverFields.filter((f) => f.name !== "driver_tc"),
    []
  );

  const activeFields = isForeign ? foreignFields : tcFields;

  /* --------------------------------------------------
     DRIVER TYPE SWITCH
  -------------------------------------------------- */
  const switchTab = (nextIsForeign) => {
    setIsForeign(nextIsForeign);

    setFormValues((prev) =>
      nextIsForeign
        ? {
            ...prev,
            isForeign: true,
            driver_tc: "",
            foreign_driver_tc: prev.foreign_driver_tc || ""
          }
        : {
            ...prev,
            isForeign: false,
            foreign_driver_tc: "",
            driver_tc: prev.driver_tc || ""
          }
    );
  };

  const renderDriverTypeSwitch = () => (
    <div className={styles.switchMainContainer}>
      <div
        className={`${styles.switchOption} ${
          !isForeign ? styles.activeOption : ""
        }`}
        onClick={() => switchTab(false)}
      >
        TC Sürücü
      </div>
      <div
        className={`${styles.switchOption} ${
          isForeign ? styles.activeOption : ""
        }`}
        onClick={() => switchTab(true)}
      >
        Yabancı Sürücü
      </div>
    </div>
  );

  /* --------------------------------------------------
     SUBMIT
  -------------------------------------------------- */
  const handleSubmit = (driverFormData) => {
    const merged = { ...formValues, ...driverFormData, isForeign };

    const cleaned = isForeign
      ? { ...merged, driver_tc: "" }
      : { ...merged, foreign_driver_tc: "" };

    navigate("/driver-victim-stepper", {
      state: {
        ...locationState,
        victimData,
        driverData: cleaned,
        samePerson
      }
    });
  };

  const handleBack = () => {
    navigate("/victim-info", { state: locationState });
  };

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */
  return (
    <div className={styles.screenContainer}>
      <div className={styles.contentArea}>
        <Stepper steps={steps} currentStep={currentStep} />

        <h2 className={styles.sectionTitle}>Sürücü Bilgileri</h2>

        <div className={styles.formCard}>
          <div className={styles.formSectionContent}>
            {renderDriverTypeSwitch()}

            <FormRenderer
              fields={activeFields}
              values={formValues}
              setValues={setFormValues}
              onSubmit={handleSubmit}
              onFormChange={({ allValid }) => setFormValid(allValid)}
            />
          </div>
        </div>

        <FormFooter
          onBack={handleBack}
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
      </div>
    </div>
  );
}
