    import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiService from "../../services/apiServices";
import submissionService from "../../services/apiServices";
import "../../styles/FileDetail.css";

const FileDetail = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();

  const [fileData, setFileData] = useState(null);
  const [fileImages, setFileImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const statusMap = {
    PENDING: "Beklemede",
    IN_PROGRESS: "İşlemde",
    REJECTED: "Reddedildi",
    COMPLETED: "Tamamlandı",
  };

  useEffect(() => {
    const fetchFileDetail = async () => {
      try {
        const res = await apiService.getSubmissionDetail(fileId);

        if (!res.success) {
          console.error("❌ Dosya detayı alınamadı:", res.message);
          return;
        }

        console.log("✅ Dosya Detayı:", res?.data);
        setFileData(res?.data);
      } catch (err) {
        console.error("❌ Hata:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSubmissionFiles = async () => {
      try {
        const res = await apiService.getSubmissionFiles(fileId);

        if (!res.success) {
          console.error("❌ Dosya görselleri alınamadı:", res.message);
          return;
        }

        const filesArray = Array.isArray(res?.data.files)
          ? res?.data.files
          : Array.isArray(res?.data.results)
          ? res?.data.results
          : [];

        const grouped = {};
        filesArray.forEach((f) => {
          if (!grouped[f.file_type]) grouped[f.file_type] = [];
          grouped[f.file_type].push({
            id: f.id,
            url: f.file_url,
            name: f.name,
            uploaded_at: f.uploaded_at,
          });
        });

        setFileImages(grouped);
      } catch (err) {
        console.error("❌ Görsel fetch hatası:", err);
      }
    };

    fetchFileDetail();
    fetchSubmissionFiles();
  }, [fileId]);

  const renderInfoRow = (label, value) => {
    if (!value) return null;
    return (
      <div className="info-row">
        <span className="info-label">{label}:</span>
        <span className="info-value">{value}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="file-detail-container">
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className="file-detail-container">
        <p className="no-data">Veri bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="file-detail-container">
      <h1 className="page-title">Dosya Detayı</h1>

      <div className="detail-card">
        <h2 className="section-title">Dosya Bilgileri</h2>
        {renderInfoRow("Durum", statusMap[fileData.status] || fileData.status)}
        {renderInfoRow("Sigorta Şirketi", fileData.insurance_company_name)}
        {renderInfoRow("Oluşturulma Tarihi", fileData.created_at?.slice(0, 10))}
        {renderInfoRow("İşlenme Tarihi", fileData.processed_at?.slice(0, 10))}
        {renderInfoRow("Tamamlanma Tarihi", fileData.completed_at?.slice(0, 10))}
        {renderInfoRow("Atanan Memur", fileData.assigned_officer)}

        <div className="separator"></div>

        <h2 className="section-title">Sürücü Bilgileri</h2>
        {renderInfoRow("Ad Soyad", fileData.driver_fullname)}
        {renderInfoRow("Doğum Tarihi", fileData.driver_birth_date)}
        {renderInfoRow("Email", fileData.driver_mail)}
        {renderInfoRow("Telefon", fileData.driver_phone)}
        {renderInfoRow("TC", fileData.driver_tc)}

        <div className="separator"></div>

        <h2 className="section-title">Mağdur Bilgileri</h2>
        {renderInfoRow("Ad Soyad", fileData.victim_fullname)}
        {renderInfoRow("Doğum Tarihi", fileData.victim_birth_date)}
        {renderInfoRow("İBAN", fileData.victim_iban)}
        {renderInfoRow("Email", fileData.victim_mail)}
        {renderInfoRow("Telefon", fileData.victim_phone)}
        {renderInfoRow("TC", fileData.victim_tc)}

        <div className="separator"></div>

        <h2 className="section-title">Araç Bilgileri</h2>
        {renderInfoRow("Plaka", fileData.vehicle_plate)}
        {renderInfoRow("Araç Markası", fileData.vehicle_brand)}
        {renderInfoRow("Araç Modeli", fileData.vehicle_model)}
        {renderInfoRow("Şasi No", fileData.vehicle_chassis_no)}
        {renderInfoRow("Motor No", fileData.vehicle_engine_no)}
        {renderInfoRow("Ruhsat Seri No", fileData.vehicle_license_no)}
        {renderInfoRow("Araç Türü", fileData.vehicle_type)}
        {renderInfoRow("Araç Kullanım Türü", fileData.vehicle_usage_type)}
        {renderInfoRow("Model Yılı", fileData.vehicle_year)}

        <div className="separator"></div>

        <h2 className="section-title">Kaza Bilgileri</h2>
        {renderInfoRow("Kaza Tarihi", fileData.accident_date?.slice(0, 10))}
        {renderInfoRow("Kaza Yeri", fileData.accident_location)}

        <div className="separator"></div>

        <h2 className="section-title">Yüklenen Dosyalar</h2>
        {Object.keys(fileImages).length === 0 ? (
          <p className="no-files">Henüz yüklenmiş dosya bulunmuyor.</p>
        ) : (
          Object.entries(fileImages).map(([type, files]) => (
            <div key={type} className="file-type-section">
              <h3 className="file-type-title">{type.toUpperCase()}</h3>
              <div className="file-images-grid">
                {files.map((f) => (
                  <div key={f.id} className="file-image-item">
                    <img
                      src={f.url}
                      alt={f.name}
                      className="file-thumbnail"
                      onClick={() => setSelectedImage(f.url)}
                    />
                    <p className="file-name">{f.name || "Dosya"}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bottom-buttons">
        <button className="back-button" onClick={() => navigate(-1)}>
          GERİ DÖN
        </button>
      </div>

      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content">
            <button className="close-modal" onClick={() => setSelectedImage(null)}>
              ×
            </button>
            <img src={selectedImage} alt="Büyük Görsel" className="modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDetail;
