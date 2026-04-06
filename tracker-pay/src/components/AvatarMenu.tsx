import { useAuthStore } from "@/utils/authStore";
import { useRouter } from "expo-router";
import { Image, StyleSheet, TouchableHighlight } from "react-native";

export default function AvatarMenu() {
  const { user } = useAuthStore();
  const router = useRouter();

  return (
    <TouchableHighlight
      style={styles.container}
      onPress={() => router.push("/avatar-menu-modal")}
      activeOpacity={0.6}
      underlayColor={"#fff"}
    >
      {user?.photo && (
        <Image source={{ uri: user.photo }} style={styles.avatar} />
      )}
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    marginRight: 10,
    overflow: "hidden",
    borderRadius: 25,
    borderColor: "#06d6a0",
    borderWidth: 3,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
});
