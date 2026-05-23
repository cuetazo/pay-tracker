import { Colors } from "@/constants/theme_test";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";

export type TransactionType = "income" | "expense";

export type TransactionCardsProps = {
  amount: number;
  transaction_type: TransactionType;
  category: string;
  destinatary: string;
};

export default function TransactionCard({
  amount,
  transaction_type,
  category,
  destinatary,
}: TransactionCardsProps) {
  const isExpense = transaction_type === "expense";

  const sign = isExpense ? "-" : "+";

  const color = isExpense
    ? Colors.accent.expense
    : Colors.accent.income;

  const icon = isExpense
    ? "arrow-top-right"
    : "arrow-bottom-left";

  return (
    <View style={styles.container}>
      {/* LEFT SIDE */}
      <View style={styles.container__information}>
        {/* ICON */}
        <View
          style={[
            styles.container__icon,
            { backgroundColor: color },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color="#FFFFFF"
          />
        </View>

        {/* TEXTS */}
        <View style={styles.textGroup}>
          <Text style={styles.destinataryText}>
            {destinatary}
          </Text>

          <View>
            <Text style={styles.categoryText}>
              {category}
            </Text>

            <Text style={styles.dateText}>
              Hoy
            </Text>
          </View>
        </View>
      </View>

      {/* RIGHT SIDE */}
      <View>
        <Text
          style={[
            styles.amount_text,
            { color: color },
          ]}
        >
          {sign}${amount}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  container__information: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  container__icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  textGroup: {
    marginLeft: 12,
    justifyContent: "center",
  },

  destinataryText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },

  categoryText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },

  dateText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },

  amount_text: {
    fontSize: 18,
    fontWeight: "700",
  },
});