import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../styles/DriveVictimStepper.module.css";
import FormRenderer from "../forms/FormRenderer";
import vehicleFields from "../../constants/vehicleFields";
import Stepper from "../stepper/Stepper";
import FormFooter from "../forms/FormFooter";

/* --------------------------------------------------
   DROPDOWN MAPLERİ (senin option value’larına göre)
-------------------------------------------------- */
const VEHICLE_TYPE_MAP = {
  otomobil: "otomobil",
  kamyonet: "kamyonet",
  motosiklet: "motosiklet",
  minibüs: "minibus",
  minibus: "minibus",
  otobüs: "otobus",
  otobus: "otobus",
  tır: "tir",
  tir: "tir",
  çekici: "cekici",
  cekici: "cekici",
  römork: "romork",
  romork: "romork",
  diger: "diger",
};

const VEHICLE_USAGE_MAP = {
  ticari: "ticari",
  hususi: "hususi",
  kamu: "kamu",
};

const normalize = str =>
  String(str || "")
    .toLowerCase()
    .replace("ı", "i")
    .replace("ğ", "g")
    .replace("ü", "u")
    .replace("ş", "s")
    .replace("ö", "o")
    .replace("ç", "c")
    .trim();

const parseUsageType = (raw) => {
  if (!raw) return "";

  const text = normalize(raw);

  if (text.includes("hususi")) return "hususi";
  if (text.includes("ticari")) return "ticari";
  if (text.includes("kamu")) return "kamu";

  return "";
};

const parseVehicleType = (raw) => {
  if (!raw) return "";

  const text = normalize(raw);

  if (text.includes("otomobil")) return "otomobil";
  if (text.includes("kamyonet")) return "kamyonet";
  if (text.includes("motosiklet")) return "motosiklet";
  if (text.includes("minibus")) return "minibus";
  if (text.includes("otobus")) return "otobus";
  if (text.includes("tir")) return "tir";
  if (text.includes("cekici")) return "cekici";
  if (text.includes("romork")) return "romork";

  return "diger";
};



const DriverVictimStepperScreen = () => {
  const navigate = useNavigate();
  const { state = {} } = useLocation();
  const [formValid, setFormValid] = useState(false);

  const {
    aiDocuments = [],
    victimData = {},
    driverData = {},
    samePerson = false,
    vehicleData: existingVehicleData,
  } = state;

  /* --------------------------------------------------
     1️⃣ MAĞDUR ARAÇ RUHSATINI BUL
  -------------------------------------------------- */
  const victimRuhsat = useMemo(() => {
    return (
      aiDocuments.find(
        d => d.doc_type === "Ruhsat" && d.folder_name === "magdur_arac_ruhsat"
      )?.data || null
    );
  }, [aiDocuments]);

  /* --------------------------------------------------
     2️⃣ ARAÇ FORM STATE
  -------------------------------------------------- */
  const [vehicleData, setVehicleData] = useState(
    existingVehicleData || {
      vehicle_brand: "",
      vehicle_type: "",
      vehicle_model: "",
      vehicle_license_no: "",
      vehicle_chassis_no: "",
      vehicle_engine_no: "",
      vehicle_year: "",
      vehicle_plate: "",
      vehicle_usage_type: "",
    }
  );

  /* --------------------------------------------------
     3️⃣ RUHSATTAN FORMU OTOMATİK DOLDUR (DROPDOWN UYUMLU)
  -------------------------------------------------- */
  useEffect(() => {
    if (!victimRuhsat) return;

    setVehicleData(prev => ({
      ...prev,
      vehicle_plate: victimRuhsat.plaka || "",
      vehicle_brand: victimRuhsat.marka || "",
      vehicle_model: victimRuhsat.model || "",
      vehicle_year: victimRuhsat.model_yili || "",
      vehicle_chassis_no: victimRuhsat.sase_no || "",
      vehicle_engine_no: victimRuhsat.motor_no || "",
      vehicle_license_no: victimRuhsat.ruhsat_seri_no || "",

      // 🔥 DÜZELEN KISIMLAR
      vehicle_type: parseVehicleType(
        victimRuhsat.arac_cinsi || victimRuhsat.arac_tipi
      ),
      vehicle_usage_type: parseUsageType(
        victimRuhsat.kullanim_amaci || victimRuhsat.kullanim_sekli
      ),
    }));
  }, [victimRuhsat]);


  /* --------------------------------------------------
     4️⃣ STEP AYARLARI
  -------------------------------------------------- */
  const steps = samePerson
    ? ["Mağdur / Sürücü Bilgileri", "Araç Bilgileri"]
    : ["Mağdur Bilgileri", "Sürücü Bilgileri", "Araç Bilgileri"];

  const currentStep = samePerson ? 2 : 3;

  /* --------------------------------------------------
     5️⃣ SUBMIT
  -------------------------------------------------- */
  const handleVehicleSubmit = values => {
    const finalDriverData = samePerson ? victimData : driverData;

    navigate("/step-info", {
      state: {
        ...state,
        vehicleData: values,
        driverData: finalDriverData,
        startStep: 2,
      },
    });
  };

  return (
    <div className={styles.screenContainerDrive}>
      <div className={styles.contentArea}>
        <Stepper steps={steps} currentStep={currentStep} />

        <h2 className={styles.sectionTitle}>Araç Bilgileri</h2>

        <div className={styles.vehicleFormCard}>
          <FormRenderer
            fields={vehicleFields}
            values={vehicleData}
            setValues={setVehicleData}
            onSubmit={handleVehicleSubmit}
            onFormChange={({ allValid }) => setFormValid(allValid)}
          />
        </div>

        <FormFooter
          onBack={() => navigate(-1, { state })}
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

export default DriverVictimStepperScreen;
