import { Colors } from "@/constants/theme_test";
import { StyleSheet, Text, View } from "react-native";

let progress = 0.7;
export default function BudgetCard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comida</Text>
      <Text style={styles.description}>Mensual</Text>

      <View style={styles.spend__container}>
        <Text style={styles.description}>Gastado</Text>
        <View style={styles.progress_bar__outside}>
          <View style={styles.progress_bar__inside}></View>
        </View>
        <View style={styles.spend__remaining_container}>
          <Text style={styles.spend__remaining_title}>Restante</Text>
          <Text style={styles.spend__remaining_amount}>s/254</Text>
        </View>
      </View>
      <View style={styles.summary__container}>
        <View style={styles.summary__limit_container}>
          <Text style={styles.summary__limit_title}>Budget Limit</Text>
          <Text style={styles.summary__limit_amount}>s/2000</Text>
        </View>
        <View style={styles.summary__use_container}>
          <Text style={styles.summary__use_description}>0%</Text>
          <Text style={styles.summary__use_description}>66% used</Text>
          <Text style={styles.summary__use_description}>100%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 6,
    marginVertical: 12,
    boxSizing: "border-box",
    padding: 10,
    gap: 4,

    shadowColor: Colors.primary.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
  },
  description: {
    fontSize: 12,
    color: "#666",
  },
  progress_bar__outside: {
    width: "100%",
    height: 4,
    backgroundColor: Colors.neutral.gray500,
    marginVertical: 6,
    justifyContent: "flex-start",
    overflow: "hidden",
    borderRadius: 10,
  },
  progress_bar__inside: {
    width: `${progress * 100}%`,
    height: "100%",
    backgroundColor: "black",
  },

  spend__container: {
    paddingVertical: 10,
  },
  spend__remaining_container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  spend__remaining_amount: {
    color: Colors.primary.main,
    fontWeight: "bold",
    fontSize: 14,
  },
  spend__remaining_title: {
    fontWeight: "400",
    color: "#666",
    fontSize: 12,
  },
  summary__container: {
    borderTopColor: "#c9c9c9",
    borderTopWidth: 1,
    gap: 16,
    paddingTop: 12,
  },
  summary__limit_container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  summary__use_container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summary__use_description: {
    fontSize: 12,
    color: Colors.neutral.gray700,
    fontWeight: "400",
  },
  summary__limit_amount: {
    fontSize: 14,
    fontWeight: "bold",
  },
  summary__limit_title: {
    fontSize: 14,
    color: Colors.neutral.gray700,
    fontWeight: "400",
  },
});
