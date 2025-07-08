export const colors = {
    // Modern brand colors - elegant and sophisticated
    primary: "#0a0a0a",
    primaryLight: "#1a1a1a",
    primaryDark: "#000000",

    // Accent colors - warm and inviting
    accent: "#ff6b35",
    accentLight: "#ff8c42",
    accentDark: "#e55a2b",

    // Secondary colors - subtle and refined
    secondary: "#6366f1",
    secondaryLight: "#818cf8",
    secondaryDark: "#4f46e5",

    // Neutral palette - modern and clean
    white: "#ffffff",
    black: "#000000",
    gray50: "#fafafa",
    gray100: "#f5f5f5",
    gray200: "#e5e5e5",
    gray300: "#d4d4d4",
    gray400: "#a3a3a3",
    gray500: "#737373",
    gray600: "#525252",
    gray700: "#404040",
    gray800: "#262626",
    gray900: "#171717",

    // Status colors - clear and accessible
    success: "#10b981",
    successLight: "#34d399",
    successDark: "#059669",

    error: "#ef4444",
    errorLight: "#f87171",
    errorDark: "#dc2626",

    warning: "#f59e0b",
    warningLight: "#fbbf24",
    warningDark: "#d97706",

    info: "#3b82f6",
    infoLight: "#60a5fa",
    infoDark: "#2563eb",

    // Background colors - layered and sophisticated
    background: "#fafafa",
    backgroundSecondary: "#f5f5f5",
    surface: "#ffffff",
    card: "#ffffff",
    overlay: "rgba(0, 0, 0, 0.5)",

    // Text colors - high contrast and readable
    text: "#0a0a0a",
    textSecondary: "#525252",
    textLight: "#a3a3a3",
    textInverted: "#ffffff",
    textMuted: "#d4d4d4",

    // Border colors - subtle and clean
    border: "#e5e5e5",
    borderLight: "#f5f5f5",
    borderDark: "#d4d4d4",
    borderFocus: "#6366f1",
} as const;

export const typography = {
    // Geist font family
    fontFamily: {
        thin: "Geist-Thin",
        extraLight: "Geist-ExtraLight",
        light: "Geist-Light",
        regular: "Geist-Regular",
        medium: "Geist-Medium",
        semibold: "Geist-SemiBold",
        bold: "Geist-Bold",
        extraBold: "Geist-ExtraBold",
        black: "Geist-Black",
    },
    fontWeight: {
        thin: "Geist-Thin",
        extraLight: "Geist-ExtraLight",
        light: "Geist-Light",
        regular: "Geist-Regular",
        medium: "Geist-Medium",
        semibold: "Geist-SemiBold",
        bold: "Geist-Bold",
        extraBold: "Geist-ExtraBold",
        black: "Geist-Black",
    },

    // Refined type scale
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        "2xl": 24,
        "3xl": 28,
        "4xl": 32,
        "5xl": 40,
        "6xl": 48,
        "7xl": 56,
    },

    // Line heights for readability
    lineHeight: {
        tight: 1.2,
        snug: 1.3,
        normal: 1.5,
        relaxed: 1.6,
        loose: 1.8,
    },

    // Letter spacing for elegance
    letterSpacing: {
        tighter: -0.5,
        tight: -0.25,
        normal: 0,
        wide: 0.25,
        wider: 0.5,
        widest: 1,
    },
} as const;

export const spacing = {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    10: 40,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    24: 96,
    28: 112,
    32: 128,
    40: 160,
    48: 192,
    56: 224,
    64: 256,
} as const;

export const borderRadius = {
    none: 0,
    xs: 2,
    sm: 4,
    base: 6,
    md: 8,
    lg: 12,
    xl: 16,
    "2xl": 20,
    "3xl": 24,
    full: 9999,
} as const;

export const shadows = {
    xs: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 1,
        elevation: 1,
    },
    sm: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    base: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    md: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    xl: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 12,
    },
} as const;

// Component-specific design tokens
export const components = {
    button: {
        height: {
            sm: 32,
            md: 40,
            lg: 48,
            xl: 56,
        },
        padding: {
            sm: { horizontal: 12, vertical: 6 },
            md: { horizontal: 16, vertical: 8 },
            lg: { horizontal: 20, vertical: 12 },
            xl: { horizontal: 24, vertical: 16 },
        },
    },
    card: {
        padding: {
            sm: 12,
            md: 16,
            lg: 20,
            xl: 24,
        },
        borderRadius: borderRadius.lg,
        shadow: shadows.sm,
    },
    input: {
        height: 48,
        borderRadius: borderRadius.md,
        padding: { horizontal: 16, vertical: 12 },
    },
} as const;

export const theme = {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    components,
} as const;

export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
