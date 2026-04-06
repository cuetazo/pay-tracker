import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";
export default function BudgetBigCard() {
  return (
    <View style={styles.container}>
      <Text>Activo</Text>
      <MaterialCommunityIcons name="trending-up" size={24} color="black" />
      <Text>5</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    borderRadius: 20,
    margin: 6,
    backgroundColor: "white",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
