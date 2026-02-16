import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import submissionService from "../../services/submissionService";
import styles from "../../styles/documentUploaderScreen.module.css";
import FormFooter from "../forms/FormFooter";
import { FILE_TYPES } from "../../constants/filesTypes";
import toast from "react-hot-toast";

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


  const AI_EXCLUDED_FILE_TYPES = ["fotograflar", "diger"];
  const [checkingSections, setCheckingSections] = useState({});


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

  const EXPECTED_DOC_TYPES = {
    tutanak: "Kaza Tespit Tutanağı",
    magdur_arac_ruhsat: "Ruhsat",
    magdur_arac_ehliyet: "Kimlik",
    bizim_taraf_surucu_ehliyet: "Kimlik",
    sigortali_arac_ruhsat: "Ruhsat",
    sigortali_arac_ehliyet: "Kimlik",
    karsi_taraf_surucu_ehliyet: "Kimlik",
  };



  /* --------------------------------------------------
     FILE SELECT
  -------------------------------------------------- */
  const handleFileSelect = async (e, sectionId) => {
    const files = Array.from(e.target.files);

    setCheckingSections(p => ({ ...p, [sectionId]: true }));

    const validatedFiles = [];

    for (const file of files) {
      // 🧠 Fotograf & Diger hariç AI kontrolü
      if (!AI_EXCLUDED_FILE_TYPES.includes(sectionId)) {
        const aiResult = await checkWithAI(file, sectionId);

        if (!aiResult) {
          setCheckingSections(p => ({ ...p, [sectionId]: false }));
          e.target.value = "";
          return; // ❌ yanlış belge → ekleme
        }

        validatedFiles.push({
          id: `${sectionId}-${Date.now()}-${Math.random()}`,
          file,
          preview: file.type.includes("image")
            ? URL.createObjectURL(file)
            : null,
          name: file.name,
          type: file.type,
          aiChecked: true,
          aiResult, // 🔥 KAYIT
        });
      } else {
        // AI olmayanlar
        validatedFiles.push({
          id: `${sectionId}-${Date.now()}-${Math.random()}`,
          file,
          preview: file.type.includes("image")
            ? URL.createObjectURL(file)
            : null,
          name: file.name,
          type: file.type,
          aiChecked: false,
          aiResult: null,
        });
      }
    }

    // ✅ STATE’E EKLE
    setSections(prev =>
      prev.map(sec =>
        sec.id === sectionId
          ? { ...sec, files: [...sec.files, ...validatedFiles] }
          : sec
      )
    );

    setCheckingSections(p => ({ ...p, [sectionId]: false }));
    e.target.value = "";
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
    if (!submissionId) {
      toast.error("Submission bulunamadı");
      return;
    }

    const allFiles = sections.flatMap(s =>
      s.files.map(f => ({
        ...f,
        sectionId: s.id,
        title: s.title,
      }))
    );

    if (allFiles.length === 0) {
      toast.error("Lütfen en az bir belge yükleyin");
      return;
    }

    setUploading(true);
    setProgress({ current: 0, total: allFiles.length });

    try {
      let completed = 0;

      for (let i = 0; i < allFiles.length; i += CONCURRENT_UPLOADS) {
        const batch = allFiles.slice(i, i + CONCURRENT_UPLOADS);

        await Promise.all(
          batch.map(async (item) => {
            await uploadSingleFile(item);
            completed++;
            setProgress({ current: completed, total: allFiles.length });
          })
        );
      }

      // 🔥 AI SONUÇLARI ZATEN ELİNDE
      const aiDocuments = allFiles
        .filter(f => f.aiChecked)
        .map(f => f.aiResult);

      navigate("/victim-info", {
        state: {
          submissionId,
          aiDocuments, // 👈 TEKRAR AI YOK
          kazaNitelik,
          insuranceSource,
          selectedCompany,
          samePerson,
          karsiSamePerson,
        },
      });

    } catch (err) {
      toast.error("Yükleme sırasında hata oluştu");
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

  const checkWithAI = async (file, sectionId) => {
    const expectedType = EXPECTED_DOC_TYPES[sectionId];
    if (!expectedType) return null;

    const formData = new FormData();
    formData.append("files", file);
    formData.append("folder_names", sectionId);

    const res = await fetch("https://doc.everionai.com/api/documents/upload/", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    const detectedType = data?.results?.[0]?.doc_type;

    if (
      !detectedType ||
      !detectedType.toLowerCase().includes(expectedType.toLowerCase())
    ) {
      toast.error(
        `Yanlış belge tipi • Beklenen: ${expectedType} • Algılanan: ${detectedType}`
      );
      return null;
    }

    return data.results[0];
  };

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
                <div className={styles.uploadEmpty}>
                  {checkingSections[section.id]
                    ? "Belge kontrol ediliyor..."
                    : "Dosya yok"}
                </div>
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
