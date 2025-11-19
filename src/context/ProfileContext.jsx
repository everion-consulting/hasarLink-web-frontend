import { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/apiServices";


const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null); 
  const [profileDetail, setProfileDetail] = useState(null); 
  const [loading, setLoading] = useState(true);

  const [favoriteCompanies, setFavoriteCompanies] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const res1 = await apiService.getProfile();
      if (res1.success) {
        setProfile(res1.data);
      }

      const res2 = await apiService.getProfileDetail();
      if (res2.success) {
        setProfileDetail(res2.data);

        setFavoriteCompanies(
          Array.isArray(res2.data.favorite_insurance_companies)
            ? res2.data.favorite_insurance_companies
            : []
        );
      }
    } catch (err) {
      console.error("Profil verileri yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCompanies = async () => {
    try {
      const res = await apiService.getAllInsuranceCompanies();
      if (res.success) {
        setAllCompanies(res.data);
      }
    } catch (err) {
      console.error("Şirket listesi alınamadı:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchAllCompanies();
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        profileDetail,
        favoriteCompanies,
        allCompanies,
        loading,

        fetchProfile,
        fetchAllCompanies,
        setFavoriteCompanies,
        setProfileDetail,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
