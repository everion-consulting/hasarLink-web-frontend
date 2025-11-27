import React, { useState, useEffect } from "react";
import styles from "../../styles/insurance.module.css";
import { Star, StarOff, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "../../services/apiServices";
import { useProfile } from "../../context/ProfileContext";
import BackIcon from "../../components/images/back.svg";
import ContinueIcon from "../../components/images/continue.svg";

export default function InsuranceSelect() {
    const {
        allCompaniesList,
        fetchAllCompanies,
        profileDetail,
        fetchProfile
    } = useProfile();

    const navigate = useNavigate();
    const location = useLocation();
    const params = location.state || {};

    const [search, setSearch] = useState("");
    const [selectedCompany, setSelectedCompany] = useState(null);

    const favoriteList = profileDetail?.favorite_insurance_companies || [];
    const list = Array.isArray(allCompaniesList) ? allCompaniesList : [];
    const companyObj = list.find(c => c.id === selectedCompany);

    useEffect(() => {
        fetchAllCompanies();
        fetchProfile();
    }, []);

    const toggleFavorite = async (id) => {
        const updated = favoriteList.includes(id)
            ? favoriteList.filter(f => f !== id)
            : [...favoriteList, id];

        const res = await apiService.toggleFavoriteCompanies(updated);
        if (res.success) fetchProfile();
    };


    const filteredCompanies = list.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase())
    );

    const favoriteCompanies = filteredCompanies.filter(c =>
        favoriteList.includes(c.id)
    );

    const normalCompanies = filteredCompanies.filter(c =>
        !favoriteList.includes(c.id)
    );

    return (
        <div className={styles.insurancePage}>
            <h1 className={styles.pageTitle}>Aracın Sigorta Şirketini Seç</h1>

            <div className={styles.searchBox}>
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Sigorta şirketi ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {list.length === 0 && (
                <div className={styles.loadingText}>
                    Şirketler yükleniyor veya veri bulunamadı...
                </div>
            )}

            {favoriteCompanies.length > 0 && (
                <section>
                    <h2 className={styles.sectionTitle}>Favori Sigorta Şirketlerim</h2>

                    <div className={styles.grid}>
                        {favoriteCompanies.map(company => (
                            <div
                                key={company.id}
                                className={`${styles.companyCard} ${selectedCompany === company.id ? styles.selected : ""
                                    }`}
                                onClick={() => setSelectedCompany(company.id)}
                            >
                                <button
                                    className={styles.starBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(company.id);
                                    }}
                                >
                                    <Star size={20} color="#FFD700" fill="#FFD700" />
                                </button>

                                <img
                                    src={company.photo}
                                    alt={company.name}
                                    className={styles.companyLogo}
                                    onError={(e) => (e.target.style.display = "none")}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h2 className={styles.sectionTitle}>Tüm Sigorta Şirketleri</h2>

                <div className={styles.grid}>
                    {normalCompanies.length === 0 && list.length > 0 && (
                        <p className={styles.noResultText}>
                            {search ? "Arama sonucu bulunamadı" : "Tüm şirketler favorilerde"}
                        </p>
                    )}

                    {normalCompanies.map(company => (
                        <div
                            key={company.id}
                            className={`${styles.companyCard} ${selectedCompany === company.id ? styles.selected : ""
                                }`}
                            onClick={() => setSelectedCompany(company.id)}
                        >
                            <button
                                className={styles.starBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(company.id);
                                }}
                            >
                                {favoriteList.includes(company.id)
                                    ? <Star size={20} color="#FFD700" fill="#FFD700" />
                                    : <StarOff size={20} color="#ccc" />
                                }
                            </button>

                            <img
                                src={company.photo}
                                alt={company.name}
                                className={styles.companyLogo}
                                onError={(e) => (e.target.style.display = "none")}
                            />
                        </div>
                    ))}
                </div>
            </section>

            <div className={styles.bottomButtons}>
                <div className={styles.buttonContainer}>

                    <button
                        className={styles.backBtn}
                        onClick={() => navigate(-1)}
                    >
                        <div className={styles.iconCircle}>
                            <img src={BackIcon} alt="Geri" />
                        </div>
                        GERİ DÖN
                    </button>

                    <button
                        className={`${styles.continueBtn} ${!selectedCompany ? styles.disabled : ""
                            }`}
                        disabled={!selectedCompany}
                        onClick={() => {
                            // Eğer StepInfoScreen'den geldiyse, oraya geri dön
                            if (params.returnTo === 'StepInfoScreen') {
                                navigate('/step-info', { 
                                    state: { 
                                        ...params, 
                                        selectedCompany: companyObj,
                                        startStep: params.returnStep || 1
                                    } 
                                });
                            } else {
                                // Normal akış: AccidentTypeScreen'e git
                                navigate("/accident-type", { state: { selectedCompany: companyObj } });
                            }
                        }}
                    >
                        <span>DEVAM ET</span>
                        <div className={styles.iconCircle}>
                            <img src={ContinueIcon} alt="Devam" />
                        </div>
                    </button>


                </div>
            </div>

        </div>
    );
}
