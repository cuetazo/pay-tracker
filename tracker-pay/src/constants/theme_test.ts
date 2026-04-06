// theme.ts
export const Colors = {
  // Colores principales - Verde natural
  primary: {
    dark: "#0B3B2F", // Verde oscuro para textos importantes
    main: "#1B8C5E", // Verde principal para botones y acentos
    light: "#4CAF8C", // Verde claro para elementos secundarios
    soft: "#E8F5E9", // Verde muy suave para fondos
    background: "#F0F7F2", // Fondo general suave
  },

  // Colores de acento
  accent: {
    income: "#1B8C5E",
    //income: "#2E7D32", // Verde para ingresos (más oscuro)
    expense: "#E53935", // Rojo suave para gastos
    warning: "#FFA000", // Amarillo para advertencias
    info: "#0288D1", // Azul para información
  },

  // Neutros
  neutral: {
    white: "#FFFFFF",
    gray50: "#FAFAFA",
    gray100: "#F5F5F5",
    gray300: "#E0E0E0",
    gray500: "#9E9E9E",
    gray700: "#616161",
    gray900: "#212121",
    black: "#000000",
  },

  // Estados
  status: {
    success: "#4CAF50",
    error: "#EF5350",
    pending: "#FFB74D",
  },
} as const;

// Tipos para TypeScript
export type ColorScheme = typeof Colors;
