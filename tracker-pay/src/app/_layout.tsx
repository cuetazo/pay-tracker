import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <>
      <Stack />
      {/* <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#1e1e1e" },
          headerTintColor: "#fff",
        }}
      >
        <Stack.Screen name="(auth)/login" options={{ title: "Login" }} />
        <Stack.Screen
          name="(protected)/index"
          options={{ title: "Protected" }}
        />
      </Stack> */}
    </>
  );
}
