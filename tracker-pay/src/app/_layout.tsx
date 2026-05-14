import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "../utils/authStore";

export default function RootLayout() {
  const { silentSignIn, isLoggedIn, onboarding_complete } = useAuthStore();

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
        <StatusBar style="auto" />
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={isLoggedIn && !onboarding_complete}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="avatar-menu-modal"
            options={{
              presentation: "transparentModal",
              headerShown: false,
            }}
          />
        </Stack.Protected>
      </Stack>
    </GestureHandlerRootView>
  );
}
