// app/(tabs)/budgets.tsx
import { CategoryFormModal } from "@/components/CategoryFormModal";
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
<<<<<<< HEAD
import { useCallback, useEffect, useRef, useState } from "react";
=======
import { useCallback, useEffect, useState } from "react";
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
import {
  ActivityIndicator,
  Alert,
  FlatList,
<<<<<<< HEAD
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
=======
  RefreshControl,
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
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

const PRESET_COLORS = ["#0EA5E9", "#31C9A6", "#E12E60", "#EA9D2B", "#8754EC"];

const PRESET_ICONS: { key: string; lib: "mci" | "ion" }[] = [
  { key: "wallet", lib: "mci" },
  { key: "food", lib: "mci" },
  { key: "car", lib: "mci" },
  { key: "home", lib: "mci" },
  { key: "gamepad-variant", lib: "mci" },
  { key: "airplane", lib: "mci" },
  { key: "pill", lib: "mci" },
  { key: "book-open-variant", lib: "mci" },
  { key: "tshirt-crew", lib: "mci" },
  { key: "lightning-bolt", lib: "mci" },
];

const INTERVALS: Record<string, string> = {
  daily: "Diario",
  weekly: "Semanal",
  monthly: "Mensual",
};

export default function BudgetsScreen() {
  const { user } = useAuthStore();
  const { openModal } = useModal();
  const c = useAppColors();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Ref para el ScrollView del modal
  const scrollRef = useRef<ScrollView>(null);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

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
    openModal(<CategoryFormModal onSaveSuccess={fetchData} />, {
      type: "fullscreen",
    });
  };

  const openEdit = (cat: Category) => {
    openModal(<CategoryFormModal category={cat} onSaveSuccess={fetchData} />, {
      type: "fullscreen",
    });
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
      ],
    );
  };

  // ─── Totals ───────────────────────────────────────────────────────────────
  const totalBudget = categories.reduce((s, cat) => s + (cat.limit_amount ?? 0), 0);
  const totalSpent = categories.reduce((s, cat) => s + spentForCategory(cat.id), 0);

  // ─── Scroll helpers ───────────────────────────────────────────────────────
  const scrollToEnd = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const scrollToY = (y: number) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y, animated: true });
    }, 150);
  };

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
          data={categories}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => {
            const spent = spentForCategory(item.id);
            const limit = item.limit_amount ?? 0;
            const pct = limit > 0 ? Math.min(spent / limit, 1) : 0;
            const overBudget = limit > 0 && spent > limit;

            return (
              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor:
                      c.neutral.white === "#0F172A"
                        ? "#1E293B"
                        : Colors.neutral.white,
                  },
                ]}
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
                          (item.color ?? c.primary.main) + "22",
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={(item.icon ?? "wallet") as any}
                      size={26}
                      color={item.color ?? c.primary.main}
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.categoryName, { color: c.neutral.gray900 }]}>
                      {item.name}
                    </Text>
                    {item.description ? (
                      <Text
                        style={[styles.categoryDesc, { color: c.neutral.gray500 }]}
                        numberOfLines={1}
                      >
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.cardAmounts}>
                    <Text
                      style={[
                        styles.spentAmount,
                        { color: c.accent.income },
                        overBudget && { color: c.accent.expense },
                      ]}
                    >
                      {fmt(spent)}
                    </Text>
                    {limit > 0 && (
                      <Text style={[styles.limitAmount, { color: c.neutral.gray400 }]}>
                        {fmt(limit)}
                      </Text>
                    )}
                  </View>
                </View>

                {limit > 0 && (
                  <>
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
                            width: `${pct * 100}%` as any,
                            backgroundColor: overBudget
                              ? c.accent.expense
                              : (item.color ?? c.primary.main),
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.progressLabels}>
                      <Text
                        style={[
                          styles.progressPct,
                          { color: c.neutral.gray500 },
                          overBudget && { color: c.accent.expense },
                        ]}
                      >
                        {Math.round(pct * 100)}% usado
                      </Text>
                      {overBudget ? (
                        <Text style={[styles.overBudgetText, { color: c.accent.expense }]}>
                          Excedido
                        </Text>
                      ) : (
                        <Text style={[styles.remainingText, { color: c.neutral.gray500 }]}>
                          {fmt(limit - spent)} restante
                        </Text>
                      )}
                    </View>
                  </>
                )}

                {item.limit_interval && limit > 0 && (
                  <View
                    style={[
                      styles.intervalChip,
                      { backgroundColor: c.neutral.gray100 },
                    ]}
                  >
                    <Text style={[styles.intervalChipText, { color: c.neutral.gray500 }]}>
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
                color={c.neutral.gray300}
              />
              <Text style={[styles.emptyText, { color: c.neutral.gray500 }]}>
                Sin categorias aun
              </Text>
              <Text style={[styles.emptySubtext, { color: c.neutral.gray400 }]}>
                Toca + para crear tu primera
              </Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={[styles.headerTitle, { color: c.neutral.gray900 }]}>
                Consumo
              </Text>
              <Text style={[styles.headerSubtitle, { color: c.neutral.gray500 }]}>
                Gestiona tus categorias de gastos
              </Text>

              {categories.length > 0 && (
                <View style={styles.totalCard}>
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
        style={[styles.fab, { backgroundColor: c.primary.main }]}
        onPress={openCreate}
        activeOpacity={0.85}
      >
        <AntDesign name="plus" size={28} color="white" />
      </TouchableOpacity>
<<<<<<< HEAD

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
              {editingId ? "Editar categoria" : "Nueva categoria"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <AntDesign name="close" size={24} color={Colors.neutral.gray700} />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
          >
            <ScrollView
              ref={scrollRef}
              style={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: Spacing.xxxl * 3 }}
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
                onFocus={() => scrollToY(0)}
              />

              <ModalField
                label="Descripcion (opcional)"
                value={form.description}
                onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
                placeholder="ej. Comida y supermercado"
                onFocus={() => scrollToY(100)}
              />

              <ModalField
                label="Limite (S/, opcional)"
                value={form.limit_amount}
                onChangeText={(v) => setForm((f) => ({ ...f, limit_amount: v }))}
                placeholder="0.00"
                keyboardType="decimal-pad"
                onFocus={scrollToEnd}
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
          </KeyboardAvoidingView>
        </View>
      </Modal>
=======
>>>>>>> fc061e347e6e1158f3fd760eaa3287c1c5c96d76
    </View>
  );
}

function ModalField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  onFocus,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "decimal-pad";
  onFocus?: () => void;
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
        onFocus={onFocus}
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
  },
  headerSubtitle: {
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  // ── Total card ──────────────────────────────────────────────────
  totalCard: {
    backgroundColor: "#3282DE",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    height: 78,
    width: "100%",
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
    color: "#FFFFFF",
  },
  // ── Category card ───────────────────────────────────────────────
  categoryCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xxl,
    marginBottom: Spacing.sm,
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
  },
  categoryDesc: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  cardAmounts: { alignItems: "flex-end" },
  spentAmount: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  limitAmount: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  progressTrack: {
    height: 7,
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
  },
  overBudgetText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  remainingText: {
    fontSize: FontSize.sm,
  },
  intervalChip: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  intervalChipText: {
    fontSize: FontSize.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xxxl * 2,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  emptySubtext: {
    fontSize: FontSize.md,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 62,
    height: 62,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    ...Shadow.lg,
  },
  // ── Modal ───────────────────────────────────────────────────────
  modalContainer: { flex: 1 },
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
