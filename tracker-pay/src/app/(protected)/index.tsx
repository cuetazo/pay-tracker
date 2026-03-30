import { StyleSheet, Text, View } from "react-native";

export default function ProtectedScreen() {
  return (
    <View style={styles.container}>
      <Text>This is a protected screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
