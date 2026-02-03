import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './../../styles/victimInfoScreen.module.css';
import FormRenderer from '../forms/FormRenderer';
import { getVictimFields } from '../../constants/victimFields';
import Stepper from '../stepper/Stepper';
import FormFooter from '../forms/FormFooter';

const VictimInfoStepper = ({ samePerson = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state || {};
  const kazaNitelik = locationState.kazaNitelik;
  const selectedCompany = locationState.selectedCompany;
  const insuranceSource = locationState.insuranceSource;
  const isBizimKasko = insuranceSource === 'bizim kasko';
  const karsiSamePerson = locationState.karsiSamePerson;
  const samePersonFromState = locationState.samePerson || samePerson;
  const [isVictimForeign, setIsVictimForeign] = useState(!!locationState?.victimData?.isForeign);

  const switchVictimTab = (nextIsForeign) => {
    setIsVictimForeign(nextIsForeign);

    setFormValues((prev) => {
      const out = { ...prev, isForeign: nextIsForeign };

      if (nextIsForeign) {
        out.victim_tc = "";
        out.foreign_victim_tc = out.foreign_victim_tc || "";
      } else {
        out.foreign_victim_tc = "";
        out.victim_tc = out.victim_tc || "";
      }

      return out;
    });
  };


  useEffect(() => {
    if (locationState?.victimData) {
      const victim = { ...locationState.victimData };

      if (victim.victim_birth_date && victim.victim_birth_date.includes("-")) {
        const [y, m, d] = victim.victim_birth_date.split("-");
        victim.victim_birth_date = `${d}.${m}.${y}`;
      }

      setFormValues(victim);
      setIsVictimForeign(!!victim.isForeign);
    }
  }, [locationState]);

  console.log('🔍 VictimInfoStepper - Gelen parametreler:', {
    kazaNitelik,
    selectedCompany,
    insuranceSource,
    samePerson: samePersonFromState,
    karsiSamePerson
  });

  const [isCompany, setIsCompany] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [formValid, setFormValid] = useState(false);

  // samePerson'a göre stepleri belirle
  const steps = samePersonFromState
    ? ['Mağdur Bilgileri', 'Araç Bilgileri']
    : ['Mağdur Bilgileri', 'Sürücü Bilgileri', 'Araç Bilgileri'];

  const victimFields = getVictimFields(isCompany, selectedCompany);

  useEffect(() => {
    setFormValues(prev => ({
      ...prev,
      isCompany: isCompany
    }));
  }, [isCompany]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleFormSubmit = (values) => {

    const merged = { ...formValues, ...values, isCompany, isForeign: isVictimForeign };


    const cleaned = isCompany
      ? { ...merged, isForeign: false, foreign_victim_tc: "" }
      : isVictimForeign
        ? { ...merged, victim_tc: "" }
        : { ...merged, foreign_victim_tc: "" };

    console.log("✅ Victim SUBMIT cleaned:", cleaned);


    const transformedValues = { ...cleaned };

    victimFields.forEach((field) => {
      if (field.transform && typeof field.transform === "function" && transformedValues[field.name]) {
        transformedValues[field.name] = field.transform(transformedValues[field.name]);
      }
    });

    const editMode = locationState.editMode || false;
    const returnTo = locationState.returnTo || null;
    const returnStep = locationState.returnStep || null;

    if (editMode && returnTo) {
      navigate(`/${returnTo}`, {
        state: {
          ...locationState,
          victimData: transformedValues,
          startStep: returnStep || 2,
        },
      });
      return;
    }

    if (samePersonFromState) {
      navigate("/driver-victim-stepper", {
        state: {
          ...locationState,
          victimData: transformedValues,
          driverData: transformedValues,
          samePerson: true,
          kazaNitelik,
          selectedCompany,
          insuranceSource,
          karsiSamePerson,
        },
      });
    } else {
      navigate("/driver-info", {
        state: {
          ...locationState,
          victimData: transformedValues,
          samePerson: false,
          kazaNitelik,
          selectedCompany,
          insuranceSource,
          karsiSamePerson,
        },
      });
    }
  };


  const renderVictimTypeSwitch = () => (
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

          // ✅ şirket seçildiyse TC/Yabancı switch'i kapat + foreign tc temizle
          setIsVictimForeign(false);
          setFormValues((prev) => ({
            ...prev,
            isForeign: false,
            foreign_victim_tc: "",
          }));
        }}

      >
        Şirket
      </div>
    </div>
  );

  const renderVictimForeignSwitch = () => (
    <div className={styles.switchMainContainer}>
      <div
        className={`${styles.switchOption} ${!isVictimForeign ? styles.activeOption : ""}`}
        onClick={() => switchVictimTab(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && switchVictimTab(false)}
      >
        TC
      </div>

      <div
        className={`${styles.switchOption} ${isVictimForeign ? styles.activeOption : ""}`}
        onClick={() => switchVictimTab(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && switchVictimTab(true)}
      >
        Yabancı
      </div>
    </div>
  );

  const activeVictimFields = React.useMemo(() => {
    const base = victimFields
      .filter((f) => {
        if (isCompany) return true; // şirketse dokunma
        if (isVictimForeign) return f.name !== "victim_tc";
        return f.name !== "foreign_victim_tc";
      })
      .map((f) => {
        if (isCompany) return f;
        if (f.name === "victim_tc") return { ...f, required: !isVictimForeign };
        if (f.name === "foreign_victim_tc") return { ...f, required: isVictimForeign };
        return f;
      });

    // ✅ Bizim kasko seçildiyse Poliçe No alanı ekle
    if (isBizimKasko) {
      const alreadyExists = base.some((f) => f.name === "policy_no");
      if (!alreadyExists) {
        base.push({
          name: "policy_no",
          label: "Poliçe No",
          type: "text",
          required: true,
          placeholder: "Poliçe numarası",
        });
      }
    }

    return base;
  }, [victimFields, isCompany, isVictimForeign, isBizimKasko]);

  useEffect(() => {
    if (!isBizimKasko && formValues.policy_no) {
      setFormValues((prev) => ({ ...prev, policy_no: "" }));
    }
  }, [isBizimKasko]);

  return (
    <div className={styles.screenContainer}>
      <div className={styles.contentArea}>

        <Stepper steps={steps} currentStep={1} />

        <h2 className={styles.sectionTitle}>
          {samePersonFromState ? 'Mağdur/Sürücü Bilgileri' : 'Mağdur Bilgileri'}
        </h2>



        <div className={styles.formCard}>
          <div className={styles.formSectionContent}>
            {renderVictimTypeSwitch()}
            {!isCompany && renderVictimForeignSwitch()}
            <FormRenderer
              fields={activeVictimFields}
              values={formValues}
              setValues={setFormValues}
              onSubmit={handleFormSubmit}
              submitLabel="DEVAM ET"
              onFormChange={({ allValid }) => setFormValid(allValid)}
            />
          </div>
        </div>

        <FormFooter
          onBack={handleBack}
          onNext={() => {
            const form = document.querySelector('form');
            if (form) {
              form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
          }}
          disabled={!formValid}
        />

      </div>
    </div>
  );
};

export default VictimInfoStepper;