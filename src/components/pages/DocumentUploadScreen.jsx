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

  const submissionId =
    routeState?.submissionId ||
    routeState?.submission_id ||
    location.state?.submissionId ||
    location.state?.submission_id ||
    localStorage.getItem("submissionId");

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
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  const CONCURRENT_UPLOADS = 3;

  const uploadSingleFile = async (item) => {
    const formData = new FormData();
    formData.append("submission", submissionId);
    formData.append("file_type", item.sectionId);
    formData.append("summary", item.title);
    formData.append("name", item.name || "Dosya");
    formData.append("file", item.file);
    formData.append("_uploaded_as", item.sectionId);

    const res = await submissionService.uploadFile(formData);
    return { item, res };
  };

  const handleUpload = async () => {
    try {
      if (!submissionId) {
        alert("Submission ID bulunamadi");
        return;
      }

      const allFiles = sections.flatMap((s) =>
        s.files.map((f) => ({
          ...f,
          sectionId: s.id,
          title: s.title
        }))
      );

      if (allFiles.length === 0) {
        alert("Lutfen en az bir dosya yukleyin");
        return;
      }

      // Dosya boyutu kontrolu
      const oversized = allFiles.filter((f) => f.file.size > MAX_FILE_SIZE);
      if (oversized.length > 0) {
        const names = oversized.map((f) => f.name).join(", ");
        alert(`Su dosyalar 10MB limitini asiyor: ${names}`);
        return;
      }

      setUploading(true);
      setProgress({ current: 0, total: allFiles.length });

      // Paralel yukleme (ayni anda CONCURRENT_UPLOADS kadar)
      const failedFiles = [];
      let completed = 0;

      for (let i = 0; i < allFiles.length; i += CONCURRENT_UPLOADS) {
        const batch = allFiles.slice(i, i + CONCURRENT_UPLOADS);
        const results = await Promise.allSettled(
          batch.map((item) => uploadSingleFile(item))
        );

        for (const result of results) {
          completed++;
          setProgress({ current: completed, total: allFiles.length });

          if (result.status === "rejected") {
            failedFiles.push({ name: batch[results.indexOf(result)]?.name, error: "Baglanti hatasi" });
          } else if (!result.value.res?.success) {
            failedFiles.push({ name: result.value.item.name, error: result.value.res?.error || "Yuklenemedi" });
          }
        }
      }

      if (failedFiles.length > 0) {
        const summary = failedFiles.map((f) => `${f.name}: ${f.error}`).join("\n");
        alert(`${failedFiles.length} dosya yuklenemedi:\n${summary}`);
      }

      // Hic dosya yuklenememisse devam etme
      if (failedFiles.length === allFiles.length) {
        return;
      }

      /* ---------- AI MODE ---------- */
      if (!isAiMode) {
        onContinue?.();
        return;
      }

      const aiRes = await uploadToEverionAI(
        allFiles
          .filter((f) => !failedFiles.some((ff) => ff.name === f.name))
          .map((f) => ({ file: f.file, folderName: f.sectionId }))
      );

      const totalCount =
        typeof aiRes?.total === "number" ? aiRes.total : allFiles.length - failedFiles.length;

      localStorage.setItem("total", String(totalCount));

      console.log("Everion aiRes:", aiRes);
      console.log("Saved total:", localStorage.getItem("total"));

      navigate("/victim-info", {
        state: {
          submissionId,
          startStep: 2,
          aiDocuments: aiRes?.results || [],
          kazaNitelik,
          insuranceSource,
          selectedCompany,
          samePerson,
          karsiSamePerson,
          total: totalCount,
        },
      });

    } catch (err) {
      console.error(err);
      alert("Yukleme sirasinda hata olustu");
    } finally {
      setUploading(false);
    }
  };

  /* --------------------------------------------------
     AI UPLOAD (file + folder_name)
  -------------------------------------------------- */
  async function uploadToEverionAI(filesWithMeta) {
    const AI_UPLOAD_TIMEOUT = 180000; // 180 saniye (Gemini analiz suresi icin)

    const formData = new FormData();

    filesWithMeta.forEach((item) => {
      formData.append("files", item.file);
      formData.append("folder_names", item.folderName);
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_UPLOAD_TIMEOUT);

    try {
      const res = await fetch(
        "https://doc.everionai.com/api/documents/upload/",
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData?.error || `Everion AI hata (HTTP ${res.status})`
        );
      }

      return await res.json();
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error("AI analiz suresi doldu. Lutfen tekrar deneyin.");
      }
      throw err;
    }
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
              <p>Yükleniyor, Lütfen Bekleyiniz...</p>
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
