// utils/formatter.js

// -------------------
// Ortak yardımcılar
// -------------------
export const onlyDigits = (s = "") => s.replace(/\D/g, "");

// 0 (5xx) xxx xx xx
export const maskPhone = (value = "") => {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";

  let formatted = digits;
  if (!formatted.startsWith("0")) {
    formatted = "0" + formatted;
  }

  if (formatted.length <= 1) return formatted;
  if (formatted.length <= 4) return formatted.replace(/(\d{1})(\d{0,3})/, "$1 ($2");
  if (formatted.length <= 7)
    return formatted.replace(/(\d{1})(\d{3})(\d{0,3})/, "$1 ($2) $3");
  if (formatted.length <= 9)
    return formatted.replace(/(\d{1})(\d{3})(\d{3})(\d{0,2})/, "$1 ($2) $3 $4");
  if (formatted.length <= 11)
    return formatted.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{0,2})/, "$1 ($2) $3 $4 $5");

  return formatted
    .slice(0, 11)
    .replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 ($2) $3 $4 $5");
};

// TCKN maske
export const maskTCKN = (s = "") => onlyDigits(s).slice(0, 11);

// IBAN: "TR" zorunlu + 26 char + 4'lük gruplama
export const normalizeIBAN = (s = "") => {
  let v = s.replace(/\s/g, "").toUpperCase();
  if (!v.startsWith("TR")) v = "TR" + v;
  v = v.slice(0, 26);
  return v.replace(/(.{4})/g, "$1 ").trim();
};

export const validateEmail = (s = "") => /^\S+@\S+\.\S+$/.test(s);
export const validatePhone = (s = "") => /^0\d{10}$/.test(onlyDigits(s));
export const validateTCKN = (s = "") => /^\d{11}$/.test(onlyDigits(s));
export const validateIBAN = (s = "") => /^TR\d{24}$/i.test(s.replace(/\s/g, ""));

// -------------------
// Araç doğrulama fonksiyonları
// -------------------

export function validateChassisNo(value) {
  if (!value) return false;

  // Boşlukları kaldır, büyük harfe çevir
  const vin = String(value).toUpperCase().replace(/\s+/g, "");

  // 17 karakter, I O Q yok, sadece A-H J-N P R-Z ve 0-9
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;

  return vinRegex.test(vin);
}

export const validateLicenseSerialNo = (s = "") => {
  return /^[A-Z]{2}\d{6}$/.test(String(s).toUpperCase());
};

// -------------------
// Tarih doğrulama
// -------------------
export const validateDateDMY = (s = "") => /^\d{2}\.\d{2}\.\d{4}$/.test(s);
export const validateDateYMD = validateDateDMY; // alias


// -------------------
// TZ-nötr tarih yardımcıları
// -------------------
const asLocalDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const toYYYYMMDD = (dateLike) => {
  if (!dateLike) return "";

  // "DD.MM.YYYY" → "YYYY-MM-DD"
  if (typeof dateLike === "string" && /^\d{2}\.\d{2}\.\d{4}$/.test(dateLike)) {
    const [dd, mm, yyyy] = dateLike.split(".");
    return `${yyyy}-${mm}-${dd}`;
  }

  // "DD-MM-YYYY" → "YYYY-MM-DD"
  if (typeof dateLike === "string" && /^\d{2}-\d{2}-\d{4}$/.test(dateLike)) {
    const [dd, mm, yyyy] = dateLike.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }

  // "YYYY-MM-DD" → "YYYY-MM-DD"
  if (typeof dateLike === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateLike)) {
    return dateLike;
  }

  // Date objesi
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const toDDMMYYYY = (dateLike) => {
  if (!dateLike) return "";

  if (typeof dateLike === "string") {
    // "YYYY-MM-DD" → "DD.MM.YYYY"
    const ymd = dateLike.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (ymd) return `${ymd[3]}.${ymd[2]}.${ymd[1]}`;

    // Zaten "DD.MM.YYYY" ise aynen dön
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateLike)) return dateLike;
  }

  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";

  const ld = asLocalDate(d);
  const dd = String(ld.getDate()).padStart(2, "0");
  const mm = String(ld.getMonth() + 1).padStart(2, "0");
  const yyyy = ld.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

// -------------------
// Diğer formatlayıcılar
// -------------------
export const formatPlate = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/[^A-Z0-9 ]/g, "")
    .trim();
};

// -------------------
// Default export (isteğe bağlı - modern projelerde named export tercih edilir)
// -------------------
const formatter = {
  onlyDigits,
  maskPhone,
  maskTCKN,
  normalizeIBAN,
  validateEmail,
  validatePhone,
  validateTCKN,
  validateIBAN,
  validateChassisNo,
  validateLicenseSerialNo,
  validateDateDMY,
  validateDateYMD,
  toYYYYMMDD,
  toDDMMYYYY,
  formatPlate,
};

export default formatter;