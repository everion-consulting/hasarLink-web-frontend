import { usageTypeOptions, vehicleTypeOptions } from "../components/EmptyObject/EmptyObjects";
import {
  ChevronDownIcon,
  CalendarIcon,
  UserIcon,
  IdentificationIcon,
  EnvelopeIcon,
  PhoneIcon,
  CreditCardIcon,
  TagIcon,
  TruckIcon,
  RectangleStackIcon,
  QrCodeIcon,
  Cog6ToothIcon,
  ListBulletIcon,
} from 'react-native-heroicons/outline';
import { formatPlate } from "../utils/formatter";

/**
 * vehicleFields
 * - Araç bilgileri formunda kullanılacak alan tanımlarını içerir.
 * - Her alan nesnesi, formda gösterilecek inputun özelliklerini belirler.
 * - FormRenderer gibi dinamik form bileşenlerinde kullanılır.
 * 
 * Her alan için:
 *   - name: Form state anahtarı ve inputun benzersiz adı
 *   - label: Input başlığı (kullanıcıya gösterilen metin)
 *   - placeholder: Inputun içinde gri açıklama metni
 *   - type: Alan tipi (örn: text, number, dropdown)
 *   - required: Zorunlu alan mı? (opsiyonel)
 *   - options: Dropdown için seçenekler (opsiyonel)
 *   - icon: Inputun solunda gösterilecek ikon (Ionicons veya FontAwesome)
 *   - maxLength: Maksimum karakter sayısı (opsiyonel)
 */

// constants/vehicleFields.js
// constants/vehicleFields.js
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
        placeholder: "Sedan",
        required: true,
        icon: TruckIcon,
        options: vehicleTypeOptions
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
        formatter: formatPlate,
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
        validate: (value) => {
          return /^\d{4}$/.test(value) ? null : "Yıl 4 haneli sayı olmalı";
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
        type: "text",
        placeholder: "34 ABC 123 formatında giriniz",
        required: true,
        icon: TruckIcon,
        formatter: formatPlate,
      },
      {
        name: "vehicle_usage_type",
        label: "Araç Kullanım Türü",
        type: "dropdown",
        placeholder: "------",
        required: true,
        icon: TruckIcon,
        options: usageTypeOptions
      },
    ]
  },
];