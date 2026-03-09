import React, { useState } from "react";
import apiService from "../../services/apiServices";
import styles from "../../styles/Workflow.module.css";

const ExpertAssignmentPanel = ({ submissionId, assignment, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(!assignment);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    expert_name: assignment?.expert_name || "",
    expert_phone: assignment?.expert_phone || "",
    expert_company: assignment?.expert_company || "",
    notes: assignment?.notes || "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.expert_name.trim()) return;
    setLoading(true);
    try {
      const res = await apiService.assignExpert(submissionId, formData);
      if (res.success) {
        onUpdate(res.data);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Eksper atama hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    return d.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isEditing && assignment) {
    return (
      <div className={styles.panelCard}>
        <div className={styles.panelRow}>
          <span className={styles.panelLabel}>Eksper Adı:</span>
          <span className={styles.panelValue}>{assignment.expert_name}</span>
        </div>
        {assignment.expert_phone && (
          <div className={styles.panelRow}>
            <span className={styles.panelLabel}>Telefon:</span>
            <span className={styles.panelValue}>{assignment.expert_phone}</span>
          </div>
        )}
        {assignment.expert_company && (
          <div className={styles.panelRow}>
            <span className={styles.panelLabel}>Firma:</span>
            <span className={styles.panelValue}>{assignment.expert_company}</span>
          </div>
        )}
        {assignment.assigned_at && (
          <div className={styles.panelRow}>
            <span className={styles.panelLabel}>Atanma Tarihi:</span>
            <span className={styles.panelValue}>{formatDate(assignment.assigned_at)}</span>
          </div>
        )}
        {assignment.notes && (
          <div className={styles.panelRow}>
            <span className={styles.panelLabel}>Notlar:</span>
            <span className={styles.panelValue}>{assignment.notes}</span>
          </div>
        )}
        <div className={styles.btnRow}>
          <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
            Düzenle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panelCard}>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Eksper Adı Soyadı *</label>
        <input
          className={styles.formInput}
          value={formData.expert_name}
          onChange={(e) => handleChange("expert_name", e.target.value)}
          placeholder="Eksper adı soyadı"
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Telefon</label>
        <input
          className={styles.formInput}
          value={formData.expert_phone}
          onChange={(e) => handleChange("expert_phone", e.target.value)}
          placeholder="05XX XXX XX XX"
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Firma</label>
        <input
          className={styles.formInput}
          value={formData.expert_company}
          onChange={(e) => handleChange("expert_company", e.target.value)}
          placeholder="Eksper firması"
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Notlar</label>
        <textarea
          className={styles.formTextarea}
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Ek notlar..."
        />
      </div>
      <div className={styles.btnRow}>
        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={loading || !formData.expert_name.trim()}
        >
          {loading ? "Kaydediliyor..." : assignment ? "Güncelle" : "Eksper Ata"}
        </button>
        {assignment && (
          <button className={styles.editBtn} onClick={() => setIsEditing(false)}>
            İptal
          </button>
        )}
      </div>
    </div>
  );
};

export default ExpertAssignmentPanel;
