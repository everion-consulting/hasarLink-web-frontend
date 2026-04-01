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
export const validateTCKN = (s = "") => {
  const t = onlyDigits(String(s)).slice(0, 11);


  if (!/^\d{11}$/.test(t)) return false;


  if (t[0] === "0") return false;


  if (/^(\d)\1{10}$/.test(t)) return false;

  const d = t.split("").map(Number);

  const oddSum = d[0] + d[2] + d[4] + d[6] + d[8];
  const evenSum = d[1] + d[3] + d[5] + d[7];

  const check10 = ((oddSum * 7) - evenSum) % 10;
  if (d[9] !== check10) return false;

  const check11 = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
  if (d[10] !== check11) return false;

  return true;
};


export const validateTCKNSoft = (s = "") => {
  const t = onlyDigits(String(s));


  if (!t) return true;


  if (t.length < 11) return true;


  return validateTCKN(t);
};

export const getTCKNValidationError = (s = "") => {
  const digits = onlyDigits(String(s));

  if (digits.length > 0 && digits.length < 11) {
    return "TCKN 11 haneli olmalıdır";
  }

  if (digits.length === 11 && !validateTCKN(digits)) {
    return "Geçerli bir TC kimlik numarası giriniz";
  }

  return null;
};

export const validateIBAN = (s = "") => /^TR\d{24}$/i.test(s.replace(/\s/g, ""));

// -------------------
// Araç doğrulama fonksiyonları
// -------------------

export function validateChassisNo(value) {
  if (!value) return false;

  // Boşlukları kaldır, büyük harfe çevir ve Türkçe karakterleri normalize et
  const vin = String(value)
    .toUpperCase()
    .replace(/[ÇĞİÖŞÜ]/g, (char) => ({
      Ç: "C",
      Ğ: "G",
      İ: "I",
      Ö: "O",
      Ş: "S",
      Ü: "U",
    }[char] || char))
    .replace(/\s+/g, "");

  // Eski ruhsatlardaki bazı 18 karakterli şasi numaraları da kabul edilir
  const vinRegex = /^[A-Z0-9]{17,18}$/;

  if (!vinRegex.test(vin)) return false;

  // Tamamen sayı veya tamamen harf kontrolü
  const isAllNumbers = /^[0-9]+$/.test(vin);
  const isAllLetters = /^[A-Z]+$/.test(vin);

  // Tamamen sayı veya tamamen harf ise geçersiz
  if (isAllNumbers || isAllLetters) return false;

  return true;
}

export const validateLicenseSerialNo = (s = "") => {
  return /^[A-Z]{2,3}\d{4,5}$/.test(String(s));
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

// utils/formatter.js - toYYYYMMDD fonksiyonunu tamamen yenileyelim
export const toYYYYMMDD = (dateString) => {
  if (!dateString || dateString === '' || dateString === 'Seçiniz') {
    return null; // ✅ Boş değerleri null olarak gönder
  }

  console.log('🔧 toYYYYMMDD input:', dateString);

  try {
    // Eğer zaten YYYY-MM-DD formatındaysa
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // DD.MM.YYYY → YYYY-MM-DD
    if (typeof dateString === 'string' && /^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('.');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // DD-MM-YYYY → YYYY-MM-DD
    if (typeof dateString === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('-');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Date objesinden
    if (dateString instanceof Date) {
      const year = dateString.getFullYear();
      const month = String(dateString.getMonth() + 1).padStart(2, '0');
      const day = String(dateString.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // Diğer durumlarda boş string gönderme, null gönder
    console.warn('❌ Geçersiz tarih formatı:', dateString);
    return null;

  } catch (error) {
    console.error('❌ Tarih dönüşüm hatası:', error);
    return null;
  }
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

//Plaka Validasyonu
export function validatePlate(value) {
  if (!value) return false;

  const v = String(value).toUpperCase().replace(/\s+/g, "");

  // En fazla 9 karakter, en az 1 rakam olmalı
  if (v.length > 9) return false;

  // En az bir rakam içermeli
  if (!/\d/.test(v)) return false;

  // Sadece harf ve rakam içermeli
  if (!/^[A-Z0-9]+$/.test(v)) return false;

  return true;
}

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

// utils/formatter.js
export const formatAreaCode = (value) => {
  if (!value) return "";

  const digits = value.replace(/\D/g, "").slice(0, 3);

  if (digits.length === 1) return `00${digits}`;
  if (digits.length === 2) return `0${digits}`;

  return digits;
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
  formatAreaCode
};

export default formatter;