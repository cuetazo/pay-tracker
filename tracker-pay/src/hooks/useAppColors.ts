/**
 * hooks/useAppColors.ts
 * Single hook for dark-mode-aware colors across the entire app.
 */
import { getColors } from "@/constants/theme";
import { useThemeStore } from "@/stores/themeStore";

export function useAppColors() {
  const { isDarkMode } = useThemeStore();
  return getColors(isDarkMode);
}
