import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from "lucide-react";
import styles from './DraftNotifications.module.css';
import apiService from '../../services/apiServices';

const DraftNotifications = () => {
    const [drafts, setDrafts] = useState([]);
    const [selectedDraft, setSelectedDraft] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedDate, setSelectedDate] = useState('');

    // 🔥 GENEL ARAMA FİLTRESİ
    const [searchText, setSearchText] = useState('');

    const itemsPerPage = 20;
    const navigate = useNavigate();

    // 🔥 Türkçe karakter normalize fonksiyonu
    const normalize = (str) =>
        str
            ?.toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/ı/g, "i")
            .replace(/ğ/g, "g")
            .replace(/ü/g, "u")
            .replace(/ş/g, "s")
            .replace(/ö/g, "o")
            .replace(/ç/g, "c");

    useEffect(() => {
        fetchDraftsData(currentPage);
    }, [currentPage, selectedDate, searchText]); // 🔥 searchText eklendi

    const fetchDraftsData = async (page) => {
        try {
            const response = await apiService.getDrafts(page, null, null);
            const raw = response.data ?? response;

            let allDrafts = [];
            let backendCount = 0;
            let isBackendPaginated = false;

            if (Array.isArray(raw)) {
                allDrafts = raw;
                backendCount = raw.length;
            } else {
                if (Array.isArray(raw.results)) {
                    allDrafts = raw.results;
                    backendCount = typeof raw.count === "number" ? raw.count : raw.results.length;
                    isBackendPaginated = true;
                } else if (Array.isArray(raw.queryset)) {
                    allDrafts = raw.queryset;
                    backendCount = raw.queryset.length;
                } else {
                    allDrafts = [];
                    backendCount = 0;
                }
            }

            let filtered = allDrafts;

            // 🔥 TARİH FİLTRESİ
            if (selectedDate) {
                filtered = filtered.filter((draft) => {
                    const draftDate = draft.created_at?.slice(0, 10);
                    return draftDate === selectedDate;
                });
            }

            // 🔥 GENEL ARAMA FİLTRESİ
            if (searchText.trim() !== "") {
                const n = normalize(searchText);

                filtered = filtered.filter((draft) => {
                    const combined = normalize(
                        `${draft.vehicle_plate} ${draft.accident_date} ${draft.insurance_company_name} ${draft.created_at}`
                    );
                    return combined.includes(n);
                });
            }

            const totalForPagination = (selectedDate || searchText)
                ? filtered.length
                : backendCount || filtered.length;

            if (isBackendPaginated) {
                setDrafts(filtered);
                setTotalCount(totalForPagination);
                setTotalPages(Math.ceil(totalForPagination / itemsPerPage));
            } else {
                const startIndex = (page - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const pageItems = filtered.slice(startIndex, endIndex);

                setDrafts(pageItems);
                setTotalCount(totalForPagination);
                setTotalPages(Math.ceil(totalForPagination / itemsPerPage));
            }
        } catch (error) {
            console.error("Taslaklar alınırken hata:", error);
            setDrafts([]);
            setTotalCount(0);
            setTotalPages(1);
        }
    };

    const handleFilterChange = () => {
        setCurrentPage(1);
        fetchDraftsData(1);
    };

    const handleClearFilters = () => {
        setSelectedDate('');
        setSearchText(''); // 🔥 Genel arama reset
        setCurrentPage(1);
    };

    const handleDelete = async (draftId) => {
        try {
            await apiService.deleteDraft(draftId);
            setDrafts(drafts.filter((draft) => draft.id !== draftId));
            setShowModal(false);
            fetchDraftsData(currentPage);
        } catch (error) {
            console.error("Taslak silinirken hata:", error);
        }
    };

    const handleContinue = async (draft) => {
        try {
            const response = await apiService.getDraft(draft.id);
            const draftDetail = response.data;

            let nextStep = 1;

            if (
                draftDetail.driver_fullname &&
                draftDetail.victim_fullname &&
                draftDetail.vehicle_plate
            ) {
                nextStep = 2;
            }

            if (
                draftDetail.insured_fullname &&
                draftDetail.service_name &&
                draftDetail.repair_fullname
            ) {
                nextStep = 3;
            }

            if (draftDetail.damage_type && draftDetail.accident_date) {
                nextStep = 4;
            }

            navigate('/step-info', {
                state: {
                    fromDraft: true,
                    startStep: nextStep,
                    selectedCompany: {
                        id: draftDetail.insurance_company,
                        name: draftDetail.insurance_company_name,
                    },
                    samePerson: draftDetail.is_driver_victim_same,
                    insuranceSource: draftDetail.insurance_source,

                    driverData: {
                        driver_fullname: draftDetail.driver_fullname,
                        driver_tc: draftDetail.driver_tc,
                        driver_mail: draftDetail.driver_mail,
                        driver_phone: draftDetail.driver_phone,
                        driver_birth_date: draftDetail.driver_birth_date,
                    },

                    victimData: {
                        victim_fullname: draftDetail.victim_fullname,
                        victim_tc: draftDetail.victim_tc,
                        victim_mail: draftDetail.victim_mail,
                        victim_phone: draftDetail.victim_phone,
                        victim_birth_date: draftDetail.victim_birth_date,
                        victim_iban: draftDetail.victim_iban,
                        policy_no: draftDetail.policy_no,
                        insured_policy_no: draftDetail.insured_policy_no,
                        insuredCarDocNo: draftDetail.insured_car_doc_no,
                    },

                    vehicleData: {
                        vehicle_brand: draftDetail.vehicle_brand,
                        vehicle_type: draftDetail.vehicle_type,
                        vehicle_usage_type: draftDetail.vehicle_usage_type,
                        vehicle_model: draftDetail.vehicle_model,
                        vehicle_plate: draftDetail.vehicle_plate,
                        vehicle_license_no: draftDetail.vehicle_license_no,
                        vehicle_chassis_no: draftDetail.vehicle_chassis_no,
                        vehicle_engine_no: draftDetail.vehicle_engine_no,
                        vehicle_year: draftDetail.vehicle_year,
                    },

                    insuredData: {
                        insured_fullname: draftDetail.insured_fullname,
                        insured_policy_no: draftDetail.insured_policy_no,
                        insured_tc: draftDetail.insured_tc,
                        insured_phone: draftDetail.insured_phone,
                        insured_mail: draftDetail.insured_mail,
                        insured_birth_date: draftDetail.insured_birth_date,
                        insured_plate: draftDetail.insured_plate,
                    },

                    mechanicData: {
                        repair_fullname: draftDetail.repair_fullname,
                        repair_birth_date: draftDetail.repair_birth_date,
                        repair_tc: draftDetail.repair_tc,
                        repair_phone: draftDetail.repair_phone,
                        repair_city: draftDetail.service_city,
                        repair_state_city_city: draftDetail.service_state_city_city,
                        repair_address: draftDetail.repair_address,
                    },

                    serviceData: {
                        service_name: draftDetail.service_name,
                        service_tax_no: draftDetail.service_tax_no,
                        service_phone: draftDetail.service_phone,
                        service_city: draftDetail.service_city,
                        service_state_city_city: draftDetail.service_state_city_city,
                        service_address: draftDetail.service_address,
                        service_iban: draftDetail.service_iban,
                        service_iban_name: draftDetail.service_iban_name,
                    },

                    damageData: {
                        damage_type: draftDetail.damage_type,
                        damage_description: draftDetail.damage_description,
                        accident_date: draftDetail.accident_date,
                        accident_location: draftDetail.accident_location,
                        policy_no: draftDetail.policy_no,
                        estimated_damage_amount: draftDetail.estimated_damage_amount,
                        official_report_type: draftDetail.official_report_type,
                    },

                    documents: draftDetail.files || {},
                },
            });
        } catch (error) {
            console.error('Taslak tamamlanırken hata:', error);
            alert('Bir hata oluştu!');
        }
    };

    return (
        <div className={styles.draftNotifications}>
            <h1 className={styles.title}>Taslak Bildirimlerim</h1>

            {/* Filter Section */}
            <div className={styles.filterSection}>
                <div className={styles.filterRow}>

                    {/* TARİH FİLTRESİ */}
                    <div className={styles.filterGroup}>
                        <label htmlFor="selectedDate" className={styles.filterLabel}>
                            Tarih Seçin:
                        </label>

                        <div className={styles.inputWrapper}>
                            <input
                                type="date"
                                id="selectedDate"
                                className={styles.filterDate}
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 🔥 GENEL ARAMA FİLTRESİ */}
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Genel Arama:</label>

                        <div className={styles.inputWrapper}>
                            <input
                                type="text"
                                placeholder="Plaka, şirket, tarih..."
                                className={styles.filterDate}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* BUTTONS */}
                    <div className={styles.buttonGroup}>
                        <button
                            className={styles.filterButton}
                            onClick={handleFilterChange}
                            disabled={!selectedDate && !searchText}
                        >
                            Filtrele
                        </button>

                        <button
                            className={styles.clearFilterButton}
                            onClick={handleClearFilters}
                            disabled={!selectedDate && !searchText}
                        >
                            Filtreyi Temizle
                        </button>
                    </div>
                </div>
            </div>

            {totalCount > 0 && (
                <p className={styles.totalCount}>
                    Toplam {totalCount} taslak bulundu.
                </p>
            )}

            {/* GRID LIST → KARTLAR */}
            <ul className={styles.gridWrapper}>
                {drafts.length > 0 ? (
                    drafts.map((draft) => (
                        <li key={draft.id} className={styles.draftItem}>
                            <div className={styles.draftTexts}>
                                <p className={styles.draftText}>
                                    <strong>Araç Plaka: </strong>{draft.vehicle_plate || "-"}
                                </p>
                                <p className={styles.draftText}>
                                    <strong>Kaza Tarihi: </strong>{draft.accident_date || "-"}
                                </p>
                                <p className={styles.draftText}>
                                    <strong>Sigorta Şirketi: </strong>{draft.insurance_company_name || "-"}
                                </p>
                                <p className={styles.draftText}>
                                    <strong>Oluşturulma: </strong>{draft.created_at?.slice(0, 10) || "-"}
                                </p>
                            </div>

                            {/* X Icon */}
                            <button
                                className={styles.closeButton}
                                onClick={() => {
                                    setSelectedDraft(draft);
                                    setShowModal(true);
                                }}
                            >
                                <XCircle size={20} />
                            </button>

                            <div className={styles.actions}>
                                <button
                                    className={styles.continueButton}
                                    onClick={() => handleContinue(draft)}
                                >
                                    TAMAMLA
                                </button>
                            </div>
                        </li>
                    ))
                ) : (
                    <p className={styles.noFileText}>Henüz taslak bildirim bulunmuyor.</p>
                )}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        className={styles.paginationButton}
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                    >
                        ← Önceki
                    </button>

                    <div className={styles.paginationInfo}>
                        Sayfa {currentPage} / {totalPages}
                    </div>

                    <button
                        className={styles.paginationButton}
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(totalPages, prev + 1)
                            )
                        }
                        disabled={currentPage === totalPages}
                    >
                        Sonraki →
                    </button>
                </div>
            )}

            {/* MODAL */}
            {showModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>Taslak Silinsin mi?</h2>
                        <p>Bu taslağı kalıcı olarak silmek istediğinize emin misiniz?</p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowModal(false)}
                            >
                                Vazgeç
                            </button>
                            <button
                                className={styles.deleteButton}
                                onClick={() => handleDelete(selectedDraft.id)}
                            >
                                Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DraftNotifications;