// constants/theme.ts
// Fuente única de verdad para colores, espaciado, tipografía y estilos compartidos

export const Colors = {
  primary: {
    main: "#0EA5E9", // sky-500
    light: "#38BDF8", // sky-400
    dark: "#0369A1", // sky-700
    soft: "#F0F9FF", // sky-50
    background: "#FFFFFF",
  },
  accent: {
    income: "#10B981", // emerald-500
    expense: "#F43F5E", // rose-500
  },
  neutral: {
    white: "#FFFFFF",
    black: "#0F172A",
    gray50: "#F8FAFC",
    gray100: "#F1F5F9",
    gray200: "#E2E8F0",
    gray300: "#CBD5E1",
    gray400: "#94A3B8",
    gray500: "#64748B",
    gray700: "#334155",
    gray900: "#0F172A",
  },
  status: {
    error: "#EF4444",
    warning: "#F59E0B",
    success: "#10B981",
    info: "#3B82F6",
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 36,
} as const;

export const FontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: Colors.primary.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

export const DarkColors = {
  primary: {
    main: "#38BDF8", // sky-400
    light: "#7DD3FC", // sky-300
    dark: "#0284C7", // sky-600
    soft: "#0C1A2A", // dark soft bg
    background: "#0F172A", // slate-900
  },
  accent: {
    income: "#34D399", // emerald-400
    expense: "#FB7185", // rose-400
  },
  neutral: {
    white: "#0F172A", // inverted: dark bg
    black: "#F8FAFC", // inverted: light text
    gray50: "#1E293B", // slate-800
    gray100: "#1E293B",
    gray200: "#334155", // slate-700
    gray300: "#475569", // slate-600
    gray400: "#94A3B8", // same
    gray500: "#CBD5E1", // slate-300
    gray700: "#E2E8F0", // slate-200
    gray900: "#F1F5F9", // slate-100
  },
  status: {
    error: "#F87171",
    warning: "#FBBF24",
    success: "#34D399",
    info: "#60A5FA",
  },
} as const;

/** Returns the correct color palette for the given mode */
export const getColors = (isDark: boolean) => (isDark ? DarkColors : Colors);

