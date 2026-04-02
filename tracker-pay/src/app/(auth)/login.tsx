import Entypo from "@expo/vector-icons/Entypo";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../../utils/authStore";

export default function LoginScreen() {
  const { user, SignIn, SignOut } = useAuthStore();

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
        <GoogleSigninButton
          style={{ width: 192, height: 48 }}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={SignIn}
        />
        <TouchableOpacity
          onPress={SignOut}
          style={{
            marginTop: 20,
            backgroundColor: "red",
            padding: 10,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "white" }}>Sign Out</Text>
        </TouchableOpacity>
        {user && (
          <>
            <Text>{user.name}</Text>
            <Text>{user.email}</Text>
            <Text>{user.id}</Text>
          </>
        )}
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
