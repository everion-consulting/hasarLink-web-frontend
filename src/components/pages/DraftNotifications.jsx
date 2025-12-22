import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from "lucide-react";
import styles from '../../styles/DraftNotifications.module.css';
import apiService from '../../services/apiServices';
import Pagination from '../pagination/Pagination';
import FilterSection from '../filter/FilterSection';

const DraftNotifications = () => {
    const [drafts, setDrafts] = useState([]);
    const [selectedDraft, setSelectedDraft] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedDate, setSelectedDate] = useState('');

    // GENEL ARAMA FİLTRESİ
    const [searchText, setSearchText] = useState('');

    const itemsPerPage = 20;
    const navigate = useNavigate();

    // Türkçe karakter normalize fonksiyonu
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
    }, [currentPage, selectedDate, searchText]); // searchText eklendi

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
            const response = await apiService.getDraftDetail(draft.id);
            const draftDetail = response.data;

            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return dateStr;
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                    const [year, month, day] = dateStr.split('-');
                    return `${day}.${month}.${year}`;
                }
                return dateStr;
            };

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
                    draftId: draftDetail.id, 
                    startStep: nextStep,
                    selectedCompany: {
                        id: draftDetail.insurance_company,
                        name: draftDetail.insurance_company_name,
                    },
                    samePerson: draftDetail.is_driver_victim_same,
                    insuranceSource: draftDetail.insurance_source,
                    kazaNitelik: draftDetail.nature_new,
                    karsiSamePerson:
                        draftDetail.is_insured_opposing_driver_same === true ? true :
                            draftDetail.is_insured_opposing_driver_same === false ? false :
                                null,


                    driverData: {
                        driver_fullname: draftDetail.driver_fullname,
                        driver_tc: draftDetail.driver_tc,
                        driver_mail: draftDetail.driver_mail,
                        driver_phone: draftDetail.driver_phone,
                        driver_birth_date: formatDate(draftDetail.driver_birth_date),
                    },

                    victimData: {
                        victim_fullname: draftDetail.victim_fullname,
                        victim_tc: draftDetail.victim_tc,
                        victim_mail: draftDetail.victim_mail,
                        victim_phone: draftDetail.victim_phone,
                        victim_birth_date: formatDate(draftDetail.victim_birth_date),
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
                        insured_birth_date: formatDate(draftDetail.insured_birth_date),
                        insured_plate: draftDetail.insured_plate,
                        insured_file_no: draftDetail.insured_file_no,
                    },

                    mechanicData: {
                        repair_fullname: draftDetail.repair_fullname,
                        repair_birth_date: formatDate(draftDetail.repair_birth_date),
                        repair_tc: draftDetail.repair_tc,
                        repair_phone: draftDetail.repair_phone,
                        repair_city: draftDetail.service_city,
                        repair_state_city_city: draftDetail.service_state_city_city,
                        repair_address: draftDetail.repair_address,
                    },

                    serviceData: {
                        repair_fullname: draftDetail.repair_fullname,
                        repair_birth_date: formatDate(draftDetail.repair_birth_date),
                        repair_tc: draftDetail.repair_tc,
                        repair_phone: draftDetail.repair_phone,
                        service_name: draftDetail.service_name,
                        service_tax_no: draftDetail.service_tax_no,
                        service_phone: draftDetail.service_phone,
                        service_city: draftDetail.service_city,
                        service_state_city_city: draftDetail.service_state_city_city,
                        service_address: draftDetail.service_address,
                        service_iban: draftDetail.service_iban,
                        service_iban_name: draftDetail.service_iban_name,
                    },

                    opposingDriverData: {
                        opposing_driver_fullname: draftDetail.opposing_driver_fullname,
                        opposing_driver_tc: draftDetail.opposing_driver_tc,
                        opposing_driver_phone: draftDetail.opposing_driver_phone,
                        opposing_driver_mail: draftDetail.opposing_driver_mail,
                        opposing_driver_birth_date: formatDate(draftDetail.opposing_driver_birth_date),
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
            <FilterSection
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                searchText={searchText}
                setSearchText={setSearchText}
                onFilter={handleFilterChange}
                onClear={handleClearFilters}
            />

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

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
            />

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