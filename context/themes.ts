
export interface Theme {
    name: string;
    bgColor: string | null;
    isOriginal?: boolean;
    isDark?: boolean;
    textColor: string;
    font: string;
    palette: string[];
    barBg?: string;
    barBorder?: string;
    topBarBg?: string;
    topBarText?: string;
    btnBorder?: string;
    btnBg?: string;
    btnText?: string;
    accent?: string;
    accentText?: string;
    highlightText?: string;
    cardBg?: string;
    cardText?: string;
    cardBorder?: string;
    isGlass?: boolean;
    modalBg?: string;
    modalText?: string;
    sajdah?: string;
    bg?: string;
    text?: string;
    headerBg?: string;
    headerText?: string;
}

export const presetThemes: { [key: string]: Theme } = {
    black_gold: {
        name: "الأسود والذهبي",
        bgColor: "#000000",
        isDark: true,
        textColor: "#F59E0B",
        font: "'Cairo', sans-serif",
        palette: ["#F59E0B", "#D97706", "#B45309", "#78350F"],
        barBg: "#0B0B0B",
        barBorder: "1px solid #D97706",
        topBarBg: "#000000",
        topBarText: "#F59E0B",
        btnBg: "#141414",
        btnText: "#F59E0B",
        btnBorder: "1.5px solid #D97706",
        accent: "#F59E0B",
        accentText: "#000000",
        highlightText: "#FBBF24",
        cardBg: "#111111",
        cardText: "#F59E0B",
        cardBorder: "1.5px solid #D97706",
        modalBg: "#0A0A0A",
        modalText: "#F59E0B",
        sajdah: "#F59E0B"
    },
    default: {
        name: "الافتراضي",
        bgColor: "#DFE5EC",
        isOriginal: true,
        textColor: "#1E293B",
        font: "'Cairo', sans-serif",
        palette: ["#2E7D5E", "#544670", "#3B7A82", "#A26743"],
        barBg: "#FFFFFF",
        barBorder: "none",
        topBarBg: "#FFFFFF",
        topBarText: "#1E293B",
        btnBg: "#2E7D5E",
        btnText: "#FFFFFF",
        btnBorder: "none",
        accent: "#2E7D5E",
        cardBg: "#FFFFFF",
        cardBorder: "none"
    },
    deep_black: {
        name: "اسود",
        bgColor: "#000000",
        textColor: "#FFFFFF",
        font: "'Cairo', sans-serif",
        palette: ["#000000", "#000000", "#000000"],
        barBg: "#000000",
        barBorder: "1px solid #333333",
        topBarBg: "#000000",
        topBarText: "#FFFFFF",
        btnBorder: "1px solid rgba(255, 255, 255, 0.25)",
        accent: "#FFFFFF",
        accentText: "#000000",
        highlightText: "#FFFFFF",
        cardBg: "#111111",
        cardText: "#FFFFFF",
        cardBorder: "#333333",
        btnBg: "#000000",
        btnText: "#FFFFFF",
        modalBg: "#000000",
        modalText: "#FFFFFF",
        sajdah: "#FFFFFF"
    },
    shiny_gold: {
        name: "الذهبي اللامع",
        bgColor: "#FEF9C3",
        textColor: "#000000",
        font: "'Cairo', sans-serif",
        palette: ["#D97706", "#F59E0B", "#B45309", "#78350F"],
        barBg: "#FDE047",
        barBorder: "1px solid #D97706",
        topBarBg: "#FDE047",
        topBarText: "#000000",
        btnBg: "#EAB308",
        btnText: "#000000",
        btnBorder: "1.5px solid #CA8A04",
        accent: "#D97706",
        accentText: "#000000",
        cardBg: "#FDE047",
        cardText: "#000000",
        cardBorder: "1.5px solid #D97706",
        modalBg: "#FEF9C3",
        modalText: "#000000",
        sajdah: "#B45309"
    },
    fajr_light: {
        name: "نور الفجر",
        bgColor: "#F0F9FF",
        textColor: "#0C4A6E",
        font: "'Cairo', sans-serif",
        palette: ["#0284C7", "#6366F1", "#38BDF8"],
        barBg: "#E0F2FE",
        barBorder: "1px solid #BAE6FD"
    },
    golden_sand: {
        name: "الرمال الذهبية",
        bgColor: "#FFFBEB",
        textColor: "#451A03",
        font: "'Amiri', serif",
        palette: ["#B45309", "#059669", "#92400E"],
        barBg: "#FEF3C7",
        barBorder: "1px solid #FDE68A"
    },
    olive_grove: {
        name: "الزيتون المبارك",
        bgColor: "#F7FEE7",
        textColor: "#1A2E05",
        font: "'Scheherazade New', serif",
        palette: ["#4D7C0F", "#B45309", "#3F6212"],
        barBg: "#ECFCCB",
        barBorder: "1px solid #D9F99D"
    },
    kaaba_kiswa: {
        name: "صفاء الروح",
        bgColor: "#F9FAFB",
        textColor: "#111827",
        font: "'Amiri', serif",
        palette: ["#059669", "#D97706", "#1F2937"],
        barBg: "#FFFFFF",
        barBorder: "1px solid #E5E7EB",
        accent: "#059669",
        cardBg: "#FFFFFF",
        cardBorder: "#F3F4F6",
        modalBg: "#FFFFFF",
        modalText: "#111827"
    },
    evening_tranquility: {
        name: "سكينة المساء",
        bgColor: "#0F172A",
        textColor: "#E2E8F0",
        font: "'Amiri', serif",
        palette: ["#2563EB", "#D97706", "#1E293B"],
        barBg: "#1E293B",
        barBorder: "1px solid #3B82F6",
        accent: "#FCD34D",
        accentText: "#000000",
        cardBg: "#1E293B",
        cardBorder: "#334155",
        modalBg: "#0F172A",
        modalText: "#E2E8F0"
    },
    morning_dew: {
        name: "ندى الصباح",
        bgColor: "#ECFDF5",
        textColor: "#064E3B",
        font: "'Cairo', sans-serif",
        palette: ["#059669", "#0284C7", "#10B981"],
        barBg: "#D1FAE5",
        barBorder: "1px solid #10B981",
        accent: "#10B981",
        cardBg: "#FFFFFF",
        cardBorder: "#D1FAE5"
    },
    madinah_rose: {
        name: "ورد المدينة",
        bgColor: "#FFF1F2",
        textColor: "#881337",
        font: "'Cairo', sans-serif",
        palette: ["#BE123C", "#7C3AED", "#9F1239"],
        barBg: "#FFE4E6",
        barBorder: "1px solid #FECDD3"
    },
    andalusian_garden: {
        name: "حدائق الأندلس",
        bgColor: "#F0FDF4",
        textColor: "#14532D",
        font: "'Scheherazade New', serif",
        palette: ["#166534", "#92400E", "#15803D"],
        barBg: "#DCFCE7",
        barBorder: "1px solid #86EFAC"
    },
    blue_mosque: {
        name: "المسجد الأزرق",
        bgColor: "#ECFEFF",
        textColor: "#164E63",
        font: "'Amiri', serif",
        palette: ["#0E7490", "#4338CA", "#06B6D4"],
        barBg: "#CFFAFE",
        barBorder: "1px solid #A5F3FC"
    },
    clay_earth: {
        name: "الطين والأرض",
        bgColor: "#FAFAF9",
        textColor: "#44403C",
        font: "'Cairo', sans-serif",
        palette: ["#44403C", "#9A3412", "#78716C"],
        barBg: "#E7E5E4",
        barBorder: "1px solid #D6D3D1"
    },
    slate_stone: {
        name: "الحجر والرخام",
        bgColor: "#F8FAFC",
        textColor: "#334155",
        font: "'Cairo', sans-serif",
        palette: ["#334155", "#0D9488", "#64748B"],
        barBg: "#E2E8F0",
        barBorder: "1px solid #CBD5E1"
    },
    sunset_glow: {
        name: "وهج الغروب",
        bgColor: "#FFF7ED",
        textColor: "#9A3412",
        font: "'Cairo', sans-serif",
        palette: ["#EA580C", "#9333EA", "#F97316"],
        barBg: "#FFEDD5",
        barBorder: "1px solid #FED7AA",
        accentText: "#000000"
    },
    electric_violet: {
        name: "بنفسجي كهربائي",
        bgColor: "#0F172A",
        textColor: "#F8FAFC",
        font: "'Cairo', sans-serif",
        palette: ["#7C3AED", "#06B6D4", "#A855F7"],
        barBg: "#1E1B4B",
        barBorder: "1px solid #A855F7"
    },
    sakura_breeze: {
        name: "نسيم الساكورا",
        bgColor: "#FFF1F2",
        textColor: "#9D174D",
        font: "'Cairo', sans-serif",
        palette: ["#DB2777", "#7C3AED", "#F472B6"],
        barBg: "#FFE4E6",
        barBorder: "1px solid #FBCFE8"
    },
    midnight_neon: {
        name: "نيون منتصف الليل",
        bgColor: "#0F172A",
        textColor: "#F8FAFC",
        font: "'Cairo', sans-serif",
        palette: ["#0891B2", "#D946EF", "#8B5CF6"],
        barBg: "#1E293B",
        barBorder: "1px solid #06B6D4"
    },
    royal_purple: {
        name: "أرجواني ملكي",
        bgColor: "#2E1065",
        textColor: "#F3E8FF",
        font: "'Amiri', serif",
        palette: ["#6D28D9", "#D97706", "#5B21B6"],
        barBg: "#4C1D95",
        barBorder: "1px solid #7C3AED"
    },
    desert_night: {
        name: "ليل الصحراء",
        bgColor: "#0B0F19",
        textColor: "#C7D2FE",
        font: "'Cairo', sans-serif",
        palette: ["#4338CA", "#C026D3", "#7C3AED"],
        barBg: "#1E1B4B",
        barBorder: "1px solid #4F46E5"
    },
    ocean_peace: {
        name: "سلام المحيط",
        bgColor: "#0F172A",
        textColor: "#E2E8F0",
        font: "'Cairo', sans-serif",
        palette: ["#0284C7", "#0D9488", "#0369A1"],
        barBg: "#1E293B",
        barBorder: "1px solid #0EA5E9"
    },
    vintage_paper: {
        name: "ورق عتيق",
        bgColor: "#FEFBF1",
        textColor: "#3D3328",
        font: "'Amiri', serif",
        palette: ["#78350F", "#4D7C0F", "#C2B092"],
        barBg: "#EDE6D3",
        barBorder: "1px solid #D4C5A9"
    },
    turquoise_gem: {
        name: "فيروزي",
        bgColor: "#F0FDFA",
        textColor: "#134E4A",
        font: "'Cairo', sans-serif",
        palette: ["#0D9488", "#2563EB", "#2DD4BF"],
        barBg: "#CCFBF1",
        barBorder: "1px solid #99F6E4"
    },
    deep_forest: {
        name: "غابة عميقة",
        bgColor: "#022C22",
        textColor: "#D1FAE5",
        font: "'Amiri', serif",
        palette: ["#047857", "#B45309", "#059669"],
        barBg: "#064E3B",
        barBorder: "1px solid #059669"
    },
    lavender_mist: {
        name: "ضباب الخزامى",
        bgColor: "#FAF5FF",
        textColor: "#581C87",
        font: "'Cairo', sans-serif",
        palette: ["#7C3AED", "#BE185D", "#A855F7"],
        barBg: "#F3E8FF",
        barBorder: "1px solid #E9D5FF"
    },
    crystal_glass: {
        name: "كريستال شفاف",
        bgColor: "#FFFFFF",
        textColor: "#0369A1",
        font: "'Cairo', sans-serif",
        palette: ["#0284C7", "#7C3AED", "#38BDF8"],
        barBg: "#E0F2FE",
        barBorder: "1px solid #38BDF8",
        btnText: "#FFFFFF",
        isGlass: true
    },
    frosted_emerald: {
        name: "زمرد زجاجي",
        bgColor: "#ECFDF5",
        textColor: "#065F46",
        font: "'Cairo', sans-serif",
        palette: ["#059669", "#8B5CF6", "#064E3B"],
        barBg: "#D1FAE5",
        barBorder: "1px solid #10B981",
        btnText: "#FFFFFF",
        isGlass: true
    },
    midnight_glass: {
        name: "زجاج ليلي",
        bgColor: "#0F172A",
        textColor: "#F1F5F9",
        font: "'Cairo', sans-serif",
        palette: ["#2563EB", "#7C3AED", "#0F172A"],
        barBg: "#1E293B",
        barBorder: "1px solid #3B82F6",
        btnText: "#FFFFFF",
        isGlass: true
    }
};