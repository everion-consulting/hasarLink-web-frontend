import React, { useState, useEffect } from "react";
import "../../styles/insurance.css";
import { Star, StarOff, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiServices";
import { useProfile } from "../../context/ProfileContext";

export default function InsuranceSelect() {
    const {
        allCompanies,
        fetchAllCompanies,
        profileDetail,
        fetchProfile
    } = useProfile();

    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [selectedCompany, setSelectedCompany] = useState(null);

    const favoriteList = profileDetail?.favorite_insurance_companies || [];

    useEffect(() => {
        fetchAllCompanies();
        fetchProfile();
    }, []);

    const toggleFavorite = async (id) => {
        const updated = favoriteList.includes(id)
            ? favoriteList.filter(f => f !== id)
            : [...favoriteList, id];

        const res = await apiService.toggleFavoriteCompanies(updated);
        if (res.success) {
            fetchProfile();
        }
    };

    // --------------------------------------------------
    // 🔥 EN ÖNEMLİ KISIM → sonuçlar her zaman array olsun
    // --------------------------------------------------
    const list = Array.isArray(allCompanies?.results)
        ? allCompanies.results
        : [];

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
        <div className="insurance-page">
            <h1 className="page-title">Aracın Sigorta Şirketini Seç</h1>

            {/* Search */}
            <div className="search-box">
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Sigorta şirketi ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* FAVORİLER */}
            {favoriteCompanies.length > 0 && (
                <section>
                    <h2 className="section-title">Favori Sigorta Şirketlerim</h2>

                    <div className="grid">
                        {favoriteCompanies.map(company => (
                            <div
                                key={company.id}
                                className={`company-card ${selectedCompany === company.id ? "selected" : ""}`}
                                onClick={() => setSelectedCompany(company.id)}
                            >
                                <button
                                    className="star-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(company.id);
                                    }}
                                >
                                    <Star size={20} color="#FFD700" fill="#FFD700" />
                                </button>

                                <img src={company.photo} alt="" className="company-logo" />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* TÜM ŞİRKETLER */}
            <section>
                <h2 className="section-title">Tüm Sigorta Şirketleri</h2>

                <div className="grid">
                    {normalCompanies.map(company => (
                        <div
                            key={company.id}
                            className={`company-card ${selectedCompany === company.id ? "selected" : ""}`}
                            onClick={() => setSelectedCompany(company.id)}
                        >
                            <button
                                className="star-btn"
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

                            <img src={company.photo} alt="" className="company-logo" />
                        </div>
                    ))}
                </div>
            </section>

            <div className="bottom-buttons">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    Geri Dön
                </button>

                <button
                    className={`continue-btn ${!selectedCompany ? "disabled" : ""}`}
                    disabled={!selectedCompany}
                    onClick={() => navigate("/step1", {
                        state: { companyId: selectedCompany }
                    })}
                >
                    Devam Et →
                </button>
            </div>
        </div>
    );
}
