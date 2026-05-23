import Entypo from "@expo/vector-icons/Entypo";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../../stores/authStore";

export default function LoginScreen() {
  const { user, SignIn, SignOut } = useAuthStore();

  return (
    <View style={styles.container_screen}>
      <View style={styles.logo}>
        <Entypo name="wallet" size={52} color="black" />
      </View>
      <Text style={styles.title}>Tracker Pay</Text>
      <View>
        <TouchableOpacity
          style={styles.SignInButton_container}
          onPress={user ? SignOut : SignIn}
        >
          <View style={{ width: 24, height: 24 }}>
            <Image
              style={{ width: "100%", height: "100%" }}
              source={require("@/assets/images/google-icon.png")}
            />
          </View>
          <Text style={styles.SignInButton__title}>Sign in with Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container_screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#073b4c",
    gap: 8,
  },
  logo: {
    width: 100,
    height: 100,
    backgroundColor: "#06d6a0",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    margin: 12,
  },
  SignInButton_container: {
    backgroundColor: "#dddddd",
    borderRadius: 50,
    paddingHorizontal: 24,
    padding: 12,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  SignInButton__title: {
    color: "#073b4c",
    fontSize: 16,
  },
});
