import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ImageSourcePropType } from "react-native";

export type LoginCardProps = {
  content: string;
  icon: ImageSourcePropType;
};

export default function LoginCard(props: LoginCardProps) {
  return (
    <TouchableOpacity style={styles.container}>
      <View>
        <Image source={props.icon} style={styles.icon} />
      </View>
      <Text>{props.content}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
    backgroundColor: "#cee5ff",
    padding: 16,
    width: "100%",
    borderRadius: 50,
  },
  icon: {
    width: 28,
    height: 28,
  },
});
