/**
 * insuredField
 * - Sigortalı kişi ve araca ait form alanı tanımlarını içerir.
 * - Her alan nesnesi, formda gösterilecek inputun özelliklerini belirler.
 * - FormRenderer gibi dinamik form bileşenlerinde kullanılır.
 * 
 * Her alan için:
 *   - name: Form state anahtarı ve inputun benzersiz adı
 *   - label: Input başlığı (kullanıcıya gösterilen metin)
 *   - type: Alan tipi (örn: text, tel, email, date, iban, title)
 *   - placeholder: Inputun içinde gri açıklama metni (opsiyonel)
 *   - required: Zorunlu alan mı? (opsiyonel)
 *   - maxLength: Maksimum karakter sayısı (opsiyonel)
 * 
 * "type: title" olan alanlar, formda başlık/metin olarak gösterilir (input değildir).
 */
import {
  IdentificationIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { formatPlate } from '../components/utils/formatter';


const insuredField = [

  // Sigortalı kişi bilgileri
  { name: "insured_fullname", label: "Ad Soyad", type: "text", placeholder: "Adınızı ve soyadınızı giriniz", required: true },
  {
    name: "insured_tc",
    label: "Kimlik No",
    type: "tckn",
    placeholder: "Kimlik numaranızı giriniz",
    required: true,
    maxLength: 11,
    validate: (value) => {
      return /^\d{11}$/.test(value) ? null : "Kimlik numarası 11 haneli olmalı";
    }
  },
  {
    type: "row",
    name: "insuredRow1",
    children: [
      {
        name: "insured_birth_date",
        label: "Doğum Tarihi",
        type: "date",
        placeholder: "11/22/3333",
        required: true,

      },
      {
        name: "insured_phone",
        label: "Telefon No",
        type: "phone",
        placeholder: "555-333-22-11",
        required: true,
      }
    ]
  },
  { name: "insured_mail", label: "E-Mail", type: "email", placeholder: "mailiniz@gmail.com" },
  {
    name: "insured_plate", label: "Karşı Araç Plaka", type: "text", placeholder: "34 ABC 123", formatter: formatPlate, required: true
  },
  // { name: "insured_policy_no", label: "Poliçe No", type: "text", placeholder: "Poliçe numaranızı giriniz", required: true },
  {
    name: "policy_no",
    label: "Poliçe Tecdit No (Zeyl Değişikliği Varsa)",
    placeholder: "TEC-2025-000987",
    type: "text",
    required: false,
    icon: IdentificationIcon,
    formatter: formatPlate,
  },
  {
    name: "insured_policy_no",
    label: "Sigortalı Poliçe No",
    type: "text",
    placeholder: "AXA-2024-123456",
    icon: CheckBadgeIcon,
    formatter: formatPlate,
    required: true
  },
];

export default insuredField;