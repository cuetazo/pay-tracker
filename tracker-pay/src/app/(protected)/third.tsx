import { Drawer } from "expo-router/drawer";
import { Text, View } from "react-native";

export default function thirdScreen() {
  return (
    <View>
      <Drawer />
      <Text>This is the third screen.</Text>
    </View>
  );
}
