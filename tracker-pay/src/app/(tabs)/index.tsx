// app/(protected)/index.tsx  (Home)
import TransactionCard from "@/components/transaction/TransactionCard";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  getColors,
  Shadow,
  Spacing,
} from "@/constants/theme";
import { useThemeStore } from "@/stores/themeStore";
import { Database } from "@/services/db/schema";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/stores/supabase";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as d3 from "d3";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { G, Line, Path, Rect, Svg, Text as SvgText } from "react-native-svg";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type Category = Database["public"]["Tables"]["category"]["Row"];
type Profile = {
  monthly_income: number;
  monthly_spending_limit: number;
  current_month_spending: number;
};

const MONTH_NAMES = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
];

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_WIDTH = SCREEN_WIDTH - Spacing.xl * 4;
const CHART_HEIGHT = 180;
const DONUT_SIZE = 160;

// ─── Donut chart ──────────────────────────────────────────────────────────────
function DonutChart({
  data,
  colors: chartColors,
}: {
  data: { label: string; value: number }[];
  colors: string[];
}) {
  const r = DONUT_SIZE / 2;
  const innerR = r * 0.58;
  const total = data.reduce((s, d) => s + d.value, 0);
  const pie = d3.pie<{ label: string; value: number }>().value((d) => d.value)(data);
  const arc = d3.arc<d3.PieArcDatum<{ label: string; value: number }>>()
    .innerRadius(innerR)
    .outerRadius(r);

  return (
    <Svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}>
      <G x={r} y={r}>
        {pie.map((slice, i) => (
          <Path key={i} d={arc(slice) ?? ""} fill={chartColors[i % chartColors.length]} />
        ))}
        <SvgText x={0} y={-6} textAnchor="middle" fill="#fff" fontSize={10} opacity={0.7}>
          Total
        </SvgText>
        <SvgText x={0} y={10} textAnchor="middle" fill="#fff" fontSize={13} fontWeight="bold">
          {total.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
        </SvgText>
      </G>
    </Svg>
  );
}

// ─── Bar chart ────────────────────────────────────────────────────────────────
function BarChart({
  income,
  expense,
}: {
  income: { day: string; value: number }[];
  expense: { day: string; value: number }[];
}) {
  const paddingLeft = 36;
  const paddingBottom = 24;
  const w = CHART_WIDTH - paddingLeft;
  const h = CHART_HEIGHT - paddingBottom;
  const allValues = [...income.map((d) => d.value), ...expense.map((d) => d.value)];
  const maxVal = Math.max(...allValues, 1);
  const xScale = d3.scaleBand().domain(income.map((d) => d.day)).range([0, w]).padding(0.3);
  const yScale = d3.scaleLinear().domain([0, maxVal]).range([h, 0]).nice();
  const barW = (xScale.bandwidth() / 2) * 0.85;
  const yTicks = yScale.ticks(4);

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      <G x={paddingLeft} y={0}>
        {yTicks.map((tick, i) => (
          <G key={i}>
            <Line x1={0} y1={yScale(tick)} x2={w} y2={yScale(tick)} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
            <SvgText x={-4} y={yScale(tick) + 4} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize={9}>
              {tick >= 1000 ? `${(tick / 1000).toFixed(0)}k` : tick}
            </SvgText>
          </G>
        ))}
        {income.map((d, i) => {
          const x = xScale(d.day) ?? 0;
          const expVal = expense[i]?.value ?? 0;
          const incH = h - yScale(d.value);
          const expH = h - yScale(expVal);
          return (
            <G key={d.day}>
              <Rect x={x} y={yScale(d.value)} width={barW} height={incH} fill="#4ADE80" rx={3} opacity={0.85} />
              <Rect x={x + barW + 2} y={yScale(expVal)} width={barW} height={expH} fill="#F87171" rx={3} opacity={0.85} />
              <SvgText x={x + barW} y={h + 14} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={9}>
                {d.day}
              </SvgText>
            </G>
          );
        })}
      </G>
    </Svg>
  );
}

