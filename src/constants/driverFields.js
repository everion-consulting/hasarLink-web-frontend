/**
 * driverFields
 * - Sürücüye ait form alanı tanımlarını içerir.
 * - Her alan nesnesi, formda gösterilecek inputun özelliklerini belirler.
 * - FormRenderer gibi dinamik form bileşenlerinde kullanılır.
 * 
 * Her alan için:
 *   - name: Form state anahtarı ve inputun benzersiz adı
 *   - label: Input başlığı (kullanıcıya gösterilen metin)
 *   - placeholder: Inputun içinde gri açıklama metni
 *   - type: Alan tipi (örn: text, tckn, email, phone, date, iban)
 *   - required: Zorunlu alan mı?
 *   - maxLength: Maksimum karakter sayısı (opsiyonel)
 */

const driverFields = [
  { name: "driver_fullname", label: "Ad Soyad", placeholder: "Ad Soyad", type: "text", required: true },
  { name: "driver_tc", label: "Kimlik No", placeholder: "11 hane", type: "tckn", required: true, maxLength: 11 },
  // { name: "driver_mail", label: "E-Mail", placeholder: "ornek@mail.com", type: "email"},
  { name: "driver_phone", label: "Telefon", placeholder: "5xxxxxxxxx", type: "phone", required: true },
  { name: "driver_birth_date", label: "Doğum Tarihi", placeholder: "DD.MM.YYYY", type: "date", required: true },
];

export default driverFields;