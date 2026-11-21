
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
    sky_mode: {
        name: "الوضع السماوي",
        bgColor: "#E0F2FE",
        textColor: "#000000",
        font: "'Cairo', sans-serif",
        palette: ["#0284C7", "#0369A1", "#38BDF8", "#075985"],
        barBg: "#FFFFFF",
        barBorder: "1px solid #BAE6FD",
        topBarBg: "#FFFFFF",
        topBarText: "#000000",
        btnBg: "#0369A1",
        btnText: "#FFFFFF",
        btnBorder: "none",
        accent: "#0284C7",
        accentText: "#FFFFFF",
        cardBg: "#BAE6FD",
        cardText: "#000000",
        cardBorder: "1.5px solid #38BDF8",
        modalBg: "#E0F2FE",
        modalText: "#000000",
        sajdah: "#0369A1"
    },
    emerald_mode: {
        name: "الوضع الزمردي",
        bgColor: "#D1FAE5",
        textColor: "#000000",
        font: "'Cairo', sans-serif",
        palette: ["#059669", "#047857", "#34D399", "#065F46"],
        barBg: "#FFFFFF",
        barBorder: "1px solid #A7F3D0",
        topBarBg: "#FFFFFF",
        topBarText: "#000000",
        btnBg: "#047857",
        btnText: "#FFFFFF",
        btnBorder: "none",
        accent: "#059669",
        accentText: "#FFFFFF",
        cardBg: "#A7F3D0",
        cardText: "#000000",
        cardBorder: "1.5px solid #34D399",
        modalBg: "#D1FAE5",
        modalText: "#000000",
        sajdah: "#047857"
    },
    burgundy_mode: {
        name: "الوضع العنابي",
        bgColor: "#FFE4E6",
        textColor: "#000000",
        font: "'Cairo', sans-serif",
        palette: ["#881337", "#9f1239", "#fb7185", "#701a75"],
        barBg: "#FFFFFF",
        barBorder: "1px solid #fecdd3",
        topBarBg: "#FFFFFF",
        topBarText: "#000000",
        btnBg: "#881337",
        btnText: "#FFFFFF",
        btnBorder: "none",
        accent: "#881337",
        accentText: "#FFFFFF",
        cardBg: "#fecdd3",
        cardText: "#000000",
        cardBorder: "1.5px solid #fb7185",
        modalBg: "#FFE4E6",
        modalText: "#000000",
        sajdah: "#881337"
    }
};