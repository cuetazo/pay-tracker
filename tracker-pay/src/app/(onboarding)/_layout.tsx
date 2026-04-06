import { Slot, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function onBoardingLayout() {
  const router = useRouter();

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
  },
});
