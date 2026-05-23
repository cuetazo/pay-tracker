// app/(tabs)/budgets.tsx
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
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Category = Database["public"]["Tables"]["category"]["Row"];
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

type CategoryForm = {
  name: string;
  description: string;
  icon: string;
  color: string;
  limit_amount: string;
  limit_interval: "monthly" | "weekly" | "daily";
};

const EMPTY_FORM: CategoryForm = {
  name: "",
  description: "",
  icon: "wallet",
  color: Colors.primary.main,
  limit_amount: "",
  limit_interval: "monthly",
};

const PRESET_COLORS = [
  "#0EA5E9",
  "#31C9A6",
  "#E12E60",
  "#EA9D2B",
  "#8754EC",
];

const PRESET_ICONS: { key: string; lib: "mci" | "ion" }[] = [
  { key: "wallet",                lib: "mci" },
  { key: "food",                  lib: "mci" },
  { key: "car",                   lib: "mci" },
  { key: "home",                  lib: "mci" },
  { key: "gamepad-variant",       lib: "mci" },
  { key: "airplane",              lib: "mci" },
  { key: "pill",                  lib: "mci" },
  { key: "book-open-variant",     lib: "mci" },
  { key: "tshirt-crew",           lib: "mci" },
  { key: "lightning-bolt",        lib: "mci" },
];

const INTERVALS: Record<string, string> = {
  daily: "Diario",
  weekly: "Semanal",
  monthly: "Mensual",
};

