import { requireNativeModule } from "expo-modules-core";

type YapeTrackerModuleType = {
  setSession(
    supabaseUrl: string,
    anonKey: string,
    accessToken: string,
    userId: string,
  ): void;
  clearSession(): void;
  hasOverlayPermission(): boolean;
  requestOverlayPermission(): void;
  isAccessibilityServiceEnabled(): boolean;
  openAccessibilitySettings(): void;
  isNotificationListenerEnabled(): boolean;
  openNotificationListenerSettings(): void;
};

const YapeTracker = requireNativeModule<YapeTrackerModuleType>("YapeTracker");

export default YapeTracker;
