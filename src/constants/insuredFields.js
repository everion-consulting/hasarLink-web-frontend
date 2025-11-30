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
    name: "insured_plate",
    label: "Karşı Araç Plaka",
    type: "vehicle_plate",
    placeholder: "34 ABC 123",
    required: true,
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
  // { name: "insured_policy_no", label: "Poliçe No", type: "text", placeholder: "Poliçe numaranızı giriniz", required: true },
  {
    name: "policy_no",
    label: "Poliçe Tecdit No (Zeyl Değişikliği Varsa)",
    placeholder: "TEC-2025-000987",
    type: "text",
    required: false,
    icon: IdentificationIcon,
  },
  {
    name: "insured_policy_no",
    label: "Sigortalı Poliçe No",
    type: "text",
    placeholder: "AXA-2024-123456",
    icon: CheckBadgeIcon,
    required: true,
    validate: (value) => {
      if (!value) return null;
      const v = String(value).trim();
      // En az 5 karakter olmalı
      if (v.length < 5) return "Poliçe no en az 5 karakter olmalı";
      // En az 1 rakam içermeli
      if (!/\d/.test(v)) return "Poliçe no en az 1 rakam içermeli";
      // En az 1 harf içermeli
      if (!/[a-zA-Z]/.test(v)) return "Poliçe no en az 1 harf içermeli";
      return null;
    }
  },
];

export default insuredField;