import React, { useEffect, useState } from "react";
import styles from "../../styles/partnerServices.module.css";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiServices";
import CustomSwitch from "./CustomSwitch";

export default function PartnerServices() {
    const navigate = useNavigate();

    const [companies, setCompanies] = useState([]);
    const [credentials, setCredentials] = useState({});
    const [loading, setLoading] = useState(true);

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

        if (!data) return;

        if (data.id) {
            await apiService.updateInsuranceCredential(companyId, data);
        } else {
            await apiService.createInsuranceCredential(data);
        }

        alert("Kaydedildi");
    };

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

            {loading ? (
                <p>Yükleniyor...</p>
            ) : (
                <div className={styles.list}>
                    {companies.map(company => {
                        const cred = credentials[company.id] || {};

                        return (
                            <div key={company.id} className={styles.card}>
                                <div className={styles.topRow}>
                                    <div className={styles.companyInfo}>
                                        <img src={company.photo} alt="" />
                                        <span>{company.name}</span>
                                    </div>

                                    <CustomSwitch
                                        value={cred.is_partner_service || false}
                                        onChange={() => handleToggle(company.id)}
                                    />
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
                                        <input
                                            type="password"
                                            placeholder="Şifre"
                                            value={cred.service_password || ""}
                                            onChange={(e) =>
                                                handleChange(company.id, "service_password", e.target.value)
                                            }
                                        />
                                        <button onClick={() => handleSave(company.id)}>
                                            Kaydet
                                        </button>
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