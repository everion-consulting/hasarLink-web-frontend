import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import submissionService from "../../services/submissionService";
import styles from "../../styles/documentUploaderScreen.module.css";
import FormFooter from "../forms/FormFooter";
import { FILE_TYPES } from "../../constants/filesTypes";

/* --------------------------------------------------
   DOCUMENT UPLOADER
-------------------------------------------------- */
const DocumentUploaderScreen = ({
  routeState = {},
  onBack,
  onContinue,
  aiMode = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  /* --------------------------------------------------
     ROUTE / STATE
  -------------------------------------------------- */
  const isAiMode = aiMode || location.state?.aiMode === true;

  const kazaNitelik =
    routeState?.kazaNitelik || location.state?.kazaNitelik;

  const insuranceSource =
    routeState?.insuranceSource || location.state?.insuranceSource;

  const selectedCompany =
    routeState?.selectedCompany || location.state?.selectedCompany;

  const samePerson =
    routeState?.samePerson ?? location.state?.samePerson;

  const karsiSamePerson =
    routeState?.karsiSamePerson ?? location.state?.karsiSamePerson;
  const [documents, setDocuments] = useState({});
  const [documentCount, setDocumentCount] = useState(0);


  const submissionId =
    routeState?.submissionId ||
    routeState?.submission_id ||
    location.state?.submissionId ||
    location.state?.submission_id ||
    localStorage.getItem("submissionId");


  const buildDocumentsMap = (sections) => {
    const map = {};
    sections.forEach((sec) => {
      map[sec.id] = sec.files || [];
    });
    return map;
  };

  const countDocuments = (documents) => {
    if (!documents) return 0;
    const all = Object.values(documents).flatMap((v) => (Array.isArray(v) ? v : [v]));
    return all.filter((x) => x && (x.file || x.preview || x instanceof File)).length;
  };


  /* --------------------------------------------------
     🔥 DİNAMİK FILE TYPES
  -------------------------------------------------- */
  const activeFileTypes = useMemo(() => {
    return FILE_TYPES.filter((f) => {
      if (f.id === "bizim_taraf_surucu_ehliyet") {
        return samePerson === false;
      }

      if (f.id === "karsi_taraf_surucu_ehliyet") {
        return insuranceSource !== "bizim kasko" && karsiSamePerson === false;
      }

      return true;
    });
  }, [samePerson, insuranceSource, karsiSamePerson]);

  /* --------------------------------------------------
     SECTIONS STATE
  -------------------------------------------------- */
  const [sections, setSections] = useState([]);

  useEffect(() => {
    setSections(
      activeFileTypes.map((f) => ({
        id: f.id,
        title: f.title,
        files: []
      }))
    );
  }, [activeFileTypes]);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  /* --------------------------------------------------
     FILE SELECT
  -------------------------------------------------- */
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
                type: f.type
              }))
            ]
          }
          : sec
      )
    );
  };

  /* --------------------------------------------------
     DELETE FILE
  -------------------------------------------------- */
  const handleDelete = (sectionId, fileId) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === sectionId
          ? { ...sec, files: sec.files.filter((f) => f.id !== fileId) }
          : sec
      )
    );
  };

  /* --------------------------------------------------
     UPLOAD
  -------------------------------------------------- */
  const handleUpload = async () => {
    try {
      const submissionId = routeState.submissionId;
      if (!submissionId) {
        alert("Submission ID bulunamadı!");
        return;
      }

      const allFiles = sections.flatMap((s) => s.files);
      if (allFiles.length === 0) {
        alert("Lütfen en az bir dosya yükleyin");
        return;
      }

      setUploading(true);
      setProgress({ current: 0, total: allFiles.length });

      let backendTotal = 0;

      for (const section of sections) {
        for (const item of section.files) {
          const formData = new FormData();
          formData.append("submission", submissionId);
          formData.append("file_type", section.id);
          formData.append("summary", section.title);
          formData.append("name", item.name || "Dosya");
          formData.append("file", item.file);

          const res = await submissionService.uploadFile(formData);

          // 🔥 BURASI KRİTİK
          if (typeof res?.total === "number") {
            backendTotal = res.total;
          }

          if (res?.success === false) {
            alert("Dosya yüklenemedi");
            return;
          }

          setProgress((p) => ({ ...p, current: p.current + 1 }));
        }
      }

      // ✅ BACKEND TOTAL VARSA ONU KULLAN
      const documentCount = backendTotal || allFiles.length;

      // 👉 Bir sonraki ekrana TAŞI
      onContinue?.({ documentCount });

    } catch (e) {
      console.error(e);
      alert("Yükleme sırasında hata oluştu");
    } finally {
      setUploading(false);
    }
  };


  /* --------------------------------------------------
     AI UPLOAD (file + folder_name)
  -------------------------------------------------- */
  async function uploadToEverionAI(filesWithMeta) {
    const formData = new FormData();

    filesWithMeta.forEach((item) => {
      formData.append("files", item.file);
      formData.append("folder_names", item.folderName);
    });

    const res = await fetch(
      "https://doc.everionai.com/api/documents/upload/",
      {
        method: "POST",
        body: formData
      }
    );

    if (!res.ok) {
      throw new Error("Everion AI upload failed");
    }

    return await res.json();
  }

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */
  return (
    <div>
      <div className={styles.topTextContainer}>
        <p className={styles.topText}>
          Lütfen belgelerinizi okunur netlikte yükleyin...
        </p>
      </div>

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
                        <div className={styles.pdfPreview}>📄 {item.name}</div>
                      ) : (
                        <img
                          src={item.preview}
                          className={styles.imagePreview}
                          alt=""
                        />
                      )}

                      <button
                        className={styles.deleteBtn}
                        onClick={() =>
                          handleDelete(section.id, item.id)
                        }
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
              {progress.current} / {progress.total}
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
