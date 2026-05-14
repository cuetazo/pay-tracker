// app/(protected)/transactions.tsx
import TransactionBigCard from "@/components/TransactionBigCard";
import TransactionCard from "@/components/TransactionCard";
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
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type Category = Database["public"]["Tables"]["category"]["Row"];

type TransactionForm = {
  amount: string;
  destinatary: string;
  type: "income" | "expense";
  categoryId: string;
  origin: string;
};

const EMPTY_FORM: TransactionForm = {
  amount: "",
  destinatary: "",
  type: "expense",
  categoryId: "",
  origin: "",
};

export default function TransactionsScreen() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TransactionForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("userId", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
    setLoading(false);
  }, [user?.id]);

  const fetchCategories = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("category")
      .select("*")
      .eq("userId", user.id);
    if (data) setCategories(data);
  }, [user?.id]);

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [fetchTransactions, fetchCategories]);

  // ─── CRUD ────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (t: Transaction) => {
    setEditingId(t.id);
    setForm({
      amount: t.amount?.toString() ?? "",
      destinatary: t.destinatary ?? "",
      type: (t.type as "income" | "expense") ?? "expense",
      categoryId: t.categoryId ?? "",
      origin: t.origin ?? "",
    });
    setModalVisible(true);
  };

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
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    setModalVisible(false);
    fetchTransactions();
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Eliminar transacción",
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
            else fetchTransactions();
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
    `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Filtrar categorías por tipo (ingreso/gasto)
  const filteredCategories = categories.filter((cat) =>
    form.type === "income" ? cat.type === "income" : cat.type === "expense",
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.neutral.gray50}
      />

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
            />
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="cash-remove"
                size={48}
                color={Colors.neutral.gray300}
              />
              <Text style={styles.emptyText}>Sin transacciones aún</Text>
              <Text style={styles.emptySubtext}>
                Toca el botón + para registrar una
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
        ListHeaderComponent={
          <View style={styles.header}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color={Colors.primary.main}
                style={{ marginVertical: 40 }}
              />
            ) : (
              <>
                <View style={styles.balanceCard}>
                  <Text style={styles.balanceLabel}>Balance Total</Text>
                  <Text style={styles.balanceAmount}>{fmt(totalBalance)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <TransactionBigCard
                    title={fmt(totalIncome)}
                    label="Ingresos"
                    icon="arrow-up-circle"
                    color={Colors.accent.income}
                  />
                  <TransactionBigCard
                    title={fmt(totalExpense)}
                    label="Gastos"
                    icon="arrow-down-circle"
                    color={Colors.accent.expense}
                  />
                </View>
                <View style={styles.listHeader}>
                  <Text style={styles.listTitle}>Últimas transacciones</Text>
                  <Text style={styles.listCount}>
                    {transactions.length} movimientos
                  </Text>
                </View>
              </>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openCreate}
        activeOpacity={0.85}
      >
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
              <AntDesign
                name="close"
                size={22}
                color={Colors.neutral.gray700}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
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
                        t === "expense"
                          ? Colors.accent.expense
                          : Colors.accent.income,
                    },
                  ]}
                  onPress={() => {
                    setForm((f) => ({ ...f, type: t, categoryId: "" }));
                  }}
                >
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

            {/* Category picker - Mostrar solo si hay categorías del tipo seleccionado */}
            {filteredCategories.length > 0 && (
              <>
                <Text style={styles.fieldLabel}>Categoría</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
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
                      <Text
                        style={[
                          styles.categoryChipText,
                          form.categoryId === cat.id && { color: "white" },
                        ]}
                      >
                        {cat.icon} {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Mensaje si no hay categorías */}
            {filteredCategories.length === 0 && categories.length > 0 && (
              <View style={styles.noCategoriesMessage}>
                <MaterialCommunityIcons
                  name="folder-open"
                  size={24}
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
    </View>
  );
}

// ─── Field helper ─────────────────────────────────────────────────────────────
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

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.xl },
  header: { paddingTop: Spacing.md },
  balanceCard: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadow.lg,
  },
  balanceLabel: {
    color: Colors.neutral.white,
    fontSize: FontSize.sm,
    opacity: 0.9,
    marginBottom: Spacing.sm,
  },
  balanceAmount: {
    color: Colors.neutral.white,
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
  },
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: Spacing.lg,
  },
  listTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral.gray900,
  },
  listCount: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray500,
  },
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
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray400,
  },
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
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.primary.background,
  },
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
  toggleRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.neutral.gray200,
    alignItems: "center",
    backgroundColor: Colors.neutral.gray50,
  },
  toggleButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral.gray700,
  },
  categoryScroll: {
    marginBottom: Spacing.sm,
    flexDirection: "row",
  },
  categoryChip: {
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
