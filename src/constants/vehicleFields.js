import { vehicleTypeOptions, usageTypeOptions } from '../components/EmptyObject/EmptyObjects';
import {
  CalendarIcon,
  IdentificationIcon,
  TruckIcon,
  RectangleStackIcon,
  QrCodeIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

/**
 * vehicleFields
 * - Araç bilgileri formunda kullanılacak alan tanımlarını içerir.
 */

export default [
  {
    name: "vehicle_brand",
    label: "Araç Markası",
    type: "text",
    placeholder: "Araç markası giriniz",
    required: true,
    icon: TruckIcon,
  },
  {
    type: "row",
    name: "vehicleRow1",
    children: [
      {
        name: "vehicle_type",
        label: "Araç Türü",
        type: "dropdown",
        placeholder: "Seçiniz",
        required: true,
        icon: TruckIcon,
        options: vehicleTypeOptions,
      },
      {
        name: "vehicle_model",
        label: "Araç Model",
        type: "text",
        placeholder: "Corolla",
        required: true,
        icon: RectangleStackIcon,
      }
    ]
  },
  {
    type: "row",
    name: "vehicleRow2",
    children: [
      {
        name: "vehicle_license_no",
        label: "Ruhsat Seri No",
        type: "licenseSerialNo",
        maxLength: 8,
        placeholder: "AB123456",
        required: true,
        icon: IdentificationIcon,
      },
      {
        name: "vehicle_chassis_no",
        label: "Şasi No",
        type: "chassisNo",
        maxLength: 17,
        placeholder: "Şasi no giriniz",
        required: true,
        icon: QrCodeIcon,
        validate: (value) => {
          if (!value) return null;
          
          const vin = String(value).toUpperCase().replace(/\s+/g, "");
          
          // 17 karakter kontrolü
          if (vin.length !== 17) {
            return "Şasi No 17 karakter olmalı";
          }
          
          // I, O, Q harfleri kontrolü
          if (/[IOQ]/.test(vin)) {
            return "Şasi No I, O, Q harfleri içeremez";
          }
          
          // Sadece A-H J-N P R-Z ve 0-9 kontrolü
          if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
            return "Şasi No sadece geçerli karakterler içerebilir";
          }
          
          // Tamamen sayı veya tamamen harf kontrolü
          const isAllNumbers = /^[0-9]{17}$/.test(vin);
          const isAllLetters = /^[A-HJ-NPR-Z]{17}$/.test(vin);
          
          if (isAllNumbers || isAllLetters) {
            return "Şasi No hem harf hem rakam içermelidir";
          }
          
          return null;
        }
      }
    ]
  },
  {
    type: "row",
    name: "vehicleRow3",
    children: [
      {
        name: "vehicle_engine_no",
        label: "Motor No",
        type: "text",
        placeholder: "Motor no giriniz",
        required: true,
        icon: Cog6ToothIcon,
        
      },
      {
        name: "vehicle_year",
        label: "Model Yılı",
        type: "text",
        placeholder: "YYYY",
        required: true,
        icon: CalendarIcon,
        maxLength: 4,
        keyboardType: "numeric",
        validate: (value, values) => {
          if (!value) return null;
          
          // Sadece rakam kontrolü
          if (!/^\d{4}$/.test(value)) {
            return "Lütfen model yılını 4 haneli giriniz";
          }
          
          const year = parseInt(value);
          const currentYear = new Date().getFullYear();
          
          if (year < 1900 || year > currentYear) {
            return `Model yılı 1900 ile ${currentYear} arasında olmalı`;
          }
          
          return null;
        }
      }
    ]
  },
  {
    type: "row",
    name: "vehicleRow4",
    children: [
      {
        name: "vehicle_plate",
        label: "Mağdur Araç Plaka",
        type: "vehicle_plate",
        placeholder: "34 ABC 123",
        required: true,
        icon: TruckIcon,
        maxLength: 9,
        validate: (value) => {
          if (!value) return null;
          const v = String(value).toUpperCase().replace(/\s+/g, "");
          if (v.length > 9) return "Plaka en fazla 9 karakter olmalı";
          if (!/\d/.test(v)) return "Plaka en az 1 rakam içermeli";
          if (!/^[A-Z0-9]+$/.test(v)) return "Plaka sadece harf ve rakam içerebilir";
          return null;
        }
      },
      {
        name: "vehicle_usage_type",
        label: "Araç Kullanım Türü",
        type: "dropdown",
        placeholder: "Seçiniz",
        required: true,
        icon: TruckIcon,
        options: usageTypeOptions,
      },
    ]
  },
];