import React, { useState, useEffect } from "react";
import "../../styles/insurance.css";
import { Star, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiServices";
import { useProfile } from "../../context/ProfileContext";

export default function InsuranceSelect() {
    const {
        allCompaniesList,
        fetchAllCompanies,
        favoriteCompanies,
        fetchFavoriteCompanies,
    } = useProfile();
console.log("allCompaniesList:", allCompaniesList);
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => {
        fetchAllCompanies();
        fetchFavoriteCompanies();
    }, []);

    const favList = favoriteCompanies || [];

    const addFavorite = async (companyId) => {
        const res = await apiService.addFavoriteCompany(companyId);
        if (res.success) fetchFavoriteCompanies();
    };

    const removeFavorite = async (companyId) => {
        const res = await apiService.removeFavoriteCompany(companyId);
        if (res.success) fetchFavoriteCompanies();
    };

    const toggleFavorite = async (id) => {
        if (favList.includes(id)) {
            await removeFavorite(id);
        } else {
            await addFavorite(id);
        }
    };

    // --------------------------------------------------
    // 🔥 EN ÖNEMLİ KISIM → sonuçlar her zaman array olsun
    // --------------------------------------------------
    const list = Array.isArray(allCompaniesList?.results)
        ? allCompaniesList.results
        : [];

    const filteredCompanies = list.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase())
    );

    // FAVORİ şirket objeleri (sadece ID değil)
    const favoriteCompanyObjects = filteredCompanies.filter(c =>
        favList.includes(c.id)
    );

    // Normal şirketler
    const normalCompanies = filteredCompanies.filter(c =>
        !favList.includes(c.id)
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

            {/* DEBUG BİLGİSİ - Geliştirme sırasında görmek için */}
            {list.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    Şirketler yükleniyor veya veri bulunamadı...
                </div>
            )}

            {/* FAVORİLER */}
            {favoriteCompanyObjects.length > 0 && (
                <section>
                    <h2 className="section-title">Favori Sigorta Şirketlerim</h2>

                    <div className="grid">
                        {favoriteCompanyObjects.map(company => (
                            <div
                                key={company.id}
                                className={`company-card ${selectedCompany === company.id ? "selected" : ""}`}
                                onClick={() => setSelectedCompany(company.id)}
                            >
                                {/* Yıldız */}
                                <button
                                    className="star-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(company.id);
                                    }}
                                >
                                    <Star size={22} color="#FFD700" fill="#FFD700" />
                                </button>

                                                                <img 
                                    src={company.photo} 
                                    alt={company.name || "Şirket logosu"} 
                                    className="company-logo"
                                    onError={(e) => {
                                        console.error('Logo yüklenemedi:', company.photo);
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* TÜM ŞİRKETLER */}
            <section>
                <h2 className="section-title">Tüm Sigorta Şirketleri</h2>

                <div className="grid">
                    {normalCompanies.length === 0 && list.length > 0 && (
                        <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666' }}>
                            {search ? 'Arama sonucu bulunamadı' : 'Tüm şirketler favorilerde'}
                        </p>
                    )}

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
                                {favList.includes(company.id)
                                    ? <Star size={22} color="#FFD700" fill="#FFD700" />
                                    : <Star size={22} color="#ccc" fill="none" />
                                }
                            </button>

                            <img 
                                src={company.photo} 
                                alt={company.name || "Şirket logosu"} 
                                className="company-logo"
                                onError={(e) => {
                                    console.error('Logo yüklenemedi:', company.photo);
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Alt butonlar */}
            <div className="bottom-buttons">
                <button className="back-btn" onClick={() => navigate(-1)}>Geri Dön</button>

                <button
                    className={`continue-btn ${!selectedCompany ? "disabled" : ""}`}
                    disabled={!selectedCompany}
                    onClick={() =>
                        navigate("/step1", { state: { companyId: selectedCompany } })
                    }
                >
                    Devam Et →
                </button>
            </div>
        </div>
    );
}