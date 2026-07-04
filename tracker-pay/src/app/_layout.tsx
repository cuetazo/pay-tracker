import { ModalWrapper } from "@/components/common/modalWrapper";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";

export default function RootLayout() {
  const { silentSignIn, isLoggedIn, onboarding_complete } = useAuthStore();
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
      offlineAccess: false, //mantener en false sino se rompe todo
      profileImageSize: 120,
    });
    const init = async () => {
      await silentSignIn();
    };
    init();
  }, [silentSignIn]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={isLoggedIn && !onboarding_complete}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
      <ModalWrapper />
    </GestureHandlerRootView>
  );
}
