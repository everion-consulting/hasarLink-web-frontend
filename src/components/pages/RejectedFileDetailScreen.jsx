// src/screens/file/RejectedFileDetailScreen.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import apiService from "../../services/apiServices";
import submissionService from "../../services/submissionService";
import FancySelect from "../Dropdowns/FancySelect"
import "../../styles/rejectedFileDetailScreen.css";

const FILE_TYPES = [
    { id: "tutanak", title: "Anlaşmalı Tutanak" },
    { id: "magdur_arac_ruhsat", title: "Mağdur Araç Ruhsatı" },
    { id: "magdur_arac_ehliyet", title: "Mağdur Araç Ehliyeti" },
    { id: "sigortali_arac_ruhsat", title: "Karşı Sigortalı Araç Ruhsatı" },
    { id: "sigortali_arac_ehliyet", title: "Karşı Sigortalı Araç Ehliyeti" },
    { id: "fotograflar", title: "Olay Yeri Fotoğrafları" },
    { id: "diger", title: "Diğer Evraklar" },
];

const EDITABLE_KEYS = [
    // Dosya Bilgileri
    "insurance_company_name",
    "insurance_source",
    "is_driver_victim_same",
    // Sürücü
    "driver_fullname",
    "driver_tc",
    "driver_phone",
    "driver_mail",
    "driver_birth_date",
    // Mağdur
    "victim_fullname",
    "victim_tc",
    "victim_phone",
    "victim_mail",
    "victim_birth_date",
    "victim_iban",
    // Araç
    "vehicle_brand",
    "vehicle_model",
    "vehicle_type",
    "vehicle_plate",
    "vehicle_year",
    "vehicle_usage_type",
    "vehicle_license_no",
    "vehicle_chassis_no",
    "vehicle_engine_no",
    // Sigortalı
    "insured_fullname",
    "insured_tc",
    "insured_phone",
    "insured_mail",
    "insured_birth_date",
    "insured_policy_no",
    "insured_plate",
    "insured_file_no",
    // Tamirci
    "repair_fullname",
    "repair_birth_date",
    "repair_tc",
    "repair_phone",
    "repair_city",
    "repair_state_city_city",
    "repair_address",
    "repair_works",
    // Servis
    "service_name",
    "service_phone",
    "service_city",
    "service_state_city_city",
    "service_address",
    "service_iban",
    "service_iban_name",
    "service_tax_no",
    // Kaza
    "damage_type",
    "damage_description",
    "accident_date",
    "accident_location",
    "official_report_type",
    "estimated_damage_amount",
    "policy_no",
];

const toBoolean = (v) => {
    if (v === true || v === false) return v;
    if (typeof v === "string") {
        return ["true", "1", "evet", "yes", "on"].includes(v.toLowerCase());
    }
    return !!v;
};

const norm = (s) => String(s || "").toLowerCase().trim();

const RejectedFileDetailScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { submissionId } = useParams();

    const { rejectedFields: routeFields } = location.state || {};
    const id = submissionId;

    const [fileData, setFileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);

    // 🔴 Eksik / Hatalı alanlar
    const [errorFields, setErrorFields] = useState([]);

    const [dropdownData, setDropdownData] = useState({
        insurance_company_name: [],
        insurance_source: [],
        is_driver_victim_same: [],
    });

    const [sections, setSections] = useState(
        FILE_TYPES.map((f) => ({ id: f.id, title: f.title, images: [] }))
    );

    const fileInputRef = useRef(null);
    const [uploadContext, setUploadContext] = useState(null);

    // -------------------------------------------------------
    // Helpers
    // -------------------------------------------------------
    const normalizeForApi = (data) => {
        const out = {};

        for (const k of EDITABLE_KEYS) {
            if (!(k in data)) continue;
            const v = data[k];
            if (v === null || v === undefined || v === "") continue;

            // Sigorta şirketi => id
            if (k === "insurance_company_name") {
                const selected = dropdownData.insurance_company_name.find(
                    (opt) => opt.label === v || opt.value === v
                );
                if (selected && selected.id) out["insurance_company"] = selected.id;
                continue;
            }
            if (k === "insurance_source") {
                out["insurance_source"] = v;
                continue;
            }
            if (k === "is_driver_victim_same") {
                out["is_driver_victim_same"] = toBoolean(v);
                continue;
            }

            if (k === "vehicle_year" || k === "estimated_damage_amount") {
                const num = Number(v);
                if (!Number.isNaN(num)) out[k] = num;
                continue;
            }

            out[k] = v;
        }

        return out;
    };

    const getFileUrl = (f) => f?.file_url || f?.file?.url || f?.url || null;
    const getFileName = (f) =>
        f?.name || f?.filename || getFileUrl(f)?.split("/").pop() || "Dosya";
    const getUploadedAt = (f) =>
        (f?.uploaded_at || "").slice(0, 16).replace("T", " ");

    // 🔍 Bu alan hata mı?
    const isErrorField = (label, key) =>
        errorFields.some(
            (f) => norm(f.key) === norm(key) || norm(f.label) === norm(label)
        );

    // Bu grupta en az 1 hatalı alan var mı?
    const groupHasAnyVisible = (pairs) =>
        pairs.some(
            ({ label, key }) => errorFields.length === 0 || isErrorField(label, key)
        );

    // -------------------------------------------------------
    // Dropdown verileri
    // -------------------------------------------------------
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const res = await apiService.getRejectedFirstStepDropdowns();
                const data = res?.data || {};

                setDropdownData({
                    insurance_company_name: (data.insurance_companies || []).map(
                        (opt) => ({
                            label: opt.name,
                            value: opt.name,
                            id: opt.id,
                        })
                    ),
                    insurance_source: (data.sources || []).map((opt) => ({
                        label: opt,
                        value: opt,
                    })),
                    is_driver_victim_same: (data.is_same || []).map((opt) => ({
                        label: opt === true ? "Evet" : "Hayır",
                        value: opt,
                    })),
                });
            } catch (e) {
                console.error(e);
                setDropdownData({
                    insurance_company_name: [],
                    insurance_source: [],
                    is_driver_victim_same: [],
                });
            }
        };

        fetchDropdowns();
    }, []);

    // -------------------------------------------------------
    // Dosya detayını çek
    // -------------------------------------------------------
    const fetchFileDetail = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const res = await apiService.getSubmissionDetail(id);
            if (!res.success) {
                window.alert(res.message || "Dosya detayı alınırken hata oluştu.");
                return;
            }
            setFileData(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFileDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const setPendingStatus = async () => {
        try {
            const res = await apiService.updateSubmission(id, { status: "PENDING" });
            if (!res.success) {
                window.alert(res.message || "Durum güncellenirken hata oluştu.");
                return false;
            }
            setFileData((prev) => ({ ...prev, status: res?.data?.status || "PENDING" }));
            await fetchFileDetail();
            return true;
        } catch (e) {
            console.error(e);
            window.alert("Durum güncellenemedi.");
            return false;
        }
    };

    // -------------------------------------------------------
    // 🔴 Eksik / Hatalı alanlar listesi (MOBİLDEKİYLE AYNI)
    // -------------------------------------------------------
    useEffect(() => {
        console.log("fileData.rejected_fields:", fileData?.rejected_fields);
        console.log("routeFields (from list):", routeFields);

        // 1) listeden gelen state
        // 2) backend detaydan gelen rejected_fields
        const fields =
            routeFields ??
            fileData?.rejected_fields ??
            [];

        console.log("fields used for errorFields:", fields);

        const names = (fields || []).map((f) => {
            if (typeof f === "string") return { key: f, label: f };
            return {
                key: f.name || f.field || f.label || "bilinmeyen",
                label: f.label || f.name || f.field || "Bilinmeyen Alan",
            };
        });

        setErrorFields(names);
    }, [fileData, routeFields]);


    // -------------------------------------------------------
    // Dosyaları kategorilere böl
    // -------------------------------------------------------
    useEffect(() => {
        if (!Array.isArray(fileData?.files)) {
            setSections(FILE_TYPES.map((f) => ({ id: f.id, title: f.title, images: [] })));
            return;
        }

        const grouped = FILE_TYPES.map((ft) => {
            const imgs = fileData.files
                .filter(
                    (x) =>
                        (x.file_type || "").replace(/\s+/g, "_") === ft.id ||
                        x.file_type === ft.id
                )
                .map((x) => ({
                    id: x.id,
                    url: getFileUrl(x),
                    raw: x,
                }));
            return { id: ft.id, title: ft.title, images: imgs };
        });

        setSections(grouped);
    }, [fileData]);

    // -------------------------------------------------------
    // Form değişiklikleri
    // -------------------------------------------------------
    const handleChange = (key, value) => {
        setFileData((prev) => ({ ...prev, [key]: value }));
    };

    const handleUpdate = async () => {
        if (!fileData) return;
        try {
            setUpdating(true);
            const payload = normalizeForApi(fileData);

            const res = await apiService.updateSubmission(id, payload);
            if (!res.success) {
                window.alert(res.message || "Dosya güncellenemedi.");
                return;
            }

            await setPendingStatus();
            await fetchFileDetail();

            window.alert("Dosya başarıyla güncellendi ✅");
            setEditMode(false);
            navigate("/reddedilen-dosyalar");
        } catch (e) {
            console.error(e);
            window.alert("Dosya güncellenemedi.");
        } finally {
            setUpdating(false);
        }
    };

    // -------------------------------------------------------
    // Upload / replace / delete
    // -------------------------------------------------------
    const triggerFileInput = (context) => {
        setUploadContext(context);
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileInputChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !uploadContext) return;
        e.target.value = "";

        const { action, sectionId, fileId } = uploadContext;
        setUploadContext(null);

        const form = new FormData();

        try {
            setUploading(true);

            if (action === "new") {
                form.append("submission", id);
                form.append("file_type", sectionId.replace(/_/g, " "));
                form.append("summary", sectionId);
                form.append("file", file);

                const res = await submissionService.uploadFile(form);
                if (!res.success) {
                    window.alert(res.message || "Dosya yüklenemedi.");
                    return;
                }
                await fetchFileDetail();
                await setPendingStatus();
                window.alert("Dosya eklendi.");
            }

            if (action === "replace" && fileId) {
                form.append("file_type", sectionId.replace(/_/g, " "));
                form.append("file", file);

                const res = await apiService.replaceFile(fileId, form);
                if (!res.success) {
                    window.alert(res.message || "Dosya değiştirilemedi.");
                    return;
                }
                await fetchFileDetail();
                await setPendingStatus();
                window.alert("Dosya değiştirildi.");
            }
        } catch (err) {
            console.error(err);
            window.alert("Dosya işlemi sırasında hata oluştu.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = (fileId) => {
        if (!window.confirm("Bu dosyayı silmek istiyor musunuz?")) return;

        (async () => {
            try {
                setUploading(true);
                const res = await submissionService.deleteFile(fileId);
                if (!res.success) {
                    window.alert(res.message || "Dosya silinemedi.");
                    return;
                }
                await fetchFileDetail();
                await setPendingStatus();
                window.alert("Dosya silindi.");
            } catch (e) {
                console.error(e);
                window.alert("Dosya silinemedi.");
            } finally {
                setUploading(false);
            }
        })();
    };

    // -------------------------------------------------------
    // Field renderer – SADECE hatalı alanları gösteren yapı
    // -------------------------------------------------------
    const renderField = (label, key, editable) => {
        const value = fileData?.[key] ?? "";
        const isErr = isErrorField(label, key);

        // Dropdown alanları
        // Dropdown alanları
        if (
            editMode &&
            editable &&
            ["insurance_company_name", "insurance_source", "is_driver_victim_same"].includes(
                key
            )
        ) {
            let options = dropdownData[key] || [];
            if (options.length && typeof options[0] === "string") {
                options = options.map((opt) => ({ label: opt, value: opt }));
            }

            const displayValue = value ?? "";

            // FancySelect değişim handler'ı
            const handleSelectChange = (val) => {
                // is_driver_victim_same backend’de boolean olabilir, ama FancySelect string de gönderebilir
                if (key === "is_driver_victim_same") {
                    // val true/false/"" gelebilir
                    handleChange(key, val);
                } else {
                    handleChange(key, val);
                }
            };

            return (
                <div
                    key={key}
                    className={"frd-info-row" + (isErr ? " frd-info-row--error" : "")}
                >
                    <div className="frd-info-label">{label}:</div>

                    <div style={{ flex: 1 }}>
                        <FancySelect
                            options={options}
                            value={displayValue}
                            onChange={handleSelectChange}
                            placeholder="Seçiniz"
                            isDisabled={false}
                            maxW="100%"
                        />
                    </div>
                </div>
            );
        }


        return (
            <div
                key={key}
                className={"frd-info-row" + (isErr ? " frd-info-row--error" : "")}
            >
                <div className="frd-info-label">{label}:</div>

                {editMode && editable ? (
                    <input
                        className={"frd-input" + (isErr ? " frd-input--error" : "")}
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                    />
                ) : (
                    <div
                        className={
                            "frd-info-value" + (isErr ? " frd-info-value--error" : "")
                        }
                    >
                        {key === "is_driver_victim_same"
                            ? value === true || value === "true"
                                ? "Evet"
                                : value === false || value === "false"
                                    ? "Hayır"
                                    : "-"
                            : value || "-"}
                    </div>
                )}
            </div>
        );
    };

    // 🔎 Hatalı değilse hiç render etme
    const renderFieldFiltered = (label, key, editable = true) => {
        if (errorFields.length > 0 && !isErrorField(label, key)) return null;
        return renderField(label, key, editable);
    };

    // Grup içinde en az 1 hatalı alan varsa grubu göster
    const renderGroup = (title, pairs) => {
        if (!groupHasAnyVisible(pairs)) return null;
        return (
            <div className="frd-group">
                <h3 className="frd-section-title">{title}</h3>
                {pairs.map(({ label, key }) => renderFieldFiltered(label, key, true))}
            </div>
        );
    };

    // -------------------------------------------------------
    // Loading / boş
    // -------------------------------------------------------
    if (loading) {
        return (
            <div className="screen-container-drive frd-loading-screen">
                <div className="frd-loading-spinner" />
                <p>Veriler yükleniyor...</p>
            </div>
        );
    }

    if (!fileData) {
        return (
            <div className="screen-container-drive frd-loading-screen">
                <p>Veri bulunamadı.</p>
                <button
                    type="button"
                    className="frd-btn frd-btn-light"
                    onClick={() => navigate(-1)}
                >
                    GERİ DÖN
                </button>
            </div>
        );
    }

    // -------------------------------------------------------
    // UI
    // -------------------------------------------------------
    return (
        <div className="screen-container-drive frd-screen">
            <div className="content-area frd-content-area">
                <button
                    type="button"
                    className="rejected-back"
                    onClick={() => navigate(-1)}
                >
                    ←
                </button>

                <h1 className="page-title frd-page-title">Dosya Detayı</h1>

                <div className="vehicle-form-card frd-card">
                    {/* 🔴 Eksik / Hatalı Alanlar kutusu */}
                    {errorFields.length > 0 && (
                        <div className="frd-error-box">
                            <div className="frd-error-title">Eksik / Hatalı Alanlar:</div>
                            <ul className="frd-error-list">
                                {errorFields.map((f, idx) => (
                                    <li key={idx}>• {f.label || f.key}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="frd-card-header">
                        <h2 className="frd-card-header-title">Bilgiler</h2>
                        <button
                            type="button"
                            className="frd-edit-btn"
                            onClick={() => setEditMode((prev) => !prev)}
                        >
                            {editMode ? "Düzenlemeyi Bitir" : "Düzenle"}
                        </button>
                    </div>

                    {/* 🔻 Bundan sonrası SADECE hatalı alanları gösterir */}
                    {renderGroup("Dosya Bilgileri", [
                        { label: "Sigorta Şirketi", key: "insurance_company_name" },
                        { label: "Sigorta Kaynağı", key: "insurance_source" },
                        { label: "Sürücü ve Mağdur Aynı mı", key: "is_driver_victim_same" },
                    ])}

                    {renderGroup("Sürücü Bilgileri", [
                        { label: "Ad Soyad", key: "driver_fullname" },
                        { label: "TC", key: "driver_tc" },
                        { label: "Telefon", key: "driver_phone" },
                        { label: "Mail", key: "driver_mail" },
                        { label: "Doğum Tarihi", key: "driver_birth_date" },
                    ])}

                    {renderGroup("Mağdur Bilgileri", [
                        { label: "Ad Soyad", key: "victim_fullname" },
                        { label: "TC", key: "victim_tc" },
                        { label: "Telefon", key: "victim_phone" },
                        { label: "Mail", key: "victim_mail" },
                        { label: "Doğum Tarihi", key: "victim_birth_date" },
                        { label: "IBAN", key: "victim_iban" },
                    ])}

                    {renderGroup("Araç Bilgileri", [
                        { label: "Marka", key: "vehicle_brand" },
                        { label: "Model", key: "vehicle_model" },
                        { label: "Tip", key: "vehicle_type" },
                        { label: "Plaka", key: "vehicle_plate" },
                        { label: "Yıl", key: "vehicle_year" },
                        { label: "Kullanım Tipi", key: "vehicle_usage_type" },
                        { label: "Ruhsat No", key: "vehicle_license_no" },
                        { label: "Şasi No", key: "vehicle_chassis_no" },
                        { label: "Motor No", key: "vehicle_engine_no" },
                    ])}

                    {renderGroup("Sigortalı Bilgileri", [
                        { label: "Ad Soyad", key: "insured_fullname" },
                        { label: "TC", key: "insured_tc" },
                        { label: "Telefon", key: "insured_phone" },
                        { label: "Mail", key: "insured_mail" },
                        { label: "Doğum Tarihi", key: "insured_birth_date" },
                        { label: "Poliçe No", key: "insured_policy_no" },
                        { label: "Plaka", key: "insured_plate" },
                        { label: "Dosya No", key: "insured_file_no" },
                    ])}

                    {renderGroup("Tamirci Bilgileri", [
                        { label: "Ad Soyad", key: "repair_fullname" },
                        { label: "Doğum Tarihi", key: "repair_birth_date" },
                        { label: "TC", key: "repair_tc" },
                        { label: "Telefon", key: "repair_phone" },
                        { label: "Şehir", key: "repair_city" },
                        { label: "İl/İlçe", key: "repair_state_city_city" },
                        { label: "Adres", key: "repair_address" },
                        { label: "Yapılan İşler", key: "repair_works" },
                    ])}

                    {renderGroup("Servis Bilgileri", [
                        { label: "Servis Adı", key: "service_name" },
                        { label: "Telefon", key: "service_phone" },
                        { label: "IBAN", key: "service_iban" },
                        { label: "IBAN Adı", key: "service_iban_name" },
                        { label: "Şehir", key: "service_city" },
                        { label: "İl/İlçe", key: "service_state_city_city" },
                        { label: "Adres", key: "service_address" },
                        { label: "Vergi No", key: "service_tax_no" },
                    ])}

                    {renderGroup("Kaza Bilgileri", [
                        { label: "Hasar Türü", key: "damage_type" },
                        { label: "Hasar Bölgesi", key: "damage_description" },
                        { label: "Kaza Tarihi", key: "accident_date" },
                        { label: "Kaza Yeri", key: "accident_location" },
                        { label: "Rapor Türü", key: "official_report_type" },
                        { label: "Tahmini Hasar", key: "estimated_damage_amount" },
                        { label: "Poliçe No", key: "policy_no" },
                    ])}

                    {/* Dosyalar kısmı aynı kalabilir */}
                    <div
                        className={
                            "frd-files-card" +
                            (!fileData.files || fileData.files.length === 0
                                ? " frd-files-card--empty"
                                : "")
                        }
                    >
                        <div className="frd-card-header frd-files-header">
                            <h2 className="frd-card-header-title">
                                {!fileData.files || fileData.files.length === 0
                                    ? "📁 Henüz Dosya Yüklenmemiş"
                                    : "Yüklenen Dosyalar"}
                            </h2>
                        </div>

                        {!editMode ? (
                            <>
                                {Array.isArray(fileData.files) && fileData.files.length > 0 ? (
                                    fileData.files.map((f, idx) => {
                                        const url = getFileUrl(f);
                                        return (
                                            <div
                                                key={f.id || `${idx}-${url}`}
                                                className="frd-file-row"
                                            >
                                                <div className="frd-file-main">
                                                    <div className="frd-file-name">
                                                        {getFileName(f)}
                                                    </div>
                                                    {getUploadedAt(f) && (
                                                        <div className="frd-file-date">
                                                            Yüklendi: {getUploadedAt(f)}
                                                        </div>
                                                    )}
                                                </div>
                                                {url && (
                                                    <a
                                                        className="frd-file-link"
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Aç / İndir
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="frd-no-files">
                                        Bu dosya için henüz hiçbir belge yüklenmemiş.
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                {sections.map((sec) => {
                                    const hasAny = sec.images.length > 0;
                                    const first = sec.images[0];

                                    return (
                                        <div
                                            key={sec.id}
                                            className={
                                                "frd-file-section" +
                                                (hasAny ? "" : " frd-file-section--empty")
                                            }
                                        >
                                            <div className="frd-file-section-header">
                                                <span>{sec.title}</span>
                                                {!hasAny && (
                                                    <span className="frd-file-badge">Eksik</span>
                                                )}
                                            </div>

                                            {hasAny ? (
                                                <div className="frd-file-current">
                                                    <span className="frd-file-name">
                                                        {getFileName(first.raw)}
                                                    </span>
                                                    {getUploadedAt(first.raw) && (
                                                        <span className="frd-file-date">
                                                            Yüklendi: {getUploadedAt(first.raw)}
                                                        </span>
                                                    )}
                                                    {first.url && (
                                                        <a
                                                            href={first.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="frd-file-link"
                                                        >
                                                            Aç / İndir
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="frd-no-files">
                                                    Bu kategori için dosya yok.
                                                </p>
                                            )}

                                            <div className="frd-file-actions">
                                                <button
                                                    type="button"
                                                    className="frd-btn frd-btn-primary"
                                                    disabled={uploading}
                                                    onClick={() =>
                                                        triggerFileInput({
                                                            action: "new",
                                                            sectionId: sec.id,
                                                        })
                                                    }
                                                >
                                                    {uploading ? "İşleniyor..." : "YÜKLE"}
                                                </button>

                                                {hasAny && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="frd-btn frd-btn-warning"
                                                            disabled={uploading}
                                                            onClick={() =>
                                                                triggerFileInput({
                                                                    action: "replace",
                                                                    sectionId: sec.id,
                                                                    fileId: first.id,
                                                                })
                                                            }
                                                        >
                                                            {uploading ? "İşleniyor..." : "DEĞİŞTİR"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="frd-btn frd-btn-danger"
                                                            disabled={uploading}
                                                            onClick={() => handleDeleteFile(first.id)}
                                                        >
                                                            {uploading ? "İşleniyor..." : "SİL"}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>

                    <div className="frd-footer-buttons">
                        {editMode && (
                            <button
                                type="button"
                                className="frd-btn frd-btn-primary frd-btn-full"
                                onClick={handleUpdate}
                                disabled={updating}
                            >
                                {updating ? "Güncelleniyor..." : "GÜNCELLE"}
                            </button>
                        )}

                        <button
                            type="button"
                            className="frd-btn frd-btn-light frd-btn-full"
                            onClick={() => navigate(-1)}
                        >
                            GERİ DÖN
                        </button>
                    </div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileInputChange}
                />
            </div>
        </div>
    );
};

export default RejectedFileDetailScreen;
