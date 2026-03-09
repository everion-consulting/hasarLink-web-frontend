import React from "react";
import styles from "../../styles/Workflow.module.css";

const WORKFLOW_STEPS = [
  { key: "DOSYA_ACILDI", label: "Dosya Açıldı" },
  { key: "EKSPER_ATANDI", label: "Eksper Atandı" },
  { key: "ONARIM_SURECINDE", label: "Onarım Sürecinde" },
  { key: "RAPOR_TAMAMLANDI", label: "Rapor Tamamlandı" },
  { key: "DOSYA_KAPANDI", label: "Dosya Kapandı" },
  { key: "SIGORTAYA_GONDERILDI", label: "Sigortaya Gönderildi" },
  { key: "ODEME_ALINDI", label: "Ödeme Alındı" },
];

const WorkflowTimeline = ({ currentStage }) => {
  const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.key === currentStage);

  return (
    <div className={styles.timeline}>
      {WORKFLOW_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;

        const stepClass = isCompleted
          ? styles.completed
          : isActive
          ? styles.active
          : styles.pending;

        return (
          <div key={step.key} className={`${styles.timelineStep} ${stepClass}`}>
            <div className={styles.stepIndicator}>
              <div className={styles.stepCircle}>
                {isCompleted ? "✓" : index + 1}
              </div>
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className={styles.stepLine} />
              )}
            </div>
            <div className={styles.stepContent}>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WorkflowTimeline;
