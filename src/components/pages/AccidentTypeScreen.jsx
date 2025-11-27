import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import styles from '../../styles/accidentType.module.css';
import { useProfile } from "../../context/ProfileContext";
import tekliKazaIcon from "../../assets/images/tekli-kaza.svg";
import ikiliKazaIcon from "../../assets/images/ikili-kaza.svg";
import cokluKazaIcon from "../../assets/images/coklu-kaza.svg";

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

                    {/* --- ŞİRKET KARTI --- */}
                    {selectedCompany && (
                        <div className={styles.companyCardAccident}>
                            <div className={styles.companyCardContent}>
                                <div className={styles.companyTextContent}>
                                    <div className={styles.companyTypeWrapper}>
                                        <span className={styles.companyTypeOutline}>Sigorta<br />Şirketi</span>
                                        <span className={styles.companyTypeOutline}>Sigorta<br />Şirketi</span>
                                        <span className={styles.companyTypeOutline}>Sigorta<br />Şirketi</span>
                                        <span className={styles.companyTypeOutline}>Sigorta<br />Şirketi</span>
                                        <span className={styles.companyType}>Sigorta<br />Şirketi</span>
                                    </div>
                                    <h2 className={styles.companyNameAccident}>{selectedCompany.name}</h2>
                                </div>

                                {selectedCompany.photo && (
                                    <img
                                        src={selectedCompany.photo}
                                        alt={selectedCompany.name}
                                        className={styles.companyLogoImg}
                                    />
                                )}
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

                </div>

                {/* --- BUTONLAR --- */}
                <div className={styles.buttonRow}>
                    <button className={styles.cancelButton} onClick={() => navigate(-1)}>
                        <div className={styles.buttonContent}>
                            <span className={styles.accidentBtnIcon}>
                                <img src="/src/assets/images/left-icon-black.svg" alt="Geri" />
                            </span>
                            <span>GERİ DÖN</span>
                        </div>
                    </button>

                    <button
                        className={`${styles.saveButton} ${!selected ? styles.disabled : ''}`}
                        onClick={onSave}
                        disabled={!selected}
                    >
                        <div className={styles.buttonContent}>
                            <span>DEVAM ET</span>
                            <span className={styles.accidentBtnIcon}>
                                <img src="/src/assets/images/right-icon-white.svg" alt="Gönder" />
                            </span>
                        </div>
                    </button>
                </div>

            </div>
        </div>
    );
}