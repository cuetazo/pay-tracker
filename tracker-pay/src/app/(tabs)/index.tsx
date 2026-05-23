// app/(protected)/profile.tsx
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from "@/constants/theme";
import { Database } from "@/services/db/schema";
import { useAuthStore } from "@/utils/authStore";
import { supabase } from "@/utils/supabase";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Profile = {
  monthly_income: number;
  monthly_spending_limit: number;
  current_month_spending: number;
  onboarding_completed: boolean;
};

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type Category = Database["public"]["Tables"]["category"]["Row"];

const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

export default function HomeScreen() {
  const { user, SignOut } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }

  return (
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
  );
}

const styles = StyleSheet.create({
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
    marginBottom: Spacing.md,
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
    height: 10,
    backgroundColor: Colors.neutral.gray100,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
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
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
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