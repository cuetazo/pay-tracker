import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useAuthStore } from "../utils/authStore";

export default function RootLayout() {
  const { silentSignIn, isLoggedIn } = useAuthStore();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.WEB_CLIENT_ID,
      offlineAccess: false,
      profileImageSize: 120,
    });
    silentSignIn();
  }, [silentSignIn]);

  return (
    <Stack>
      <StatusBar style="auto" />
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