// ─── Line chart ───────────────────────────────────────────────────────────────
function LineChart({ data }: { data: { day: string; value: number }[] }) {
  const paddingLeft = 40;
  const paddingBottom = 24;
  const w = CHART_WIDTH - paddingLeft;
  const h = CHART_HEIGHT - paddingBottom;
  if (data.length < 2) return null;
  const xScale = d3.scalePoint().domain(data.map((d) => d.day)).range([0, w]);
  const minVal = Math.min(...data.map((d) => d.value));
  const maxVal = Math.max(...data.map((d) => d.value));
  const yScale = d3.scaleLinear()
    .domain([minVal < 0 ? minVal * 1.1 : minVal * 0.9, maxVal * 1.1])
    .range([h, 0])
    .nice();
  const lineGen = d3.line<{ day: string; value: number }>()
    .x((d) => xScale(d.day) ?? 0)
    .y((d) => yScale(d.value))
    .curve(d3.curveMonotoneX);
  const pathD = lineGen(data) ?? "";
  const yTicks = yScale.ticks(4);

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      <G x={paddingLeft} y={0}>
        {yTicks.map((tick, i) => (
          <G key={i}>
            <Line x1={0} y1={yScale(tick)} x2={w} y2={yScale(tick)} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
            <SvgText x={-4} y={yScale(tick) + 4} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize={9}>
              {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick.toFixed(0)}
            </SvgText>
          </G>
        ))}
        <Path d={pathD} fill="none" stroke="#60A5FA" strokeWidth={2.5} />
        {data
          .filter((_, i) => i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 4) === 0)
          .map((d) => (
            <G key={d.day}>
              <Rect x={(xScale(d.day) ?? 0) - 4} y={yScale(d.value) - 4} width={8} height={8} rx={4} fill="#60A5FA" />
              <SvgText x={xScale(d.day) ?? 0} y={h + 14} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={9}>
                {d.day}
              </SvgText>
            </G>
          ))}
      </G>
    </Svg>
  );
}

