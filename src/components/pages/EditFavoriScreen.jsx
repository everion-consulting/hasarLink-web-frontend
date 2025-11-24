import React, { useState, useEffect } from "react";
import apiService from "../../services/apiServices";
import { useNavigate } from 'react-router-dom';
import '../../styles/EditFavori.css';

const EditFavoritesScreen = () => {
    const [favoriteCompanies, setFavoriteCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allCompaniesList, setAllCompaniesList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadFavorites();
        loadCompanies();
    }, []);

    const loadFavorites = async () => {
        try {
            const response = await apiService.getProfileDetail();
            
            if (!response.success) {
                console.log('Favoriler yüklenemedi:', response.message);
                alert(response.message || "Favoriler yüklenemedi");
                return;
            }

            const data = response.data;

            if (data.favorite_insurance_companies) {
                setFavoriteCompanies(Array.isArray(data.favorite_insurance_companies) ? data.favorite_insurance_companies : []);
            } else {
                setFavoriteCompanies([]);
            }

        } catch (error) {
            console.error('Favoriler yüklenirken hata oluştu:', error);
        }
    };

    const addFavorite = async (companyId) => {
        try {
            setLoading(true);
            const response = await apiService.addFavoriteCompany(companyId);

            if (!response.success) {
                alert(response.message || "Favori ekleme başarısız oldu");
                return false;
            }
            setFavoriteCompanies(prev => [...prev, companyId]);
            await loadFavorites();
            return true;

        } catch (error) {
            console.error('Favori eklenirken hata oluştu:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const loadCompanies = async () => {
        try {
            const allCompanies = await apiService.getPaginationInsuranceCompanies();

            if (!Array.isArray(allCompanies) || allCompanies.length === 0) {
                console.log("Şirketler yüklenemedi veya boş veri döndü");
                alert("Şirketler yüklenemedi");
                setAllCompaniesList([]);
                return;
            }

            setAllCompaniesList(allCompanies);
        } catch (error) {
            console.error("Şirketler yüklenirken hata:", error);
            alert("Bağlantı hatası oluştu");
            setAllCompaniesList([]);
        }
    };

    const removeFavorite = async (companyId) => {
        try {
            setLoading(true);
            const response = await apiService.removeFavoriteCompany(companyId);

            if (!response.success) {
                alert(response.message || "Favori çıkarma başarısız oldu");
                return false;
            }
            setFavoriteCompanies(prev => prev.filter(id => id !== companyId));
            await loadFavorites();
            return true;

        } catch (error) {
            console.error('Favori çıkarılırken hata oluştu:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (id) => {
        if (loading) return;

        const isCurrentlyFavorite = favoriteCompanies.includes(id);

        if (isCurrentlyFavorite) {
            await removeFavorite(id);
        } else {
            await addFavorite(id);
        }
    };

    const favoritesList = allCompaniesList.filter(company =>
        favoriteCompanies.includes(company.id)
    );

    const getImageStyle = (itemId) => {
        const styles = {
            1: { width: '150px', height: '75px' },
            2: { width: '160px', height: '80px' },
            3: { width: '150px', height: '75px' },
            4: { width: '50px', height: '50px' },
            5: { width: '130px', height: '70px' },
            6: { width: '110px', height: '60px' },
            7: { width: '130px', height: '60px' },
        };
        return styles[itemId] || { width: '130px', height: '60px' };
    };

    const renderCompanyItem = (item) => {
        const isFav = favoriteCompanies.includes(item.id);
        return (
            <div
                key={item.id}
                className={`company-card ${isFav ? 'favorite-card' : ''}`}
                onClick={() => !loading && toggleFavorite(item.id)}
                style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
            >
                <div className="logo-container">
                    {item.photo ? (
                        <img
                            src={item.photo}
                            alt={item.name}
                            style={getImageStyle(item.id)}
                            className="company-logo"
                        />
                    ) : (
                        <div className="logo-placeholder">
                            <span className="logo-text">{item.name.charAt(0)}</span>
                        </div>
                    )}
                </div>
                <div className="star-icon">
                    {isFav ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#F1B300">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F1B300" strokeWidth="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="container">
            <div className="content">
                {favoritesList.length > 0 && (
                    <div className="section">
                        <h2 className="section-title">
                            Favori Sigorta Şirketlerim
                        </h2>
                        <div className="grid">
                            {favoritesList.map((item) => renderCompanyItem(item))}
                        </div>
                    </div>
                )}

                <div className="section">
                    <h2 className="section-title-2">
                        Tüm Sigorta Şirketleri
                    </h2>
                    <p className="section-description">
                        Aşağıdaki sigorta şirketlerini yıldız simgesine dokunarak favorilerinize ekleyebilirsiniz.
                    </p>
                </div>

                <div className="grid">
                    {allCompaniesList.map((item) => renderCompanyItem(item))}
                </div>
            </div>

            <div className="bottom-container">
                <button className="back-btn" onClick={() => navigate('/profile')}>
                    <div className="arrow-circle">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </div>
                    <span className="back-btn-text">GERİ DÖN</span>
                </button>
            </div>
        </div>
    );
};

export default EditFavoritesScreen;