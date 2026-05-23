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
import { useModal } from "@/hooks/useModal";
import { Database } from "@/services/db/schema";
import { useAuthStore } from "@/stores/authStore";
import { useDataStore } from "@/stores/dataStore";
import { supabase } from "@/stores/supabase";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Category = Database["public"]["Tables"]["category"]["Row"];

const INTERVALS: Record<string, string> = {
  daily: "Diario",
  weekly: "Semanal",
  monthly: "Mensual",
};

export default function BudgetsScreen() {
  const { openModal } = useModal();
  const { refreshData } = useAuthStore();
  const { categories, transactions, loadingCategories } = useDataStore();

  const spentForCategory = (catId: string) =>
    transactions
      .filter((t) => t.categoryId === catId && t.type === "expense")
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const fmt = (n: number) =>
    `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

  const openCreate = () => {
    openModal(<CategoryFormModal onSaveSuccess={refreshData} />, {
      type: "fullscreen",
    });
  };

  const openEdit = (cat: Category) => {
    openModal(
      <CategoryFormModal category={cat} onSaveSuccess={refreshData} />,
      { type: "fullscreen" },
    );
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
            else refreshData();
          },
        },
      ],
    );
  };

  const totalSpent = categories.reduce((s, c) => s + spentForCategory(c.id), 0);

  return (
    <View style={styles.safeArea}>
      {loadingCategories && categories.length === 0 ? (
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
              <Text style={styles.emptySubtext}>
                Toca + para crear tu primera
              </Text>
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
      <TouchableOpacity
        style={styles.fab}
        onPress={openCreate}
        activeOpacity={0.85}
      >
        <AntDesign name="plus" size={28} color="white" />
      </TouchableOpacity>
    </View>
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
    color: Colors.neutral.white,
  },
  categoryCard: {
    backgroundColor: Colors.neutral.white,
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
  progressFill: { height: "100%", borderRadius: BorderRadius.full },
  progressLabels: { flexDirection: "row", justifyContent: "space-between" },
  progressPct: { fontSize: FontSize.sm, color: Colors.neutral.gray500 },
  overBudgetText: {
    fontSize: FontSize.sm,
    color: Colors.accent.expense,
    fontWeight: FontWeight.semibold,
  },
  remainingText: { fontSize: FontSize.sm, color: Colors.neutral.gray500 },
  intervalChip: {
    alignSelf: "flex-start",
    backgroundColor: Colors.neutral.gray100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  intervalChipText: { fontSize: FontSize.sm, color: Colors.neutral.gray500 },
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
});
