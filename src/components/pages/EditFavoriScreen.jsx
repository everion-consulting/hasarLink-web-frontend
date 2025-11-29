import React, { useState, useEffect } from "react";
import apiService from "../../services/apiServices";
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/EditFavori.module.css';

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
        const stylesMap = {
            1: { width: '150px', height: '75px' },
            2: { width: '160px', height: '80px' },
            3: { width: '150px', height: '75px' },
            4: { width: '50px', height: '50px' },
            5: { width: '130px', height: '70px' },
            6: { width: '110px', height: '60px' },
            7: { width: '130px', height: '60px' },
        };
        return stylesMap[itemId] || { width: '130px', height: '60px' };
    };

    const renderCompanyItem = (item) => {
        const isFav = favoriteCompanies.includes(item.id);
        return (
            <div
                key={item.id}
                className={`${styles.companyCard} ${isFav ? styles.favoriteCard : ''}`}
                onClick={() => !loading && toggleFavorite(item.id)}
                style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
            >
                <div className={styles.logoContainer}>
                    {item.photo ? (
                        <img
                            src={item.photo}
                            alt={item.name}
                            style={getImageStyle(item.id)}
                            className={styles.companyLogo}
                        />
                    ) : (
                        <div className={styles.logoPlaceholder}>
                            <span className={styles.logoText}>{item.name.charAt(0)}</span>
                        </div>
                    )}
                </div>
                <div className={styles.starIcon}>
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
        <div className={styles.container}>
            <div className={styles.content}>
                {favoritesList.length > 0 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            Favori Sigorta Şirketlerim
                        </h2>
                        <div className={styles.grid}>
                            {favoritesList.map((item) => renderCompanyItem(item))}
                        </div>
                    </div>
                )}

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle2}>
                        Tüm Sigorta Şirketleri
                    </h2>
                    <p className={styles.sectionDescription}>
                        Aşağıdaki sigorta şirketlerini yıldız simgesine dokunarak favorilerinize ekleyebilirsiniz.
                    </p>
                </div>

                <div className={styles.grid}>
                    {allCompaniesList.map((item) => renderCompanyItem(item))}
                </div>
            </div>

            <div className={styles.bottomContainer}>
                <button className={styles.backBtn} onClick={() => navigate('/profile')}>
                    <div className={styles.arrowCircle}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </div>
                    <span className={styles.backBtnText}>GERİ DÖN</span>
                </button>
            </div>
        </div>
    );
};

export default EditFavoritesScreen;
