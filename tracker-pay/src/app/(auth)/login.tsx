import Entypo from "@expo/vector-icons/Entypo";
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

GoogleSignin.configure({
  webClientId:
    "184071206390-jaqlpi38k4kko7qhjd4eorfos8mirf7a.apps.googleusercontent.com",
  offlineAccess: false,
  profileImageSize: 120,
});

export default function LoginScreen() {
  useEffect(() => {}, []);
  const [state, setState] = useState<{ userInfo: any | null }>({
    userInfo: null,
  });

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log("response", response);
      if (isSuccessResponse(response)) {
        setState({ userInfo: response.data });
      } else {
        // sign in was cancelled by user
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            break;
          default:
          // some other error happened
        }
      } else {
        // an error that's not related to google sign in occurred
      }
    }
  };

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
          onPress={signIn}
        />
        {state.userInfo && (
          <>
            <Text>{state.userInfo.user?.name}</Text>
            <Text>{state.userInfo.user?.email}</Text>
            <Text>{state.userInfo.user?.id}</Text>
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
