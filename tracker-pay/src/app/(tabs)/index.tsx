// app/(protected)/index.tsx  (Home)
import TransactionCard from "@/components/transaction/TransactionCard";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from "@/constants/theme";
import { Database } from "@/services/db/schema";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/stores/supabase";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View
} from "react-native";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type Category = Database["public"]["Tables"]["category"]["Row"];
type Profile = {
  monthly_income: number;
  monthly_spending_limit: number;
  current_month_spending: number;
};

const MONTH_NAMES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const currentMonth = MONTH_NAMES[new Date().getMonth()];

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    const [txRes, catRes, profileRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("userId", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("category").select("*").eq("userId", user.id),
      supabase
        .from("profiles")
        .select(
          "monthly_income, monthly_spending_limit, current_month_spending",
        )
        .eq("id", user.id)
        .single(),
    ]);

    if (txRes.data) setTransactions(txRes.data);
    if (catRes.data) setCategories(catRes.data);
    if (profileRes.data) setProfile(profileRes.data);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Derived values ───────────────────────────────────────────────────────
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const totalBalance = totalIncome - totalExpense;

  const spendingLimit = profile?.monthly_spending_limit ?? 0;
  const currentSpending = profile?.current_month_spending ?? 0;
  const percentUsed =
    spendingLimit > 0 ? Math.min(currentSpending / spendingLimit, 1) : 0;
  const remaining = spendingLimit - currentSpending;
  const overBudget = spendingLimit > 0 && currentSpending > spendingLimit;

  const fmt = (n: number) =>
    `S/ ${n.toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.safeArea}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.primary.main}
          style={{ flex: 1, justifyContent: "center" }}
        />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TransactionCard
              amount={item.amount ?? 0}
              transaction_type={
                (item.type as "income" | "expense") ?? "expense"
              }
              category={
                categories.find((c) => c.id === item.categoryId)?.name ??
                "Sin categoría"
              }
              destinatary={item.destinatary ?? "—"}
              date={
                item.created_at
                  ? new Date(item.created_at).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "short",
                    })
                  : undefined
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="cash-remove"
                size={48}
                color={Colors.neutral.gray300}
              />
              <Text style={styles.emptyText}>Sin movimientos recientes</Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 32 }} />}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              {/* Greeting */}
              <Text style={styles.greeting}>
                Bienvenido {user?.name?.split(" ")[0]}!
              </Text>
              <Text style={styles.pageTitle}>Tus finanzas</Text>

              {/* Balance card */}
              <View style={styles.balanceCard}>
                <View style={styles.balanceCardDecorCircle} />
                <View style={styles.balanceCardDecorCircle2} />

                <Text style={styles.balanceCardLabel}>Balance total</Text>
                <Text style={styles.balanceCardMonth}>{currentMonth}</Text>
                <Text style={styles.balanceCardAmount}>
                  {fmt(totalBalance)}
                </Text>

                <View style={styles.balancePillsRow}>
                  <View style={styles.balancePill}>
                    <Text style={styles.balancePillLabel}>Ingresos</Text>
                    <Text style={styles.balancePillValue}>
                      {fmt(totalIncome)}
                    </Text>
                  </View>
                  <View style={styles.balancePill}>
                    <Text style={styles.balancePillLabel}>Gastos</Text>
                    <Text style={styles.balancePillValue}>
                      -{fmt(totalExpense)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Budget progress card */}
              {spendingLimit > 0 && (
                <View style={styles.budgetCard}>
                  <View style={styles.budgetCardHeader}>
                    <Text style={styles.budgetCardTitle}>Gastos este mes</Text>
                    <Text
                      style={[
                        styles.budgetCardRemaining,
                        overBudget && { color: Colors.accent.expense },
                      ]}
                    >
                      {overBudget
                        ? "Excedido"
                        : `${Math.round((1 - percentUsed) * 100)}% restante`}
                    </Text>
                  </View>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${percentUsed * 100}%` as any,
                          backgroundColor: overBudget
                            ? Colors.accent.expense
                            : Colors.primary.main,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.budgetLabels}>
                    <Text style={styles.budgetLabelText}>
                      {fmt(currentSpending)}
                    </Text>
                    <Text style={styles.budgetLabelText}>
                      {fmt(spendingLimit)}
                    </Text>
                  </View>

                  {/* Transactions preview inside budget card */}
                  {transactions.length > 0 && (
                    <View style={styles.recentInCard}>
                      {transactions.slice(0, 2).map((item) => (
                        <TransactionCard
                          key={item.id}
                          amount={item.amount ?? 0}
                          transaction_type={
                            (item.type as "income" | "expense") ?? "expense"
                          }
                          category={
                            categories.find((c) => c.id === item.categoryId)
                              ?.name ?? "Sin categoría"
                          }
                          destinatary={item.destinatary ?? "—"}
                          date={
                            item.created_at
                              ? new Date(item.created_at).toLocaleDateString(
                                  "es-PE",
                                  { day: "2-digit", month: "short" },
                                )
                              : undefined
                          }
                          flat
                        />
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Section label */}
              {transactions.length > 0 && (
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Últimos movimientos</Text>
                </View>
              )}
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.primary.background },
  listContent: { paddingHorizontal: Spacing.xl },
  listHeader: { paddingTop: Spacing.xl },

  // ── Greeting ─────────────────────────────────────────────────────
  greeting: {
    fontSize: FontSize.base,
    color: Colors.neutral.gray500,
    marginBottom: Spacing.xs,
  },
  pageTitle: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.extrabold,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.lg,
  },

  // ── Balance card ─────────────────────────────────────────────────
  balanceCard: {
    backgroundColor: "#3282DE",
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    overflow: "hidden",
    ...Shadow.lg,
  },
  balanceCardDecorCircle: {
    position: "absolute",
    right: -50,
    top: -50,
    width: 160,
    height: 160,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  balanceCardDecorCircle2: {
    position: "absolute",
    left: -30,
    bottom: -40,
    width: 120,
    height: 120,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  balanceCardLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  balanceCardMonth: {
    color: "rgba(255,255,255,0.6)",
    fontSize: FontSize.xs,
    letterSpacing: 3,
    marginBottom: Spacing.sm,
  },
  balanceCardAmount: {
    color: Colors.neutral.white,
    fontSize: 36,
    fontWeight: FontWeight.extrabold,
    marginBottom: Spacing.lg,
  },
  balancePillsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  balancePill: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  balancePillLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: FontSize.xs,
    marginBottom: 4,
  },
  balancePillValue: {
    color: Colors.neutral.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  // ── Budget card ──────────────────────────────────────────────────
  budgetCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  budgetCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: Spacing.md,
  },
  budgetCardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral.gray900,
  },
  budgetCardRemaining: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray400,
    fontWeight: FontWeight.medium,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.neutral.gray100,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  budgetLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  budgetLabelText: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray400,
  },
  recentInCard: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray100,
    paddingTop: Spacing.md,
    gap: Spacing.xs,
  },

  // ── Section label ─────────────────────────────────────────────────
  sectionRow: {
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral.gray900,
  },

  // ── Empty ────────────────────────────────────────────────────────
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xxxl * 2,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral.gray500,
  },
});
