// ===================================
// victimFields.js

/**
 * 📅 formatToISO
 * Kullanıcının girdiği "DD.MM.YYYY" veya "DD/MM/YYYY" tarihleri
 * backend'in beklediği "YYYY-MM-DD" formatına çevirir.
 */
const formatToISO = (value) => {
  if (!value) return null;
  const [day, month, year] = value.split(/[./-]/);
  if (day && month && year) {
    return `${year}-${month}-${day}`;
  }
  return value; // fallback
};

export const getVictimFields = (isCompany = false) => {
  const fields = [
    {
      name: isCompany ? "companyName" : "victim_fullname",
      label: isCompany ? "Şirket İsmi" : "Ad Soyad",
      placeholder: isCompany ? "Şirket İsmi" : "Ad Soyad",
      type: "text",
      required: true,
    },
    {
      name: isCompany ? "taxId" : "victim_tc",
      label: isCompany ? "Vergi Kimlik No" : "Kimlik No",
      placeholder: isCompany ? "Vergi Kimlik No" : "11 hane",
      type: isCompany ? "text" : "tckn",
      required: true,
      maxLength: isCompany ? undefined : 11,
    },
    { name: "victim_mail", label: "E-Mail", placeholder: "ornek@mail.com", type: "email", required: false },
    { name: "victim_phone", label: "Telefon", placeholder: "5xxxxxxxxx", type: "phone", required: false },
  ];

  if (!isCompany) {
    fields.push({
      name: "victim_birth_date",
      label: "Doğum Tarihi",
      placeholder: "DD.MM.YYYY",
      type: "date",
      required: true,

      // 🔹 Form verisi backend'e gönderilmeden önce dönüştürülecek
      transform: (val) => formatToISO(val),
    });
  }

  fields.push(
    { name: "victim_iban", label: "IBAN No", placeholder: "TR00 0000 0000 0000 0000 0000 00", type: "iban", required: false, maxLength: 32 },
    // {
    //   name: "policy_no",
    //   label: "Poliçe Tecdit No (Zeyl Değişikliği Varsa)",
    //   placeholder: "TEC-2025-000987",
    //   type: "text",
    //   required: false,
    //   icon: IdentificationIcon,
    //   formatter: formatPlate,
    // },
    // {
    //   name: "insured_policy_no",
    //   label: "Sigortalı Poliçe No",
    //   type: "text",
    //   placeholder: "AXA-2024-123456",
    //   icon: CheckBadgeIcon,
    //   formatter: formatPlate,
    //   required: true 
    // },
    // {
    //   name: "insuredCarDocNo",
    //   label: "Ruhsat Seri No",
    //   type: "text",
    //   placeholder: "AB 123456",
    //   icon: IdentificationIcon,
    //   formatter: formatPlate,
    //   required: true 
    // }
  );

  return fields;
};

// Backward compatibility - default export for individual fields
const victimFields = getVictimFields(false);
export default victimFields;
