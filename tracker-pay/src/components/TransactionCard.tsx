import { Colors } from "@/constants/theme_test";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";

// 1. Definimos el Enum
/* export enum TransactionType {
  EXPENSE = "expense",
  INCOME = "income",
} */
export type TransactionType = "income" | "expense";
// 2. Ajustamos la interfaz para usar el Enum
export type TransactionCardsProps = {
  amount: number;
  transaction_type: TransactionType; // Cambiado de string a TransactionType
  category: string;
  destinatary: string;
};

/* 
// Mapeo de configuraciones según el tipo
const transactionConfig = {
  [TransactionType.EXPENSE]: {
    color: "#ef476f",
    icon: "arrow-top-right" as const,
  },
  [TransactionType.INCOME]: {
    color: "#06d6a0",
    icon: "arrow-bottom-left" as const,
  },
}; */

export default function TransactionCard({
  amount,
  transaction_type,
  category,
  destinatary,
}: TransactionCardsProps) {
  // Obtenemos la configuración basada en el tipo que llega por props
  //const config = transactionConfig[transaction_type];

  const isExpense = transaction_type === "expense";
  const sign = isExpense ? "-" : "+";
  const color = isExpense ? Colors.accent.expense : Colors.accent.income;
  const icon = isExpense ? "arrow-top-right" : "arrow-bottom-left";

  return (
    <View style={styles.container}>
      <View style={styles.container__information}>
        {/* Aplicamos el color de fondo dinámico */}
        <View style={[styles.container__icon, { backgroundColor: color }]}>
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color="white" // Cambiado a blanco para mejor contraste
          />
        </View>

        <View style={styles.textGroup}>
          <Text style={styles.destinataryText}>{destinatary}</Text>
          <View>
            <Text style={styles.categoryText}>{category}</Text>
            <Text style={styles.dateText}>Hoy</Text>
          </View>
        </View>
      </View>

      <View>
        <Text style={[styles.amount_text, { color: color }]}>
          {sign}${amount}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "white",
    borderColor: "#e0e0e0",
    borderBottomWidth: 0.8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    elevation: 6,
  },
  container__information: {
    flexDirection: "row",
    alignItems: "center",
  },
  textGroup: {
    marginLeft: 10,
  },
  destinataryText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  categoryText: {
    color: "#666",
    fontSize: 12,
  },
  dateText: {
    color: "#999",
    fontSize: 10,
  },
  amount_text: {
    fontSize: 18,
    fontWeight: "600",
  },
  container__icon: {
    borderRadius: 12,
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
});
