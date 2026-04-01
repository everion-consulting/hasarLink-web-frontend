import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./../../styles/victimInfoScreen.module.css";
import FormRenderer from "../forms/FormRenderer";
import { getVictimFields } from "../../constants/victimFields";
import Stepper from "../stepper/Stepper";
import FormFooter from "../forms/FormFooter";

const VictimInfoStepper = ({ samePerson = false }) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  console.log("🔥 VICTIM STATE", state);
  console.log("🔥 AI DOCS", state?.aiDocuments);

  const aiDocuments = state?.aiDocuments || [];

  /* --------------------------------------------------
     2️⃣ MAĞDUR RUHSAT = PLAKASI BİZİM ARAÇ OLAN
  -------------------------------------------------- */
  const magdurRuhsat = useMemo(() => {
    return aiDocuments.find(d => d.doc_type === "Ruhsat")?.data || null;
  }, [aiDocuments]);
  console.log("✅ MAGDUR RUHSAT", magdurRuhsat);

  const insuranceSource = state?.insuranceSource;
  const isBizimKasko = insuranceSource === "bizim kasko";


  /* --------------------------------------------------
     3️⃣ MAĞDUR KİMLİK = TC / AD SOYAD EŞLEŞMESİ
  -------------------------------------------------- */
  const magdurKimlik = useMemo(() => {
    return aiDocuments.find(d => d.doc_type === "Kimlik")?.data || null;
  }, [aiDocuments]);

  /* --------------------------------------------------
     3️⃣ MAĞDUR ARAÇ EHLİYETİ = AYNI KİŞİ AKIŞI
  -------------------------------------------------- */
  const magdurAracEhliyet = useMemo(() => {
    const byFolder = aiDocuments.find(
      d => d.folder_name === "magdur_arac_ehliyet"
    )?.data;

    if (byFolder) return byFolder;

    return aiDocuments.find(d => d.doc_type === "Kimlik")?.data || null;
  }, [aiDocuments]);


  /* -------------------------------------------------- */

  const [isCompany, setIsCompany] = useState(false);
  const [isVictimForeign, setIsVictimForeign] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [formValid, setFormValid] = useState(false);

  /* --------------------------------------------------
     4️⃣ FORMU DOLDUR
  -------------------------------------------------- */
  useEffect(() => {
    // Ayni kisi: magdur arac ehliyetinden cek | Farkli kisi: ruhsattan cek
    const dataSource = state?.samePerson ? magdurAracEhliyet : magdurRuhsat;
    
    if (!dataSource) return;

    const isCompanyDetected = dataSource.tc_vkn?.length === 10;

    setIsCompany(isCompanyDetected);
    setIsVictimForeign(false);

    // Ayni kisi ise dogum tarihini magdur arac ehliyetinden al
    const birthDateSource = state?.samePerson
      ? magdurAracEhliyet?.dogum_tarihi
      : magdurKimlik?.dogum_tarihi;

    setFormValues({
      victim_fullname: dataSource.ruhsat_sahibi ||   `${dataSource.ad || ""} ${dataSource.soyad || ""}`.trim(),

      // 🔑 KRİTİK NOKTA
      victim_tc: !isCompanyDetected ? (dataSource.tc_vkn || dataSource.tc_no || "") : "",
      taxId: isCompanyDetected ? (dataSource.tc_vkn || "") : "",

      foreign_victim_tc: "",
      victim_birth_date: birthDateSource || "",
      victim_phone: magdurKimlik?.telefon || "",
      isForeign: false,
    });
  }, [magdurRuhsat, magdurKimlik, magdurAracEhliyet, state?.samePerson]);





  console.log(
    "🧩 VICTIM FIELD NAMES:",
    getVictimFields(false, state?.selectedCompany, state?.kazaNitelik).map(f => f.name)
  );

  const renderInsuredTypeSwitch = () => (
    <div className={styles.switchMainContainer}>
      {/* ŞAHIS */}
      <div
        className={`${styles.switchOption} ${!isCompany ? styles.activeOption : ""
          }`}
        onClick={() => {
          setIsCompany(false);

          // 🔁 Vergi No → TC'ye taşı
          setFormValues((prev) => ({
            ...prev,
            victim_tc: prev.taxId || "",
            taxId: "",
          }));

          setIsVictimForeign(false);
        }}
      >
        Şahıs
      </div>

      {/* ŞİRKET */}
      <div
        className={`${styles.switchOption} ${isCompany ? styles.activeOption : ""
          }`}
        onClick={() => {
          setIsCompany(true);

          // 🔁 TC → Vergi No'ya taşı
          setFormValues((prev) => ({
            ...prev,
            taxId: prev.victim_tc || "",
            victim_tc: "",
          }));

          setIsVictimForeign(false);
        }}
      >
        Şirket
      </div>
    </div>
  );



  /* -------------------------------------------------- */

  const victimFields = getVictimFields(isCompany, state?.selectedCompany);

  const activeVictimFields = React.useMemo(() => {
    let base = victimFields
      .filter((f) => {
        if (isCompany) return true;

        if (isVictimForeign) return f.name !== "victim_tc";
        return f.name !== "foreign_victim_tc";
      })
      .map((f) => {
        if (isCompany) return f;

        if (f.name === "victim_tc")
          return { ...f, required: !isVictimForeign };

        if (f.name === "foreign_victim_tc")
          return { ...f, required: isVictimForeign };

        // ✅ bizim kasko ise poliçe no zorunlu
        if (f.name === "policy_no")
          return { ...f, required: isBizimKasko };

        // ✅ farklı kişi ise doğum tarihi zorunlu
        if (f.name === "victim_birth_date")
          return { ...f, required: state?.samePerson === false };

        return f;
      });

    // ✅ bizim kasko DEĞİLSE poliçe noyu tamamen kaldır
    if (!isBizimKasko) {
      base = base.filter((f) => f.name !== "policy_no");
    }

    return base;
  }, [victimFields, isCompany, isVictimForeign, isBizimKasko]);



  const handleFormSubmit = values => {
    const merged = { ...formValues, ...values };

    // 🔥 AYNI KİŞİ AKIŞI
    if (state?.samePerson) {
      navigate("/driver-victim-stepper", {
        state: {
          ...state,
          victimData: merged,
          driverData: merged // 👈 aynı kişi olduğu için
        }
      });
      return;
    }

    // 🔁 NORMAL AKIŞ
    navigate("/driver-info", {
      state: {
        ...state,
        victimData: merged
      }
    });
  };


  return (
    <div className={styles.screenContainer}>
      <div className={styles.contentArea}>
        <Stepper steps={["Mağdur Bilgileri", "Araç Bilgileri"]} currentStep={1} />

        <h2 className={styles.sectionTitle}>Mağdur Bilgileri</h2>
        {renderInsuredTypeSwitch()}
        <div className={styles.formCard}>
          <FormRenderer
            fields={activeVictimFields}
            values={formValues}
            setValues={setFormValues}
            onSubmit={handleFormSubmit}
            submitLabel="DEVAM ET"
            onFormChange={({ allValid }) => setFormValid(allValid)}
          />
        </div>

        <FormFooter
          onBack={() => {
            navigate("/step-info", {
              state: {
                ...state,
                victimData: Object.keys(formValues).length > 0 ? formValues : state?.victimData,
                startStep: 2,
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
    </div>
  );
};

export default VictimInfoStepper;
