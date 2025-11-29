// src/screens/file/DocumentUploaderScreen.jsx
import React, { useState } from "react";
import apiService from "../../services/apiServices";

// ⬇️ ARTIK CSS MODULE
import styles from "../../styles/documentUploaderScreen.module.css";
import FormFooter from "../forms/FormFooter";

const FILE_TYPES = [
  { id: "tutanak", title: "Anlaşmalı Tutanak" },
  { id: "magdur_arac_ruhsat", title: "Mağdur Araç Ruhsatı" },
  { id: "magdur_arac_ehliyet", title: "Mağdur Araç Ehliyeti" },
  { id: "sigortali_arac_ruhsat", title: "Karşı Sigortalı Araç Ruhsatı" },
  { id: "sigortali_arac_ehliyet", title: "Karşı Sigortalı Araç Ehliyeti" },
  { id: "fotograflar", title: "Olay Yeri Fotoğrafları" },
  { id: "diger", title: "Diğer Evraklar" },
];

const DocumentUploaderScreen = ({ routeState = {}, onBack, onContinue }) => {
  const [sections, setSections] = useState(
    FILE_TYPES.map((f) => ({ id: f.id, title: f.title, files: [] }))
  );

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleFileSelect = (e, sectionId) => {
    const files = Array.from(e.target.files);

    setSections((prev) =>
      prev.map((sec) =>
        sec.id === sectionId
          ? {
            ...sec,
            files: [
              ...sec.files,
              ...files.map((f) => ({
                id: `${sectionId}-${Date.now()}-${Math.random()}`,
                file: f,
                preview: f.type.includes("image")
                  ? URL.createObjectURL(f)
                  : null,
                name: f.name,
                type: f.type,
              })),
            ],
          }
          : sec
      )
    );
  };

  const handleDelete = (sectionId, fileId) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === sectionId
          ? { ...sec, files: sec.files.filter((f) => f.id !== fileId) }
          : sec
      )
    );
  };

  const handleUpload = async () => {
    try {
      const submissionId = routeState.submissionId;
      if (!submissionId) return alert("Submission ID bulunamadı!");

      const allFiles = sections.flatMap((s) => s.files);
      setProgress({ current: 0, total: allFiles.length });
      setUploading(true);

      for (const section of sections) {
        for (const item of section.files) {
          const formData = new FormData();
          formData.append("submission", submissionId);
          formData.append("file_type", section.id.replace(/_/g, " "));
          formData.append("summary", section.title);
          formData.append("file", item.file);

          await apiService.uploadFile(formData);

          setProgress((p) => ({ ...p, current: p.current + 1 }));
        }
      }

      const docs = Object.fromEntries(
        sections.map((s) => [s.id, s.files])
      );

      if (onContinue) {
        onContinue({ documents: docs });
      }
    } catch (e) {
      console.error(e);
      alert("Yükleme sırasında hata oluştu");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.uploadContainer}>
      {sections.map((section) => (
        <div key={section.id} className={styles.uploadCard}>
          <div className={styles.uploadCardHeader}>
            <div className={styles.uploadCardTitle}>{section.title}</div>

            <label className={styles.uploadButton}>
              + YÜKLE
              <input
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={(e) => handleFileSelect(e, section.id)}
              />
            </label>
          </div>

          <div className={styles.uploadPreviewArea}>
            {section.files.length === 0 && (
              <div className={styles.uploadEmpty}>Dosya yok</div>
            )}

            {section.files.length > 0 && (
              <div className={styles.previewList}>
                {section.files.map((item) => (
                  <div key={item.id} className={styles.previewItem}>
                    {item.type.includes("pdf") ? (
                      <div className={styles.pdfPreview}>
                        📄 <span>{item.name}</span>
                      </div>
                    ) : (
                      <img
                        src={item.preview}
                        className={styles.imagePreview}
                        alt=""
                      />
                    )}

                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(section.id, item.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* --- BUTONLAR --- */}
      <FormFooter
        onBack={() => navigate(-1)}
        onNext={handleUpload}
        nextLabel="DEVAM ET"
        backLabel="GERİ DÖN"
      />

      {uploading && (
        <div className={styles.uploadOverlay}>
          <div className={styles.uploadModal}>
            <div>Dosyalar Yükleniyor...</div>
            <div>
              {progress.current} / {progress.total}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUploaderScreen;