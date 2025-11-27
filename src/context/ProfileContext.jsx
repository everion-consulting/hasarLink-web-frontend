import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiServices';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState(null);
  const [profileDetail, setProfileDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoriteCompanies, setFavoriteCompanies] = useState([]);
  const [allCompaniesList, setAllCompaniesList] = useState([]);

  const fetchProfile = async () => {
    try {
      const res1 = await apiService.getProfile();
      console.log('API:', res1.data);
      if (res1.success) {
        console.log('Profil verisi:', res1.data);
        setProfileData(res1.data);
      } else {
        console.error('Profil alınamadı:', res1.message);
      }

      const res2 = await apiService.getProfileDetail();
      if (res2.success) {
        console.log('Profil detay verisi:', res2.data);
        setProfileDetail(res2.data);
      } else {
        console.error('Profil detay alınamadı:', res2.message);
      }
    } catch (err) {
      console.error('Profil verileri yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  // const [notificationSettings, setNotificationSettings] = useState({
  //   caseUpdates: true,
  //   campaignAnnouncements: true,
  //   smsNotifications: false,
  //   emailNotifications: false,
  // });

  // const updateNotificationSettings = async (key, value) => {
  //   const newSettings = { ...notificationSettings, [key]: value };
  //   setNotificationSettings(newSettings);

  //   try {
  //     const res = await accountService.updateNotificationPreferences(
  //       newSettings.caseUpdates,
  //       newSettings.emailNotifications,
  //       newSettings.campaignAnnouncements,
  //       true, // reminder
  //       false // marketing
  //     );
  //     if (res.success) {
  //       Alert.alert(res?.message)
  //     } else {
  //       Alert.alert(res?.message)
  //       console.error(' Güncelleme başarısız:', res.message);
  //     }
  //   } catch (err) {
  //     console.log('Bildirim tercih güncelleme hatası:', err);
  //   }
  // };

  // const toggleSetting = key => {
  //   updateNotificationSettings(key, !notificationSettings[key]);
  // };

  const loadFavorites = async () => {
    try {
      const res = await apiService.getProfileDetail();
      if (res.success) {
        const data = res.data;
        setFavoriteCompanies(
          Array.isArray(data.favorite_insurance_companies)
            ? data.favorite_insurance_companies
            : [],
        );
      } else {
        setFavoriteCompanies([]);
        console.error('Favoriler alınamadı:', res.message);
      }
    } catch (err) {
      console.error('Favoriler yüklenemedi:', err);
      setFavoriteCompanies([]);
    }
  };

  const fetchFavoriteCompanies = async () => {
    try {
      const res = await apiService.getProfileDetail();
      if (res.success) {
        setFavoriteCompanies(res.data.favorite_insurance_companies || []);
      } else {
        setFavoriteCompanies([]);
        console.error('Favori şirketler alınamadı:', res.message);
      }
    } catch (err) {
      console.error('Favori şirketler yüklenemedi:', err);
      setFavoriteCompanies([]);
    }
  };
  
  const fetchAllCompanies = async () => {
    try {
      const companies = await apiService.getPaginationInsuranceCompanies();

      if (!Array.isArray(companies) || companies.length === 0) {
        console.log("Şirketler yüklenemedi veya boş veri döndü");
        setAllCompaniesList([]);
        return;
      }

      console.log('Şirketler başarıyla yüklendi:', companies.length, 'adet');
      setAllCompaniesList(companies);
    } catch (err) {
      console.error('Şirket listesi yüklenirken hata:', err);
      setAllCompaniesList([]);
    }
  };


  useEffect(() => {
    fetchProfile();
    console.log('Profil yükleniyor...');
    fetchFavoriteCompanies();
    fetchAllCompanies();
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profileData,
        setProfileData,
        profileDetail,
        setProfileDetail,
        fetchProfile,
        loading,
        favoriteCompanies,
        setFavoriteCompanies,
        allCompaniesList,
        setAllCompaniesList,
        fetchFavoriteCompanies,
        fetchAllCompanies,
        loadFavorites,

      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
