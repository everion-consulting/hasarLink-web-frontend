/**
 * damageFields
 * - Hasar bilgisi formunda kullanılacak alan tanımlarını içerir.
 * - Her alan nesnesi, formda gösterilecek inputun özelliklerini belirler.
 * - FormRenderer gibi dinamik form bileşenlerinde kullanılır.
 */
/**
 * damageFields
 * - Hasar bilgisi formunda kullanılacak alan tanımlarını içerir.
 * - Her alan nesnesi, formda gösterilecek inputun özelliklerini belirler.
 * - FormRenderer gibi dinamik form bileşenlerinde kullanılır.
 */
import { CheckBadgeIcon, CircleStackIcon, DocumentTextIcon } from 'react-native-heroicons/outline';
import { NewspaperIcon } from 'react-native-heroicons/outline';
import { WrenchScrewdriverIcon } from 'react-native-heroicons/outline';
import { QuestionMarkCircle } from 'react-native-heroicons/outline';
import { MapPinIcon, ClockIcon } from 'react-native-heroicons/outline';
import formatter, { formatPlate } from '../utils/formatter';

const damageFields = [
    // Hasar nedeni seçimi
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
        icon: QuestionMarkCircle,
    },

    // Hasar tipi seçimi
    {
        name: "damage_description",
        label: "Hasar Bölgesi",
        placeholder: "Kaporta",
        type: "select",
        required: true,
        icon: NewspaperIcon
    },

    // ✅ Kaza Yeri - İl ve İlçe aynı satırda
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

    // ✅ Kaza Tarihi ve Saati aynı satırda
    {
        name: "accident_datetime",
        label: "Kaza Tarihi ve Saati",
        type: "datetime",  // ✅ Yeni tip
        placeholder: "Tarih ve saat seçiniz",
        required: true,
        icon: ClockIcon,
    },

    {
        name: "estimated_damage_amount",
        label: "Tahmini Hasar Tutarı",
        placeholder: "Tahmini Hasar Tutarı Giriniz",
        type: "number",
        required: false,
        icon: CircleStackIcon
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