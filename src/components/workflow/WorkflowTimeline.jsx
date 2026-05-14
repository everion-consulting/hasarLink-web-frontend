import React, { useState, useRef, useEffect } from "react";
import apiService from "../../services/apiServices";
import styles from "../../styles/Workflow.module.css";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "OFFICER"];

const REPAIR_STAGES = [
  { value: "ONARIMA_BASLANDI", label: "Onarıma Başlandı" },
  { value: "PARCA_BEKLENIYOR", label: "Parça Bekleniyor" },
  { value: "BOYA",             label: "Boya" },
  { value: "MONTAJ",           label: "Montaj" },
  { value: "ONARIM_TAMAMLANDI", label: "Onarım Tamamlandı" },
];

// ── SVG İkon Bileşenleri ──────────────────────────────────────────────────────
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconFile = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconWrench = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IconBuilding = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="9" width="18" height="12" rx="1" />
    <path d="M8 9V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4" />
    <line x1="12" y1="12" x2="12" y2="18" />
    <line x1="8" y1="12" x2="8" y2="18" />
    <line x1="16" y1="12" x2="16" y2="18" />
  </svg>
);
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconQuestion = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// ── Yardımcı ─────────────────────────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return null;
  const datePart = String(date).split("T")[0];
  if (datePart.includes("-")) {
    const [year, month, day] = datePart.split("-");
    return `${day}.${month}.${year}`;
  }
  return date;
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("tr-TR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const WorkflowTimeline = ({
  submissionId,
  fileData,
  userRole,
  onRefresh,
  repairStages = [],
  onRepairStagesUpdate,
  highlight = false,
  onHighlightDismiss,
}) => {
  const isAdmin = ADMIN_ROLES.includes(userRole);
  // ── Backend'den gelen tek kaynak: workflow_stage ──────────────────────────
  const rawStage      = fileData?.workflow_stage || "DOSYA_ACILDI";
  const paymentDate   = fileData?.insurance_company_date || fileData?.payment_date || null;
  const issueReason   = fileData?.payment_problem_reason || null;
  const paymentAmount = fileData?.insurance_payment?.payment_amount ?? null;
  const isRejected    = fileData?.status === "REJECTED";

  // status=DEGERLENDIRME ise (backend signal henüz çalışmadıysa) aşamayı override et
  const DEGERLENDIRME_STAGE = "SIGORTA_SIRKETI_TARAFINDAN_DEGERLENDIRMEDE";
  const STAGE_ORDER = [
    "DOSYA_ACILDI",
    "EKSPER_ATANDI",
    "ONARIMA_BASLANDI_MI",
    "EKSPER_RAPORU_SIGORTAYA_GONDERDI",
    "SIGORTA_SIRKETI_TARAFINDAN_DEGERLENDIRMEDE",
    "SIGORTA_SIRKETINDEN_VERILEN_ODEME_TARIHI",
    "ODEME_ALDINIZ_MI",
    "ODEME_ALINDI",
    "ODEME_SORUNU_KONTROL_EDILIYOR",
  ];
  const stageIdx = (s) => STAGE_ORDER.indexOf(s);

  // status DEGERLENDIRME ise ve mevcut stage henüz o aşamaya ulaşmamışsa override
  const stage = (
    fileData?.status === "DEGERLENDIRME" &&
    stageIdx(rawStage) < stageIdx(DEGERLENDIRME_STAGE)
  ) ? DEGERLENDIRME_STAGE : rawStage;

  const currentIdx = stageIdx(stage);

  // Adım adımı: bu adımın indexi mevcut index'ten küçükse "done"
  const isDone    = (s) => stageIdx(s) < currentIdx;
  const isActive  = (s) => s === stage;
  const stepState = (s) => isDone(s) ? "done" : isActive(s) ? "active" : "pending";

  // Daire inline stili — CSS module çakışmasını önler
  const CIRCLE_STYLES = {
    done:    { background: "#133E87", color: "#fff",      border: "none",                  boxShadow: "0 2px 8px rgba(19,62,135,0.3)" },
    active:  { background: "#0f2d5e", color: "#fff",      border: "none",                  boxShadow: "0 4px 12px rgba(15,45,94,0.4)" },
    pending: { background: "#f1f5f9", color: "#94a3b8",   border: "1.5px solid #e2e8f0",   boxShadow: "none" },
    warning: { background: "#fef3c7", color: "#d97706",   border: "1.5px solid #fcd34d",   boxShadow: "none" },
  };
  const cs = (s) => CIRCLE_STYLES[stepState(s)] || CIRCLE_STYLES.pending;

  // Ödeme tarihine 1 gün kala, günü veya günü geçtiyse → kırmızı pulse
  const isPaymentDateSoon = (() => {
    if (!paymentDate) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const pd    = new Date(paymentDate); pd.setHours(0, 0, 0, 0);
    const diff  = (pd - today) / (1000 * 60 * 60 * 24); // gün farkı
    return diff <= 1; // 1 günden az kaldıysa veya geçtiyse
  })();

  // Ödeme tarihi bugün veya geçtiyse → "Ödemenizi aldınız mı?" sorusunu göster
  const isPaymentDateDue = (() => {
    if (!paymentDate) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const pd    = new Date(paymentDate); pd.setHours(0, 0, 0, 0);
    return pd <= today;
  })();

  // "Ödemenizi aldınız mı?" gösterim koşulu:
  // - Backend ODEME_ALDINIZ_MI gönderdi, VEYA
  // - Tarih geldi/geçti ve henüz ödeme kararı verilmedi (ALINDI ya da SORUNU yok)
  const showPaymentQuestion =
    stage === "ODEME_ALDINIZ_MI" ||
    (isPaymentDateDue &&
      stage === "SIGORTA_SIRKETINDEN_VERILEN_ODEME_TARIHI");

  // Kısayollar
  const expertAssigned = !!fileData?.expert_assignment?.id;
  const repairStarted  = repairStages.length > 0;

  // ── UI state ──────────────────────────────────────────────────────────────
  const [showRepairModal,    setShowRepairModal]    = useState(false);
  const [showSubSteps,       setShowSubSteps]       = useState(false);
  const [repairStageInput,   setRepairStageInput]   = useState("");
  const [repairNotesInput,   setRepairNotesInput]   = useState("");
  const [repairImages,       setRepairImages]       = useState([]);
  const [repairPreviews,     setRepairPreviews]     = useState([]);
  const [repairLoading,      setRepairLoading]      = useState(false);
  const repairFileRef = useRef(null);

  // Aşama düzenleme modalı
  const [editingStage,     setEditingStage]     = useState(null);
  const [editNotes,        setEditNotes]        = useState("");
  const [editNewImages,    setEditNewImages]    = useState([]);
  const [editNewPreviews,  setEditNewPreviews]  = useState([]);
  const [editSaving,       setEditSaving]       = useState(false);
  const [deletingImageId,  setDeletingImageId]  = useState(null);
  const editFileRef = useRef(null);
  const [editLoadingImages, setEditLoadingImages] = useState(false);

  const [showRepairStartConfirm, setShowRepairStartConfirm] = useState(false);
  const [repairStartLoading,    setRepairStartLoading]    = useState(false);

  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [reportLoading,     setReportLoading]     = useState(false);

  const [showPaymentModal,   setShowPaymentModal]   = useState(false);
  const [paymentAmountInput, setPaymentAmountInput] = useState("");
  const [paymentLoading,     setPaymentLoading]     = useState(false);

  const [highlighted, setHighlighted] = useState(highlight);
  const paymentCardRef = useRef(null);

  useEffect(() => {
    if (highlight) {
      setHighlighted(true);
      setTimeout(() => {
        paymentCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
    }
  }, [highlight]);

  const dismissHighlight = () => { setHighlighted(false); onHighlightDismiss?.(); };

  // ── Edit stage helpers ────────────────────────────────────────────────────
  const openEditStage = async (stage) => {
    // Önce elimizdeki veriyle modalı hemen aç (UX için)
    setEditingStage(stage);
    setEditNotes(stage.notes || "");
    editNewPreviews.forEach(URL.revokeObjectURL);
    setEditNewImages([]);
    setEditNewPreviews([]);
    // Taze image listesini backend'den çek
    setEditLoadingImages(true);
    try {
      const res = await apiService.getRepairStages(submissionId);
      if (res.success) {
        const dataArr = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
          ? res.data.results
          : [];
        const fresh = dataArr.find(s => s.id === stage.id);
        if (fresh) {
          setEditingStage(fresh);
          setEditNotes(fresh.notes || "");
          onRepairStagesUpdate?.(dataArr);
        }
      }
    } finally { setEditLoadingImages(false); }
  };
  const closeEditStage = () => {
    editNewPreviews.forEach(URL.revokeObjectURL);
    setEditingStage(null);
    setEditNotes("");
    setEditNewImages([]);
    setEditNewPreviews([]);
  };
  const handleEditImgAdd = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const merged = [...editNewImages, ...files];
    editNewPreviews.forEach(URL.revokeObjectURL);
    setEditNewImages(merged);
    setEditNewPreviews(merged.map(f => URL.createObjectURL(f)));
    e.target.value = "";
  };
  const handleEditImgRemoveNew = (i) => {
    URL.revokeObjectURL(editNewPreviews[i]);
    setEditNewImages(p => p.filter((_, idx) => idx !== i));
    setEditNewPreviews(p => p.filter((_, idx) => idx !== i));
  };
  const handleDeleteExistingImage = async (imageId) => {
    setDeletingImageId(imageId);
    try {
      const res = await apiService.deleteRepairStageImage(imageId);
      if (res.success) {
        const updatedImages = (editingStage.images || []).filter(
          img => (img?.id ?? img) !== imageId
        );
        const updated = { ...editingStage, images: updatedImages };
        setEditingStage(updated);
        onRepairStagesUpdate?.(repairStages.map(s => s.id === editingStage.id ? updated : s));
      }
    } finally { setDeletingImageId(null); }
  };
  const handleSaveEditStage = async () => {
    setEditSaving(true);
    try {
      const formData = new FormData();
      formData.append("notes", editNotes);
      editNewImages.forEach(img => formData.append("images", img));
      const res = await apiService.updateRepairStage(submissionId, editingStage.id, formData);
      if (res.success) {
        closeEditStage();
        await onRefresh?.();
      }
    } catch (err) {
      console.error("Aşama güncellenemedi:", err);
    } finally { setEditSaving(false); }
  };

  // ── Görsel yardımcıları ───────────────────────────────────────────────────
  const handleRepairImgAdd = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const merged = [...repairImages, ...files];
    repairPreviews.forEach(URL.revokeObjectURL);
    setRepairImages(merged);
    setRepairPreviews(merged.map(f => URL.createObjectURL(f)));
    e.target.value = "";
  };
  const handleRepairImgRemove = (i) => {
    URL.revokeObjectURL(repairPreviews[i]);
    setRepairImages(p => p.filter((_, idx) => idx !== i));
    setRepairPreviews(p => p.filter((_, idx) => idx !== i));
  };

  // ── Handler'lar ───────────────────────────────────────────────────────────

  // Onarım aşaması ekle (ilk aşama eklenince "Onarımda" olur)
  const handleAddRepairStage = async () => {
    if (!repairStageInput) return;
    setRepairLoading(true);
    try {
      const formData = new FormData();
      formData.append("stage", repairStageInput);
      formData.append("notes", repairNotesInput);
      repairImages.forEach(img => formData.append("images", img));
      const res = await apiService.addRepairStage(submissionId, formData);
      if (res.success) {
        setRepairStageInput("");
        setRepairNotesInput("");
        repairPreviews.forEach(URL.revokeObjectURL);
        setRepairImages([]);
        setRepairPreviews([]);
        setShowRepairModal(false);
        // Tam veriyi backend'den çek — stage_display, images vb. eksik kalmasın
        await onRefresh?.();
      } else {
        console.error("Onarım aşaması eklenemedi:", res.message);
        alert(res.message || "Aşama eklenirken hata oluştu.");
      }
    } catch (err) {
      console.error("Onarım aşaması eklenemedi:", err);
      alert("Aşama eklenirken bir hata oluştu: " + (err?.message || err));
    } finally { setRepairLoading(false); }
  };

  const handleRepairStartConfirm = async () => {
    setRepairStartLoading(true);
    try {
      const res = await apiService.advanceWorkflow(submissionId, "ONARIMA_BASLANDI_MI");
      if (res.success) { setShowRepairStartConfirm(false); onRefresh?.(); }
    } finally { setRepairStartLoading(false); }
  };

  const handleReportConfirm = async () => {
    setReportLoading(true);
    try {
      const res = await apiService.advanceWorkflow(submissionId, "EKSPER_RAPORU_SIGORTAYA_GONDERDI");
      if (res.success) { setShowReportConfirm(false); onRefresh?.(); }
    } finally { setReportLoading(false); }
  };

  const handlePaymentNo = async () => {
    setPaymentLoading(true);
    try {
      const res = await apiService.paymentConfirmation(submissionId, false);
      if (res.success) { dismissHighlight(); onRefresh?.(); }
    } finally { setPaymentLoading(false); }
  };

  const handleSavePaymentAmount = async () => {
    const amount = parseFloat(paymentAmountInput);
    if (!amount || amount <= 0) return;
    setPaymentLoading(true);
    try {
      const res = await apiService.paymentConfirmation(submissionId, true, amount);
      if (res.success) {
        setShowPaymentModal(false);
        setPaymentAmountInput("");
        dismissHighlight();
        onRefresh?.();
      }
    } finally { setPaymentLoading(false); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className={styles.timeline}>
        <h3 className={styles.timelineTitle}>İŞ AKIŞ TAKİBİ</h3>

        {/* ── Reddedildi banner ────────────────────────────────────────── */}
        {isRejected && (
          <div className={styles.rejectedBanner}>
            <span className={styles.rejectedIcon}>✕</span>
            <div className={styles.rejectedContent}>
              <span className={styles.rejectedTitle}>Dosya Reddedildi</span>
              {fileData?.rejection_reason && (
                <span className={styles.rejectedReason}>{fileData.rejection_reason}</span>
              )}
            </div>
          </div>
        )}

        <div className={styles.timelineList} style={isRejected ? { opacity: 0.45, pointerEvents: "none" } : {}}>

          {/* ── 1: Dosya Açıldı ─────────────────────────────────────────── */}
          <div className={styles.timelineRow}>
            <div className={styles.timelineLeft}>
              <div className={styles.stepCircle} style={cs("DOSYA_ACILDI")}>
                {stepState("DOSYA_ACILDI") === "done" ? <IconCheck /> : <IconFile />}
              </div>
              <div className={styles.stepConnector} />
            </div>
            <div className={`${styles.timelineCard} ${styles[`card_${stepState("DOSYA_ACILDI")}`]}`}>
              <div className={styles.cardRow}>
                <div className={styles.cardContent}>
                  <span className={styles.cardTitle}>Dosya Açıldı</span>
                  {fileData?.created_at && (
                    <span className={styles.cardSubtitle}>{formatDate(fileData.created_at)} · Dosya oluşturuldu</span>
                  )}
                </div>
                <span className={`${styles.statusBadgeTl} ${styles[`badge_${stepState("DOSYA_ACILDI")}`]}`}>
                  {stepState("DOSYA_ACILDI") === "done" ? "Tamamlandı" : stepState("DOSYA_ACILDI") === "active" ? "Aktif" : "Bekleniyor"}
                </span>
              </div>
            </div>
          </div>

          {/* ── 2: Eksper Atandı ────────────────────────────────────────── */}
          <div className={styles.timelineRow}>
            <div className={styles.timelineLeft}>
              <div className={styles.stepCircle} style={cs("EKSPER_ATANDI")}>
                {stepState("EKSPER_ATANDI") === "done" ? <IconCheck /> : <IconUser />}
              </div>
              <div className={styles.stepConnector} />
            </div>
            <div className={`${styles.timelineCard} ${styles[`card_${stepState("EKSPER_ATANDI")}`]}`}>
              <div className={styles.cardRow}>
                <div className={styles.cardContent}>
                  <span className={styles.cardTitle}>Eksper Atandı</span>
                  {expertAssigned && (fileData?.expert_assignment?.expert_informations || fileData?.expert_assignment?.expert_name) && (
                    <span className={styles.cardSubtitle}>
                      {fileData.expert_assignment.expert_name || fileData.expert_assignment.expert_informations}
                      {fileData.expert_assignment.assigned_at && (
                        <> · {formatDateTime(fileData.expert_assignment.assigned_at)}</>
                      )}
                    </span>
                  )}
                  {!expertAssigned && stepState("EKSPER_ATANDI") === "active" && (
                    <span className={styles.cardSubtitle}>Admin tarafından atanacak</span>
                  )}
                </div>
                <span className={`${styles.statusBadgeTl} ${styles[`badge_${stepState("EKSPER_ATANDI")}`]}`}>
                  {stepState("EKSPER_ATANDI") === "done" ? "Tamamlandı" : stepState("EKSPER_ATANDI") === "active" ? "Aktif" : "Bekleniyor"}
                </span>
              </div>
              {stepState("EKSPER_ATANDI") === "active" && (
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className={styles.addRepairStageBtn}
                    onClick={() => setShowRepairStartConfirm(true)}
                  >
                    🔧 Onarıma Başla
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── 3: Onarımda ─────────────────────────────────────────────── */}
          <div className={styles.timelineRow}>
            <div className={styles.timelineLeft}>
              <div className={styles.stepCircle} style={cs("ONARIMA_BASLANDI_MI")}>
                {stepState("ONARIMA_BASLANDI_MI") === "done" ? <IconCheck /> : <IconWrench />}
              </div>
              <div className={styles.stepConnector} />
            </div>
            <div className={`${styles.timelineCard} ${styles[`card_${stepState("ONARIMA_BASLANDI_MI")}`]}`}>
              <div className={styles.cardRow}>
                <div className={styles.cardContent}>
                  <span className={styles.cardTitle}>
                    {repairStarted ? "Onarımda" : "Onarıma Başlandı mı?"}
                  </span>
                  {stepState("ONARIMA_BASLANDI_MI") === "active" && (
                    <span className={styles.cardSubtitle}>
                      {repairStarted ? "Aktif · Devam ediyor" : "Eksper onayladıktan sonra başlar"}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {repairStarted && (
                    <span className={`${styles.statusBadgeTl} ${styles.badge_repair}`}>
                      {repairStages.length} Aşama
                    </span>
                  )}
                  {!repairStarted && (
                    <span className={`${styles.statusBadgeTl} ${styles[`badge_${stepState("ONARIMA_BASLANDI_MI")}`]}`}>
                      {stepState("ONARIMA_BASLANDI_MI") === "done" ? "Tamamlandı" : stepState("ONARIMA_BASLANDI_MI") === "active" ? "Aktif" : "Bekleniyor"}
                    </span>
                  )}
                </div>
              </div>

              {/* Alt aşamalar — her zaman açık */}
              {(repairStarted || stepState("ONARIMA_BASLANDI_MI") !== "pending") && repairStages.length > 0 && (
                <div className={styles.repairSubStepList}>
                  {repairStages.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      className={styles.repairSubStep}
                      onClick={() => openEditStage(s)}
                    >
                      <span className={styles.repairSubStepBadge}>{s.stage_display || s.stage}</span>
                      <div className={styles.repairSubStepMeta}>
                        <span className={styles.repairSubStepDate}>{formatDateTime(s.created_at)}</span>
                        {s.notes && <span className={styles.repairSubStepNotes}>{s.notes}</span>}
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    className={styles.addRepairStageBtn}
                    onClick={() => setShowRepairModal(true)}
                  >
                    + Aşama Ekle
                  </button>
                </div>
              )}

              {/* İlk aşama ekle butonu (henüz aşama yoksa, aktifken) */}
              {!repairStarted && stepState("ONARIMA_BASLANDI_MI") === "active" && (
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className={styles.addRepairStageBtn}
                    onClick={() => setShowRepairModal(true)}
                  >
                    + Onarım Aşaması Ekle
                  </button>
                </div>
              )}

              {/* Eksper raporunu sigortaya gönder butonu — onarım aktifken */}
              {stepState("ONARIMA_BASLANDI_MI") === "active" && (
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className={styles.addRepairStageBtn}
                    style={{ background: "#f0fdf4", color: "#15803d", border: "1.5px solid #bbf7d0" }}
                    onClick={() => setShowReportConfirm(true)}
                  >
                    📤 Eksper Raporu Sigortaya Gönderildi
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── 4: Eksper Raporu Sigortaya Gönderildi mi? ───────────────── */}
          <div className={styles.timelineRow}>
            <div className={styles.timelineLeft}>
              <div className={styles.stepCircle} style={cs("EKSPER_RAPORU_SIGORTAYA_GONDERDI")}>
                {stepState("EKSPER_RAPORU_SIGORTAYA_GONDERDI") === "done" ? <IconCheck /> : <IconSend />}
              </div>
              <div className={styles.stepConnector} />
            </div>
            <div
              className={`${styles.timelineCard} ${styles[`card_${stepState("EKSPER_RAPORU_SIGORTAYA_GONDERDI")}`]}`}
            >
              <div className={styles.cardRow}>
                <div className={styles.cardContent}>
                  <span className={styles.cardTitle}>
                    {stepState("EKSPER_RAPORU_SIGORTAYA_GONDERDI") === "pending"
                      ? "Eksper Raporu Sigortaya Gönderildi mi?"
                      : "Eksper Raporu Sigortaya Gönderildi"}
                  </span>
                  {stepState("EKSPER_RAPORU_SIGORTAYA_GONDERDI") === "pending" && isActive("ONARIMA_BASLANDI_MI") && (
                    <span className={styles.cardSubtitle}>Onarım kartından onaylayabilirsiniz</span>
                  )}
                </div>
                <span className={`${styles.statusBadgeTl} ${styles[`badge_${stepState("EKSPER_RAPORU_SIGORTAYA_GONDERDI")}`]}`}>
                  {stepState("EKSPER_RAPORU_SIGORTAYA_GONDERDI") === "done" ? "Tamamlandı" : stepState("EKSPER_RAPORU_SIGORTAYA_GONDERDI") === "active" ? "Aktif" : "Bekleniyor"}
                </span>
              </div>
            </div>
          </div>

          {/* ── 5: Sigorta Şirketi Değerlendirmede──────────────────────── */}
          <div className={styles.timelineRow}>
            <div className={styles.timelineLeft}>
              <div className={styles.stepCircle} style={cs("SIGORTA_SIRKETI_TARAFINDAN_DEGERLENDIRMEDE")}>
                {stepState("SIGORTA_SIRKETI_TARAFINDAN_DEGERLENDIRMEDE") === "done" ? <IconCheck /> : <IconBuilding />}
              </div>
              <div className={styles.stepConnector} />
            </div>
            <div className={`${styles.timelineCard} ${styles[`card_${stepState("SIGORTA_SIRKETI_TARAFINDAN_DEGERLENDIRMEDE")}`]}`}>
              <div className={styles.cardRow}>
                <div className={styles.cardContent}>
                  <span className={styles.cardTitle}>Eksper Raporu Sigorta Şirketi Tarafından Değerlendirmede</span>
                  {stepState("SIGORTA_SIRKETI_TARAFINDAN_DEGERLENDIRMEDE") === "active" && (
                    <span className={styles.cardSubtitle}>Sigorta şirketi değerlendiriyor</span>
                  )}
                </div>
                <span className={`${styles.statusBadgeTl} ${styles[`badge_${stepState("SIGORTA_SIRKETI_TARAFINDAN_DEGERLENDIRMEDE")}`]}`}>
                  {stepState("SIGORTA_SIRKETI_TARAFINDAN_DEGERLENDIRMEDE") === "done" ? "Tamamlandı" : stepState("SIGORTA_SIRKETI_TARAFINDAN_DEGERLENDIRMEDE") === "active" ? "Aktif" : "Bekleniyor"}
                </span>
              </div>
            </div>
          </div>

          {/* ── 6: Sigorta Şirketi Tarafından Verilen Ödeme Tarihi ──────── */}
          <div className={`${styles.timelineRow} ${isPaymentDateSoon ? styles.paymentRowPulse : ""}`}>
            <div className={styles.timelineLeft}>
              <div className={styles.stepCircle} style={cs("SIGORTA_SIRKETINDEN_VERILEN_ODEME_TARIHI")}>
                {stepState("SIGORTA_SIRKETINDEN_VERILEN_ODEME_TARIHI") === "done" ? <IconCheck /> : <IconCalendar />}
              </div>
              {(showPaymentQuestion || stage === "ODEME_ALINDI" || stage === "ODEME_SORUNU_KONTROL_EDILIYOR") && (
                <div className={styles.stepConnector} />
              )}
            </div>
            <div className={`${styles.timelineCard} ${styles[`card_${stepState("SIGORTA_SIRKETINDEN_VERILEN_ODEME_TARIHI")}`]} ${isPaymentDateSoon ? styles.paymentDatePulse : ""}`}>
              <div className={styles.cardRow}>
                <div className={styles.cardContent}>
                  <span className={styles.cardTitle}>Sigorta Şirketi Tarafından Verilen Ödeme Tarihi</span>
                  {paymentDate
                    ? <span className={styles.cardSubtitle}><strong>{formatDate(paymentDate)}</strong></span>
                    : <span className={styles.cardSubtitle}>Admin panelden girilecek</span>
                  }
                </div>
                <span className={`${styles.statusBadgeTl} ${styles[`badge_${stepState("SIGORTA_SIRKETINDEN_VERILEN_ODEME_TARIHI")}`]}`}>
                  {stepState("SIGORTA_SIRKETINDEN_VERILEN_ODEME_TARIHI") === "done" ? "Tamamlandı" : stepState("SIGORTA_SIRKETINDEN_VERILEN_ODEME_TARIHI") === "active" ? "Aktif" : "Bekleniyor"}
                </span>
              </div>
            </div>
          </div>

          {/* ── 7: Ödeme Aldınız mı? ────────────────────────────────────── */}
          {showPaymentQuestion && (
            <div className={styles.timelineRow}>
              <div className={styles.timelineLeft}>
                <div className={styles.stepCircle} style={CIRCLE_STYLES.active}>
                  <IconQuestion />
                </div>
                {(stage === "ODEME_ALINDI" || stage === "ODEME_SORUNU_KONTROL_EDILIYOR") && (
                  <div className={styles.stepConnector} />
                )}
              </div>
              <div
                ref={paymentCardRef}
                className={`${styles.timelineCard} ${styles.card_active} ${highlighted ? styles.paymentQuestionCardPulse : ""}`}
                onClick={highlighted ? dismissHighlight : undefined}
                style={{ cursor: highlighted ? "pointer" : "default" }}
              >
                <div className={styles.cardRow}>
                  <div className={styles.cardContent}>
                    <span className={styles.cardTitle}>Ödemenizi aldınız mı?</span>
                  </div>
                </div>
                {!isAdmin ? (
                  <div className={styles.paymentActionButtons}>
                    <button type="button" onClick={() => setShowPaymentModal(true)} disabled={paymentLoading}>EVET</button>
                    <button type="button" onClick={handlePaymentNo} disabled={paymentLoading}>HAYIR</button>
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: "#64748b", margin: "8px 0 0" }}>Usta yanıtı bekleniyor.</p>
                )}
              </div>
            </div>
          )}

          {/* ── 8a: Ödeme Alındı ────────────────────────────────────────── */}
          {stage === "ODEME_ALINDI" && (
            <div className={styles.timelineRow}>
              <div className={styles.timelineLeft}>
                <div className={styles.stepCircle} style={CIRCLE_STYLES.done}>
                  <IconCheck />
                </div>
              </div>
              <div className={`${styles.timelineCard} ${styles.card_done}`}>
                <div className={styles.cardRow}>
                  <div className={styles.cardContent}>
                    <span className={styles.cardTitle}>Ödeme Alındı ✓</span>
                    {paymentAmount && (
                      <span className={styles.cardSubtitle}>
                        {Number(paymentAmount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                      </span>
                    )}
                  </div>
                  <span className={`${styles.statusBadgeTl} ${styles.badge_done}`}>Tamamlandı</span>
                </div>
              </div>
            </div>
          )}

          {/* ── 8b: Ödeme Sorunu ────────────────────────────────────────── */}
          {stage === "ODEME_SORUNU_KONTROL_EDILIYOR" && (
            <div className={styles.timelineRow}>
              <div className={styles.timelineLeft}>
                <div className={styles.stepCircle} style={CIRCLE_STYLES.warning}>
                  <IconQuestion />
                </div>
              </div>
              <div className={`${styles.timelineCard} ${styles.card_warning}`}>
                <div className={styles.cardRow}>
                  <div className={styles.cardContent}>
                    <span className={styles.cardTitle}>
                      {issueReason ? "Ödeme Alınamama Sebebi" : "Ödeme Sorunu Kontrol Ediliyor"}
                    </span>
                    {issueReason && (
                      <span className={styles.cardSubtitle}>{issueReason}</span>
                    )}
                  </div>
                  <span className={`${styles.statusBadgeTl} ${styles.badge_warning}`}>
                    {issueReason ? "Açıklandı" : "İnceleniyor"}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Eksper Raporu Onay Modalı ────────────────────────────────────── */}
      {showRepairStartConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowRepairStartConfirm(false)}>
          <div className={styles.paymentModal} style={{ maxWidth: 420, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <button type="button" className={styles.closeButton} onClick={() => setShowRepairStartConfirm(false)}>×</button>
            <h3 style={{ color: "#174f9a", marginBottom: 12 }}>Onarıma Başlandı mı?</h3>
            <p style={{ fontSize: 14, color: "#475569", marginBottom: 24 }}>
              Onayladığınızda dosya onarım aşamasına geçecektir.<br />
              Onarım aşamalarını daha sonra ekleyebilirsiniz.
            </p>
            <button
              type="button"
              className={styles.confirmButton}
              onClick={handleRepairStartConfirm}
              disabled={repairStartLoading}
            >
              {repairStartLoading ? "Kaydediliyor..." : "✓ Evet, Onarıma Başlandı"}
            </button>
          </div>
        </div>
      )}

      {showReportConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowReportConfirm(false)}>
          <div className={styles.paymentModal} style={{ maxWidth: 420, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <button type="button" className={styles.closeButton} onClick={() => setShowReportConfirm(false)}>×</button>
            <h3 style={{ color: "#174f9a", marginBottom: 12 }}>Eksper Raporu Sigortaya Gönderildi mi?</h3>
            <p style={{ fontSize: 14, color: "#475569", marginBottom: 24 }}>
              Onayladığınızda süreç bir sonraki aşamaya geçecektir.<br />
              Onarım adımlarını girmeden de bu aşamaya geçebilirsiniz.
            </p>
            <button
              type="button"
              className={styles.confirmButton}
              onClick={handleReportConfirm}
              disabled={reportLoading}
            >
              {reportLoading ? "Kaydediliyor..." : "✓ Evet, Gönderildi — Onayla"}
            </button>
          </div>
        </div>
      )}

      {/* ── Onarım Takibi Modalı ─────────────────────────────────────────── */}
      {showRepairModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRepairModal(false)}>
          <div
            className={styles.paymentModal}
            style={{ maxWidth: 520, maxHeight: "85vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}
          >
            <button type="button" className={styles.closeButton} onClick={() => setShowRepairModal(false)}>×</button>
            <h3 style={{ marginBottom: 16, color: "#174f9a" }}>Onarım Takibi</h3>

            {/* Yeni aşama ekleme formu */}
            <div style={{ borderTop: repairStages.length > 0 ? "1px solid #e2e8f0" : "none", paddingTop: repairStages.length > 0 ? 14 : 0 }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Yeni Onarım Aşaması</label>
                <select
                  className={styles.formSelect}
                  value={repairStageInput}
                  onChange={e => setRepairStageInput(e.target.value)}
                >
                  <option value="">Aşama seçin...</option>
                  {REPAIR_STAGES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Not</label>
                <textarea
                  className={styles.formTextarea}
                  placeholder="Aşama hakkında not..."
                  value={repairNotesInput}
                  onChange={e => setRepairNotesInput(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Görseller</label>
                <input
                  ref={repairFileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleRepairImgAdd}
                />
                <button
                  type="button"
                  className={styles.uploadTriggerBtn}
                  onClick={() => repairFileRef.current?.click()}
                >
                  📷 Görsel Ekle
                </button>
                {repairPreviews.length > 0 && (
                  <div className={styles.imagePreviewGrid} style={{ marginTop: 8 }}>
                    {repairPreviews.map((src, i) => (
                      <div key={i} className={styles.imagePreviewItem}>
                        <img src={src} alt="" className={styles.imagePreviewThumb} />
                        <button className={styles.imageRemoveBtn} onClick={() => handleRepairImgRemove(i)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className={styles.confirmButton}
                onClick={handleAddRepairStage}
                disabled={repairLoading || !repairStageInput}
              >
                {repairLoading ? "Ekleniyor..." : "Aşama Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Aşama Düzenleme Modalı ──────────────────────────────────────── */}
      {editingStage && (
        <div className={styles.modalOverlay} onClick={closeEditStage}>
          <div
            className={styles.paymentModal}
            style={{ maxWidth: 500, maxHeight: "85vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}
          >
            <button type="button" className={styles.closeButton} onClick={closeEditStage}>×</button>
            <h3 style={{ marginBottom: 4, color: "#174f9a" }}>
              {editingStage.stage_display || editingStage.stage}
            </h3>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
              {formatDateTime(editingStage.created_at)}
            </p>

            {/* Mevcut görseller */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Mevcut Görseller</label>
              {editLoadingImages ? (
                <p style={{ fontSize: 12, color: "#64748b" }}>Yükleniyor...</p>
              ) : editingStage.images?.length > 0 ? (
                <div className={styles.imagePreviewGrid}>
                  {editingStage.images.map((img, i) => {
                    const src = img?.image || img;
                    const id  = img?.id ?? i;
                    return (
                      <div key={id} className={styles.imagePreviewItem}>
                        <a href={src} target="_blank" rel="noopener noreferrer">
                          <img src={src} alt="" className={styles.imagePreviewThumb} />
                        </a>
                        <button
                          className={styles.imageRemoveBtn}
                          onClick={() => handleDeleteExistingImage(id)}
                          disabled={deletingImageId === id}
                        >
                          {deletingImageId === id ? "…" : "×"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: "#94a3b8" }}>Henüz görsel yok.</p>
              )}
            </div>

            {/* Yeni görsel ekle */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Görsel Ekle</label>
              <input
                ref={editFileRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleEditImgAdd}
              />
              <button
                type="button"
                className={styles.uploadTriggerBtn}
                onClick={() => editFileRef.current?.click()}
              >
                📷 Görsel Ekle
              </button>
              {editNewPreviews.length > 0 && (
                <div className={styles.imagePreviewGrid} style={{ marginTop: 8 }}>
                  {editNewPreviews.map((src, i) => (
                    <div key={i} className={styles.imagePreviewItem}>
                      <img src={src} alt="" className={styles.imagePreviewThumb} />
                      <button className={styles.imageRemoveBtn} onClick={() => handleEditImgRemoveNew(i)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Not düzenleme */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Not</label>
              <textarea
                className={styles.formTextarea}
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="Aşama notu..."
              />
            </div>

            <button
              type="button"
              className={styles.confirmButton}
              onClick={handleSaveEditStage}
              disabled={editSaving}
            >
              {editSaving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      )}

      {/* ── Ödeme Tutar Modalı ───────────────────────────────────────────── */}
      {showPaymentModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
          <div className={styles.paymentModal} onClick={e => e.stopPropagation()}>
            <button type="button" className={styles.closeButton} onClick={() => setShowPaymentModal(false)}>×</button>
            <h3>Ne kadar ödeme aldınız?</h3>
            <input
              type="number"
              value={paymentAmountInput}
              onChange={e => setPaymentAmountInput(e.target.value)}
              placeholder="Örn: 70000"
              className={styles.paymentInput}
              autoFocus
            />
            <p className={styles.modalInfoText}>
              Bu bilgiyi girmek opsiyoneldir ve sadece kendi finansınızı görüntüleyebilmeniz açısından eklenmektedir.
            </p>
            <button type="button" className={styles.confirmButton} onClick={handleSavePaymentAmount} disabled={paymentLoading}>
              {paymentLoading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkflowTimeline;
