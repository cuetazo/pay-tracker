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
<<<<<<< HEAD
import { Database } from "@/services/db/schema";
import { useAuthStore } from "@/utils/authStore";
import { supabase } from "@/utils/supabase";
=======
import { useAppColors } from "@/hooks/useAppColors";
import { Database } from "@/services/db/schema";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/stores/supabase";
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
<<<<<<< HEAD
  ScrollView,
=======
  RefreshControl,
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
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

<<<<<<< HEAD
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type Category = Database["public"]["Tables"]["category"]["Row"];

const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

export default function HomeScreen() {
  const { user, SignOut } = useAuthStore();
=======
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
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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

<<<<<<< HEAD
  const currentMonth = MONTH_NAMES[new Date().getMonth()].toUpperCase();

  const fetchAll = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    const [profRes, txRes, catRes] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "monthly_income, monthly_spending_limit, current_month_spending, onboarding_completed",
        )
        .eq("id", user.id)
        .single(),
      supabase
        .from("transactions")
        .select("*")
        .eq("userId", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("category").select("*").eq("userId", user.id),
    ]);

    if (profRes.data) setProfile(profRes.data);
    if (txRes.data) setTransactions(txRes.data);
    if (catRes.data) setCategories(catRes.data);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fmt = (n: number) =>
    `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + (t.amount ?? 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + (t.amount ?? 0), 0);

  const spent = profile?.current_month_spending ?? 0;
  const limit = profile?.monthly_spending_limit ?? 0;
  const percentUsed = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const remaining = limit - spent;
=======
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

  const salary = (profile?.monthly_income ?? 0) as number;
  const totalBalance = salary + totalIncome - totalExpense;

  const spendingLimit = profile?.monthly_spending_limit ?? 0;
  const currentSpending = profile?.current_month_spending ?? 0;
  const percentUsed =
    spendingLimit > 0 ? Math.min(currentSpending / spendingLimit, 1) : 0;
  const remaining = spendingLimit - currentSpending;
  const overBudget = spendingLimit > 0 && currentSpending > spendingLimit;
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76

  const fmt = (n: number) =>
    `S/ ${n.toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
<<<<<<< HEAD
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ListFooterComponent={<View style={{ height: 32 }} />}
      renderItem={({ item }) => {
        const isIncome = item.type === "income";
        const cat = categories.find((c) => c.id === item.categoryId);
        const iconColor = isIncome ? Colors.accent.income : Colors.accent.expense;
        const iconBg = iconColor + "22";

        return (
          <View style={styles.txCard}>
            <View style={[styles.txIconBg, { backgroundColor: iconBg }]}>
              <MaterialCommunityIcons
                name={isIncome ? "arrow-down-left" : "arrow-up-right"}
                size={22}
                color={iconColor}
              />
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txName} numberOfLines={1}>
                {item.destinatary ?? "—"}
              </Text>
              <Text style={styles.txMeta}>
                {cat?.name ?? "Sin categoría"}
              </Text>
            </View>
            <Text style={[styles.txAmount, { color: iconColor }]}>
              {isIncome ? "+" : "-"} {fmt(item.amount ?? 0)}
            </Text>
          </View>
        );
      }}
      ListEmptyComponent={
        <View style={styles.emptyTx}>
          <MaterialCommunityIcons
            name="cash-remove"
            size={36}
            color={Colors.neutral.gray300}
          />
          <Text style={styles.emptyTxText}>Sin transacciones aún</Text>
        </View>
      }
      ListHeaderComponent={
        <View>
          {/* ── Greeting ─────────────────────────────────────── */}
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greetingSub}>
                Bienvenido {user?.name?.split(" ")[0]}!
              </Text>
              <Text style={styles.greetingTitle}>Tus finanzas</Text>
            </View>
            <TouchableOpacity style={styles.avatarBtn} onPress={SignOut}>
              <MaterialCommunityIcons
                name="account"
                size={26}
                color={Colors.primary.main}
              />
            </TouchableOpacity>
          </View>

          {/* ── Balance card ──────────────────────────────────── */}
          <View style={styles.balanceCard}>
            {/* decorative circles */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            <View style={styles.balanceCardTop}>
              <Text style={styles.balanceCardTopLabel}>Balance total</Text>
              <View style={styles.badgePct}>
                <MaterialCommunityIcons
                  name="trending-up"
                  size={12}
                  color={Colors.neutral.white}
                />
                <Text style={styles.badgePctText}>+ 12%</Text>
              </View>
            </View>

            <Text style={styles.balanceMonth}>{currentMonth}</Text>
            <Text style={styles.balanceAmount}>
              {fmt(profile?.monthly_income ?? 0)}
            </Text>

            <View style={styles.balanceSubRow}>
              <View style={styles.balanceSubCard}>
                <Text style={styles.balanceSubLabel}>Ingresos</Text>
                <Text style={styles.balanceSubValue}>{fmt(totalIncome)}</Text>
              </View>
              <View style={styles.balanceSubDivider} />
              <View style={styles.balanceSubCard}>
                <Text style={styles.balanceSubLabel}>Gastos</Text>
                <Text style={[styles.balanceSubValue, { color: Colors.accent.expense }]}>
                  -{fmt(totalExpense)}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Spending progress ─────────────────────────────── */}
          <View style={styles.progressCard}>
            <View style={styles.progressCardHeader}>
              <Text style={styles.progressCardTitle}>Gastos este mes</Text>
              <Text style={styles.progressCardRemaining}>
                {Math.round(100 - percentUsed)}% restante
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${percentUsed}%` as any,
                    backgroundColor:
                      percentUsed >= 90
                        ? Colors.accent.expense
                        : Colors.primary.main,
                  },
                ]}
              />
            </View>

            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelText}>{fmt(spent)}</Text>
              <Text style={styles.progressLabelText}>{fmt(limit)}</Text>
            </View>
          </View>

          {/* ── Recent section label ──────────────────────────── */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Recientes</Text>
          </View>
        </View>
      }
    />
=======
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
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: Spacing.xl },

  // ── Greeting ──────────────────────────────────────────────────────
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  greetingSub: {
    fontSize: FontSize.md,
    color: Colors.neutral.gray500,
    marginBottom: 2,
  },
  greetingTitle: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.extrabold,
    color: Colors.neutral.gray900,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary.soft,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Balance card ──────────────────────────────────────────────────
  balanceCard: {
    backgroundColor:"#3282DE",
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    overflow: "hidden",
    ...Shadow.lg,
  },

  balanceCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  balanceCardTopLabel: {
    fontSize: FontSize.md,
    color: "rgba(255,255,255,0.8)",
  },
  badgePct: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgePctText: {
    fontSize: FontSize.xs,
    color: Colors.neutral.white,
    fontWeight: FontWeight.semibold,
  },
  balanceMonth: {
    fontSize: FontSize.sm,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 4,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: FontWeight.extrabold,
    color: Colors.neutral.white,
    marginBottom: Spacing.lg,
  },
  balanceSubRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  balanceSubCard: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  balanceSubDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  balanceSubLabel: {
    fontSize: FontSize.xs,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 2,
  },
  balanceSubValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.neutral.white,
  },

  // ── Progress card ─────────────────────────────────────────────────
  progressCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  progressCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
=======
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
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
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
  progressCardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral.gray900,
  },
  progressCardRemaining: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray400,
  },
  progressTrack: {
<<<<<<< HEAD
    height: 10,
    backgroundColor: Colors.neutral.gray100,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    marginBottom: Spacing.sm,
=======
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    marginBottom: Spacing.xs,
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
  },
  progressFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
<<<<<<< HEAD
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabelText: {
    fontSize: FontSize.xs,
    color: Colors.neutral.gray400,
  },

  // ── Section ───────────────────────────────────────────────────────
  sectionRow: {
    marginBottom: Spacing.md,
=======
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
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
<<<<<<< HEAD
    color: Colors.neutral.gray900,
  },

  // ── Transaction row ───────────────────────────────────────────────
  txCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.md,
  },
  txIconBg: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  txInfo: { flex: 1 },
  txName: {
=======
  },

  // ── Empty ────────────────────────────────────────────────────────
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xxxl * 2,
    gap: Spacing.sm,
  },
  emptyText: {
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral.gray900,
  },
  txMeta: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray400,
    marginTop: 2,
  },
  txAmount: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  emptyTx: {
    alignItems: "center",
    paddingVertical: Spacing.xxxl,
    gap: Spacing.sm,
  },
  emptyTxText: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray400,
  },
});