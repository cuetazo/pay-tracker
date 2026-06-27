import TransactionCard from "@/components/transaction/TransactionCard";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from "@/constants/theme";
import { useAppColors } from "@/hooks/useAppColors";
import { Database } from "@/services/db/schema";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/stores/supabase";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type Category = Database["public"]["Tables"]["category"]["Row"];

export default function PaymentsScreen() {
  const { user } = useAuthStore();
  const c = useAppColors();

  const [payments, setPayments] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    const [txRes, catRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("userId", user.id)
        .eq("type", "expense")
        .order("created_at", { ascending: false }),
      supabase.from("category").select("*").eq("userId", user.id),
    ]);

    if (txRes.data) setPayments(txRes.data);
    if (catRes.data) setCategories(catRes.data);
    setLoading(false);
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Statistics calculations (based on all actual payments in the current month)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthPayments = payments.filter((p) => {
    const d = p.created_at ? new Date(p.created_at) : null;
    return (
      d && d.getMonth() === currentMonth && d.getFullYear() === currentYear
    );
  });

  const totalPaid = thisMonthPayments.reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const totalCount = thisMonthPayments.length;
  const averagePayment = totalCount > 0 ? totalPaid / totalCount : 0;

  // Filtered payments list
  const filteredPayments = payments.filter((p) => {
    const matchesSearch = p.destinatary
      ? p.destinatary.toLowerCase().includes(searchQuery.toLowerCase())
      : false;
    
    const categoryName = categories.find((cat) => cat.id === p.categoryId)?.name || "";
    const matchesCategoryName = categoryName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilterCategory = selectedCategoryId
      ? p.categoryId === selectedCategoryId
      : true;

    return (matchesSearch || matchesCategoryName) && matchesFilterCategory;
  });

  const fmt = (n: number) =>
    `S/ ${n.toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const cardBg = c.neutral.white === "#0F172A" ? "#1E293B" : Colors.neutral.white;
  const inputBg = c.neutral.white === "#0F172A" ? "#1E293B" : c.neutral.gray100;
  const statCardBg = c.neutral.white === "#0F172A" ? "#1E293B" : c.neutral.white;

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
          data={filteredPayments}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={[styles.pageTitle, { color: c.neutral.gray900 }]}>
                Historial de Pagos
              </Text>

              {/* Statistics Card */}
              <View style={[styles.statsContainer, { backgroundColor: statCardBg, borderColor: c.neutral.gray200 }]}>
                <View style={styles.statHeader}>
                  <View style={[styles.statIconBg, { backgroundColor: c.accent.expense + "22" }]}>
                    <MaterialCommunityIcons name="credit-card-outline" size={24} color={c.accent.expense} />
                  </View>
                  <View>
                    <Text style={[styles.statLabel, { color: c.neutral.gray500 }]}>Total Pagado este mes</Text>
                    <Text style={[styles.statValue, { color: c.neutral.gray900 }]}>{fmt(totalPaid)}</Text>
                  </View>
                </View>
                <View style={[styles.statsDivider, { backgroundColor: c.neutral.gray200 }]} />
                <View style={styles.statRow}>
                  <View style={styles.statCol}>
                    <Text style={[styles.subStatLabel, { color: c.neutral.gray400 }]}>Pagos</Text>
                    <Text style={[styles.subStatValue, { color: c.neutral.gray700 }]}>{totalCount} trans.</Text>
                  </View>
                  <View style={[styles.statColDivider, { backgroundColor: c.neutral.gray200 }]} />
                  <View style={styles.statCol}>
                    <Text style={[styles.subStatLabel, { color: c.neutral.gray400 }]}>Promedio</Text>
                    <Text style={[styles.subStatValue, { color: c.neutral.gray700 }]}>{fmt(averagePayment)}</Text>
                  </View>
                </View>
              </View>

              {/* Search Bar */}
              <View style={[styles.searchSection, { backgroundColor: inputBg }]}>
                <AntDesign name="search1" size={20} color={c.neutral.gray400} style={styles.searchIcon} />
                <TextInput
                  style={[styles.input, { color: c.neutral.gray900 }]}
                  placeholder="Buscar por destinatario o categoría..."
                  placeholderTextColor={c.neutral.gray400}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery !== "" && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <AntDesign name="closecircle" size={16} color={c.neutral.gray400} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Categories Filter (Chips) */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
              >
                <TouchableOpacity
                  style={[
                    styles.chip,
                    selectedCategoryId === null
                      ? { backgroundColor: c.primary.main }
                      : { backgroundColor: cardBg, borderWidth: 1, borderColor: c.neutral.gray200 },
                  ]}
                  onPress={() => setSelectedCategoryId(null)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedCategoryId === null ? { color: "#FFFFFF" } : { color: c.neutral.gray600 },
                    ]}
                  >
                    Todos
                  </Text>
                </TouchableOpacity>

                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.chip,
                      selectedCategoryId === cat.id
                        ? { backgroundColor: c.primary.main }
                        : { backgroundColor: cardBg, borderWidth: 1, borderColor: c.neutral.gray200 },
                    ]}
                    onPress={() => setSelectedCategoryId(cat.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedCategoryId === cat.id ? { color: "#FFFFFF" } : { color: c.neutral.gray600 },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* List header label */}
              <View style={styles.sectionLabelRow}>
                <Text style={[styles.sectionTitle, { color: c.neutral.gray900 }]}>
                  Pagos realizados
                </Text>
                <Text style={[styles.sectionCount, { color: c.neutral.gray400 }]}>
                  {filteredPayments.length} de {payments.length}
                </Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <TransactionCard
              amount={item.amount ?? 0}
              transaction_type="expense"
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
                name="receipt-text-minus"
                size={56}
                color={c.neutral.gray300}
              />
              <Text style={[styles.emptyText, { color: c.neutral.gray500 }]}>
                No se encontraron pagos
              </Text>
              <Text style={[styles.emptySubtext, { color: c.neutral.gray400 }]}>
                Prueba buscando otro destinatario o categoría
              </Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.xl },
  listHeader: { paddingTop: Spacing.xl, paddingBottom: Spacing.sm },
  pageTitle: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.extrabold,
    marginBottom: Spacing.lg,
  },

  // ── Statistics Card ──
  statsContainer: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    ...Shadow.md,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  statIconBg: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    marginTop: 2,
  },
  statsDivider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statColDivider: {
    width: 1,
    height: 30,
  },
  subStatLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    marginBottom: 2,
  },
  subStatValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },

  // ── Search Section ──
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    height: "100%",
  },

  // ── Category Chips ──
  chipsContainer: {
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },

  // ── Section Label Row ──
  sectionLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  sectionCount: {
    fontSize: FontSize.sm,
  },

  // ── Empty State ──
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
    textAlign: "center",
  },
});
