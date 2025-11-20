const opposingDriverFields = [
  { name: "opposing_driver_fullname", label: "Ad Soyad", placeholder: "Ad Soyad", type: "text", required: true },
  { name: "opposing_driver_tc", label: "Kimlik No", placeholder: "11 hane", type: "tckn", required: true, maxLength: 11 },
  // { name: "opposing_driver_mail", label: "E-Mail", placeholder: "ornek@mail.com", type: "email"},
  { name: "opposing_driver_phone", label: "Telefon", placeholder: "5xxxxxxxxx", type: "phone", required: true },
  { name: "opposing_driver_birth_date", label: "Doğum Tarihi", placeholder: "DD.MM.YYYY", type: "date", required: true },
];

export default opposingDriverFields;