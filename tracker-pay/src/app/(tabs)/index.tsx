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
import { useAppColors } from "@/hooks/useAppColors";
import { Database } from "@/services/db/schema";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/stores/supabase";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
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
  const c = useAppColors();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
          "monthly_income, monthly_spending_limit, current_month_spending, salary",
        )
        .eq("id", user.id)
        .single(),
    ]);

    if (txRes.data) setTransactions(txRes.data);
    if (catRes.data) setCategories(catRes.data);
    if (profileRes.data) setProfile(profileRes.data);
    setLoading(false);
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // ─── Derived values ───────────────────────────────────────────────────────
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const salary = (profile?.monthly_income ?? 0) as number;
  const totalBalance = salary + totalIncome - totalExpense;

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
    <View style={[styles.safeArea, { backgroundColor: c.primary.background }]}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={c.primary.main}
          style={{ flex: 1, justifyContent: "center" }}
        />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TransactionCard
              amount={item.amount ?? 0}
              transaction_type={
                (item.type as "income" | "expense") ?? "expense"
              }
              category={
                categories.find((cat) => cat.id === item.categoryId)?.name ??
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
                color={c.neutral.gray300}
              />
              <Text style={[styles.emptyText, { color: c.neutral.gray500 }]}>
                Sin movimientos recientes
              </Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 32 }} />}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              {/* Greeting */}
              <Text style={[styles.greeting, { color: c.neutral.gray500 }]}>
                Bienvenido {user?.name?.split(" ")[0]}!
              </Text>
              <Text style={[styles.pageTitle, { color: c.neutral.gray900 }]}>
                Tus finanzas
              </Text>

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
                <View
                  style={[
                    styles.budgetCard,
                    {
                      backgroundColor:
                        c.neutral.white === "#0F172A"
                          ? "#1E293B"
                          : Colors.neutral.white,
                    },
                  ]}
                >
                  <View style={styles.budgetCardHeader}>
                    <Text
                      style={[
                        styles.budgetCardTitle,
                        { color: c.neutral.gray900 },
                      ]}
                    >
                      Gastos este mes
                    </Text>
                    <Text
                      style={[
                        styles.budgetCardRemaining,
                        { color: c.neutral.gray400 },
                        overBudget && { color: c.accent.expense },
                      ]}
                    >
                      {overBudget
                        ? "Excedido"
                        : `${Math.round((1 - percentUsed) * 100)}% restante`}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.progressTrack,
                      { backgroundColor: c.neutral.gray100 },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${percentUsed * 100}%` as any,
                          backgroundColor: overBudget
                            ? c.accent.expense
                            : c.primary.main,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.budgetLabels}>
                    <Text
                      style={[
                        styles.budgetLabelText,
                        { color: c.neutral.gray400 },
                      ]}
                    >
                      {fmt(currentSpending)}
                    </Text>
                    <Text
                      style={[
                        styles.budgetLabelText,
                        { color: c.neutral.gray400 },
                      ]}
                    >
                      {fmt(spendingLimit)}
                    </Text>
                  </View>

                  {/* Transactions preview inside budget card */}
                  {transactions.length > 0 && (
                    <View
                      style={[
                        styles.recentInCard,
                        { borderTopColor: c.neutral.gray100 },
                      ]}
                    >
                      {transactions.slice(0, 2).map((item) => (
                        <TransactionCard
                          key={item.id}
                          amount={item.amount ?? 0}
                          transaction_type={
                            (item.type as "income" | "expense") ?? "expense"
                          }
                          category={
                            categories.find(
                              (cat) => cat.id === item.categoryId,
                            )?.name ?? "Sin categoría"
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
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: c.neutral.gray900 },
                    ]}
                  >
                    Últimos movimientos
                  </Text>
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
  safeArea: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.xl },
  listHeader: { paddingTop: Spacing.xl },

  // ── Greeting ─────────────────────────────────────────────────────
  greeting: {
    fontSize: FontSize.base,
    marginBottom: Spacing.xs,
  },
  pageTitle: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.extrabold,
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
  },
  budgetCardRemaining: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  progressTrack: {
    height: 8,
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
  },
  recentInCard: {
    borderTopWidth: 1,
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
  },
});
