/**
 * bothFields
 * - Sürücü ve mağdur gibi ortak kullanıcılar için form alanı tanımlarını içerir.
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

const bothFields = [
    { name: "fullName", label: "Ad Soyad", placeholder: "Ad Soyad", type: "text", required: true },
    { name: "nationalId", label: "Kimlik No", placeholder: "11 hane", type: "tckn", required: true, maxLength: 11 },
    { name: "email", label: "E-Mail", placeholder: "ornek@mail.com", type: "email", required: true },
    { name: "phone", label: "Telefon", placeholder: "5xxxxxxxxx", type: "phone", required: true },
    { name: "birthDate", label: "Doğum Tarihi", placeholder: "DD.MM.YYYY", type: "date", required: true },
    { name: "iban", label: "IBAN No", placeholder: "TR00 0000 0000 0000 0000 0000 00", type: "iban", required: false, maxLength: 32 },
];

export default bothFields;