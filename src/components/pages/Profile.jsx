// src/components/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import "../../styles/profile.css";
import { Bell, Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import apiService from "../../services/apiServices";
import { useProfile } from "../../context/ProfileContext";
import userIcon from "../../assets/images/kullanıcı.svg";
import userBackground from "../../assets/images/userBackground.svg";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const {
        profile,
        profileDetail,
        allCompanies,
        loading,
        fetchProfile,
        fetchAllCompanies
    } = useProfile();
    const favoriteCompanies = profileDetail?.favorite_insurance_companies || [];
    console.log("favoriteCompanies:", favoriteCompanies);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

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

        console.log("🔍 BACKEND RESPONSE:", response);

        // Hata mesajını yakalamak için geniş kapsamlı kontrol
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

        // Eğer backend yeni token dönerse:
        if (response.data?.token) {
            localStorage.setItem("authToken", response.data.token);
        }
    };


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


    useEffect(() => {
        fetchProfile();
        fetchAllCompanies();
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
            if (res.success) setFileNotifications(res.data.results);
        };
        getFiles();
    }, []);

    const handleUploadAvatar = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const form = new FormData();
        form.append("avatar", file);

        const res = await apiService.uploadAvatar(form);
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

    if (loading) return <div className="loading">Yükleniyor...</div>;

    return (
        <div className="profile-page">

            <div className="profile-bg"></div>

            <div className="profile-main-card fade-in">
                <label className="avatar-circle">
                    {profileDetail?.avatar ? (
                        <img src={profileDetail.avatar} alt="avatar" className="avatar-img" />
                    ) : (
                        <div className="avatar-upload-text">
                            <img className="userBg" src={userBackground} alt="User arkaplan" />
                            <img className="userIcon" src={userIcon} alt="Kullanıcı resim" />
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleUploadAvatar} />
                </label>

                <div className="profile-info">
                    <h2>{profileDetail?.repair_fullname || "Kullanıcı"}</h2>
                    <p className="email">{profile?.email}</p>
                </div>
            </div>

            <div className="profile-grid">

                <div className="card">
                    <h3 className="card-title">HESAP BİLGİLERİ</h3>
                    <p>{profile?.email}</p>
                    <a className="mini-link" onClick={() => setPasswordModalOpen(true)}>
                        Şifreyi değiştir
                    </a>

                </div>

                <div className="card">
                    <div className="card-title-row">
                        <h3 className="card-title">SERVİS BİLGİLERİ</h3>
                        <a className="mini-link" onClick={() => {
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

                    <p>{profileDetail?.repair_fullname}</p>
                    <p>{profileDetail?.repair_phone}</p>
                    <p>{profileDetail?.repair_city} / {profileDetail?.repair_state}</p>
                    <p>{profileDetail?.repair_address}</p>
                </div>

                <div className="card">
                    <div className="card-title-row">
                        <h3 className="card-title">FAVORİ SİGORTA ŞİRKETLERİM</h3>
                        <a className="mini-link">Düzenle</a>
                    </div>

                    <div className="insurer-logos">
                        {favoriteCompanies?.length === 0 && (
                            <p className="no-favorites">Favori şirket yok</p>
                        )}

                        {favoriteCompanies?.map((id) => {
                            const comp = allCompanies?.find((c) => c.id === id);
                            return (
                                <img
                                    key={id}
                                    src={comp?.photo}
                                    alt={comp?.name}
                                    className="insurer-logo"
                                />
                            );
                        })}
                    </div>
                </div>

                <div className="card">
                    <div className="card-title-row">
                        <h3 className="card-title">DOSYA BİLDİRİMLERİM</h3>
                        <a className="mini-link">Hepsini Gör</a>
                    </div>

                    <div className="file-status-row">
                        {fileNotifications.slice(0, 4).map((item) => (
                            <div key={item.id} className="file-status-box">
                                {getStatusIcon(item.status)}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 className="card-title">İSTATİSTİKLER</h3>

                    {loadingStats ? (
                        <p>Yükleniyor...</p>
                    ) : statistics ? (
                        <div className="stats">
                            <p><strong>{statistics.counts.total}</strong> Toplam Dosya</p>
                            <p><strong>{statistics.counts.pending}</strong> Onay Bekleyen</p>
                            <p><strong>{statistics.counts.in_progress}</strong> Onaylanan</p>
                            <p><strong>{statistics.counts.rejected}</strong> Reddedilen</p>
                        </div>
                    ) : (
                        <p>Veri bulunamadı</p>
                    )}
                </div>

            </div>

            <div className="bottom-button-container">
                <button
                    className="back-home-btn"
                    onClick={() => navigate("/")}
                >
                    ANASAYFAYA DÖN →
                </button>
            </div>

            {editModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-card">

                        <h2 className="modal-title">Servis Bilgilerini Düzenle</h2>

                        <div className="modal-form">

                            {/* Tek kolon */}
                            <label>Ad Soyad</label>
                            <input
                                type="text"
                                value={form.repair_fullname}
                                onChange={(e) => setForm({ ...form, repair_fullname: e.target.value })}
                            />

                            {/* İKİLİ GRID */}
                            <div className="form-row-2">
                                <div>
                                    <label>Telefon</label>
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

                            {/* Tek kolon */}
                            <label>Doğum Tarihi</label>
                            <input
                                type="date"
                                value={form.repair_birth_date}
                                onChange={(e) => setForm({ ...form, repair_birth_date: e.target.value })}
                            />

                            <label>T.C. Kimlik No</label>
                            <input
                                type="text"
                                value={form.repair_tc}
                                onChange={(e) => setForm({ ...form, repair_tc: e.target.value })}
                            />

                            {/* Tek kolon */}
                            <label>Servis Adı</label>
                            <input
                                type="text"
                                value={form.service_name}
                                onChange={(e) => setForm({ ...form, service_name: e.target.value })}
                            />

                            {/* İKİLİ GRID */}
                            <div className="form-row-2">
                                <div>
                                    <label>Servis Şehir</label>
                                    <input
                                        type="text"
                                        value={form.service_city}
                                        onChange={(e) => setForm({ ...form, service_city: e.target.value })}
                                    />
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

                            {/* Tek kolon */}
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

                            <div className="modal-buttons">
                                <button className="btn-cancel" onClick={() => setEditModalOpen(false)}>
                                    İptal
                                </button>

                                <button
                                    className="btn-save"
                                    onClick={async () => {
                                        const res = await apiService.updateProfileDetail(form);
                                        if (res.success) {
                                            await fetchProfile();
                                            setEditModalOpen(false);
                                            alert("Servis bilgileri güncellendi!");
                                        } else {
                                            alert("Güncelleme başarısız!");
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

            {passwordModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-card">

                        <h2 className="modal-title">Şifre Değiştir</h2>

                        <div className="modal-form">

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

                            <div className="modal-buttons">
                                <button className="btn-cancel" onClick={() => setPasswordModalOpen(false)}>
                                    İptal
                                </button>

                                <button
                                    className="btn-save"
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
