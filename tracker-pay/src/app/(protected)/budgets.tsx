import BudgetBigCard from "@/components/budgetBigCard";
import BudgetCard from "@/components/budgetCard";
import { Colors } from "@/constants/theme_test";
import AntDesign from "@expo/vector-icons/AntDesign";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";

export default function budgetsScreen() {
  return (
    <View style={styles.layout}>
      <Text>Sigue tus gastos segun categoria</Text>
      <TouchableHighlight
        style={styles.button_add}
        activeOpacity={0.6}
        underlayColor={Colors.primary.main}
        onPress={() => {
          console.log("wasa");
        }}
      >
        <View style={styles.button_add__content}>
          <AntDesign name="plus" size={16} color="white" />
          <Text style={styles.buton_add__title}>Agregar categoria</Text>
        </View>
      </TouchableHighlight>
      <View style={styles.BigCards__container}>
        <BudgetBigCard />
        <BudgetBigCard />
        <BudgetBigCard />
      </View>
      <View>
        <BudgetCard />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    padding: 20,
  },
  button_add: {
    margin: 16,
    backgroundColor: Colors.primary.light,
    paddingVertical: 10,
    borderRadius: 6,
  },
  buton_add__title: {
    color: "white",
  },
  button_add__content: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  BigCards__container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    maxWidth: "auto",
  },
});
