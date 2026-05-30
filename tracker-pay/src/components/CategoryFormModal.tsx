import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from "@/constants/theme";
import { Database } from "@/services/db/schema";
import { useAuthStore } from "@/stores/authStore";
import { useModal } from "@/stores/modalStore";
import { supabase } from "@/stores/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";

type Category = Database["public"]["Tables"]["category"]["Row"];

type CategoryForm = {
  name: string;
  description: string;
  icon: string;
  color: string;
  limit_amount: string;
  limit_interval: "monthly" | "weekly" | "daily";
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

const EMPTY_FORM: CategoryForm = {
  name: "",
  description: "",
  icon: "wallet",
  color: Colors.primary.main,
  limit_amount: "",
  limit_interval: "monthly",
};

interface CategoryFormModalProps {
  category?: Category | null;
  onSaveSuccess: () => void;
}

export function CategoryFormModal({
  category,
  onSaveSuccess,
}: CategoryFormModalProps) {
  const { user } = useAuthStore();
  const { closeModal } = useModal();
  const [form, setForm] = useState<CategoryForm>(
    category
      ? {
          name: category.name,
          description: category.description ?? "",
          icon: category.icon ?? "wallet",
          color: category.color ?? Colors.primary.main,
          limit_amount: category.limit_amount?.toString() ?? "",
          limit_interval:
            (category.limit_interval as CategoryForm["limit_interval"]) ??
            "monthly",
        }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

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
    if (category?.id) {
      ({ error } = await supabase
        .from("category")
        .update(payload)
        .eq("id", category.id));
    } else {
      ({ error } = await supabase.from("category").insert(payload));
    }

    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    closeModal();
    onSaveSuccess();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {category ? "Editar categoria" : "Nueva categoria"}
        </Text>
        <TouchableOpacity onPress={closeModal}>
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
          style={styles.scroll}
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
                  color={
                    form.icon === key ? form.color : Colors.neutral.gray400
                  }
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
                {category ? "Guardar cambios" : "Crear categoria"}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  container: { flex: 1, backgroundColor: Colors.primary.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral.gray900,
  },
  scroll: {
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
