import TransactionBigCard from "@/components/TransactionBigCard";
import TransactionCard, { TransactionType } from "@/components/TransactionCard";
import { Colors } from "@/constants/theme_test";
import { FlatList, StatusBar, StyleSheet, Text, View } from "react-native";

//fake data simulate fetch for render list of transactions
const data: Array<{
  transaction_type: TransactionType;
  amount: number;
  destinatary: string;
  category: string;
}> = [
  {
    transaction_type: "income",
    amount: 100,
    destinatary: "wasa wasasiano",
    category: "food",
  },
  {
    transaction_type: "income",
    amount: 2500,
    destinatary: "employer inc",
    category: "salary",
  },
  {
    transaction_type: "expense",
    amount: 45.5,
    destinatary: "coffee shop",
    category: "food",
  },
  {
    transaction_type: "income",
    amount: 150,
    destinatary: "john doe",
    category: "personal",
  },
  {
    transaction_type: "income",
    amount: 500,
    destinatary: "freelance project",
    category: "work",
  },
  {
    transaction_type: "income",
    amount: 2500,
    destinatary: "employer inc",
    category: "salary",
  },
  {
    transaction_type: "expense",
    amount: 45.5,
    destinatary: "coffee shop",
    category: "food",
  },
  {
    transaction_type: "income",
    amount: 150,
    destinatary: "john doe",
    category: "personal",
  },
  {
    transaction_type: "income",
    amount: 500,
    destinatary: "freelance project",
    category: "work",
  },
  {
    transaction_type: "income",
    amount: 2500,
    destinatary: "employer inc",
    category: "salary",
  },
  {
    transaction_type: "expense",
    amount: 45.5,
    destinatary: "coffee shop",
    category: "food",
  },
  {
    transaction_type: "income",
    amount: 150,
    destinatary: "john doe",
    category: "personal",
  },
  {
    transaction_type: "income",
    amount: 500,
    destinatary: "freelance project",
    category: "work",
  },
  {
    transaction_type: "expense",
    amount: 89.99,
    destinatary: "gas station",
    category: "transport",
  },
  {
    transaction_type: "expense",
    amount: 200,
    destinatary: "electricity bill",
    category: "utilities",
  },
  {
    transaction_type: "income",
    amount: 1200,
    destinatary: "bonus",
    category: "salary",
  },
  {
    transaction_type: "expense",
    amount: 35.75,
    destinatary: "grocery store",
    category: "food",
  },
  {
    transaction_type: "income",
    amount: 300,
    destinatary: "credit card",
    category: "finance",
  },
];

export default function TransactionsScreen() {
  // Calcular totales reales
  const totalIncome = data
    .filter((t) => t.transaction_type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = data
    .filter((t) => t.transaction_type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.neutral.gray50}
      />
      <FlatList
        data={data}
        keyExtractor={(item, index) => `${item.destinatary}-${index}`}
        renderItem={({ item }) => <TransactionCard {...item} />}
        showsVerticalScrollIndicator={true}
        ListFooterComponent={<View style={{ height: 10 }}></View>}
        ListHeaderComponent={
          <View style={styles.screen}>
            {/* <Text style={styles.title}>Transacciones</Text> */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Balance Total</Text>
              <Text style={styles.balanceAmount}>
                $
                {totalBalance.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
            <View style={styles.summary_container}>
              <TransactionBigCard
                title={`$${totalIncome.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
                label="Ingresos"
                icon="arrow-up-circle"
                color={Colors.accent.income}
              />
              <TransactionBigCard
                title={`$${totalExpense.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
                label="Gastos"
                icon="arrow-down-circle"
                color={Colors.accent.expense}
              />
            </View>
            <View style={styles.transactionsHeader}>
              <Text style={styles.transactionsTitle}>
                Últimas transacciones
              </Text>
              <Text style={styles.transactionsCount}>
                {data.length} movimientos
              </Text>
            </View>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    paddingTop: 12,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary.dark,
    marginVertical: 10,
  },
  balanceCard: {
    backgroundColor: Colors.primary.main,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.primary.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceLabel: {
    color: Colors.neutral.white,
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    color: Colors.neutral.white,
    fontSize: 36,
    fontWeight: "bold",
  },
  summary_container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 22,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary.dark,
  },
  transactionsCount: {
    fontSize: 12,
    color: Colors.neutral.gray500,
  },
});
