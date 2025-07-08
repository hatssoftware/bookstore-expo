export const colors = {
    // Primary colors
    primary: "#1f2937",
    primaryLight: "#374151",
    primaryDark: "#111827",

    // Secondary colors
    secondary: "#f59e0b",
    secondaryLight: "#fbbf24",
    secondaryDark: "#d97706",

    // Neutral colors
    white: "#ffffff",
    black: "#000000",
    gray50: "#f9fafb",
    gray100: "#f3f4f6",
    gray200: "#e5e7eb",
    gray300: "#d1d5db",
    gray400: "#9ca3af",
    gray500: "#6b7280",
    gray600: "#4b5563",
    gray700: "#374151",
    gray800: "#1f2937",
    gray900: "#111827",

    // Status colors
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

    // Background colors
    background: "#ffffff",
    backgroundSecondary: "#f9fafb",
    surface: "#ffffff",
    card: "#ffffff",

    // Text colors
    text: "#111827",
    textSecondary: "#6b7280",
    textLight: "#9ca3af",
    textInverted: "#ffffff",

    // Border colors
    border: "#e5e7eb",
    borderLight: "#f3f4f6",
    borderDark: "#d1d5db",
} as const;

export const typography = {
    // Font families
    fontFamily: {
        regular: "System",
        medium: "System",
        bold: "System",
    },

    // Font sizes
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        "2xl": 24,
        "3xl": 30,
        "4xl": 36,
        "5xl": 48,
    },

    // Line heights
    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },

    // Font weights
    fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
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
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
    32: 128,
} as const;

export const borderRadius = {
    none: 0,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
} as const;

export const shadows = {
    sm: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    base: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    lg: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
} as const;

export const theme = {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
} as const;

export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
