/**
 * fixField
 * - Tamirci/servis formlarında kullanılacak alan tanımlarını içerir.
 * - Her alan nesnesi, formda gösterilecek inputun özelliklerini belirler.
 * - FormRenderer gibi dinamik form bileşenlerinde kullanılır.
 * 
 * Her alan için:
 *   - name: Form state anahtarı ve inputun benzersiz adı
 *   - label: Input başlığı (kullanıcıya gösterilen metin)
 *   - type: Alan tipi (örn: text, tel, radio, select, textarea)
 *   - placeholder: Inputun içinde gri açıklama metni (opsiyonel)
 *   - options: Seçmeli alanlar için seçenekler (label, value)
 */

import { maskPhone } from "../utils/formatter";

const fixField = [
  // Ad Soyad alanı
  { name: "repair_fullname", label: "Ad Soyad", type: "text", placeholder: "Adınızı ve soyadınızı giriniz", required: true },
  // Kimlik No alanı
  {
    name: "repair_tc",
    label: "Kimlik No",
    type: "text",
    placeholder: "Kimlik numaranızı giriniz",
    required: true,
    maxLength: 11,
    keyboardType: "numeric",
    validate: (value) => {
      return /^\d{11}$/.test(value) ? null : "Kimlik numarası 11 haneli olmalı";
    }
  },
  {
    name: "repair_phone",
    label: "Telefon No",
    type: "tel",
    placeholder: "555-333-22-11",
    required: true,
    maxLength: 17,
    formatter: maskPhone,
    keyboardType: "numeric"
  },
  { name: "repair_birth_date", label: "Doğum Tarihi", placeholder: "DD.MM.YYYY", type: "date", required: false },


  // İl seçimi (select/dropdown)
  {
    name: "repair_city",
    label: "İl",
    type: "dropdown",
    options: [],
    required: true
  },

  // İlçe seçimi (select/dropdown)
  {
    name: "repair_state_city_city",
    label: "İlçe",
    type: "text",
    placeholder: "İlçe yazınız",
    required: true
  },

  // Açık Adres (çok satırlı metin)
  { name: "repair_address", label: "Açık Adres", type: "textarea", placeholder: "Barbaros Mah., Atpıkız Sk. No:2 D:3", required: true },
  {
    name: "repair_area_code",
    label: "Bölge Kodu",
    type: "text",
    placeholder: "Bölge kodunu giriniz",
  },
  // {
  //   name: "repair_field_name",
  //   label: "Referans Adı",
  //   type: "text",
  //   placeholder: "Referans adını giriniz",
  // },
];

export default fixField;