/**
 * policyFields
 * - Dosya/poliçe bilgisi formunda kullanılacak alan tanımlarını içerir.
 * - Her alan nesnesi, formda gösterilecek inputun özelliklerini belirler.
 * - FormRenderer gibi dinamik form bileşenlerinde kullanılır.
 * 
 * Her alan için:
 *   - name: Form state anahtarı ve inputun benzersiz adı
 *   - label: Input başlığı (kullanıcıya gösterilen metin)
 *   - placeholder: Inputun içinde gri açıklama metni
 *   - type: Alan tipi (örn: text, date)
 *   - required: Zorunlu alan mı?
 */

const policyFields = [
    // Poliçe Tecdit No alanı
    { name: "policeTecditNo", label: "Poliçe Tecdit No (Zeyl Değişikliği Varsa)", placeholder: "TEC-2025-000987", type: "text", required: true },
    // Dosya No alanı
    { name: "dosyaNo", label: "Dosya No", placeholder: "2024-AXA-000123", type: "text", required: true },
    // Vade tarihi
    { name: "vade", label: "Vade", placeholder: "DD.MM.YYYY", type: "date", required: true },
    // Ürün kodu
    { name: "urunKodu", label: "Ürün Kodu", placeholder: "KASKO-STD-2024", type: "text", required: true },
    // Poliçe başlangıç tarihi
    { name: "baslangicTarihi", label: "Poliçe Başlangıç Tarihi", placeholder: "DD.MM.YYYY", type: "date", required: true },
    // Poliçe bitiş tarihi
    { name: "bitisTarihi", label: "Poliçe Bitiş Tarihi", placeholder: "DD.MM.YYYY", type: "date", required: true }
];

export default policyFields;