// ─── Charts Modal ─────────────────────────────────────────────────────────────
function ChartsModal({
  visible,
  onClose,
  transactions,
  categories,
  totalIncome,
  totalExpense,
  salary,
  fmt,
}: {
  visible: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: Category[];
  totalIncome: number;
  totalExpense: number;
  salary: number;
  fmt: (n: number) => string;
}) {
  const CHART_COLORS = ["#60A5FA", "#4ADE80", "#F87171", "#FBBF24", "#A78BFA", "#34D399"];

  const expenseByCategory = categories
    .map((cat) => ({
      label: cat.name ?? "Sin nombre",
      value: transactions
        .filter((t) => t.type === "expense" && t.categoryId === cat.id)
        .reduce((s, t) => s + (t.amount ?? 0), 0),
    }))
    .filter((d) => d.value > 0);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const incomeByDay = last7Days.map((date) => ({
    day: `${date.getDate()}/${date.getMonth() + 1}`,
    value: transactions
      .filter((t) => {
        if (!t.created_at || t.type !== "income") return false;
        return new Date(t.created_at).toDateString() === date.toDateString();
      })
      .reduce((s, t) => s + (t.amount ?? 0), 0),
  }));

  const expenseByDay = last7Days.map((date) => ({
    day: `${date.getDate()}/${date.getMonth() + 1}`,
    value: transactions
      .filter((t) => {
        if (!t.created_at || t.type !== "expense") return false;
        return new Date(t.created_at).toDateString() === date.toDateString();
      })
      .reduce((s, t) => s + (t.amount ?? 0), 0),
  }));

  let running = salary;
  const balanceByDay = last7Days.map((date) => {
    const dayInc = transactions
      .filter((t) => t.created_at && t.type === "income" && new Date(t.created_at).toDateString() === date.toDateString())
      .reduce((s, t) => s + (t.amount ?? 0), 0);
    const dayExp = transactions
      .filter((t) => t.created_at && t.type === "expense" && new Date(t.created_at).toDateString() === date.toDateString())
      .reduce((s, t) => s + (t.amount ?? 0), 0);
    running += dayInc - dayExp;
    return { day: `${date.getDate()}/${date.getMonth() + 1}`, value: running };
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[modalStyles.container, { backgroundColor: "#0F172A" }]}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>Análisis</Text>
          <Pressable onPress={onClose} style={modalStyles.closeBtn}>
            <MaterialCommunityIcons name="close" size={22} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={modalStyles.scroll}>
          <View style={modalStyles.summaryRow}>
            <View style={[modalStyles.summaryPill, { backgroundColor: "rgba(74,222,128,0.15)" }]}>
              <Text style={[modalStyles.pillLabel, { color: "#4ADE80" }]}>Ingresos</Text>
              <Text style={[modalStyles.pillValue, { color: "#4ADE80" }]}>{fmt(totalIncome)}</Text>
            </View>
            <View style={[modalStyles.summaryPill, { backgroundColor: "rgba(248,113,113,0.15)" }]}>
              <Text style={[modalStyles.pillLabel, { color: "#F87171" }]}>Gastos</Text>
              <Text style={[modalStyles.pillValue, { color: "#F87171" }]}>{fmt(totalExpense)}</Text>
            </View>
          </View>

          <View style={modalStyles.section}>
            <Text style={modalStyles.sectionTitle}>Últimos 7 días</Text>
            <View style={modalStyles.legend}>
              <View style={modalStyles.legendItem}>
                <View style={[modalStyles.legendDot, { backgroundColor: "#4ADE80" }]} />
                <Text style={modalStyles.legendText}>Ingresos</Text>
              </View>
              <View style={modalStyles.legendItem}>
                <View style={[modalStyles.legendDot, { backgroundColor: "#F87171" }]} />
                <Text style={modalStyles.legendText}>Gastos</Text>
              </View>
            </View>
            <BarChart income={incomeByDay} expense={expenseByDay} />
          </View>

          <View style={modalStyles.section}>
            <Text style={modalStyles.sectionTitle}>Balance acumulado</Text>
            <LineChart data={balanceByDay} />
          </View>

          {expenseByCategory.length > 0 && (
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionTitle}>Gastos por categoría</Text>
              <View style={modalStyles.donutRow}>
                <DonutChart data={expenseByCategory} colors={CHART_COLORS} />
                <View style={modalStyles.donutLegend}>
                  {expenseByCategory.map((d, i) => (
                    <View key={d.label} style={modalStyles.donutLegendItem}>
                      <View style={[modalStyles.legendDot, { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }]} />
                      <View>
                        <Text style={modalStyles.donutLegendLabel} numberOfLines={1}>{d.label}</Text>
                        <Text style={modalStyles.donutLegendValue}>{fmt(d.value)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { user } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const c = getColors(isDarkMode);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartsVisible, setChartsVisible] = useState(false);

  const currentMonth = MONTH_NAMES[new Date().getMonth()];

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
        .select("monthly_income, monthly_spending_limit, current_month_spending, salary")
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  const percentUsed = spendingLimit > 0 ? Math.min(currentSpending / spendingLimit, 1) : 0;
  const overBudget = spendingLimit > 0 && currentSpending > spendingLimit;

  const fmt = (n: number) =>
    `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const cardBg = isDarkMode ? "#1E293B" : Colors.neutral.white;

  return (
    <View style={[styles.safeArea, { backgroundColor: c.primary.background }]}>
      {loading ? (
        <ActivityIndicator size="large" color={c.primary.main} style={{ flex: 1, justifyContent: "center" }} />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <TransactionCard
              amount={item.amount ?? 0}
              transaction_type={(item.type as "income" | "expense") ?? "expense"}
              category={categories.find((cat) => cat.id === item.categoryId)?.name ?? "Sin categoría"}
              destinatary={item.destinatary ?? "—"}
              date={
                item.created_at
                  ? new Date(item.created_at).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })
                  : undefined
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="cash-remove" size={48} color={c.neutral.gray300} />
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
                <Text style={styles.balanceCardAmount}>{fmt(totalBalance)}</Text>

                <View style={styles.balancePillsRow}>
                  <View style={styles.balancePill}>
                    <Text style={styles.balancePillLabel}>Ingresos</Text>
                    <Text style={styles.balancePillValue}>{fmt(totalIncome)}</Text>
                  </View>
                  <View style={styles.balancePill}>
                    <Text style={styles.balancePillLabel}>Gastos</Text>
                    <Text style={styles.balancePillValue}>-{fmt(totalExpense)}</Text>
                  </View>
                </View>

                {/* Charts button */}
                <Pressable onPress={() => setChartsVisible(true)} style={styles.chartsBtn}>
                  <MaterialCommunityIcons name="chart-bar" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.chartsBtnText}>Ver análisis</Text>
                </Pressable>
              </View>

              {/* Budget progress card */}
              {spendingLimit > 0 && (
                <View style={[styles.budgetCard, { backgroundColor: cardBg }]}>
                  <View style={styles.budgetCardHeader}>
                    <Text style={[styles.budgetCardTitle, { color: c.neutral.gray900 }]}>
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

                  <View style={[styles.progressTrack, { backgroundColor: c.neutral.gray100 }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${percentUsed * 100}%` as any,
                          backgroundColor: overBudget ? c.accent.expense : c.primary.main,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.budgetLabels}>
                    <Text style={[styles.budgetLabelText, { color: c.neutral.gray400 }]}>
                      {fmt(currentSpending)}
                    </Text>
                    <Text style={[styles.budgetLabelText, { color: c.neutral.gray400 }]}>
                      {fmt(spendingLimit)}
                    </Text>
                  </View>

                  {transactions.length > 0 && (
                    <View style={[styles.recentInCard, { borderTopColor: c.neutral.gray100 }]}>
                      {transactions.slice(0, 2).map((item) => (
                        <TransactionCard
                          key={item.id}
                          amount={item.amount ?? 0}
                          transaction_type={(item.type as "income" | "expense") ?? "expense"}
                          category={categories.find((cat) => cat.id === item.categoryId)?.name ?? "Sin categoría"}
                          destinatary={item.destinatary ?? "—"}
                          date={
                            item.created_at
                              ? new Date(item.created_at).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })
                              : undefined
                          }
                          flat
                        />
                      ))}
                    </View>
                  )}
                </View>
              )}

              {transactions.length > 0 && (
                <View style={styles.sectionRow}>
                  <Text style={[styles.sectionTitle, { color: c.neutral.gray900 }]}>
                    Últimos movimientos
                  </Text>
                </View>
              )}
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <ChartsModal
        visible={chartsVisible}
        onClose={() => setChartsVisible(false)}
        transactions={transactions}
        categories={categories}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        salary={salary}
        fmt={fmt}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.xl },
  listHeader: { paddingTop: Spacing.xl },

  greeting: { fontSize: FontSize.base, marginBottom: Spacing.xs },
  pageTitle: { fontSize: FontSize.display, fontWeight: FontWeight.extrabold, marginBottom: Spacing.lg },

  balanceCard: {
    backgroundColor: "#3282DE",
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    overflow: "hidden",
    ...Shadow.lg,
  },
  balanceCardDecorCircle: {
    position: "absolute", right: -50, top: -50,
    width: 160, height: 160, borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  balanceCardDecorCircle2: {
    position: "absolute", left: -30, bottom: -40,
    width: 120, height: 120, borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  balanceCardLabel: { color: "rgba(255,255,255,0.75)", fontSize: FontSize.sm, marginBottom: Spacing.xs },
  balanceCardMonth: { color: "rgba(255,255,255,0.6)", fontSize: FontSize.xs, letterSpacing: 3, marginBottom: Spacing.sm },
  balanceCardAmount: { color: Colors.neutral.white, fontSize: 36, fontWeight: FontWeight.extrabold, marginBottom: Spacing.lg },
  balancePillsRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.md },
  balancePill: { flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: BorderRadius.md, padding: Spacing.md },
  balancePillLabel: { color: "rgba(255,255,255,0.7)", fontSize: FontSize.xs, marginBottom: 4 },
  balancePillValue: { color: Colors.neutral.white, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  chartsBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)", borderRadius: BorderRadius.md,
    paddingVertical: 8, paddingHorizontal: Spacing.md,
  },
  chartsBtnText: { color: "rgba(255,255,255,0.9)", fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  budgetCard: { borderRadius: BorderRadius.xl, padding: Spacing.xl, marginBottom: Spacing.md, ...Shadow.md },
  budgetCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: Spacing.md },
  budgetCardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  budgetCardRemaining: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  progressTrack: { height: 8, borderRadius: BorderRadius.full, overflow: "hidden", marginBottom: Spacing.xs },
  progressFill: { height: "100%", borderRadius: BorderRadius.full },
  budgetLabels: { flexDirection: "row", justifyContent: "space-between", marginBottom: Spacing.lg },
  budgetLabelText: { fontSize: FontSize.sm },
  recentInCard: { borderTopWidth: 1, paddingTop: Spacing.md, gap: Spacing.xs },

  sectionRow: { marginBottom: Spacing.md, marginTop: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },

  emptyState: { alignItems: "center", paddingVertical: Spacing.xxxl * 2, gap: Spacing.sm },
  emptyText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});

const modalStyles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)",
  },
  title: { color: "#fff", fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  closeBtn: { padding: 6, borderRadius: BorderRadius.md, backgroundColor: "rgba(255,255,255,0.1)" },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  summaryRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.xl },
  summaryPill: { flex: 1, borderRadius: BorderRadius.lg, padding: Spacing.md },
  pillLabel: { fontSize: FontSize.xs, marginBottom: 4 },
  pillValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    color: "rgba(255,255,255,0.75)", fontSize: FontSize.sm, fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md, textTransform: "uppercase", letterSpacing: 1,
  },
  legend: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.sm },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: "rgba(255,255,255,0.5)", fontSize: FontSize.xs },
  donutRow: { flexDirection: "row", alignItems: "center", gap: Spacing.lg },
  donutLegend: { flex: 1, gap: Spacing.sm },
  donutLegendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  donutLegendLabel: { color: "rgba(255,255,255,0.7)", fontSize: FontSize.xs },
  donutLegendValue: { color: "rgba(255,255,255,0.45)", fontSize: 10 },
});