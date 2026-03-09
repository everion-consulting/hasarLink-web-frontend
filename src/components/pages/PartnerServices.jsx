import React, { useEffect, useState } from "react";
import styles from "../../styles/partnerServices.module.css";
import { ChevronLeft, Eye, EyeOff, Pencil, Check, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiServices";
import CustomSwitch from "./CustomSwitch";

export default function PartnerServices() {
    const navigate = useNavigate();

    const [companies, setCompanies] = useState([]);
    const [credentials, setCredentials] = useState({});
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState({});
    const [noteOpen, setNoteOpen] = useState({});
    const [savingNote, setSavingNote] = useState({});
    const [noteSaved, setNoteSaved] = useState({});
    const [editingNote, setEditingNote] = useState({});
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            const companyRes = await apiService.getPaginationInsuranceCompanies();
            const credRes = await apiService.getInsuranceCredentials();

            setCompanies(companyRes || []);

            const map = {};
            credRes?.data?.data?.forEach(c => {
                map[c.insurance_company] = c;
            });

            setCredentials(map);

        } catch (e) {
            console.error("LOAD ERROR:", e);
        } finally {
            setLoading(false);
        }
        const openMap = {};
        credRes?.data?.data?.forEach(c => {
            if (c.note && c.note.trim()) {
                openMap[c.insurance_company] = true;
            }
        });
        setNoteOpen(openMap);
    };

    const handleToggle = (companyId) => {
        setCredentials(prev => ({
            ...prev,
            [companyId]: {
                ...prev[companyId],
                insurance_company: companyId,
                is_partner_service: !prev[companyId]?.is_partner_service
            }
        }));
    };

    const togglePassword = (companyId) => {
        setShowPassword(prev => ({
            ...prev,
            [companyId]: !prev[companyId]
        }));
    };

    const handleChange = (companyId, field, value) => {
        setCredentials(prev => ({
            ...prev,
            [companyId]: {
                ...prev[companyId],
                insurance_company: companyId,
                [field]: value
            }
        }));
    };

    const handleSave = async (companyId) => {
        const data = credentials[companyId];
        if (!data?.is_partner_service) return;
        if (!data) return;

        try {
            let res;

            if (data.id) {
                res = await apiService.updateInsuranceCredential(data.id, data);
            } else {
                res = await apiService.createInsuranceCredential(data);
            }

            const saved = res?.data;

            // ✅ MERGE ET — state’i ezme
            setCredentials(prev => ({
                ...prev,
                [companyId]: {
                    ...prev[companyId],  // mevcut state
                    ...saved,            // backend’den gelenler
                    is_partner_service: true // 🔒 garanti
                }
            }));

            alert("Kaydedildi");
        } catch (e) {
            console.error(e);
            alert("Kaydedilemedi");
        }
    };
    const toggleNote = (companyId) => {
        setNoteOpen(prev => ({
            ...prev,
            [companyId]: !prev[companyId]
        }));

        // Açılıyorsa düzenleme moduna gir
        setEditingNote(prev => ({
            ...prev,
            [companyId]: true
        }));
    };

    const handleSaveNote = async (companyId) => {
        const data = credentials[companyId];
        if (!data) return;

        try {
            setSavingNote(p => ({ ...p, [companyId]: true }));

            if (data.id) {
                await apiService.updateInsuranceCredential(companyId, {
                    note: data.note
                });
            } else {
                await apiService.createInsuranceCredential(data);
            }

            // ✨ görsel feedback
            setNoteSaved(p => ({ ...p, [companyId]: true }));
            setTimeout(() => {
                setNoteSaved(p => ({ ...p, [companyId]: false }));
            }, 1500);

        } catch (e) {
            console.error(e);
            alert("Not kaydedilemedi");
        } finally {
            setSavingNote(p => ({ ...p, [companyId]: false }));
            setEditingNote(p => ({ ...p, [companyId]: false }));
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <button onClick={() => navigate(-1)} className={styles.backBtn}>
                    <ChevronLeft size={20} />
                </button>
                <h1>Anlaşmalı Servis Ayarları</h1>
            </div>

            <div className={styles.infoBox}>
                Burada seçeceğiniz sigorta şirketlerinin giriş bilgilerini
                kaydedebilirsiniz. Bu bilgiler dosya bildirimi sırasında otomatik kullanılır.
            </div>

            <div className={styles.searchBox}>
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Sigorta şirketi ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <p>Yükleniyor...</p>
            ) : (
                <div className={styles.list}>
                    {filteredCompanies.map(company => {
                        const cred = credentials[company.id] || {};

                        return (
                            <div key={company.id} className={styles.card}>
                                <div className={styles.topRow}>
                                    <div className={styles.companyInfo}>
                                        <img src={company.photo} alt="" />
                                        <span>{company.name}</span>
                                    </div>
                                    <div className="iconBox">
                                        <button
                                            type="button"
                                            className={`${styles.noteIconBtn} ${!cred.is_partner_service ? styles.disabledIcon : ""
                                                }`}
                                            onClick={() => {
                                                if (!cred.is_partner_service) return;
                                                toggleNote(company.id);
                                            }}
                                            title={
                                                cred.is_partner_service
                                                    ? "Not ekle"
                                                    : "Not eklemek için anlaşmalı servis açılmalı"
                                            }
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <CustomSwitch
                                            value={cred.is_partner_service || false}
                                            onChange={() => handleToggle(company.id)}
                                        />
                                    </div>
                                </div>

                                {cred.is_partner_service && (
                                    <div className={styles.form}>
                                        <input
                                            placeholder="Kullanıcı Adı"
                                            value={cred.service_username || ""}
                                            onChange={(e) =>
                                                handleChange(company.id, "service_username", e.target.value)
                                            }
                                        />
                                        <div className={styles.passwordField}>
                                            <input
                                                type={showPassword[company.id] ? "text" : "password"}
                                                placeholder="Şifre"
                                                value={cred.service_password || ""}
                                                onChange={(e) =>
                                                    handleChange(company.id, "service_password", e.target.value)
                                                }
                                            />

                                            <button
                                                type="button"
                                                className={styles.eyeBtn}
                                                onClick={() => togglePassword(company.id)}
                                            >
                                                {showPassword[company.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        <button className={styles.saveBtn} onClick={() => handleSave(company.id)}>
                                            Kaydet
                                        </button>
                                    </div>
                                )}
                                {cred.is_partner_service && noteOpen[company.id] && (
                                    <div
                                        className={`${styles.noteBox}
        ${noteSaved[company.id] ? styles.noteSaved : ""}
        ${!editingNote[company.id] ? styles.noteReadonly : ""}
    `}
                                    >
                                        <textarea
                                            rows={2}
                                            placeholder="Not ekleyin..."
                                            value={cred.note || ""}
                                            readOnly={!editingNote[company.id]}
                                            onChange={(e) =>
                                                handleChange(company.id, "note", e.target.value)
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}