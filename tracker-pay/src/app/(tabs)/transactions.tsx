// app/(protected)/transactions.tsx
<<<<<<< HEAD
import TransactionCard from "@/components/TransactionCard";
=======
import TransactionCard from "@/components/transaction/TransactionCard";
import { TransactionFormModal } from "@/components/TransactionFormModal";
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
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
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
<<<<<<< HEAD
  Modal,
  ScrollView,
=======
  RefreshControl,
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
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
  const c = useAppColors();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { closeModal } = useModal();
  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

<<<<<<< HEAD
    if (!error && data) setTransactions(data);
=======
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
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
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

<<<<<<< HEAD
  const handleSave = async () => {
    if (!user?.id) return;
    if (!form.amount || isNaN(Number(form.amount))) {
      Alert.alert("Error", "Ingresa un monto válido.");
      return;
    }
    if (!form.destinatary.trim()) {
      Alert.alert("Error", "Ingresa un destinatario.");
      return;
    }

    setSaving(true);
    const payload = {
      amount: Number(form.amount),
      destinatary: form.destinatary.trim(),
      type: form.type,
      categoryId: form.categoryId || null,
      origin: form.origin.trim() || null,
      userId: user.id,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase
        .from("transactions")
        .update(payload)
        .eq("id", editingId));
    } else {
      ({ error } = await supabase.from("transactions").insert(payload));
    }

    setSaving(false);
    if (error) { Alert.alert("Error", error.message); return; }
    setModalVisible(false);
    fetchTransactions();
  };

  const handleDelete = (id: string) => {
=======
  const handleDelete = (id: string, name: string) => {
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
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
<<<<<<< HEAD
    `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const filteredCategories = categories.filter((cat) =>
    form.type === "income" ? cat.type === "income" : cat.type === "expense",
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.safeArea}>
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
                  onPress: () => handleDelete(item.id),
                },
                { text: "Cancelar", style: "cancel" },
              ])
            }
            activeOpacity={0.8}
          >
            <TransactionCard
              amount={item.amount ?? 0}
              transaction_type={(item.type as "income" | "expense") ?? "expense"}
              category={
                categories.find((c) => c.id === item.categoryId)?.name ?? "Sin categoría"
              }
              destinatary={item.destinatary ?? "—"}
            />
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
=======
    `S/ ${Math.abs(n).toLocaleString("es-PE", {
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
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="cash-remove"
                size={56}
                color={c.neutral.gray300}
              />
<<<<<<< HEAD
              <Text style={styles.emptyText}>Sin transacciones aún</Text>
              <Text style={styles.emptySubtext}>Toca + para registrar una</Text>
            </View>
          ) : null
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
        ListHeaderComponent={
          <View style={styles.listHeaderWrapper}>
            {/* Page title */}
            <Text style={styles.pageTitle}>Transacciones</Text>

            {loading ? (
              <ActivityIndicator
                size="large"
                color={Colors.primary.main}
                style={{ marginVertical: 40 }}
              />
            ) : (
              <>
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

                {/* Income / Expense row */}
                <View style={styles.summaryRow}>
                  {/* Income */}
                  <View style={styles.summaryCard}>
                    <View style={[styles.summaryIconBg, { backgroundColor: Colors.accent.income + "22" }]}>
                      <MaterialCommunityIcons
                        name="arrow-down-left"
                        size={20}
                        color={Colors.accent.income}
                      />
                    </View>
                    <View>
                      <Text style={styles.summaryCardLabel}>Ingresos</Text>
                      <Text style={[styles.summaryCardValue, { color: Colors.accent.income }]}>
                        + {fmt(totalIncome)}
                      </Text>
                    </View>
                  </View>

                  {/* Expense */}
                  <View style={styles.summaryCard}>
                    <View style={[styles.summaryIconBg, { backgroundColor: Colors.accent.expense + "22" }]}>
                      <MaterialCommunityIcons
                        name="arrow-up-right"
                        size={20}
                        color={Colors.accent.expense}
                      />
                    </View>
                    <View>
                      <Text style={styles.summaryCardLabel}>Gastos</Text>
                      <Text style={[styles.summaryCardValue, { color: Colors.accent.expense }]}>
                        - {fmt(totalExpense)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Section label */}
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Últimas transacciones</Text>
                  <Text style={styles.sectionCount}>
                    {transactions.length} movimientos
=======
              <Text style={[styles.emptyText, { color: c.neutral.gray500 }]}>
                Sin transacciones aún
              </Text>
              <Text style={[styles.emptySubtext, { color: c.neutral.gray400 }]}>
                Toca + para registrar una
              </Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
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
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
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
                  {transactions.length} movimientos
                </Text>
              </View>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* FAB */}
<<<<<<< HEAD
      <TouchableOpacity style={styles.fab} onPress={openCreate} activeOpacity={0.85}>
        <AntDesign name="plus" size={26} color="white" />
      </TouchableOpacity>

      {/* ─── Modal ─────────────────────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingId ? "Editar transacción" : "Nueva transacción"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <AntDesign name="close" size={22} color={Colors.neutral.gray700} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Spacing.xxxl * 2 }}
          >
            {/* Type toggle */}
            <Text style={styles.fieldLabel}>Tipo</Text>
            <View style={styles.toggleRow}>
              {(["expense", "income"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.toggleButton,
                    form.type === t && {
                      backgroundColor:
                        t === "expense" ? Colors.accent.expense : Colors.accent.income,
                      borderColor:
                        t === "expense" ? Colors.accent.expense : Colors.accent.income,
                    },
                  ]}
                  onPress={() => setForm((f) => ({ ...f, type: t, categoryId: "" }))}
                >
                  <MaterialCommunityIcons
                    name={t === "expense" ? "arrow-up-right" : "arrow-down-left"}
                    size={16}
                    color={
                      form.type === t
                        ? "white"
                        : Colors.neutral.gray500
                    }
                  />
                  <Text
                    style={[
                      styles.toggleButtonText,
                      form.type === t && { color: "white" },
                    ]}
                  >
                    {t === "expense" ? "Gasto" : "Ingreso"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Field
              label="Monto (S/)"
              keyboardType="decimal-pad"
              value={form.amount}
              onChangeText={(v) => setForm((f) => ({ ...f, amount: v }))}
              placeholder="0.00"
            />

            <Field
              label="Destinatario / Descripción"
              value={form.destinatary}
              onChangeText={(v) => setForm((f) => ({ ...f, destinatary: v }))}
              placeholder="ej. Supermercado"
            />

            <Field
              label="Origen (opcional)"
              value={form.origin}
              onChangeText={(v) => setForm((f) => ({ ...f, origin: v }))}
              placeholder="ej. Banco, Efectivo"
            />

            {filteredCategories.length > 0 && (
              <>
                <Text style={styles.fieldLabel}>Categoría</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: Spacing.sm }}
                >
                  {filteredCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChip,
                        form.categoryId === cat.id && {
                          backgroundColor: cat.color ?? Colors.primary.main,
                          borderColor: cat.color ?? Colors.primary.main,
                        },
                      ]}
                      onPress={() =>
                        setForm((f) => ({
                          ...f,
                          categoryId: f.categoryId === cat.id ? "" : cat.id,
                        }))
                      }
                    >
                      <MaterialCommunityIcons
                        name={(cat.icon ?? "wallet") as any}
                        size={14}
                        color={
                          form.categoryId === cat.id
                            ? "white"
                            : Colors.neutral.gray500
                        }
                      />
                      <Text
                        style={[
                          styles.categoryChipText,
                          form.categoryId === cat.id && { color: "white" },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {filteredCategories.length === 0 && categories.length > 0 && (
              <View style={styles.noCategoriesMessage}>
                <MaterialCommunityIcons
                  name="folder-open"
                  size={20}
                  color={Colors.neutral.gray400}
                />
                <Text style={styles.noCategoriesText}>
                  No hay categorías para{" "}
                  {form.type === "expense" ? "gastos" : "ingresos"}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.saveButton, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {editingId ? "Guardar cambios" : "Agregar transacción"}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
=======
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary.main }]}
        onPress={openCreate}
        activeOpacity={0.85}
      >
        <AntDesign name="plus" size={26} color="white" />
      </TouchableOpacity>
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
    </View>
  );
}

<<<<<<< HEAD
// ─── Field helper ──────────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "decimal-pad";
}) {
  return (
    <>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.neutral.gray400}
        keyboardType={keyboardType}
      />
    </>
  );
}

=======
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.primary.background },

  listContent: { paddingHorizontal: Spacing.xl },
<<<<<<< HEAD

  listHeaderWrapper: { paddingTop: Spacing.xl },
=======
  listHeader: { paddingTop: Spacing.xl, paddingBottom: Spacing.sm },
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76

  // ── Page title ──────────────────────────────────────────────────
  pageTitle: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.extrabold,
<<<<<<< HEAD
    color: Colors.neutral.gray900,
=======
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
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
<<<<<<< HEAD
    color: Colors.neutral.white,
=======
    color: "#FFFFFF",
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
  },

<<<<<<< HEAD
  // ── Summary row ──────────────────────────────────────────────────
=======
  // ── Summary cards ────────────────────────────────────────────────
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    flex: 1,
<<<<<<< HEAD
    backgroundColor: Colors.neutral.white,
=======
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
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
<<<<<<< HEAD
    color: Colors.neutral.gray500,
=======
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
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
  },
  sectionCount: {
    fontSize: FontSize.sm,
<<<<<<< HEAD
    color: Colors.neutral.gray400,
=======
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
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
<<<<<<< HEAD
    color: Colors.neutral.gray500,
  },
  emptySubtext: { fontSize: FontSize.sm, color: Colors.neutral.gray400 },
=======
  },
  emptySubtext: { fontSize: FontSize.md },
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76

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
<<<<<<< HEAD

  // ── Modal ─────────────────────────────────────────────────────────
  modalContainer: { flex: 1, backgroundColor: Colors.primary.background },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral.gray900,
  },
  modalScroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral.gray700,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  textInput: {
    backgroundColor: Colors.neutral.gray50,
    borderWidth: 1.5,
    borderColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    height: 50,
    fontSize: FontSize.base,
    color: Colors.neutral.gray900,
  },
  toggleRow: { flexDirection: "row", gap: Spacing.md },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.neutral.gray200,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.neutral.gray50,
  },
  toggleButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral.gray700,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.neutral.gray200,
    backgroundColor: Colors.neutral.gray50,
    marginRight: Spacing.sm,
  },
  categoryChipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.neutral.gray700,
  },
  saveButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xxxl,
    ...Shadow.md,
  },
  saveButtonText: {
    color: Colors.neutral.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  noCategoriesMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    backgroundColor: Colors.neutral.gray50,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  noCategoriesText: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray500,
  },
});
=======
});
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
