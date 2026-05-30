// components/TransactionFormModal.tsx
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
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
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

type Props = {
  transaction?: Transaction;
  categories: Category[];
  onSaveSuccess: () => void;
};

export function TransactionFormModal({
  transaction,
  categories,
  onSaveSuccess,
}: Props) {
  const { user } = useAuthStore();
  const { closeModal } = useModal();
  const isEditing = !!transaction;

  const [form, setForm] = useState<TransactionForm>(
    transaction
      ? {
          amount: transaction.amount?.toString() ?? "",
          destinatary: transaction.destinatary ?? "",
          type: (transaction.type as "income" | "expense") ?? "expense",
          categoryId: transaction.categoryId ?? "",
          origin: transaction.origin ?? "",
        }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);

  const filteredCategories = categories.filter((cat) =>
    form.type === "income" ? cat.type === "income" : cat.type === "expense",
  );

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
    if (isEditing) {
      ({ error } = await supabase
        .from("transactions")
        .update(payload)
        .eq("id", transaction.id));
    } else {
      ({ error } = await supabase.from("transactions").insert(payload));
    }

    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    await onSaveSuccess();
    closeModal();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEditing ? "Editar transacción" : "Nueva transacción"}
        </Text>
        <TouchableOpacity onPress={closeModal} hitSlop={8}>
          <AntDesign name="close" size={22} color={Colors.neutral.gray700} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
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
                    t === "expense"
                      ? Colors.accent.expense
                      : Colors.accent.income,
                  borderColor:
                    t === "expense"
                      ? Colors.accent.expense
                      : Colors.accent.income,
                },
              ]}
              onPress={() =>
                setForm((f) => ({ ...f, type: t, categoryId: "" }))
              }
            >
              <MaterialCommunityIcons
                name={t === "expense" ? "arrow-up-right" : "arrow-down-left"}
                size={16}
                color={form.type === t ? "white" : Colors.neutral.gray500}
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

        {/* Amount */}
        <Text style={styles.fieldLabel}>Monto (S/)</Text>
        <TextInput
          style={styles.textInput}
          value={form.amount}
          onChangeText={(v) => setForm((f) => ({ ...f, amount: v }))}
          placeholder="0.00"
          placeholderTextColor={Colors.neutral.gray400}
          keyboardType="decimal-pad"
        />

        {/* Destinatary */}
        <Text style={styles.fieldLabel}>Destinatario / Descripción</Text>
        <TextInput
          style={styles.textInput}
          value={form.destinatary}
          onChangeText={(v) => setForm((f) => ({ ...f, destinatary: v }))}
          placeholder="ej. Supermercado"
          placeholderTextColor={Colors.neutral.gray400}
        />

        {/* Origin */}
        <Text style={styles.fieldLabel}>Origen (opcional)</Text>
        <TextInput
          style={styles.textInput}
          value={form.origin}
          onChangeText={(v) => setForm((f) => ({ ...f, origin: v }))}
          placeholder="ej. Banco, Efectivo"
          placeholderTextColor={Colors.neutral.gray400}
        />

        {/* Categories */}
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

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? "Guardar cambios" : "Agregar transacción"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral.gray900,
  },
  scroll: {
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
});
