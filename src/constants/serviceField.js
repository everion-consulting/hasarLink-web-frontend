/**
 * serviceField
 * - Servis (hizmet sağlayıcı) formlarında kullanılacak alan tanımlarını içerir.
 * - Her alan nesnesi, formda gösterilecek inputun özelliklerini belirler.
 * - FormRenderer gibi dinamik form bileşenlerinde kullanılır.
 * 
 * Her alan için:
 *   - name: Form state anahtarı ve inputun benzersiz adı
 *   - label: Input başlığı (kullanıcıya gösterilen metin)
 *   - placeholder: Inputun içinde gri açıklama metni (opsiyonel)
 *   - type: Alan tipi (örn: text, tckn, phone, numeric, select, textarea)
 *   - required: Zorunlu alan mı? (opsiyonel)
 *   - maxLength: Maksimum karakter sayısı (opsiyonel)
 *   - options: Seçmeli alanlar için seçenekler (label, value)
 */

import { maskPhone } from "../components/utils/formatter";


const serviceField = [
  { name: "repair_fullname", label: "Ad Soyad", type: "text", placeholder: "Adınızı ve soyadınızı giriniz", required: true },
  // Kimlik No alanı
  {
    name: "repair_tc",
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
    name: "repair_phone",
    label: "Telefon No",
    type: "phone",
    placeholder: "555-333-22-11",
    required: true,
    maxLength: 17,
    formatter: maskPhone
  },
  { name: "repair_birth_date", label: "Doğum Tarihi", placeholder: "DD.MM.YYYY", type: "date", required: false },

  // Servis Adı alanı
  { name: "service_name", label: "Servis Adı", placeholder: "Servis Adı", type: "text", required: true },
  // Telefon alanı
  { name: "service_phone", label: "Telefon", placeholder: "5xxxxxxxxx", type: "phone", required: true, maxLength: 19 },
  // Servis Vergi No alanı
  { name: "service_tax_no", label: "Servis Vergi No", placeholder: "0123456789", type: "numeric", required: true },
  // İl seçimi (select/dropdown)
  { name: "service_iban", label: "IBAN NUMARASI", placeholder: "İban Numarası", type: "iban" },
  { name: "service_iban_name", label: "IBAN Adı", placeholder: "Hesap Sahibinin Adı", type: "text", required: false },
  {
    type: "row",
    name: "insuredRow1",
    children: [
      {
        name: "service_city",
        label: "İl",
        type: "dropdown",
        options: [],
        required: true
      },
      // İlçe seçimi (select/dropdown)
      {
        name: "service_state_city_city",
        label: "İlçe",
        type: "text",
        placeholder: "İlçe yazınız",
        required: true
      },]
  },
  // Açık Adres (çok satırlı metin)
  { name: "service_address", label: "Açık Adres", type: "textarea", placeholder: "Barbaros Mah., Atpıkız Sk. No:2 D:3", required: true },
  { name: "repair_area_code", label: "Bölge Kodu", type: "textarea", placeholder: "Örn:017", required: false, maxLength: 3 },
  
];

export default serviceField;