export default function BudgetsScreen() {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    const [catRes, txRes] = await Promise.all([
      supabase.from("category").select("*").eq("userId", user.id),
      supabase
        .from("transactions")
        .select("*")
        .eq("userId", user.id)
        .eq("type", "expense"),
    ]);

    if (catRes.data) setCategories(catRes.data);
    if (txRes.data) setTransactions(txRes.data);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const spentForCategory = (catId: string) =>
    transactions
      .filter((t) => t.categoryId === catId)
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const fmt = (n: number) =>
    `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

  // ─── CRUD ────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description ?? "",
      icon: cat.icon ?? "wallet",
      color: cat.color ?? Colors.primary.main,
      limit_amount: cat.limit_amount?.toString() ?? "",
      limit_interval:
        (cat.limit_interval as CategoryForm["limit_interval"]) ?? "monthly",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    if (!form.name.trim()) {
      Alert.alert("Error", "El nombre es requerido.");
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      icon: form.icon,
      color: form.color,
      limit_amount: form.limit_amount ? Number(form.limit_amount) : null,
      limit_interval: form.limit_amount ? form.limit_interval : null,
      userId: user.id,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase
        .from("category")
        .update(payload)
        .eq("id", editingId));
    } else {
      ({ error } = await supabase.from("category").insert(payload));
    }

    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    setModalVisible(false);
    fetchData();
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      `Eliminar "${name}"`,
      "Esto no elimina las transacciones asociadas.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("category")
              .delete()
              .eq("id", id);
            if (error) Alert.alert("Error", error.message);
            else fetchData();
          },
        },
      ]
    );
  };

  // ─── Totals ───────────────────────────────────────────────────────────────
  const totalBudget = categories.reduce((s, c) => s + (c.limit_amount ?? 0), 0);
  const totalSpent = categories.reduce((s, c) => s + spentForCategory(c.id), 0);

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
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const spent = spentForCategory(item.id);
            const limit = item.limit_amount ?? 0;
            const pct = limit > 0 ? Math.min(spent / limit, 1) : 0;
            const overBudget = limit > 0 && spent > limit;

            return (
              <TouchableOpacity
                style={styles.categoryCard}
                onLongPress={() =>
                  Alert.alert(item.name, "", [
                    { text: "Editar", onPress: () => openEdit(item) },
                    {
                      text: "Eliminar",
                      style: "destructive",
                      onPress: () => handleDelete(item.id, item.name),
                    },
                    { text: "Cancelar", style: "cancel" },
                  ])
                }
                activeOpacity={0.8}
              >
                <View style={styles.cardTop}>
                  <View
                    style={[
                      styles.iconBg,
                      {
                        backgroundColor:
                          (item.color ?? Colors.primary.main) + "22",
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={(item.icon ?? "wallet") as any}
                      size={26}
                      color={item.color ?? Colors.primary.main}
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.categoryName}>{item.name}</Text>
                    {item.description ? (
                      <Text style={styles.categoryDesc} numberOfLines={1}>
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.cardAmounts}>
                    <Text
                      style={[
                        styles.spentAmount,
                        overBudget && { color: Colors.accent.expense },
                      ]}
                    >
                      {fmt(spent)}
                    </Text>
                    {limit > 0 && (
                      <Text style={styles.limitAmount}>{fmt(limit)}</Text>
                    )}
                  </View>
                </View>

                {limit > 0 && (
                  <>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${pct * 100}%` as any,
                            backgroundColor: overBudget
                              ? Colors.accent.expense
                              : (item.color ?? Colors.primary.main),
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.progressLabels}>
                      <Text
                        style={[
                          styles.progressPct,
                          overBudget && { color: Colors.accent.expense },
                        ]}
                      >
                        {Math.round(pct * 100)}% usado
                      </Text>
                      {overBudget ? (
                        <Text style={styles.overBudgetText}>Excedido</Text>
                      ) : (
                        <Text style={styles.remainingText}>
                          {fmt(limit - spent)} restante
                        </Text>
                      )}
                    </View>
                  </>
                )}

                {item.limit_interval && limit > 0 && (
                  <View style={styles.intervalChip}>
                    <Text style={styles.intervalChipText}>
                      {INTERVALS[item.limit_interval] ?? item.limit_interval}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="piggy-bank-outline"
                size={56}
                color={Colors.neutral.gray300}
              />
              <Text style={styles.emptyText}>Sin categorias aun</Text>
              <Text style={styles.emptySubtext}>Toca + para crear tu primera</Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.headerTitle}>Consumo</Text>
              <Text style={styles.headerSubtitle}>
                Gestiona tus categorias de gastos
              </Text>

              {categories.length > 0 && (
                <View style={styles.totalCard}>
                  {/* Círculo decorativo */}
                  <View style={styles.totalCardCircle} />

                  <View style={styles.totalCardIcon}>
                    <MaterialCommunityIcons
                      name="credit-card-outline"
                      size={26}
                      color="#fff"
                    />
                  </View>
                  <View>
                    <Text style={styles.totalCardLabel}>Total gastado</Text>
                    <Text style={styles.totalCardValue}>{fmt(totalSpent)}</Text>
                  </View>
                </View>
              )}
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
        <AntDesign name="plus" size={28} color="white" />
      </TouchableOpacity>

      {/* ─── Modal ─────────────────────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingId ? "Editar categoria" : "Nueva categoria"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <AntDesign name="close" size={24} color={Colors.neutral.gray700} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Icon picker */}
            <Text style={styles.fieldLabel}>Icono</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {PRESET_ICONS.map(({ key }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.iconOption,
                    form.icon === key && {
                      backgroundColor: form.color + "22",
                      borderColor: form.color,
                    },
                  ]}
                  onPress={() => setForm((f) => ({ ...f, icon: key }))}
                >
                  <MaterialCommunityIcons
                    name={key as any}
                    size={26}
                    color={form.icon === key ? form.color : Colors.neutral.gray400}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Color picker */}
            <Text style={styles.fieldLabel}>Color</Text>
            <View style={styles.colorRow}>
              {PRESET_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    form.color === c && styles.colorDotSelected,
                  ]}
                  onPress={() => setForm((f) => ({ ...f, color: c }))}
                />
              ))}
            </View>

            <ModalField
              label="Nombre *"
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="ej. Alimentacion"
            />

            <ModalField
              label="Descripcion (opcional)"
              value={form.description}
              onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
              placeholder="ej. Comida y supermercado"
            />

            <ModalField
              label="Limite (S/, opcional)"
              value={form.limit_amount}
              onChangeText={(v) => setForm((f) => ({ ...f, limit_amount: v }))}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />

            {form.limit_amount ? (
              <>
                <Text style={styles.fieldLabel}>Intervalo</Text>
                <View style={styles.toggleRow}>
                  {(["daily", "weekly", "monthly"] as const).map((interval) => (
                    <TouchableOpacity
                      key={interval}
                      style={[
                        styles.intervalButton,
                        form.limit_interval === interval && {
                          backgroundColor: form.color,
                          borderColor: form.color,
                        },
                      ]}
                      onPress={() =>
                        setForm((f) => ({ ...f, limit_interval: interval }))
                      }
                    >
                      <Text
                        style={[
                          styles.intervalButtonText,
                          form.limit_interval === interval && {
                            color: "white",
                          },
                        ]}
                      >
                        {INTERVALS[interval]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : null}

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: "#1E82F4" },
                saving && { opacity: 0.6 },
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {editingId ? "Guardar cambios" : "Crear categoria"}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function ModalField({
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
  listHeader: { paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
  headerTitle: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.extrabold,
    color: Colors.neutral.gray900,
  },
  headerSubtitle: {
    fontSize: FontSize.md,
    color: Colors.neutral.gray500,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  // ── Total card ──────────────────────────────────────────────────
  totalCard: {
    backgroundColor: "#3282DE",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,        // prueba subiendo/bajando este
    height: 78,                 // altura fija de Figma
    width: "100%",              // o 343 si quieres fijo
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    overflow: "hidden",
    ...Shadow.md,
  },
  totalCardCircle: {
    position: "absolute",
    right: -30,
    top: -50,
    width: 128,
    height: 128,
    borderRadius: 100,
    backgroundColor: "rgba(31, 43, 151, 0.1)",
  },
  totalCardIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  totalCardLabel: {
    fontSize: FontSize.md,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 2,
  },
  totalCardValue: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.neutral.white,
  },
  // ── Category card ───────────────────────────────────────────────
  categoryCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.xxl,
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  iconBg: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  cardInfo: { flex: 1 },
  categoryName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral.gray900,
  },
  categoryDesc: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray500,
    marginTop: 2,
  },
  cardAmounts: { alignItems: "flex-end" },
  spentAmount: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.accent.income,
  },
  limitAmount: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray400,
    marginTop: 2,
  },
  progressTrack: {
    height: 7,
    backgroundColor: Colors.neutral.gray100,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  progressFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressPct: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray500,
  },
  overBudgetText: {
    fontSize: FontSize.sm,
    color: Colors.accent.expense,
    fontWeight: FontWeight.semibold,
  },
  remainingText: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray500,
  },
  intervalChip: {
    alignSelf: "flex-start",
    backgroundColor: Colors.neutral.gray100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  intervalChipText: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray500,
  },
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
  emptySubtext: {
    fontSize: FontSize.md,
    color: Colors.neutral.gray400,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 62,
    height: 62,
    borderRadius: BorderRadius.full,
    backgroundColor: "#1E82F4",
    justifyContent: "center",
    alignItems: "center",
    ...Shadow.lg,
  },
  // ── Modal ───────────────────────────────────────────────────────
  modalContainer: { flex: 1, backgroundColor: Colors.primary.background },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  modalTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral.gray900,
  },
  modalScroll: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
  },
  fieldLabel: {
    fontSize: FontSize.md,
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
    height: 56,
    fontSize: FontSize.md,
    color: Colors.neutral.gray900,
  },
  iconOption: {
    width: 54,
    height: 54,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.neutral.gray200,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
    backgroundColor: Colors.neutral.white,
  },
  colorRow: { flexDirection: "row", gap: Spacing.md, flexWrap: "wrap" },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: Colors.neutral.gray900,
  },
  toggleRow: { flexDirection: "row", gap: Spacing.sm },
  intervalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.neutral.gray200,
    alignItems: "center",
    backgroundColor: Colors.neutral.gray50,
  },
  intervalButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral.gray700,
  },
  saveButton: {
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xxxl,
    ...Shadow.md,
  },
  saveButtonText: {
    color: Colors.neutral.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
});