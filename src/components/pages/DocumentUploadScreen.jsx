import React, { useState } from "react";
import submissionService from "../../services/submissionService";
import styles from "../../styles/documentUploaderScreen.module.css";
import FormFooter from "../forms/FormFooter";

import { FILE_TYPES } from "../../constants/filesTypes";




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
      if (!submissionId) {
        alert("Submission ID bulunamadı!");
        return;
      }

      const allFiles = sections.flatMap((s) => s.files);
      setProgress({ current: 0, total: allFiles.length });
      setUploading(true);

      for (const section of sections) {
        for (const item of section.files) {
          const formData = new FormData();

          formData.append("submission", submissionId);
          formData.append("file_type", section.id);
          formData.append("summary", section.title);
          formData.append("name", item.name || "Dosya");
          formData.append("file", item.file); // <input type="file" /> File objesi

          const res = await submissionService.uploadFile(formData);

          // 🔴 BURASI ÇOK ÖNEMLİ: backend ne döndürüyor görelim
          console.log("UPLOAD RES", {
            section: section.id,
            success: res.success,
            status: res.status,
            data: res.data,
          });

          if (!res.success) {
            // FileViewSet.create böyle dönüyor:
            // { success: False, error: 'Validasyon hatası', details: {...} }
            const details = res.data?.details || res.data?.data || res.data;
            console.error("Upload failed details:", details);

            alert(
              "Dosya yüklenemedi:\n" +
              (JSON.stringify(details, null, 2) || res.message)
            );

            // şu anlık tüm yüklemeyi keselim, istersen continue da edebilirsin
            throw new Error("Upload failed");
          }

          setProgress((p) => ({ ...p, current: p.current + 1 }));
        }
      }

      const docs = Object.fromEntries(sections.map((s) => [s.id, s.files]));

      if (onContinue) {
        onContinue({ documents: docs });
      }
    } catch (e) {
      console.error("upload error:", e);
      if (!uploading) {
        alert("Yükleme sırasında hata oluştu");
      }
    } finally {
      setUploading(false);
    }
  };


  const isAllChosenForCurrentStep = sections.some(section => section.files.length > 0);
  return (
    <div>
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
      <FormFooter
        onBack={onBack}
        onNext={handleUpload}
        nextLabel="DEVAM ET"
        backLabel="GERİ DÖN"
      />
    </div>
  );
};

export default DocumentUploaderScreen;