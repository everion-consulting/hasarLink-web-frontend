import React, { useState } from "react";
import apiService from "../../services/apiServices";
import styles from "../../styles/Workflow.module.css";

const PAYMENT_STATUSES = [
  { value: "BEKLEMEDE", label: "Beklemede" },
  { value: "ONAYLANDI", label: "Onaylandı" },
  { value: "ODENDI", label: "Ödendi" },
  { value: "REDDEDILDI", label: "Reddedildi" },
];

const getStatusClass = (status) => {
  const map = {
    BEKLEMEDE: styles.statusBeklemede,
    ONAYLANDI: styles.statusOnaylandi,
    ODENDI: styles.statusOdendi,
    REDDEDILDI: styles.statusReddedildi,
  };
  return map[status] || "";
};

const InsurancePaymentPanel = ({ submissionId, payment, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(!payment);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    payment_amount: payment?.payment_amount || "",
    payment_status: payment?.payment_status || "BEKLEMEDE",
    payment_date: payment?.payment_date || "",
    payment_reference: payment?.payment_reference || "",
    notes: payment?.notes || "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.payment_amount) delete payload.payment_amount;
      if (!payload.payment_date) delete payload.payment_date;

      let res;
      if (payment) {
        res = await apiService.updateInsurancePayment(submissionId, payload);
      } else {
        res = await apiService.createInsurancePayment(submissionId, payload);
      }
      if (res.success) {
        onUpdate(res.data);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Ödeme kayıt hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    if (dateString.includes("T")) {
      const d = new Date(dateString);
      return d.toLocaleDateString("tr-TR");
    }
    const [y, m, d] = dateString.split("-");
    return `${d}.${m}.${y}`;
  };

  const formatAmount = (amount) => {
    if (!amount) return null;
    return Number(amount).toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " TL";
  };

  if (!isEditing && payment) {
    return (
      <div className={styles.panelCard}>
        {payment.payment_amount && (
          <div className={styles.panelRow}>
            <span className={styles.panelLabel}>Ödeme Tutarı:</span>
            <span className={styles.panelValue}>
              {formatAmount(payment.payment_amount)}
            </span>
          </div>
        )}
        <div className={styles.panelRow}>
          <span className={styles.panelLabel}>Durum:</span>
          <span className={`${styles.statusBadge} ${getStatusClass(payment.payment_status)}`}>
            {payment.payment_status_display || payment.payment_status}
          </span>
        </div>
        {payment.payment_date && (
          <div className={styles.panelRow}>
            <span className={styles.panelLabel}>Ödeme Tarihi:</span>
            <span className={styles.panelValue}>
              {formatDate(payment.payment_date)}
            </span>
          </div>
        )}
        {payment.payment_reference && (
          <div className={styles.panelRow}>
            <span className={styles.panelLabel}>Referans No:</span>
            <span className={styles.panelValue}>
              {payment.payment_reference}
            </span>
          </div>
        )}
        {payment.notes && (
          <div className={styles.panelRow}>
            <span className={styles.panelLabel}>Notlar:</span>
            <span className={styles.panelValue}>{payment.notes}</span>
          </div>
        )}
        <div className={styles.btnRow}>
          <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
            Güncelle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panelCard}>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Ödeme Tutarı (TL)</label>
        <input
          className={styles.formInput}
          type="number"
          step="0.01"
          value={formData.payment_amount}
          onChange={(e) => handleChange("payment_amount", e.target.value)}
          placeholder="0.00"
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Ödeme Durumu</label>
        <select
          className={styles.formSelect}
          value={formData.payment_status}
          onChange={(e) => handleChange("payment_status", e.target.value)}
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Ödeme Tarihi</label>
        <input
          className={styles.formInput}
          type="date"
          value={formData.payment_date}
          onChange={(e) => handleChange("payment_date", e.target.value)}
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Referans No</label>
        <input
          className={styles.formInput}
          value={formData.payment_reference}
          onChange={(e) => handleChange("payment_reference", e.target.value)}
          placeholder="Ödeme referans numarası"
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
          disabled={loading}
        >
          {loading ? "Kaydediliyor..." : payment ? "Güncelle" : "Ödeme Kaydı Oluştur"}
        </button>
        {payment && (
          <button className={styles.editBtn} onClick={() => setIsEditing(false)}>
            İptal
          </button>
        )}
      </div>
    </div>
  );
};

export default InsurancePaymentPanel;
