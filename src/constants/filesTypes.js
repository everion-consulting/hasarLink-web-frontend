// src/constants/fileTypes.js
export const FILE_TYPES = [
  { id: "tutanak", title: "Tutanak" },
  { id: "magdur_arac_ruhsat", title: "Mağdur Araç Ruhsatı" },
  { id: "magdur_arac_ehliyet", title: "Mağdur Araç Ehliyeti" },
  { id: "magdur_surucu_ehliyet", title: "Mağdur Sürücü Ehliyeti" },
  {
    id: "bizim_taraf_surucu_ehliyet",
    title: "Bizim Taraf Sürücü Ehliyeti"
  },
  { id: "sigortali_arac_ruhsat", title: "Karşı Sigortalı Araç Ruhsatı" },
  { id: "sigortali_arac_ehliyet", title: "Karşı Sigortalı Araç Ehliyeti" },
  {
    id: "karsi_taraf_surucu_ehliyet",
    title: "Karşı Taraf Sürücü Ehliyeti"
  },
  { id: "fotograflar", title: "Fotoğraflar" },
  { id: "diger", title: "Diğer" },
];

// 🔹 backend'de saklanan değer (id alt çizgi→boşluk, lower) -> title
export const FILE_TYPE_LABEL_MAP = FILE_TYPES.reduce((map, f) => {
  const backendKey = f.id.replace(/_/g, " ").toLowerCase();
  map[backendKey] = f.title;
  return map;
}, {});
