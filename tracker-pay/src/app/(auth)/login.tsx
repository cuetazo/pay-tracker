import LoginCard from "@/components/loginCard";
import Entypo from "@expo/vector-icons/Entypo";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function LoginScreen() {
  useEffect(() => {}, []);
  return (
    <View style={styles.container}>
      <View>
        {/* Login icon */}
        <View>
          <Entypo name="wallet" size={24} color="black" />
        </View>
        <View>
          <Text>Welcome Back!</Text>
          <Text>Please log in to continue</Text>
        </View>
      </View>

      <View>
        <Text>Sign in into your account</Text>
        <View>
          <LoginCard
            content="Sign in with Google"
            icon={require("@/assets/images/google-icon.png")}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
});
