import { vehicleTypeOptions, usageTypeOptions } from '../components/EmptyObject/EmptyObjects';
import {
  CalendarIcon,
  IdentificationIcon,
  TruckIcon,
  RectangleStackIcon,
  QrCodeIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { formatPlate } from '../components/utils/formatter';

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
    formatter: formatPlate,
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
        formatter: formatPlate,
      },
      {
        name: "vehicle_model",
        label: "Araç Model",
        type: "text",
        placeholder: "Corolla",
        required: true,
        icon: RectangleStackIcon,
        formatter: formatPlate,
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
        formatter: formatPlate,
      },
      {
        name: "vehicle_chassis_no",
        label: "Şasi No",
        type: "chassisNo",
        maxLength: 17,
        placeholder: "Şasi no giriniz",
        required: true,
        icon: QrCodeIcon,
        formatter: formatPlate,
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
          const year = parseInt(value);
          const currentYear = new Date().getFullYear();
          if (!/^\d{4}$/.test(value)) return "Yıl 4 haneli sayı olmalı";
          if (year < 1900 || year > currentYear + 1) return "Geçerli bir yıl giriniz";
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
        formatter: formatPlate,
      },
      {
        name: "vehicle_usage_type",
        label: "Araç Kullanım Türü",
        type: "dropdown",
        placeholder: "Seçiniz",
        required: true,
        icon: TruckIcon,
        options: usageTypeOptions,
        // ✅ formatter YOK - dropdown için gerekli değil
      },
    ]
  },
];