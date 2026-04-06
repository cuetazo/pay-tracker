import { useAuthStore } from "@/utils/authStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function AvatarMenuModal() {
  const router = useRouter();
  const { SignOut } = useAuthStore();

  const handleSettings = () => {
    router.back();
    // Navigate to settings page when ready
    // router.push("/settings");
  };

  const handleLogout = async () => {
    await SignOut();
  };

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSettings}
        >
          <Ionicons name="settings" size={20} color="#06d6a0" />
          <Text style={styles.buttonText}>Settings</Text>
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.logoutButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={SignOut}
        >
          <Ionicons name="log-out" size={20} color="#ef476f" />
          <Text style={[styles.buttonText, styles.logoutText]}>Logout</Text>
        </Pressable>
      </View>

      <Pressable style={styles.overlay} onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: 10,
  },
  modal: {
    backgroundColor: "#0b3d4f",
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 180,
    borderColor: "#06d6a0",
    borderWidth: 1,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  buttonPressed: {
    backgroundColor: "rgba(6, 214, 160, 0.1)",
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  logoutButton: {},
  logoutText: {
    color: "#ef476f",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
});
