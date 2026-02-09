/**
 * İl / İlçe veri yardımcıları
 * JSON verisi lokal dosyalardan gelir (API çağrısı gerekmez).
 */
import iller from "../assets/json/iller.json";
import ilceler from "../assets/json/ilceler.json";

/** Tüm iller — dropdown options formatında (id'ye göre sıralı) */
export const getIlOptions = () =>
  iller
    .slice()
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map((il) => ({
      label: il.name,
      value: il.id,
    }));

/** Seçilen il'e ait ilçeler — dropdown options formatında */
export const getIlceOptions = (ilId) => {
  if (!ilId) return [];
  const id = String(ilId);
  return ilceler
    .filter((ilce) => String(ilce.il_id) === id)
    .sort((a, b) => a.name.localeCompare(b.name, "tr"))
    .map((ilce) => ({
      label: ilce.name,
      value: ilce.id,
    }));
};

/** il id'den il adını bul */
export const getIlName = (ilId) => {
  if (!ilId) return "";
  const found = iller.find((il) => String(il.id) === String(ilId));
  return found ? found.name : "";
};

/** ilce id'den ilçe adını bul */
export const getIlceName = (ilceId) => {
  if (!ilceId) return "";
  const found = ilceler.find((ilce) => String(ilce.id) === String(ilceId));
  return found ? found.name : "";
};

/**
 * İl adından il id'sini bul (OCR / profil verisinden gelen isimler için)
 * Büyük-küçük harf duyarsız, Türkçe karakter normalize ederek eşleştirir.
 */
export const findIlIdByName = (name) => {
  if (!name) return "";
  const input = String(name).toUpperCase().trim();
  // Tam eşleşme
  const exact = iller.find((il) => il.name === input);
  if (exact) return exact.id;
  // Normalize ederek eşleştir (İ→I, Ş→S vs.)
  const norm = (s) =>
    s
      .replace(/İ/g, "I")
      .replace(/Ş/g, "S")
      .replace(/Ğ/g, "G")
      .replace(/Ü/g, "U")
      .replace(/Ö/g, "O")
      .replace(/Ç/g, "C");
  const normInput = norm(input);
  const fuzzy = iller.find((il) => norm(il.name) === normInput);
  if (fuzzy) return fuzzy.id;
  // İsim parçası içerme kontrolü (G.Antep → GAZİANTEP gibi kısaltmalar)
  const partial = iller.find(
    (il) => il.name.includes(normInput) || normInput.includes(norm(il.name))
  );
  return partial ? partial.id : "";
};

/**
 * İlçe adından ilçe id'sini bul (belirli il kapsamında)
 */
export const findIlceIdByName = (ilId, name) => {
  if (!ilId || !name) return "";
  const id = String(ilId);
  const input = String(name).toUpperCase().trim();
  const ilcelerOfIl = ilceler.filter((ilce) => String(ilce.il_id) === id);
  // Tam eşleşme
  const exact = ilcelerOfIl.find((ilce) => ilce.name === input);
  if (exact) return exact.id;
  // Normalize ederek eşleştir
  const norm = (s) =>
    s
      .replace(/İ/g, "I")
      .replace(/Ş/g, "S")
      .replace(/Ğ/g, "G")
      .replace(/Ü/g, "U")
      .replace(/Ö/g, "O")
      .replace(/Ç/g, "C");
  const normInput = norm(input);
  const fuzzy = ilcelerOfIl.find((ilce) => norm(ilce.name) === normInput);
  return fuzzy ? fuzzy.id : "";
};

export default {
  getIlOptions,
  getIlceOptions,
  getIlName,
  getIlceName,
  findIlIdByName,
  findIlceIdByName,
};
