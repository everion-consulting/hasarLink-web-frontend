// victimFields.js

const formatToISO = (value) => {
  if (!value) return null;
  const [day, month, year] = value.split(/[./-]/);
  if (day && month && year) {
    return `${year}-${month}-${day}`;
  }
  return value;
};

export const getVictimFields = (
  isCompany = false,
  selectedCompany = null,
  kazaNitelik = null
) => {
  const isIbanRequired = selectedCompany?.id === 72 || selectedCompany?.id === 76;

  const fields = [
    {
      name: "victim_fullname",
      label: isCompany ? "Şirket İsmi" : "Ad Soyad",
      placeholder: isCompany ? "Şirket ünvanı" : "Ad Soyad",
      type: "text",
      required: true,
    },
    {
      name: isCompany ? "taxId" : "victim_tc",
      label: isCompany ? "Vergi Kimlik No" : "Kimlik No",
      placeholder: isCompany ? "10 haneli vergi no" : "11 haneli TC",
      type: isCompany ? "text" : "tckn",
      required: true,
      maxLength: isCompany ? 10 : 11,
    },
    {
      name: "victim_phone",
      label: "Telefon",
      placeholder: "5xxxxxxxxx",
      type: "phone",
      required: false,
    },
    {
      name: "policy_no",
      label: "Poliçe No",
      placeholder: "Poliçe numarasını giriniz",
      type: "text",
      required: true,
      maxLength: 30,
    },
  ];

  // 🔹 SADECE ŞAHIS İSE
  if (!isCompany) {
    fields.push(
      {
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
        required: false,
        maxLength: 11,
      }
    );
  }

  // 🔹 IBAN
  fields.push({
    name: "victim_iban",
    label: isIbanRequired
      ? "IBAN No (Zorunlu) – Ruhsat sahibine ait olmalıdır"
      : "IBAN No – Ruhsat sahibine ait olmalıdır",
    placeholder: "TR00 0000 0000 0000 0000 0000 00",
    type: "iban",
    required: isIbanRequired,
    maxLength: 32,
  });

  return fields;
};

export default getVictimFields(false);
