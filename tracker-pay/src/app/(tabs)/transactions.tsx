// app/(protected)/transactions.tsx
import TransactionCard from "@/components/transaction/TransactionCard";
import { TransactionFormModal } from "@/components/transaction/TransactionFormModal";

import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from "@/constants/theme";
import { useModal } from "@/hooks/useModal";
import { Database } from "@/services/db/schema";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/stores/supabase";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type Category = Database["public"]["Tables"]["category"]["Row"];

export default function TransactionsScreen() {
  const { user } = useAuthStore();
  const { openModal } = useModal();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    const [txRes, catRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("userId", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("category").select("*").eq("userId", user.id),
    ]);

    if (txRes.data) setTransactions(txRes.data);
    if (catRes.data) setCategories(catRes.data);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  const openCreate = () => {
    openModal(
      <TransactionFormModal
        categories={categories}
        onSaveSuccess={fetchData}
      />,
      { type: "fullscreen" },
    );
  };

  const openEdit = (transaction: Transaction) => {
    openModal(
      <TransactionFormModal
        transaction={transaction}
        categories={categories}
        onSaveSuccess={fetchData}
      />,
      { type: "fullscreen" },
    );
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      `Eliminar "${name}"`,
      "¿Estás seguro? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("transactions")
              .delete()
              .eq("id", id);
            if (error) Alert.alert("Error", error.message);
            else fetchData();
          },
        },
      ],
    );
  };

  // ─── Totals ───────────────────────────────────────────────────────────────
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const totalBalance = totalIncome - totalExpense;

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
          renderItem={({ item }) => (
            <TouchableOpacity
              onLongPress={() =>
                Alert.alert("Opciones", item.destinatary ?? "", [
                  { text: "Editar", onPress: () => openEdit(item) },
                  {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () =>
                      handleDelete(item.id, item.destinatary ?? ""),
                  },
                  { text: "Cancelar", style: "cancel" },
                ])
              }
              activeOpacity={0.8}
            >
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
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="cash-remove"
                size={56}
                color={Colors.neutral.gray300}
              />
              <Text style={styles.emptyText}>Sin transacciones aún</Text>
              <Text style={styles.emptySubtext}>Toca + para registrar una</Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.pageTitle}>Transacciones</Text>

              {/* Balance card */}
              <View style={styles.balanceCard}>
                <View style={styles.balanceCardDecorCircle} />
                <View style={styles.balanceCardIcon}>
                  <MaterialCommunityIcons
                    name="credit-card-outline"
                    size={22}
                    color="#fff"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.balanceLabel}>Balance total</Text>
                  <Text style={styles.balanceAmount}>{fmt(totalBalance)}</Text>
                </View>
              </View>

              {/* Section label */}
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Últimas transacciones</Text>
                <Text style={styles.sectionCount}>
                  {transactions.length} movimientos
                </Text>
              </View>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openCreate}
        activeOpacity={0.85}
      >
        <AntDesign name="plus" size={26} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.primary.background },
  listContent: { paddingHorizontal: Spacing.xl },
  listHeader: { paddingTop: Spacing.xl, paddingBottom: Spacing.sm },

  // ── Page title ──────────────────────────────────────────────────
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
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
    overflow: "hidden",
    ...Shadow.lg,
  },
  balanceCardDecorCircle: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 130,
    height: 130,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  balanceCardIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: FontSize.sm,
    marginBottom: 4,
  },
  balanceAmount: {
    color: Colors.neutral.white,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
  },

  // ── Summary row ──────────────────────────────────────────────────
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    ...Shadow.md,
  },
  summaryIconBg: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryCardLabel: {
    fontSize: FontSize.xs,
    color: Colors.neutral.gray500,
    marginBottom: 2,
  },
  summaryCardValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  // ── Section header ───────────────────────────────────────────────
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral.gray900,
  },
  sectionCount: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray400,
  },

  // ── Empty ────────────────────────────────────────────────────────
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xxxl * 2,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral.gray500,
  },
  emptySubtext: { fontSize: FontSize.md, color: Colors.neutral.gray400 },

  // ── FAB ──────────────────────────────────────────────────────────
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary.main,
    justifyContent: "center",
    alignItems: "center",
    ...Shadow.lg,
  },
});
