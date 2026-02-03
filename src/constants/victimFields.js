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

// victimFields.js
export const getVictimFields = (
  isCompany = false,
  selectedCompany = null,
  kazaNitelik = null
) => {

  // RAY SİGORTA (id: 72) veya TMTB (id: 76) için IBAN zorunlu
  const isIbanRequired = selectedCompany?.id === 72 || selectedCompany?.id === 76;

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
    { name: "victim_phone", label: "Telefon", placeholder: "5xxxxxxxxx", type: "phone", required: false },


  ];

  if (!isCompany) {
    fields.push({
      name: "victim_birth_date",
      label: "Doğum Tarihi",
      placeholder: "DD.MM.YYYY",
      type: "date",
      required: false,
    },
      {
        name: "foreign_victim_tc",
        label: "Yabancı Kimlik No",
        placeholder: "11 hane",
        type: "tckn",
        required: true,
        maxLength: 11,
      });
  }

  if (kazaNitelik === "TEKLİ KAZA (BEYANLI)") {
    fields.push({
      name: "policy_no",
      label: "Poliçe No",
      placeholder: "Poliçe numarasını giriniz",
      type: "text",
      required: true,
      maxLength: 30,
    });
  }

  // IBAN alanını doğrudan push ediyoruz
  fields.push(
    {
      name: "victim_iban",
      label: isIbanRequired
        ? "IBAN No (Zorunlu) - Kesinlikle mağdur ruhsat sahibinin IBAN'ı olmalıdır"
        : "IBAN No (Kesinlikle mağdur ruhsat sahibinin IBAN'ı olmalıdır)",
      placeholder: "TR00 0000 0000 0000 0000 0000 00",
      type: "iban",
      required: isIbanRequired,
      maxLength: 32
    }
  );



  return fields;
};

// Backward compatibility - default export for individual fields
const victimFields = getVictimFields(false);
export default victimFields;
