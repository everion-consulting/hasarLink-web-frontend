// src/screens/file/RejectedFileDetailScreen.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import apiService from "../../services/apiServices";
import submissionService from "../../services/submissionService";
import FancySelect from "../Dropdowns/FancySelect";
import { getIlName, getIlceName } from "../../constants/ilIlceData";
import styles from "../../styles/rejectedFileDetailScreen.module.css";

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
    "insurance_company_name","insurance_source","is_driver_victim_same",
    "driver_fullname","driver_tc","driver_phone","driver_mail","driver_birth_date",
    "victim_fullname","victim_tc","victim_phone","victim_mail","victim_birth_date","victim_iban",
    "vehicle_brand","vehicle_model","vehicle_type","vehicle_plate","vehicle_year","vehicle_usage_type",
    "vehicle_license_no","vehicle_chassis_no","vehicle_engine_no",
    "insured_fullname","insured_tc","insured_phone","insured_mail","insured_birth_date",
    "insured_policy_no","insured_plate","insured_file_no",
    "repair_fullname","repair_birth_date","repair_tc","repair_phone","repair_city",
    "repair_state_city_city","repair_address","repair_works",
    "service_name","service_phone","service_city","service_state_city_city",
    "service_address","service_iban","service_iban_name","service_tax_no",
    "damage_type","damage_description","accident_date","accident_location",
    "official_report_type","estimated_damage_amount","policy_no"
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

    // ---------------- NORMALIZE ----------------
    const normalizeForApi = (data) => {
        const out = {};
        for (const k of EDITABLE_KEYS) {
            if (!(k in data)) continue;
            const v = data[k];
            if (v === null || v === undefined || v === "") continue;

            if (k === "insurance_company_name") {
                const selected = dropdownData.insurance_company_name.find(
                    (opt) => opt.label === v || opt.value === v
                );
                if (selected?.id) out["insurance_company"] = selected.id;
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
            if (["vehicle_year","estimated_damage_amount"].includes(k)) {
                const num = Number(v);
                if (!isNaN(num)) out[k] = num;
                continue;
            }
            out[k] = v;
        }
        return out;
    };

    const getFileUrl = (f) => f?.file_url || f?.file?.url || f?.url || null;
    const getFileName = (f) => f?.name || f?.filename || getFileUrl(f)?.split("/").pop() || "Dosya";
    const getUploadedAt = (f) => (f?.uploaded_at || "").slice(0, 16).replace("T", " ");

    const isErrorField = (label, key) =>
        errorFields.some(
            (f) =>
                norm(f.key) === norm(key) ||
                norm(f.label) === norm(label)
        );

    const groupHasAnyVisible = (pairs) =>
        pairs.some(
            ({ label, key }) => errorFields.length === 0 || isErrorField(label, key)
        );

    // ---------------- Dropdowns ----------------
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const res = await apiService.getRejectedFirstStepDropdowns();
                const data = res?.data || {};

                setDropdownData({
                    insurance_company_name: (data.insurance_companies || []).map((opt) => ({
                        label: opt.name,
                        value: opt.name,
                        id: opt.id,
                    })),
                    insurance_source: (data.sources || []).map((opt) => ({
                        label: opt,
                        value: opt,
                    })),
                    is_driver_victim_same: (data.is_same || []).map((opt) => ({
                        label: opt ? "Evet" : "Hayır",
                        value: opt,
                    })),
                });
            } catch (e) {
                setDropdownData({
                    insurance_company_name: [],
                    insurance_source: [],
                    is_driver_victim_same: [],
                });
            }
        };
        fetchDropdowns();
    }, []);

    // ---------------- File Detail ----------------
    const fetchFileDetail = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const res = await apiService.getSubmissionDetail(id);
            if (!res.success) {
                alert(res.message || "Dosya detayı alınamadı.");
                return;
            }
            setFileData(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFileDetail();
    }, [id]);

    const setPendingStatus = async () => {
        try {
            const res = await apiService.updateSubmission(id,{status:"PENDING"});
            if (!res.success) return false;
            setFileData((p)=>({...p,status:"PENDING"}));
            await fetchFileDetail();
            return true;
        } catch {
            return false;
        }
    };

    // ---------------- Error Fields ----------------
    useEffect(() => {
        const fields = routeFields ?? fileData?.rejected_fields ?? [];
        const names = (fields || []).map((f) => {
            if (typeof f === "string") return { key: f, label: f };
            return {
                key: f.name || f.field || f.label || "bilinmeyen",
                label: f.label || f.name || f.field || "Bilinmeyen Alan",
            };
        });
        setErrorFields(names);
    }, [fileData, routeFields]);

    // ---------------- Section Images ----------------
    useEffect(() => {
        if (!Array.isArray(fileData?.files)) {
            setSections(FILE_TYPES.map((f)=>({id:f.id,title:f.title,images:[]})));
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

    // ---------------- Handle Change ----------------
    const handleChange = (key, value) => {
        setFileData((prev) => ({ ...prev, [key]: value }));
    };

    // ---------------- Update ----------------
    const handleUpdate = async () => {
        if (!fileData) return;
        try {
            setUpdating(true);
            const payload = normalizeForApi(fileData);
            const res = await apiService.updateSubmission(id,payload);

            if (!res.success) {
                alert(res.message || "Güncelleme başarısız.");
                return;
            }

            await setPendingStatus();
            await fetchFileDetail();

            alert("Dosya başarıyla güncellendi.");
            setEditMode(false);
            navigate("/reddedilen-dosyalar");
        } finally {
            setUpdating(false);
        }
    };

    // ---------------- Upload / Replace ----------------
    const triggerFileInput = (ctx) => {
        setUploadContext(ctx);
        fileInputRef.current?.click();
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
                    alert(res.message || "Dosya yüklenemedi.");
                    return;
                }
            }

            if (action === "replace") {
                form.append("file_type", sectionId.replace(/_/g, " "));
                form.append("file", file);

                const res = await apiService.replaceFile(fileId, form);
                if (!res.success) {
                    alert(res.message || "Dosya değiştirilemedi.");
                    return;
                }
            }

            await fetchFileDetail();
            await setPendingStatus();
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
                    alert(res.message || "Silme işlemi başarısız.");
                    return;
                }

                await fetchFileDetail();
                await setPendingStatus();
            } finally {
                setUploading(false);
            }
        })();
    };

    // ---------------- Render Field ----------------
    const CITY_KEYS = ["service_city", "repair_city", "accident_city"];
    const DISTRICT_KEYS = ["service_state_city_city", "repair_state_city_city", "service_state", "accident_district"];

    const resolveDisplayValue = (key, raw) => {
        if (!raw) return raw;
        if (CITY_KEYS.includes(key)) return getIlName(raw) || raw;
        if (DISTRICT_KEYS.includes(key)) return getIlceName(raw) || raw;
        return raw;
    };

    const renderField = (label, key, editable) => {
        const rawValue = fileData?.[key] ?? "";
        const value = resolveDisplayValue(key, rawValue);
        const isErr = isErrorField(label, key);

        if (
            editMode &&
            editable &&
            ["insurance_company_name","insurance_source","is_driver_victim_same"].includes(key)
        ) {
            let options = dropdownData[key] || [];
            if (options.length && typeof options[0] === "string") {
                options = options.map((o) => ({ label: o, value: o }));
            }

            return (
                <div
                    key={key}
                    className={`${styles.frdInfoRow} ${isErr ? styles.frdInfoRowError : ""}`}
                >
                    <div className={styles.frdInfoLabel}>{label}:</div>

                    <div style={{ flex: 1 }}>
                        <FancySelect
                            options={options}
                            value={value}
                            onChange={(val)=>handleChange(key,val)}
                            placeholder="Seçiniz"
                            maxW="100%"
                        />
                    </div>
                </div>
            );
        }

        return (
            <div
                key={key}
                className={`${styles.frdInfoRow} ${isErr ? styles.frdInfoRowError : ""}`}
            >
                <div className={styles.frdInfoLabel}>{label}:</div>

                {editMode && editable ? (
                    <input
                        className={`${styles.frdInput} ${isErr ? styles.frdInputError : ""}`}
                        value={value}
                        onChange={(e)=>handleChange(key,e.target.value)}
                    />
                ) : (
                    <div
                        className={`${styles.frdInfoValue} ${
                            isErr ? styles.frdInfoValueError : ""
                        }`}
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

    const renderFieldFiltered = (label, key, editable = true) => {
        if (errorFields.length > 0 && !isErrorField(label, key)) return null;
        return renderField(label, key, editable);
    };

    const renderGroup = (title, pairs) => {
        if (!groupHasAnyVisible(pairs)) return null;

        return (
            <div className={styles.frdGroup}>
                <h3 className={styles.frdSectionTitle}>{title}</h3>
                {pairs.map(({label,key})=>renderFieldFiltered(label,key,true))}
            </div>
        );
    };

    // ---------------- LOADING ----------------
    if (loading) {
        return (
            <div className={styles.frdLoadingScreen}>
                <div className={styles.frdLoadingSpinner} />
                <p>Veriler yükleniyor...</p>
            </div>
        );
    }

    if (!fileData) {
        return (
            <div className={styles.frdLoadingScreen}>
                <p>Veri bulunamadı.</p>
                <button
                    type="button"
                    className={`${styles.frdBtn} ${styles.frdBtnLight}`}
                    onClick={()=>navigate(-1)}
                >
                    GERİ DÖN
                </button>
            </div>
        );
    }

    // ---------------- UI ----------------
    return (
        <div className={styles.frdScreen}>
            <div className={styles.frdContentArea}>

                <button
                    type="button"
                    className={styles.rejectedBack}
                    onClick={()=>navigate(-1)}
                >
                    ←
                </button>

                <h1 className={styles.frdPageTitle}>
                    Dosya Detayı
                </h1>

                <div className={styles.frdCard}>

                    {errorFields.length > 0 && (
                        <div className={styles.frdErrorBox}>
                            <div className={styles.frdErrorTitle}>Eksik / Hatalı Alanlar:</div>
                            <ul className={styles.frdErrorList}>
                                {errorFields.map((f, idx)=>(
                                    <li key={idx}>• {f.label || f.key}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className={styles.frdCardHeader}>
                        <h2 className={styles.frdCardHeaderTitle}>Bilgiler</h2>

                        <button
                            type="button"
                            className={styles.frdEditBtn}
                            onClick={()=>setEditMode((p)=>!p)}
                        >
                            {editMode ? "Düzenlemeyi Bitir" : "Düzenle"}
                        </button>
                    </div>

                    {renderGroup("Dosya Bilgileri", [
                        {label:"Sigorta Şirketi", key:"insurance_company_name"},
                        {label:"Sigorta Kaynağı", key:"insurance_source"},
                        {label:"Sürücü ve Mağdur Aynı mı", key:"is_driver_victim_same"},
                    ])}

                    {renderGroup("Sürücü Bilgileri", [
                        {label:"Ad Soyad", key:"driver_fullname"},
                        {label:"TC", key:"driver_tc"},
                        {label:"Telefon", key:"driver_phone"},
                        {label:"Mail", key:"driver_mail"},
                        {label:"Doğum Tarihi", key:"driver_birth_date"},
                    ])}

                    {renderGroup("Mağdur Bilgileri", [
                        {label:"Ad Soyad", key:"victim_fullname"},
                        {label:"TC", key:"victim_tc"},
                        {label:"Telefon", key:"victim_phone"},
                        {label:"Mail", key:"victim_mail"},
                        {label:"Doğum Tarihi", key:"victim_birth_date"},
                        {label:"IBAN", key:"victim_iban"},
                    ])}

                    {renderGroup("Araç Bilgileri", [
                        {label:"Marka", key:"vehicle_brand"},
                        {label:"Model", key:"vehicle_model"},
                        {label:"Tip", key:"vehicle_type"},
                        {label:"Plaka", key:"vehicle_plate"},
                        {label:"Yıl", key:"vehicle_year"},
                        {label:"Kullanım Tipi", key:"vehicle_usage_type"},
                        {label:"Ruhsat No", key:"vehicle_license_no"},
                        {label:"Şasi No", key:"vehicle_chassis_no"},
                        {label:"Motor No", key:"vehicle_engine_no"},
                    ])}

                    {renderGroup("Sigortalı Bilgileri", [
                        {label:"Ad Soyad", key:"insured_fullname"},
                        {label:"TC", key:"insured_tc"},
                        {label:"Telefon", key:"insured_phone"},
                        {label:"Mail", key:"insured_mail"},
                        {label:"Doğum Tarihi", key:"insured_birth_date"},
                        {label:"Poliçe No", key:"insured_policy_no"},
                        {label:"Plaka", key:"insured_plate"},
                        {label:"Dosya No", key:"insured_file_no"},
                    ])}

                    {renderGroup("Tamirci Bilgileri", [
                        {label:"Ad Soyad", key:"repair_fullname"},
                        {label:"Doğum Tarihi", key:"repair_birth_date"},
                        {label:"TC", key:"repair_tc"},
                        {label:"Telefon", key:"repair_phone"},
                        {label:"Şehir", key:"repair_city"},
                        {label:"İl/İlçe", key:"repair_state_city_city"},
                        {label:"Adres", key:"repair_address"},
                        {label:"Yapılan İşler", key:"repair_works"},
                    ])}

                    {renderGroup("Servis Bilgileri", [
                        {label:"Servis Adı", key:"service_name"},
                        {label:"Telefon", key:"service_phone"},
                        {label:"IBAN", key:"service_iban"},
                        {label:"IBAN Adı", key:"service_iban_name"},
                        {label:"Şehir", key:"service_city"},
                        {label:"İl/İlçe", key:"service_state_city_city"},
                        {label:"Adres", key:"service_address"},
                        {label:"Vergi No", key:"service_tax_no"},
                    ])}

                    {renderGroup("Kaza Bilgileri", [
                        {label:"Hasar Türü", key:"damage_type"},
                        {label:"Hasar Bölgesi", key:"damage_description"},
                        {label:"Kaza Tarihi", key:"accident_date"},
                        {label:"Kaza Yeri", key:"accident_location"},
                        {label:"Rapor Türü", key:"official_report_type"},
                        {label:"Tahmini Hasar", key:"estimated_damage_amount"},
                        {label:"Poliçe No", key:"policy_no"},
                    ])}

                    <div
                        className={`${styles.frdFilesCard} ${
                            !fileData.files || fileData.files.length === 0
                                ? styles.frdFilesCardEmpty
                                : ""
                        }`}
                    >
                        <div className={`${styles.frdCardHeader} ${styles.frdFilesHeader}`}>
                            <h2 className={styles.frdCardHeaderTitle}>
                                {!fileData.files || fileData.files.length === 0
                                    ? "📁 Henüz Dosya Yüklenmemiş"
                                    : "Yüklenen Dosyalar"}
                            </h2>
                        </div>

                        {!editMode ? (
                            <>
                                {fileData.files?.length > 0 ? (
                                    fileData.files.map((f, idx) => {
                                        const url = getFileUrl(f);
                                        return (
                                            <div
                                                key={f.id || `${idx}-${url}`}
                                                className={styles.frdFileRow}
                                            >
                                                <div className={styles.frdFileMain}>
                                                    <div className={styles.frdFileName}>
                                                        {getFileName(f)}
                                                    </div>

                                                    {getUploadedAt(f) && (
                                                        <div className={styles.frdFileDate}>
                                                            Yüklendi: {getUploadedAt(f)}
                                                        </div>
                                                    )}
                                                </div>

                                                {url && (
                                                    <a
                                                        className={styles.frdFileLink}
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
                                    <p className={styles.frdNoFiles}>
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
                                            className={`${styles.frdFileSection} ${
                                                hasAny ? "" : styles.frdFileSectionEmpty
                                            }`}
                                        >
                                            <div className={styles.frdFileSectionHeader}>
                                                <span>{sec.title}</span>
                                                {!hasAny && (
                                                    <span className={styles.frdFileBadge}>Eksik</span>
                                                )}
                                            </div>

                                            {hasAny ? (
                                                <div className={styles.frdFileCurrent}>
                                                    <span className={styles.frdFileName}>
                                                        {getFileName(first.raw)}
                                                    </span>

                                                    {getUploadedAt(first.raw) && (
                                                        <span className={styles.frdFileDate}>
                                                            Yüklendi: {getUploadedAt(first.raw)}
                                                        </span>
                                                    )}

                                                    {first.url && (
                                                        <a
                                                            href={first.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={styles.frdFileLink}
                                                        >
                                                            Aç / İndir
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className={styles.frdNoFiles}>
                                                    Bu kategori için dosya yok.
                                                </p>
                                            )}

                                            <div className={styles.frdFileActions}>
                                                <button
                                                    type="button"
                                                    className={`${styles.frdBtn} ${styles.frdBtnPrimary}`}
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
                                                            className={`${styles.frdBtn} ${styles.frdBtnWarning}`}
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
                                                            className={`${styles.frdBtn} ${styles.frdBtnDanger}`}
                                                            disabled={uploading}
                                                            onClick={() =>
                                                                handleDeleteFile(first.id)
                                                            }
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

                    <div className={styles.frdFooterButtons}>

                            <button
                                type="button"
                                className={`${styles.frdBtn} ${styles.frdBtnPrimary} ${styles.frdBtnFull}`}
                                onClick={handleUpdate}
                                disabled={updating}
                            >
                                {updating ? "Güncelleniyor..." : "GÜNCELLE"}
                            </button>


                        <button
                            type="button"
                            className={`${styles.frdBtn} ${styles.frdBtnLight} ${styles.frdBtnFull}`}
                            onClick={()=>navigate(-1)}
                        >
                            GERİ DÖN
                        </button>
                    </div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display:"none" }}
                    onChange={handleFileInputChange}
                />
            </div>
        </div>
    );
};

export default RejectedFileDetailScreen;
