import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DraftNotifications.css';
import apiService from '../../services/apiServices';

const DraftNotifications = () => {
    const [drafts, setDrafts] = useState([]);
    const [selectedDraft, setSelectedDraft] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDraftsData = async () => {
            try {
                const response = await apiService.getDrafts();
                console.log("API'den gelen taslaklar:", response); // Yanıtı kontrol et
                setDrafts(Array.isArray(response.data?.results) ? response.data.results : []);
            } catch (error) {
                console.error("Taslaklar alınırken hata:", error);
                setDrafts([]);
            }
        };

        fetchDraftsData();
    }, []);

    const handleDelete = async (draftId) => {
        try {
            await apiService.deleteDraft(draftId);
            setDrafts(drafts.filter((draft) => draft.id !== draftId));
            setShowModal(false);
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
        <div className="draft-notifications">
            <h1>Taslak Bildirimlerim</h1>
            <ul>
                {drafts.length > 0 ? (
                    drafts.map((draft) => (
                        <li key={draft.id} className="draft-item">
                            <div>
                                <p>Araç Plaka: {draft.vehicle_plate || "-"}</p>
                                <p>Kaza Tarihi: {draft.accident_date || "-"}</p>
                                <p>Sigorta Şirketi: {draft.insurance_company_name || "-"}</p>
                                <p>Oluşturulma: {draft.created_at?.slice(0, 10) || "-"}</p>
                            </div>
                            <button
                                className="close-button"
                                onClick={() => {
                                    setSelectedDraft(draft);
                                    setShowModal(true);
                                }}
                            >
                                ×
                            </button>
                            <div className="actions">
                                <button className="continue-button" onClick={() => handleContinue(draft)}>TAMAMLA</button>
                            </div>
                        </li>
                    ))
                ) : (
                    <p>Henüz taslak bildirim bulunmuyor.</p>
                )}
            </ul>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Taslak Silinsin mi?</h2>
                        <p>Bu taslağı kalıcı olarak silmek istediğinize emin misiniz?</p>
                        <div className="modal-actions">
                            <button className="cancel-button" onClick={() => setShowModal(false)}>Vazgeç</button>
                            <button className="delete-button" onClick={() => handleDelete(selectedDraft.id)}>Sil</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DraftNotifications;