import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import submissionService from "../../services/submissionService";
import styles from "../../styles/documentUploaderScreen.module.css";
import FormFooter from "../forms/FormFooter";
import { FILE_TYPES } from "../../constants/filesTypes";
import toast from "react-hot-toast";

const DRAFT_DB_NAME = "hasarlink-upload-drafts";
const DRAFT_STORE_NAME = "document-uploader";
let draftDbPromise;

const getDraftDb = () => {
  if (draftDbPromise) {
    return draftDbPromise;
  }

  draftDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DRAFT_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DRAFT_STORE_NAME)) {
        db.createObjectStore(DRAFT_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return draftDbPromise;
};

const getDraftByKey = async (key) => {
  const db = await getDraftDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(DRAFT_STORE_NAME, "readonly");
    const store = tx.objectStore(DRAFT_STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

const saveDraftByKey = async (key, value) => {
  const db = await getDraftDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(DRAFT_STORE_NAME, "readwrite");
    const store = tx.objectStore(DRAFT_STORE_NAME);
    const request = store.put(value, key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const deleteDraftByKey = async (key) => {
  const db = await getDraftDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(DRAFT_STORE_NAME, "readwrite");
    const store = tx.objectStore(DRAFT_STORE_NAME);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

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

  const draftStorageKey = submissionId
    ? `document-uploader:${submissionId}`
    : "document-uploader:anonymous";


  const AI_EXCLUDED_FILE_TYPES = ["fotograflar", "diger"];
  const [checkingSections, setCheckingSections] = useState({});
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const previewUrlsRef = useRef(new Set());
  const MIN_PREVIEW_ZOOM = 1;
  const MAX_PREVIEW_ZOOM = 4;
  const PREVIEW_ZOOM_STEP = 0.1;

  const revokePreviewUrl = (previewUrl) => {
    if (!previewUrl || !previewUrlsRef.current.has(previewUrl)) {
      return;
    }

    URL.revokeObjectURL(previewUrl);
    previewUrlsRef.current.delete(previewUrl);
  };

  const serializeSectionsForDraft = (sectionsToPersist) => {
    return sectionsToPersist.map((section) => ({
      id: section.id,
      title: section.title,
      files: section.files.map((fileItem) => ({
        id: fileItem.id,
        file: fileItem.file,
        name: fileItem.name,
        type: fileItem.type,
        aiChecked: fileItem.aiChecked,
        aiResult: fileItem.aiResult,
      })),
    }));
  };

  const persistDraftSections = async (sectionsToPersist) => {
    try {
      await saveDraftByKey(draftStorageKey, {
        updatedAt: Date.now(),
        sections: serializeSectionsForDraft(sectionsToPersist),
      });
    } catch {
      // Kullanici akisinin bozulmamasi icin sessiz geciyoruz.
    }
  };

  const isAnyChecking = useMemo(() => {
    return Object.values(checkingSections).some(Boolean);
  }, [checkingSections]);


  /* --------------------------------------------------
     🔥 DİNAMİK FILE TYPES
  -------------------------------------------------- */
  const activeFileTypes = useMemo(() => {
    return FILE_TYPES.filter((f) => {
      // � Tekli kaza: karşı taraf alanları gizle
      if (kazaNitelik === "TEKLİ KAZA (BEYANLI)") {
        if (["sigortali_arac_ruhsat", "sigortali_arac_ehliyet", "karsi_taraf_surucu_ehliyet"].includes(f.id)) {
          return false;
        }
      }

      // 👤 Aynı kişi: mağdur sürücü ehliyeti göster, bizim sürücü ehliyeti gizle
      if (f.id === "magdur_surucu_ehliyet") {
        return samePerson === true;
      }

      if (f.id === "bizim_taraf_surucu_ehliyet") {
        return samePerson === false;
      }

      // 🚗 Farklı kişi: mağdur araç ehliyeti gizle
      if (f.id === "magdur_arac_ehliyet") {
        return samePerson === true;
      }

      if (f.id === "karsi_taraf_surucu_ehliyet") {
        return insuranceSource !== "bizim kasko" && karsiSamePerson === false;
      }

      return true;
    });
  }, [samePerson, insuranceSource, karsiSamePerson, kazaNitelik]);



  /* --------------------------------------------------
     SECTIONS STATE
  -------------------------------------------------- */
  const [sections, setSections] = useState([]);

  useEffect(() => {
    let isActive = true;

    const initializeSections = async () => {
      previewUrlsRef.current.forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });
      previewUrlsRef.current.clear();

      const emptySections = activeFileTypes.map((f) => ({
        id: f.id,
        title: f.title,
        files: []
      }));

      try {
        const draft = await getDraftByKey(draftStorageKey);

        if (!isActive || !draft?.sections) {
          if (isActive) {
            setSections(emptySections);
          }
          return;
        }

        const draftSectionMap = new Map(
          draft.sections.map((section) => [section.id, section])
        );

        const restoredSections = activeFileTypes.map((fileType) => {
          const draftSection = draftSectionMap.get(fileType.id);

          if (!draftSection?.files?.length) {
            return {
              id: fileType.id,
              title: fileType.title,
              files: [],
            };
          }

          const restoredFiles = draftSection.files
            .filter((item) => item?.file)
            .map((item) => {
              const preview = URL.createObjectURL(item.file);
              previewUrlsRef.current.add(preview);

              return {
                id: item.id,
                file: item.file,
                preview,
                name: item.name,
                type: item.type,
                aiChecked: Boolean(item.aiChecked),
                aiResult: item.aiResult ?? null,
              };
            });

          return {
            id: fileType.id,
            title: fileType.title,
            files: restoredFiles,
          };
        });

        setSections(restoredSections);
      } catch {
        if (isActive) {
          setSections(emptySections);
        }
      }
    };

    initializeSections();

    return () => {
      isActive = false;
    };
  }, [activeFileTypes, draftStorageKey]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });
      previewUrlsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!selectedPreview) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closePreview();
      }

      if (selectedPreview.type.includes("pdf")) {
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        changePreviewZoom(PREVIEW_ZOOM_STEP);
      }

      if (event.key === "-") {
        event.preventDefault();
        changePreviewZoom(-PREVIEW_ZOOM_STEP);
      }

      if (event.key === "0") {
        event.preventDefault();
        setPreviewZoom(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPreview]);

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

  const isNextDisabled = uploading || isAnyChecking;

  /* --------------------------------------------------
     FILE SELECT
  -------------------------------------------------- */
  const handleFileSelect = async (e, sectionId) => {
    const files = Array.from(e.target.files);

    setCheckingSections(p => ({ ...p, [sectionId]: true }));

    const validatedFiles = [];

    for (const file of files) {
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);

      // 🧠 Fotograf & Diger hariç AI kontrolü
      if (!AI_EXCLUDED_FILE_TYPES.includes(sectionId)) {
        const aiResult = await checkWithAI(file, sectionId);

        if (!aiResult) {
          revokePreviewUrl(previewUrl);
          setCheckingSections(p => ({ ...p, [sectionId]: false }));
          e.target.value = "";
          return; // ❌ yanlış belge → ekleme
        }

        validatedFiles.push({
          id: `${sectionId}-${Date.now()}-${Math.random()}`,
          file,
          preview: previewUrl,
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
          preview: previewUrl,
          name: file.name,
          type: file.type,
          aiChecked: false,
          aiResult: null,
        });
      }
    }

    // ✅ STATE’E EKLE
    setSections(prev => {
      const nextSections = prev.map(sec =>
        sec.id === sectionId
          ? { ...sec, files: [...sec.files, ...validatedFiles] }
          : sec
      );

      void persistDraftSections(nextSections);
      return nextSections;
    });

    setCheckingSections(p => ({ ...p, [sectionId]: false }));
    e.target.value = "";
  };


  /* --------------------------------------------------
     DELETE FILE
  -------------------------------------------------- */
  const handleDelete = (sectionId, fileId) => {
    setSections((prev) =>
      {
        const nextSections = prev.map((sec) => {
        if (sec.id !== sectionId) {
          return sec;
        }

        const fileToDelete = sec.files.find((fileItem) => fileItem.id === fileId);

        if (fileToDelete?.preview) {
          revokePreviewUrl(fileToDelete.preview);
        }

        if (selectedPreview?.url === fileToDelete?.preview) {
          setSelectedPreview(null);
        }

        return { ...sec, files: sec.files.filter((f) => f.id !== fileId) };
      });

        void persistDraftSections(nextSections);
        return nextSections;
      }
    );
  };

  const openPreview = (item) => {
    if (!item.preview) {
      return;
    }

    setPreviewZoom(1);
    setSelectedPreview({
      url: item.preview,
      type: item.type,
      name: item.name,
    });
  };

  const closePreview = () => {
    setSelectedPreview(null);
    setPreviewZoom(1);
  };

  const changePreviewZoom = (delta) => {
    setPreviewZoom((currentZoom) => {
      const nextZoom = currentZoom + delta;
      return Math.min(MAX_PREVIEW_ZOOM, Math.max(MIN_PREVIEW_ZOOM, Number(nextZoom.toFixed(2))));
    });
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

      await deleteDraftByKey(draftStorageKey).catch(() => {});

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
                      <button
                        type="button"
                        className={styles.previewTrigger}
                        onClick={() => openPreview(item)}
                        aria-label={`${item.name} onizlemesini buyut`}
                      >
                        {item.type.includes("pdf") ? (
                          <div className={styles.pdfPreview}>📄 {item.name}</div>
                        ) : (
                          <img
                            src={item.preview}
                            className={styles.imagePreview}
                            alt={item.name}
                          />
                        )}
                      </button>

                      <button
                        type="button"
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

      {selectedPreview && (
        <div
          className={styles.previewModalOverlay}
          onClick={closePreview}
        >
          <div
            className={styles.previewModalContent}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.previewModalClose}
              onClick={closePreview}
              aria-label="Onizlemeyi kapat"
            >
              ×
            </button>

            <div className={styles.previewModalHeader}>
              <span className={styles.previewModalTitle}>{selectedPreview.name}</span>
              {!selectedPreview.type.includes("pdf") && (
                <div className={styles.previewToolbar}>
                  <button
                    type="button"
                    className={styles.previewToolbarButton}
                    onClick={() => changePreviewZoom(-PREVIEW_ZOOM_STEP)}
                    disabled={previewZoom <= MIN_PREVIEW_ZOOM}
                    aria-label="Uzaklastir"
                  >
                    -
                  </button>
                  <span className={styles.previewZoomValue}>%{Math.round(previewZoom * 100)}</span>
                  <button
                    type="button"
                    className={styles.previewToolbarButton}
                    onClick={() => changePreviewZoom(PREVIEW_ZOOM_STEP)}
                    disabled={previewZoom >= MAX_PREVIEW_ZOOM}
                    aria-label="Yakinlastir"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className={styles.previewToolbarButton}
                    onClick={() => setPreviewZoom(1)}
                    disabled={previewZoom === 1}
                  >
                    Sifirla
                  </button>
                </div>
              )}
            </div>

            {selectedPreview.type.includes("pdf") ? (
              <iframe
                src={selectedPreview.url}
                title={selectedPreview.name}
                className={styles.previewPdfFrame}
              />
            ) : (
              <div className={styles.previewImageViewport}>
                <div
                  className={styles.previewImageStage}
                  style={{
                    width: previewZoom > 1 ? `${previewZoom * 100}%` : "100%",
                    minWidth: previewZoom > 1 ? `${previewZoom * 100}%` : "100%",
                  }}
                >
                  <img
                    src={selectedPreview.url}
                    alt={selectedPreview.name}
                    className={styles.previewModalImage}
                    style={{
                      maxWidth: previewZoom > 1 ? "none" : "100%",
                      maxHeight: previewZoom > 1 ? "none" : "calc(100vh - 190px)",
                      width: previewZoom > 1 ? "100%" : "auto",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <FormFooter
        onBack={onBack}
        onNext={handleUpload}
        nextLabel={
          isAnyChecking
            ? "Kontrol Ediliyor..."
            : uploading
              ? "Yükleniyor..."
              : "DEVAM ET"
        }
        backLabel="GERİ DÖN"
        disabled={isNextDisabled}
      />
    </div>
  );
};

export default DocumentUploaderScreen;
