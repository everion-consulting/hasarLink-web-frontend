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



export const getInsuredFields = (isCompany = false) => {
  const fields = [
    {
      name: isCompany ? "company_name" : "insured_fullname",
      label: isCompany ? "Şirket İsmi" : "Ad Soyad",
      type: "text",
      required: true
    },
    {
      name: isCompany ? "company_tax_number" : "insured_tc",
      label: isCompany ? "Vergi Kimlik No" : "Kimlik No",
      type: isCompany ? "text" : "tckn",
      required: false,
      maxLength: isCompany ? 10 : 11,
      validate: isCompany
        ? (v) => /^\d{10}$/.test(v) ? null : "Vergi kimlik numarası 10 haneli olmalı"
        : (v) => /^\d{11}$/.test(v) ? null : "Kimlik numarası 11 haneli olmalı"
    },
  ];

  if (!isCompany) {
    fields.push({
      name: "foreign_insured_tc",
      label: "Yabancı Kimlik No",
      type: "text",
      placeholder: "Kimlik numaranızı giriniz",
      required: false,
      maxLength: 11,
      keyboardType: "numeric",
      validate: (value) =>
        /^\d{11}$/.test(value) ? null : "Kimlik numarası 11 haneli olmalı",
    });
  }

  if (isCompany) {
    fields.push({
      name: "insured_phone",
      label: "Telefon No",
      type: "phone",
      placeholder: "555-333-22-11",
      required: false,
    });
  } else {
    fields.push({
      type: "row",
      name: "insuredRow1",
      children: [
        {
          name: "insured_birth_date",
          label: "Doğum Tarihi",
          type: "date",
          placeholder: "11/22/3333",
          required: false,

        },
        {
          name: "insured_phone",
          label: "Telefon No",
          type: "phone",

          placeholder: "555-333-22-11",
          required: false,
        }
      ]
    });
  }

  fields.push(
    //{ name: "insured_mail", label: "E-Mail", type: "email", placeholder: "mailiniz@gmail.com" },
    {
      name: "insured_plate",
      label: "Karşı Araç Plaka",
      type: "vehicle_plate",
      placeholder: "34 ABC 123",
      required: false,
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
      transform: (value) => value?.toUpperCase(),
    },
    {
      name: "insured_policy_no",
      label: "Sigortalı Poliçe No",
      type: "text",
      placeholder: "AXA-2024-123456",
      icon: CheckBadgeIcon,
      required: false,
      transform: (value) => value?.toUpperCase(),
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
    }
  );

  return fields;
};

const insuredField = getInsuredFields(false);
export default insuredField;
