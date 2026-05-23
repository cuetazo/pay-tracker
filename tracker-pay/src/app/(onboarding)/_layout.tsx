import { Slot, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function onBoardingLayout() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.layout}>
      <Slot />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  layout: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
