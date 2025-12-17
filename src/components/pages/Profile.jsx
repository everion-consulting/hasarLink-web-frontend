// src/components/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import styles from "../../styles/profile.module.css";
import { Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import apiService from "../../services/apiServices";
import { useProfile } from "../../context/ProfileContext";
import userIcon from "../../assets/images/kullanıcı.svg";
import userBackground from "../../assets/images/profile-ellipse.svg";
import { useNavigate } from "react-router-dom";
import {
    Mail, KeyRound, User, Phone, MapPin, Building2
} from "lucide-react";
import RightIcon from "../../components/images/rightIcon.svg";


export default function Profile() {
    const {
        profileData: profile,
        profileDetail,
        allCompaniesList,
        loading,
        fetchProfile,
        fetchAllCompanies
    } = useProfile();

    const favoriteCompanies = profileDetail?.favorite_insurance_companies || [];

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [form, setForm] = useState({
        repair_fullname: "",
        repair_phone: "",
        repair_city: "",
        repair_state: "",
        repair_address: "",
        repair_birth_date: "",
        repair_tc: "",
        repair_area_code: "",
        service_name: "",
        service_city: "",
        service_state: "",
        service_address: "",
        service_tax_no: "",
    });

    const [statistics, setStatistics] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [fileNotifications, setFileNotifications] = useState([]);
    const navigate = useNavigate();
    const [cityOptions, setCityOptions] = useState([]);

    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "" });
        }, 3000);
    };

    const truncateText = (text, maxLength = 17) => {
        if (!text) return "";
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    const handlePasswordChange = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Tüm alanları doldurun");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Şifreler eşleşmiyor");
            return;
        }

        const response = await apiService.changePassword(
            currentPassword,
            newPassword,
            confirmPassword
        );

        const backendError =
            response.data?.detail ||
            response.data?.message ||
            Object.values(response.data || {})[0]?.[0];

        if (!response.success) {
            alert(backendError || "Hata");
            return;
        }

        alert("Şifre başarıyla değişti!");
        setPasswordModalOpen(false);

        if (response.data?.token) {
            localStorage.setItem("authToken", response.data.token);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchAllCompanies();
    }, []);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                let allCities = [];
                let currentUrl = null;
                
                const res = await apiService.getCities();
                
                if (res?.data?.results) {
                    allCities = [...res.data.results];
                    currentUrl = res.data.next;
                    while (currentUrl) {
                        const nextRes = await apiService.getCities(currentUrl);
                        if (nextRes?.data?.results) {
                            allCities = [...allCities, ...nextRes.data.results];
                            currentUrl = nextRes.data.next;
                        } else {
                            break;
                        }
                    }
                } else {
                    allCities = res?.data || [];
                }
                
                const options = allCities.map((city) => ({
                    label: city.name,
                    value: city.name,
                }));
                setCityOptions(options);
            } catch (err) {
                console.error('❌ Şehir verileri alınamadı:', err);
                setCityOptions([]);
            }
        };
        fetchCities();
    }, []);

    useEffect(() => {
        const getStats = async () => {
            try {
                const res = await apiService.getUserStatistics();
                if (res.success) setStatistics(res.data.data);
            } catch (err) {
                console.error("İstatistik hatası:", err);
            } finally {
                setLoadingStats(false);
            }
        };
        getStats();
    }, []);

    useEffect(() => {
        const getFiles = async () => {
            const res = await apiService.getAllSubmissions();
            if (res.success) {
                const notifications = res.data?.results || res.data || [];
                setFileNotifications(notifications);
            } else {
                console.error("Dosya Bildirimleri Çekilmedi:", res);
            }
        };
        getFiles();
    }, []);

    const handleUploadAvatar = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("avatar", file);

        const res = await apiService.uploadAvatar(formData);
        if (res.success) {
            fetchProfile();
            alert("Profil fotoğrafı güncellendi!");
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "PENDING":
                return <Clock size={24} color="#facc15" />;
            case "IN_PROGRESS":
                return <CheckCircle size={24} color="#22c55e" />;
            case "REJECTED":
                return <XCircle size={24} color="#ef4444" />;
            default:
                return <FileText size={24} color="#6b7280" />;
        }
    };

    if (loading) return <div className={styles.loading}>Yükleniyor...</div>;

    return (
        <div className={styles.profilePage}>

            {/* 🔔 Toast Notification */}
            {toast.show && (
                <div className={`${styles.toast} ${styles[toast.type]}`}>
                    {toast.type === "success" ? "✓" : "✕"} {toast.message}
                </div>
            )}

            <div className={styles.profileBackground}></div>

            {/* ÜST PROFİL KARTI */}
            <div className={`${styles.profileMainCard} ${styles.fadeIn}`}>
                <label className={styles.avatarCircle}>
                    {profileDetail?.avatar ? (
                        <img src={profileDetail.avatar} alt="avatar" className={styles.avatarImg} />
                    ) : (
                        <div className={styles.avatarUploadText}>
                            <img className={styles.userBg} src={userBackground} alt="BG" />
                            <img className={styles.userIcon} src={userIcon} alt="User" />
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleUploadAvatar} />
                </label>

                <div className={styles.profileInfo}>
                    <h2>{profileDetail?.repair_fullname || "Kullanıcı"}</h2>
                    <p className={styles.email}>{profile?.email}</p>
                </div>
            </div>

            {/* GRID */}
            <div className={styles.profileGrid}>
                {/* HESAP BİLGİLERİ */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>HESAP BİLGİLERİ</h3>

                    <div className={styles.infoRow}>
                        <Mail size={22} strokeWidth={1.75} className={styles.infoIcon} />
                        <p className={styles.infoText}>{profile?.email}</p>
                    </div>

                    <div className={styles.rowDivider}></div>

                    <div className={styles.infoRow}>
                        <KeyRound size={22} strokeWidth={1.75} className={styles.infoIcon} />
                        <span className={styles.infoText}>Şifreyi Gör</span>

                        <a
                            className={styles.editLink}
                            onClick={() => setPasswordModalOpen(true)}
                        >
                            Şifreyi değiştir
                        </a>
                    </div>
                </div>

                {/* SERVİS BİLGİLERİ */}
                <div className={styles.card}>
                    <div className={styles.cardTitleRow}>
                        <h3 className={styles.cardTitle}>SERVİS BİLGİLERİ</h3>
                        <a className={styles.editLink} onClick={() => {
                            setForm({
                                repair_fullname: profileDetail?.repair_fullname || "",
                                repair_phone: profileDetail?.repair_phone || "",
                                repair_city: profileDetail?.repair_city || "",
                                repair_state: profileDetail?.repair_state || "",
                                repair_address: profileDetail?.repair_address || "",
                                repair_birth_date: profileDetail?.repair_birth_date || "",
                                repair_tc: profileDetail?.repair_tc || "",
                                repair_area_code: profileDetail?.repair_area_code || "",
                                service_name: profileDetail?.service_name || "",
                                service_city: profileDetail?.service_city || "",
                                service_state: profileDetail?.service_state || "",
                                service_address: profileDetail?.service_address || "",
                                service_tax_no: profileDetail?.service_tax_no || "",
                            });
                            setEditModalOpen(true);
                        }}>
                            Düzenle
                        </a>
                    </div>

                    <div className={styles.row}><User size={20} /><p>{profileDetail?.repair_fullname}</p></div>
                    <div className={styles.row}><Phone size={20} /><p>{profileDetail?.repair_phone}</p></div>
                    <div className={styles.row}><MapPin size={20} /><p>{truncateText(profileDetail?.service_city, 10)} / {truncateText(profileDetail?.service_state, 10)}</p></div>
                    <div className={styles.row}><Building2 size={20} /><p>{truncateText(profileDetail?.service_address, 17)}</p></div>
                </div>


                {/* FAVORİ ŞİRKETLER */}
                <div className={styles.card}>
                    <div className={styles.cardTitleRow}>
                        <h3 className={styles.cardTitle}>FAVORİ SİGORTA ŞİRKETLERİM</h3>
                        <a className={styles.editLink} onClick={() => navigate("/edit-favorites")}>Düzenle</a>
                    </div>

                    <div className={styles.insurerLogos}>
                        {favoriteCompanies.length === 0 && (
                            <p className={styles.noFavorites}>Favori şirket yok</p>
                        )}

                        {favoriteCompanies.slice(0, 6).map((id) => {
                            const comp = allCompaniesList?.find(c => c.id === id);
                            if (!comp) return null;

                            return (
                                <img
                                    key={id}
                                    src={comp.photo}
                                    alt={comp.name}
                                    className={styles.insurerLogo}
                                />
                            );
                        })}
                    </div>
                </div>


                {/* DOSYA BİLDİRİMLERİ */}
                <div className={styles.card}>
                    <div className={styles.cardTitleRow}>
                        <h3 className={styles.cardTitle}>DOSYA BİLDİRİMLERİM</h3>
                        <a className={styles.editLink} onClick={() => navigate("/file-notifications")}>Hepsini Gör</a>
                    </div>

                    <div className={`${styles.fileStatusRow} ${styles['count-' + Math.min((fileNotifications || []).slice(0, 8).length, 8)]}`}>
                        {(fileNotifications || []).slice(0, 8).map((item) => (
                            <div key={item.id} className={styles.fileStatusBox}>
                                {getStatusIcon(item.status)}
                            </div>
                        ))}
                    </div>
                </div>


                {/* İSTATİSTİKLER */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>İSTATİSTİKLER</h3>

                    {loadingStats ? (
                        <p>Yükleniyor...</p>
                    ) : statistics ? (
                        <div className={styles.stats}>
                            <p><strong>{statistics?.counts?.total}</strong> Toplam Dosya</p>
                            <p><strong>{statistics?.counts?.pending}</strong> Onay Bekleyen</p>
                            <p><strong>{statistics?.counts?.in_progress}</strong> Onaylanan</p>
                            <p><strong>{statistics?.counts?.rejected}</strong> Reddedilen</p>
                        </div>
                    ) : (
                        <p>Veri bulunamadı</p>
                    )}
                </div>

            </div>

            {/* Geri dön butonu */}
            <div className={styles.bottomButtonContainer}>
                <button className={styles.backBtn} onClick={() => navigate("/")}>
                    ANASAYFAYA DÖN
                    <span className={styles.contactBtnIcon}>
                        <img src={RightIcon} alt="Geri" />
                    </span>
                </button>
            </div>

            {/* Modal 1 */}
            {editModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalCard}>
                        <h2 className={styles.modalTitle}>Servis Bilgilerini Düzenle</h2>

                        <div className={styles.modalForm}>

                            <label>Usta Adı Soyadı</label>
                            <input
                                type="text"
                                value={form.repair_fullname}
                                onChange={(e) => setForm({ ...form, repair_fullname: e.target.value })}
                            />

                            <div className={styles.formRow2}>
                                <div>
                                    <label>Usta Telefon No</label>
                                    <input
                                        type="text"
                                        value={form.repair_phone}
                                        onChange={(e) => setForm({ ...form, repair_phone: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label>Bölge Kodu</label>
                                    <input
                                        type="text"
                                        value={form.repair_area_code}
                                        onChange={(e) => setForm({ ...form, repair_area_code: e.target.value })}
                                    />
                                </div>
                            </div>

                            <label>Usta Doğum Tarihi</label>
                            <input
                                type="date"
                                value={form.repair_birth_date}
                                onChange={(e) => setForm({ ...form, repair_birth_date: e.target.value })}
                            />

                            <label>Usta Kimlik No</label>
                            <input
                                type="text"
                                value={form.repair_tc}
                                onChange={(e) => setForm({ ...form, repair_tc: e.target.value })}
                            />

                            <label>Servis Adı</label>
                            <input
                                type="text"
                                value={form.service_name}
                                onChange={(e) => setForm({ ...form, service_name: e.target.value })}
                            />

                            <div className={styles.formRow2}>
                                <div>
                                    <label>Servis Şehir</label>
                                    <select
                                        value={form.service_city}
                                        onChange={(e) => setForm({ ...form, service_city: e.target.value })}
                                        className={styles.selectInput}
                                    >
                                        <option value="">Şehir Seçin</option>
                                        {cityOptions.map((city) => (
                                            <option key={city.value} value={city.value}>
                                                {city.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>Servis İlçe</label>
                                    <input
                                        type="text"
                                        value={form.service_state}
                                        onChange={(e) => setForm({ ...form, service_state: e.target.value })}
                                    />
                                </div>
                            </div>

                            <label>Servis Adres</label>
                            <textarea
                                value={form.service_address}
                                onChange={(e) => setForm({ ...form, service_address: e.target.value })}
                            ></textarea>

                            <label>Vergi No</label>
                            <input
                                type="text"
                                value={form.service_tax_no}
                                onChange={(e) => setForm({ ...form, service_tax_no: e.target.value })}
                            />

                            <div className={styles.modalButtons}>
                                <button className={styles.btnCancel} onClick={() => setEditModalOpen(false)}>
                                    İptal
                                </button>

                                <button
                                    className={styles.btnSave}
                                    onClick={async () => {
                                        const res = await apiService.updateProfileDetail(form);
                                        if (res.success) {
                                            await fetchProfile();
                                            setEditModalOpen(false);
                                            showToast("Servis bilgileri güncellendi!", "success");
                                        } else {
                                            setEditModalOpen(false);
                                            showToast("Güncelleme başarısız!", "error");
                                        }
                                    }}
                                >
                                    Kaydet
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Modal 2 */}
            {passwordModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalCard}>
                        <h2 className={styles.modalTitle}>Şifre Değiştir</h2>

                        <div className={styles.modalForm}>
                            <label>Mevcut Şifre</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />

                            <label>Yeni Şifre</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />

                            <label>Yeni Şifre (Tekrar)</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />

                            <div className={styles.modalButtons}>
                                <button className={styles.btnCancel} onClick={() => setPasswordModalOpen(false)}>
                                    İptal
                                </button>

                                <button
                                    className={styles.btnSave}
                                    onClick={handlePasswordChange}
                                >
                                    Kaydet
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}