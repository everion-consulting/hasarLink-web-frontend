import React, { useState } from "react";
import apiService from "../../services/apiServices";
import styles from "../../styles/Workflow.module.css";

const REPAIR_STAGES = [
  { value: "ONARIMA_BASLANDI", label: "Onarıma Başlandı" },
  { value: "PARCA_BEKLENIYOR", label: "Parça Bekleniyor" },
  { value: "BOYA", label: "Boya" },
  { value: "MONTAJ", label: "Montaj" },
  { value: "ONARIM_TAMAMLANDI", label: "Onarım Tamamlandı" },
];

const RepairTrackingPanel = ({ submissionId, stages = [], onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState("");
  const [notes, setNotes] = useState("");

  const handleAdd = async () => {
    if (!selectedStage) return;
    setLoading(true);
    try {
      const res = await apiService.addRepairStage(submissionId, {
        stage: selectedStage,
        notes,
      });
      if (res.success) {
        onUpdate([...stages, res.data]);
        setSelectedStage("");
        setNotes("");
      }
    } catch (err) {
      console.error("Onarım aşaması ekleme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.panelCard}>
      {/* Yeni aşama ekleme formu */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Yeni Onarım Aşaması</label>
        <select
          className={styles.formSelect}
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value)}
        >
          <option value="">Aşama seçin...</option>
          {REPAIR_STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Not</label>
        <textarea
          className={styles.formTextarea}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Aşama hakkında not..."
        />
      </div>
      <div className={styles.btnRow}>
        <button
          className={styles.submitBtn}
          onClick={handleAdd}
          disabled={loading || !selectedStage}
        >
          {loading ? "Ekleniyor..." : "Aşama Ekle"}
        </button>
      </div>

      {/* Mevcut aşamalar */}
      {stages.length > 0 && (
        <div className={styles.stageList}>
          {stages.map((stage) => (
            <div key={stage.id} className={styles.stageItem}>
              <span className={styles.stageBadge}>
                {stage.stage_display || stage.stage}
              </span>
              <div className={styles.stageInfo}>
                <span className={styles.stageDate}>
                  {formatDate(stage.created_at)}
                </span>
                {stage.notes && (
                  <p className={styles.stageNotes}>{stage.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {stages.length === 0 && (
        <p className={styles.emptyState}>Henüz onarım aşaması eklenmemiş.</p>
      )}
    </div>
  );
};

export default RepairTrackingPanel;
