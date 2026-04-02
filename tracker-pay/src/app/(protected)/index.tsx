import { useAuthStore } from "@/utils/authStore";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProtectedScreen() {
  const { user, SignOut } = useAuthStore();
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={SignOut}
        style={{
          marginTop: 20,
          backgroundColor: "teal",
          padding: 12,
          borderRadius: 8,
        }}
      >
        <Text>Sign Out</Text>
      </TouchableOpacity>
      <Text>This is a protected screen.</Text>
      <Text>Welcome, {user?.name}!</Text>
      <Text>Email: {user?.email}</Text>
      <Text>UID: {user?.id}</Text>
      <View style={styles.avatarContainer}>
        {user?.photo ? (
          <Image
            style={styles.avatar}
            source={{ uri: user.photo }}
            accessibilityLabel="Photo de perfil"
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>No Photo</Text>
          </View>
        )}
      </View>
      <Text style={{ marginTop: 8, fontSize: 12, color: "gray" }}>
        Profile Photo
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    marginTop: 20,
    marginBottom: 8,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ccc",
  },
  avatarFallbackText: {
    fontSize: 12,
    color: "#444",
  },
});
