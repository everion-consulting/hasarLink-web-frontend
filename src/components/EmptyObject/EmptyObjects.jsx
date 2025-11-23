/**
 * EmptyObjects.js
 * - Formlarda dropdown/select alanlarında kullanılacak sabit seçenek listelerini içerir.
 * - Her seçenek için label (görünen metin) ve value (değer) tanımlanır.
 * - Kod tekrarını önler, merkezi ve kolay yönetim sağlar.
 */

// Araç tipi seçenekleri (örn: araç ekleme veya düzenleme formlarında kullanılır)
export const vehicleTypeOptions = [
  { label: "Otomobil", value: "otomobil" },
  { label: "Kamyonet", value: "kamyonet" },
  { label: "Motosiklet", value: "motosiklet" },
];

// Kullanım tipi seçenekleri (örn: ticari/hususi ayrımı gereken formlarda kullanılır)
export const usageTypeOptions = [
  { label: "Ticari", value: "ticari" },
  { label: "Hususi", value: "hususi" },
  { label: "Kamu", value: "kamu" },
];

// JSX bileşeni olarak kullanım örneği
export const DropdownOptions = {
  vehicleType: vehicleTypeOptions,
  usageType: usageTypeOptions
};

// React bileşeni olarak dropdown render etmek için örnek
export const DropdownRenderer = ({ options, value, onChange, placeholder = "Seçiniz..." }) => {
  return (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="form-select"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Daha modern bir dropdown için örnek (custom select)
export const CustomSelect = ({ options, value, onChange, placeholder = "Seçiniz..." }) => {
  return (
    <div className="custom-select-container">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="custom-select"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="custom-arrow">▼</span>
    </div>
  );
};

export default {
  vehicleTypeOptions,
  usageTypeOptions,
  DropdownOptions,
  DropdownRenderer,
  CustomSelect
};