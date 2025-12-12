/**
 * damageFields
 */

import {
  CheckBadgeIcon,
  CircleStackIcon,
  DocumentTextIcon,
  NewspaperIcon,
  WrenchScrewdriverIcon,
  QuestionMarkCircleIcon,
  MapPinIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

const damageFields = [
  {
    name: "damage_type",
    label: "Hasar Türü",
    placeholder: "Hasar türünü seçiniz",
    type: "dropdown",
    options: [
      { label: "Çarpışma", value: "carpışma" },
      { label: "Çarpma", value: "carpma" },
      { label: "Park Hali", value: "park hali" },
      { label: "Sabit Cisme Çarpma", value: "sabit cisme carpma" },
    ],
    required: true,
    icon: QuestionMarkCircleIcon,
  },

  {
    name: "damage_description",
    label: "Hasar Bölgesi",
    placeholder: "Kaporta",
    type: "select",
    required: true,
    icon: NewspaperIcon
  },

  {
    type: "row",
    name: "accident_location_row",
    children: [
      {
        name: "accident_city",
        label: "Kaza Yeri (İl)",
        placeholder: "İl seçiniz",
        type: "dropdown",
        required: true,
        options: [],
        fetchOptions: true,
      },
      {
        name: "accident_district",
        label: "İlçe",
        placeholder: "İlçe seçiniz",
        type: "text",
        required: true,
      },
    ],
  },

  {
    name: "accident_datetime",
    label: "Kaza Tarihi ve Saati",
    type: "datetime",
    placeholder: "Tarih ve saat seçiniz",
    required: true,
    icon: ClockIcon,
  },

  {
    name: "estimated_damage_amount",
    label: "Tahmini Hasar Tutarı",
    placeholder: "Tahmini Hasar Tutarı Giriniz",
    type: "currency",
    required: false,
    icon: CircleStackIcon,
    // Virgül ve rakam dışındakileri temizle, baştaki gereksiz sıfırları kaldır bu kaldırılacaksa 
    // eğer burayı yorum satırına alalım ve  type: "currency" yazısını da değiştirmeyi unutmayın
    transform: (value) => {
      if (!value) return '';
      let cleaned = String(value).replace(/[^0-9,]/g, '');
      if (cleaned.startsWith('0') && cleaned.length > 1 && cleaned[1] !== ',') {
        cleaned = cleaned.substring(1);
      }
      return cleaned;
    }
  },

  {
    name: "official_report_type",
    label: "Tutanak Türü",
    placeholder: "Tutanak türünü seçiniz",
    type: "dropdown",
    options: [
      { label: "İfade Tutanağı", value: "ifade tutanagi" },
      { label: "Anlaşmalı Tutanak", value: "anlaşmali tutanak" },
      { label: "Zabıtlı", value: "zabitli" },
      { label: "Beyanlı", value: "beyanli" },
    ],
    required: true,
    icon: DocumentTextIcon,
  }
];

export default damageFields;
