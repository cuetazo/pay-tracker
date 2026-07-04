import { useAuthStore } from "@/stores/authStore";
import Entypo from "@expo/vector-icons/Entypo";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const { user, SignIn, SignOut } = useAuthStore();

  return (
    <View style={styles.container_screen}>
      <View style={styles.logo}>
        <Entypo name="wallet" size={64} color="white" />
      </View>
      <View style={{ alignItems: "center", gap: 8 }}>
        <Text style={styles.title}>Tracker Pay</Text>
        <Text style={{ fontSize: 16, color: "#333", textAlign: "center" }}>
          Finanzas precisas para tu vida diaria. Controla tus gastos, ahorra de
          forma simple.
        </Text>
      </View>
      <View style={{ width: "100%" }}>
        <TouchableOpacity
          style={styles.SignInButton_container}
          onPress={user ? SignOut : SignIn}
        >
          <Image
            style={{
              width: 18,
              height: 18,
              backgroundColor: "white",
              borderRadius: 100,
              padding: 2,
              borderWidth: 2,
              borderColor: "white",
            }}
            source={require("@/assets/images/google-icon.png")}
          />
          <Text style={styles.SignInButton__title}>Continuar con Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container_screen: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  logo: {
    width: 132,
    height: 132,
    backgroundColor: "#1E82F4",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#1E82F4",
    marginBottom: 8,
  },
  SignInButton_container: {
    backgroundColor: "#1E82F4",
    borderRadius: 8,
    paddingVertical: 18,
    marginTop: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  SignInButton__title: {
    color: "white",
    fontSize: 16,
  },
});
