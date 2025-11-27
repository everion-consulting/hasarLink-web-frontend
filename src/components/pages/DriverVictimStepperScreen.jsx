import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/DriveVictimStepper.css';
import FormRenderer from '../forms/FormRenderer';
import vehicleFields from '../../constants/vehicleFields';
import Stepper from '../stepper/Stepper';

const DriverVictimStepperScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    victimData = {},
    driverData = {},
    samePerson = false,
    selectedCompany,
    insuranceSource,
    kazaNitelik,
    karsiSamePerson,
    vehicleData: existingVehicleData,
    ...otherParams
  } = location.state || {};

  const [vehicleData, setVehicleData] = useState(
    existingVehicleData || {
      vehicle_brand: '',
      vehicle_type: '',
      vehicle_model: '',
      vehicle_license_no: '',
      vehicle_chassis_no: '',
      vehicle_engine_no: '',
      vehicle_year: '',
      vehicle_plate: '',
      vehicle_usage_type: ''
    }
  );

  // 🔍 vehicleData her değiştiğinde log'la
  useEffect(() => {
    console.log('🚗 vehicleData güncellendi:', vehicleData);
  }, [vehicleData]);

  const handleSetVehicleData = (newData) => {
    console.log('📝 setVehicleData çağrıldı:', newData);

    if (typeof newData === 'function') {
      setVehicleData(prevData => {
        const result = newData(prevData);
        console.log('📝 Function sonucu:', result);
        return result;
      });
    } else {
      setVehicleData(newData);
    }
  };

  const steps = samePerson
    ? ['Mağdur Bilgileri', 'Araç Bilgileri']
    : ['Mağdur Bilgileri', 'Sürücü Bilgileri', 'Araç Bilgileri'];

  const currentStep = samePerson ? 2 : 3;

  const handleBack = () => {
    navigate(-1);
  };

  const handleVehicleSubmit = (vehicleFormData) => {
    console.log("🚗 Vehicle Form Tamamlandı:", vehicleFormData);

    // Tüm verileri birleştir
    const completeData = {
      victimData: victimData || {},
      driverData: driverData || {},
      vehicleData: vehicleFormData,
      selectedCompany,
      insuranceSource,
      kazaNitelik,
      karsiSamePerson,
      samePerson,
      startStep: 2, // StepInfoScreen'de 2. adımda olacak
      ...otherParams
    };

    console.log("📦 StepInfoScreen'e gönderilen TÜM veriler:", completeData);
    console.log("📍 victimData:", victimData);
    console.log("📍 driverData:", driverData);
    console.log("📍 vehicleData:", vehicleFormData);

    navigate("/step-info", {
      state: completeData
    });
  };

  // Footer render'ında
  const renderFormFooter = ({ submit, allValid }) => (
    <div className="form-footer-web">
      <button className="back-button-web" onClick={handleBack} type="button">
        <span className="arrow-icon-left">←</span> GERİ DÖN
      </button>
      <button
        className="next-button-web"
        onClick={submit}
        // disabled={!allValid} // Bu satırı yorum satırı yap veya kaldır
        type="button"
      >
        FORMU TAMAMLA <span className="arrow-icon">➔</span>
      </button>
    </div>
  );

  return (
    <div className="screen-container-drive">
      <div className="content-area">
        <Stepper steps={steps} currentStep={currentStep} />

        <h2 className="section-title">Araç Bilgileri</h2>

        <div className="vehicle-form-card">
          <div className="vehicle-form-section-content">
            <FormRenderer
              key="vehicle"
              fields={vehicleFields}
              values={vehicleData}
              setValues={handleSetVehicleData}
              onSubmit={handleVehicleSubmit}
              renderFooter={renderFormFooter}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverVictimStepperScreen;