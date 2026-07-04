import TransactionCard from "@/components/transaction/TransactionCard";
import { TransactionFormModal } from "@/components/TransactionFormModal";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from "@/constants/theme";
import { useAppColors } from "@/hooks/useAppColors";
import { useModal } from "@/hooks/useModal";
import { Database } from "@/services/db/schema";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/stores/supabase";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type Category = Database["public"]["Tables"]["category"]["Row"];

const PAGE_SIZE = 10;

export default function TransactionsScreen() {
  const { user } = useAuthStore();
  const { openModal } = useModal();
  const c = useAppColors();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { closeModal } = useModal();

  // ─── Search & expand state ─────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset expansion whenever the search changes, so results start collapsed again
  useEffect(() => {
    setShowAll(false);
  }, [searchQuery]);

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  const openCreate = () => {
    openModal(
      <TransactionFormModal
        categories={categories}
        onSaveSuccess={() => {
          closeModal();
          fetchData();
        }}
        onClose={closeModal}
      />,
      { type: "fullscreen" },
    );
  };

  const openEdit = (transaction: Transaction) => {
    openModal(
      <TransactionFormModal
        transaction={transaction}
        categories={categories}
        onSaveSuccess={() => {
          closeModal();
          fetchData();
        }}
        onClose={closeModal}
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

  // ─── Totals (siempre sobre el total real, no el filtrado) ─────────────────
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthTx = transactions.filter((t) => {
    const d = t.created_at ? new Date(t.created_at) : null;
    return (
      d && d.getMonth() === currentMonth && d.getFullYear() === currentYear
    );
  });

  const totalIncome = thisMonthTx
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const totalExpense = thisMonthTx
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const totalBalance = transactions.reduce(
    (sum, t) =>
      t.type === "income" ? sum + (t.amount ?? 0) : sum - (t.amount ?? 0),
    0,
  );

  const fmt = (n: number) =>
    `S/ ${Math.abs(n).toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // ─── Filtro de búsqueda ─────────────────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return transactions;

    return transactions.filter((t) => {
      const categoryName =
        categories.find((cat) => cat.id === t.categoryId)?.name ?? "";
      const typeLabel = t.type === "income" ? "ingreso" : "gasto";

      return (
        (t.destinatary ?? "").toLowerCase().includes(q) ||
        categoryName.toLowerCase().includes(q) ||
        typeLabel.includes(q)
      );
    });
  }, [transactions, categories, searchQuery]);

  const visibleTransactions = showAll
    ? filteredTransactions
    : filteredTransactions.slice(0, PAGE_SIZE);

  const hasMore = !showAll && filteredTransactions.length > PAGE_SIZE;

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
          data={visibleTransactions}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name={searchQuery ? "text-box-search-outline" : "cash-remove"}
                size={56}
                color={c.neutral.gray300}
              />
              <Text style={[styles.emptyText, { color: c.neutral.gray500 }]}>
                {searchQuery
                  ? "Sin resultados para tu búsqueda"
                  : "Sin transacciones aún"}
              </Text>
              <Text style={[styles.emptySubtext, { color: c.neutral.gray400 }]}>
                {searchQuery
                  ? "Prueba con otro nombre, categoría o tipo"
                  : "Toca + para registrar una"}
              </Text>
            </View>
          }
          ListFooterComponent={
            <View>
              {hasMore && (
                <TouchableOpacity
                  style={[
                    styles.seeMoreButton,
                    { backgroundColor: c.neutral.white },
                  ]}
                  onPress={() => setShowAll(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.seeMoreText, { color: c.primary.main }]}>
                    Ver más ({filteredTransactions.length - PAGE_SIZE} más)
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={20}
                    color={c.primary.main}
                  />
                </TouchableOpacity>
              )}
              <View style={{ height: 100 }} />
            </View>
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={[styles.pageTitle, { color: c.neutral.gray900 }]}>
                Transacciones
              </Text>

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
                  <Text style={styles.balanceAmount}>
                    {totalBalance < 0 ? "- " : ""}
                    {fmt(totalBalance)}
                  </Text>
                </View>
              </View>

              {/* Summary cards */}
              <View style={styles.summaryRow}>
                <View
                  style={[
                    styles.summaryCard,
                    { backgroundColor: c.neutral.white },
                  ]}
                >
                  <View
                    style={[
                      styles.summaryIconBg,
                      { backgroundColor: "#FEE2E2" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="arrow-up-right"
                      size={18}
                      color={Colors.accent.expense}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.summaryCardLabel,
                        { color: c.neutral.gray500 },
                      ]}
                    >
                      Gastado este mes
                    </Text>
                    <Text
                      style={[
                        styles.summaryCardValue,
                        { color: Colors.accent.expense },
                      ]}
                      numberOfLines={1}
                    >
                      {fmt(totalExpense)}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.summaryCard,
                    { backgroundColor: c.neutral.white },
                  ]}
                >
                  <View
                    style={[
                      styles.summaryIconBg,
                      { backgroundColor: "#D1FAE5" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="arrow-down-left"
                      size={18}
                      color={Colors.accent.income}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.summaryCardLabel,
                        { color: c.neutral.gray500 },
                      ]}
                    >
                      Ingresado este mes
                    </Text>
                    <Text
                      style={[
                        styles.summaryCardValue,
                        { color: Colors.accent.income },
                      ]}
                      numberOfLines={1}
                    >
                      {fmt(totalIncome)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Search bar */}
              <View
                style={[styles.searchBar, { backgroundColor: c.neutral.white }]}
              >
                <MaterialCommunityIcons
                  name="magnify"
                  size={20}
                  color={c.neutral.gray400}
                />
                <TextInput
                  style={[styles.searchInput, { color: c.neutral.gray900 }]}
                  placeholder="Buscar por destinatario, categoría o tipo..."
                  placeholderTextColor={c.neutral.gray400}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={18}
                      color={c.neutral.gray400}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Section label */}
              <View style={styles.sectionRow}>
                <Text
                  style={[styles.sectionTitle, { color: c.neutral.gray900 }]}
                >
                  Últimas transacciones
                </Text>
                <Text
                  style={[styles.sectionCount, { color: c.neutral.gray400 }]}
                >
                  {filteredTransactions.length} movimientos
                </Text>
              </View>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary.main }]}
        onPress={openCreate}
        activeOpacity={0.85}
      >
        <AntDesign name="plus" size={26} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.xl },
  listHeader: { paddingTop: Spacing.xl, paddingBottom: Spacing.sm },

  // ── Page title ──────────────────────────────────────────────────
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
    color: "#FFFFFF",
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
  },

  // ── Summary cards ────────────────────────────────────────────────
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    flex: 1,
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
    marginBottom: 2,
  },
  summaryCardValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  // ── Search bar ───────────────────────────────────────────────────
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    paddingVertical: 4,
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
  },
  sectionCount: {
    fontSize: FontSize.sm,
  },

  // ── Ver más ──────────────────────────────────────────────────────
  seeMoreButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xs,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    ...Shadow.md,
  },
  seeMoreText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
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
  },
  emptySubtext: { fontSize: FontSize.md },

  // ── FAB ──────────────────────────────────────────────────────────
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    ...Shadow.lg,
  },
});
