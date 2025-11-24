import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import '../../styles/AccidentType.css';

const OPTIONS = [
    {
        label: "TEKLİ KAZA (BEYANLI)",
        value: "TEKLİ KAZA (BEYANLI)",
        subtitle: "Tek araçlı kaza",
    },
    {
        label: "İKİLİ KAZA",
        value: "İKİLİ KAZA",
        subtitle: "İki araçlı kaza",
    },
    {
        label: "ÇOKLU KAZA",
        value: "ÇOKLU KAZA",
        subtitle: "Birden Fazla Araç İçeren Kaza",
    },
];

export default function AccidentTypeScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const selectedCompany = location.state?.selectedCompany || null;
    const [selected, setSelected] = useState(null);

    const onSave = () => {
        if (!selected) {
            alert("Uyarı", "Lütfen bir kaza tipi seçiniz.");
            return;
        }

        navigate('/insurance-stepper', {
            state: {
                ...location.state,
                kazaNitelik: selected,
                startStep: 1
            }
        });
    };

    return (
        <div className="accident-type-page">
            <div className="scroll-container">
                <div className="cards-container">
                    {selectedCompany && (
                        <div className="company-card">
                            <div className="company-card-content">
                                <div className="company-text-content">
                                    <div className="company-type-wrapper">
                                        <span className="company-type-outline">Sigorta<br/>Şirketi</span>
                                        <span className="company-type-outline">Sigorta<br/>Şirketi</span>
                                        <span className="company-type-outline">Sigorta<br/>Şirketi</span>
                                        <span className="company-type-outline">Sigorta<br/>Şirketi</span>
                                        <span className="company-type">Sigorta<br/>Şirketi</span>
                                    </div>
                                    <h2 className="company-name-accident">{selectedCompany.name}</h2>
                                </div>
                                {selectedCompany.photo && (
                                    <img
                                        src={selectedCompany.photo}
                                        alt={selectedCompany.name}
                                        className="company-logo-img"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* === KAZA TİPİ SEÇİMİ === */}
                    <div className="stepper-card">
                        <h1 className="main-title">Kaza Niteliği</h1>

                        <div className="option-container">
                            {OPTIONS.map((opt) => (
                                <div
                                    key={opt.value}
                                    className={`option-card ${selected === opt.value ? 'selected' : ''}`}
                                    onClick={() => setSelected(opt.value)}
                                >
                                    <div className="option-content">
                                        <h3 className={`option-label ${selected === opt.value ? 'selected' : ''}`}>
                                            {opt.label}
                                        </h3>
                                        <p className={`option-subtitle ${selected === opt.value ? 'selected' : ''}`}>
                                            {opt.subtitle}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* === BUTONLAR === */}
                <div className="button-row">
                    <button className="cancel-button" onClick={() => navigate(-1)}>
                        <div className="button-content">
                            <ArrowLeft size={20} />
                            <span>GERİ DÖN</span>
                        </div>
                    </button>

                    <button
                        className={`save-button ${!selected ? 'disabled' : ''}`}
                        onClick={onSave}
                        disabled={!selected}
                    >
                        <div className="button-content">
                            <span>DEVAM ET</span>
                            <ArrowRight size={20} color="#fff" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}