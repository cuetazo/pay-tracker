import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useAuthStore } from "../../stores/authStore";

export default function AuthLayout() {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/(tabs)");
    }
  }, [isLoggedIn, router]);

  return (
    <View style={styles.layout}>
      <Slot />
    </View>
  );
}
const styles = StyleSheet.create({
  layout: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#073b4c",
  },
});
