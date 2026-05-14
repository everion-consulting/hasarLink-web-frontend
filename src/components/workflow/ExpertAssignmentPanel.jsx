import React, { useState, useEffect } from "react";
import apiService from "../../services/apiServices";
import styles from "../../styles/Workflow.module.css";

const ExpertAssignmentPanel = ({ submissionId, assignment, experInformations, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    expert_name: assignment?.expert_name || "",
    expert_company: assignment?.expert_company || "",
    expert_phone: assignment?.expert_phone || "",
    notes: assignment?.notes || "",
  });

  useEffect(() => {
    setFormData({
      expert_name: assignment?.expert_name || "",
      expert_company: assignment?.expert_company || "",
      expert_phone: assignment?.expert_phone || "",
      notes: assignment?.notes || "",
    });
    setIsEditing(false);
  }, [assignment]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
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

  const hasAnyData =
    experInformations ||
    assignment?.expert_name ||
    assignment?.expert_company ||
    assignment?.expert_phone ||
    assignment?.notes;

  if (!isEditing) {
    return (
      <div className={styles.panelCard}>
        {experInformations && (
          <div className={styles.panelRow}>
            <span className={styles.panelLabel}>Eksper Bilgisi:</span>
            <span className={styles.panelValue}>{experInformations}</span>
          </div>
        )}
        {assignment?.expert_name && (
          <div className={styles.panelRow}>
            <span className={styles.panelLabel}>Eksper Adı:</span>
            <span className={styles.panelValue}>{assignment.expert_name}</span>
          </div>
        )}
        {assignment?.expert_company && (
          <div className={styles.panelRow}>
            <span className={styles.panelLabel}>Eksper Şirketi:</span>
            <span className={styles.panelValue}>{assignment.expert_company}</span>
          </div>
        )}
        {assignment?.expert_phone && (
          <div className={styles.panelRow}>
            <span className={styles.panelLabel}>Telefon No:</span>
            <span className={styles.panelValue}>{assignment.expert_phone}</span>
          </div>
        )}
        {assignment?.notes && (
          <div className={styles.panelRow}>
            <span className={styles.panelLabel}>Not:</span>
            <span className={styles.panelValue}>{assignment.notes}</span>
          </div>
        )}
        {!hasAnyData && (
          <div className={styles.panelEmpty}>Henüz eksper atanmadı.</div>
        )}
        <div className={styles.btnRow}>
          <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
            {hasAnyData ? "Düzenle" : "Eksper Bilgisi Ekle"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panelCard}>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Eksper Adı</label>
        <input
          className={styles.formInput}
          value={formData.expert_name}
          onChange={(e) => handleChange("expert_name", e.target.value)}
          placeholder="Eksper adı soyadı"
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Eksper Şirketi</label>
        <input
          className={styles.formInput}
          value={formData.expert_company}
          onChange={(e) => handleChange("expert_company", e.target.value)}
          placeholder="Eksper şirketi"
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Telefon No</label>
        <input
          className={styles.formInput}
          value={formData.expert_phone}
          onChange={(e) => handleChange("expert_phone", e.target.value)}
          placeholder="05XX XXX XX XX"
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Not</label>
        <textarea
          className={styles.formTextarea}
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Ek notlar..."
          rows={3}
        />
      </div>
      <div className={styles.btnRow}>
        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button className={styles.editBtn} onClick={() => setIsEditing(false)}>
          İptal
        </button>
      </div>
    </div>
  );
};

export default ExpertAssignmentPanel;
