// components/transaction/TransactionFormModal.tsx
import {
    BorderRadius,
    Colors,
    FontSize,
    FontWeight,
    Spacing,
} from "@/constants/theme";
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

interface Props {
  transaction?: Transaction;
  categories: Category[];
  onSaveSuccess: () => void;
  onClose: () => void; // ← recibe closeModal desde el padre
}

interface FormState {
  type: "expense" | "income";
  amount: string;
  destinatary: string;
  origin: string;
  categoryId: string;
}

const Field = ({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof TextInput>) => (
  <View style={{ marginBottom: Spacing.md }}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholderTextColor={Colors.neutral.gray400}
      {...props}
    />
  </View>
);

export function TransactionFormModal({
  transaction,
  categories,
  onSaveSuccess,
  onClose,
}: Props) {
  const { user } = useAuthStore();
  const editingId = transaction?.id;

  const [form, setForm] = useState<FormState>({
    type: (transaction?.type as "expense" | "income") ?? "expense",
    amount: transaction?.amount?.toString() ?? "",
    destinatary: transaction?.destinatary ?? "",
    origin: transaction?.origin ?? "",
    categoryId: transaction?.categoryId ?? "",
  });
  const [saving, setSaving] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === form.type);

  const handleSave = async () => {
    if (!form.amount || isNaN(Number(form.amount))) {
      Alert.alert("Error", "Ingresa un monto válido");
      return;
    }
    if (!user?.id) return;

    setSaving(true);
    const payload = {
      type: form.type,
      amount: parseFloat(form.amount),
      destinatary: form.destinatary,
      origin: form.origin || null,
      categoryId: form.categoryId || null,
      userId: user.id,
    };

    const { error } = editingId
      ? await supabase.from("transactions").update(payload).eq("id", editingId)
      : await supabase.from("transactions").insert(payload);

    setSaving(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      onSaveSuccess(); // cierra modal y recarga datos
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {editingId ? "Editar transacción" : "Nueva transacción"}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <AntDesign name="close" size={24} color={Colors.neutral.gray500} />
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

        <Field
          label="Monto"
          keyboardType="decimal-pad"
          value={form.amount}
          onChangeText={(v) => setForm((f) => ({ ...f, amount: v }))}
          placeholder="S/ 0.00"
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
          placeholder="ej. Efectivo"
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral.gray900,
  },
  scroll: { flex: 1 },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral.gray700,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.neutral.gray900,
    backgroundColor: Colors.neutral.gray50,
  },
  toggleRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
  },
  toggleButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral.gray500,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
    marginRight: Spacing.sm,
  },
  categoryChipText: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray500,
  },
  noCategoriesMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.neutral.gray50,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  noCategoriesText: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray400,
  },
  saveButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  saveButtonText: {
    color: "white",
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
