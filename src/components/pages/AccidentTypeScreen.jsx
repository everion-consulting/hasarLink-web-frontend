import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import styles from '../../styles/accidentType.module.css';
import { useProfile } from "../../context/ProfileContext";
import tekliKazaIcon from "../../assets/images/tekli-kaza.svg";
import ikiliKazaIcon from "../../assets/images/ikili-kaza.svg";
import cokluKazaIcon from "../../assets/images/coklu-kaza.svg";
import FormFooter from '../forms/FormFooter';

const OPTIONS = [
    {
        label: "TEKLİ KAZA (BEYANLI)",
        value: "TEKLİ KAZA (BEYANLI)",
        subtitle: "Tek Araçlı Kaza",
        icon: tekliKazaIcon,
    },
    {
        label: "İKİLİ KAZA",
        value: "İKİLİ KAZA",
        subtitle: "İki Araçlı Kaza",
        icon: ikiliKazaIcon,
    },
    {
        label: "ÇOKLU KAZA",
        value: "ÇOKLU KAZA",
        subtitle: "Birden Fazla Araç İçeren Kaza",
        icon: cokluKazaIcon,
    },
];

export default function AccidentTypeScreen() {
    const { allCompaniesList } = useProfile();
    const navigate = useNavigate();
    const location = useLocation();

    const selectedCompany = location.state?.selectedCompany || null;
    const [selected, setSelected] = useState(null);

    const onSave = () => {
        if (!selected) return alert("Lütfen bir kaza tipi seçiniz.");

        navigate('/insurance-stepper', {
            state: {
                ...location.state,
                kazaNitelik: selected,
                startStep: 1,
                selectedCompany: selectedCompany,
            }
        });
    };

    return (
        <div className={styles.accidentTypePage}>
            <div className={styles.scrollContainer}>
                <div className={styles.cardsContainer}>

                    {selectedCompany && (
                        // Şirket Kartı
                        <div className={styles.companyCardAccidentInsurance}>
                            <div className={styles.companyCardContentInsurance}>
                                <div className={styles.companyTextContentInsurance}>
                                    <div className={styles.companyTypeWrapperInsurance}>
                                        <span className={styles.companyTypeInsurance}>Sigorta<br />Şirketi</span>
                                    </div>
                                </div>

                                {selectedCompany.photo && (
                                    <img
                                        src={selectedCompany.photo}
                                        alt={selectedCompany.name}
                                        className={styles.companyLogoImg}
                                    />
                                )}
                            </div>

                            {/* Koyu Mavi Alt Şerit */}
                            <div className={styles.companyNameFooter}>
                                <h2 className={styles.companyNameAccidentInsuranceFooter}>
                                    {selectedCompany.name}
                                </h2>
                            </div>
                        </div>
                    )}

                    {/* --- KAZA SEÇİM KARTI --- */}
                    <div className={styles.stepperCard}>
                        <h1 className={styles.mainTitle}>Kaza Niteliği</h1>

                        <div className={styles.optionContainer}>
                            {OPTIONS.map((opt) => (
                                <div
                                    key={opt.value}
                                    className={`${styles.optionCard} ${selected === opt.value ? styles.selected : ''}`}
                                    onClick={() => setSelected(opt.value)}
                                >
                                    {/* --- SENİN İKONLARIN --- */}
                                    <img src={opt.icon} alt={opt.label} className={styles.optionIcon} />

                                    <div className={styles.optionContent}>
                                        <h3 className={`${styles.optionLabel} ${selected === opt.value ? styles.selected : ''}`}>
                                            {opt.label}
                                        </h3>
                                        <p className={`${styles.optionSubtitle} ${selected === opt.value ? styles.selected : ''}`}>
                                            {opt.subtitle}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* --- BUTONLAR --- */}
                    <FormFooter
                        onBack={() => navigate(-1)}
                        onNext={onSave}
                        nextLabel="DEVAM ET"
                        backLabel="GERİ DÖN"
                        disabled={!selected}
                    />
                </div>



            </div>
        </div>
    );
}