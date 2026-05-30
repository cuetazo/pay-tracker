// app/(tabs)/account.tsx
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  getColors,
  Shadow,
  Spacing,
} from "@/constants/theme";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { supabase } from "@/stores/supabase";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function AccountScreen() {
  const { user, SignOut } = useAuthStore();
  const { isDarkMode, setDarkMode } = useThemeStore();
  const c = getColors(isDarkMode);

  // Profile data from Supabase
  const [spendingLimit, setSpendingLimit] = useState<number | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [editingField, setEditingField] = useState<
    "spending_limit" | "monthly_income" | null
  >(null);
  const [saving, setSaving] = useState(false);

  // ── Fetch profile ─────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("monthly_spending_limit, monthly_income, salary, spending_limit")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setSpendingLimit(data.monthly_spending_limit ?? data.spending_limit ?? 0);
      setMonthlyIncome(data.monthly_income ?? data.salary ?? 0);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ── Save handler ──────────────────────────────────────────────────
  const handleSave = async (value: string) => {
    if (!user?.id || !editingField) return;
    setSaving(true);

    const numValue = Number(value);

    // Build the update payload depending on which field we're editing
    const updatePayload =
      editingField === "spending_limit"
        ? { monthly_spending_limit: numValue, spending_limit: numValue }
        : { monthly_income: numValue, salary: numValue };

    const { error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    // Update local state
    if (editingField === "spending_limit") {
      setSpendingLimit(numValue);
    } else {
      setMonthlyIncome(numValue);
    }

    setEditingField(null);
  };

  const fmt = (n: number | null) =>
    n != null
      ? `S/ ${n.toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
      : "—";

  return (
    <View style={[styles.safeArea, { backgroundColor: c.primary.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header / Profile ──────────────────────────────────────── */}
        <View style={styles.profileSection}>
          {user?.photo ? (
            <Image
              source={{ uri: user.photo }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View
              style={[
                styles.avatar,
                styles.avatarPlaceholder,
                { backgroundColor: c.neutral.gray100, borderColor: c.neutral.gray200 },
              ]}
            >
              <Feather name="user" size={40} color={c.neutral.gray400} />
            </View>
          )}

          <Text style={[styles.userName, { color: c.neutral.gray900 }]}>
            {user?.name ?? "Usuario"}
          </Text>
          <Text style={[styles.userEmail, { color: c.neutral.gray400 }]}>
            {user?.email ?? ""}
          </Text>
        </View>

        {/* ── Settings ──────────────────────────────────────────────── */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: c.neutral.gray900 }]}>
            Ajustes
          </Text>

          <View
            style={[
              styles.settingsCard,
              {
                backgroundColor: c.neutral.white === "#0F172A" ? "#1E293B" : Colors.neutral.white,
              },
            ]}
          >
            <SettingsItem
              colors={c}
              icon={
                <MaterialCommunityIcons
                  name="circle-edit-outline"
                  size={22}
                  color={c.neutral.gray700}
                />
              }
              label="Editar limite de gastos"
              subtitle={loading ? "Cargando..." : fmt(spendingLimit)}
              onPress={() => setEditingField("spending_limit")}
            />

            <View style={[styles.divider, { backgroundColor: c.neutral.gray200 }]} />

            <SettingsItem
              colors={c}
              icon={
                <MaterialCommunityIcons
                  name="cash-edit"
                  size={22}
                  color={c.neutral.gray700}
                />
              }
              label="Editar saldo actual"
              subtitle={loading ? "Cargando..." : fmt(monthlyIncome)}
              onPress={() => setEditingField("monthly_income")}
            />

            <View style={[styles.divider, { backgroundColor: c.neutral.gray200 }]} />

            <SettingsItem
              colors={c}
              icon={
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={c.neutral.gray700}
                />
              }
              label="Notificaciones"
              onPress={() => { }}
            />

            <View style={[styles.divider, { backgroundColor: c.neutral.gray200 }]} />

            <SettingsItem
              colors={c}
              icon={
                <Ionicons
                  name="moon-outline"
                  size={22}
                  color={c.neutral.gray700}
                />
              }
              label="Tema Oscuro"
              trailing={
                <Switch
                  value={isDarkMode}
                  onValueChange={setDarkMode}
                  trackColor={{
                    false: Colors.neutral.gray300,
                    true: Colors.primary.main,
                  }}
                  thumbColor={Colors.neutral.white}
                />
              }
            />
          </View>
        </View>

        {/* ── Sign out ──────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.signOutButton}
          activeOpacity={0.8}
          onPress={SignOut}
        >
          <Text style={styles.signOutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Edit Modals ─────────────────────────────────────────────── */}
      <EditModal
        visible={editingField === "spending_limit"}
        title="Editar limite de gastos"
        label="Nuevo límite mensual"
        currentValue={spendingLimit?.toString() ?? ""}
        onSave={handleSave}
        onClose={() => setEditingField(null)}
        saving={saving}
      />
      <EditModal
        visible={editingField === "monthly_income"}
        title="Editar saldo actual"
        label="Nuevo ingreso mensual"
        currentValue={monthlyIncome?.toString() ?? ""}
        onSave={handleSave}
        onClose={() => setEditingField(null)}
        saving={saving}
      />
    </View>
  );
}


type SettingsItemProps = {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  colors: ReturnType<typeof getColors>;
};

type EditModalProps = {
  visible: boolean;
  title: string;
  label: string;
  currentValue: string;
  onSave: (value: string) => Promise<void>;
  onClose: () => void;
  saving: boolean;
};

function EditModal({
  visible,
  title,
  label,
  currentValue,
  onSave,
  onClose,
  saving,
}: EditModalProps) {
  const [value, setValue] = useState(currentValue);
  const { isDarkMode } = useThemeStore();
  const c = getColors(isDarkMode);

  // Sync when modal opens with a new value
  useEffect(() => {
    if (visible) setValue(currentValue);
  }, [visible, currentValue]);

  if (!visible) return null;

  const handleSave = () => {
    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      Alert.alert("Valor inválido", "Por favor ingresa un número válido.");
      return;
    }
    onSave(value);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={modalStyles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={[modalStyles.card, { backgroundColor: c.neutral.white === "#0F172A" ? "#1E293B" : Colors.neutral.white }]}>
            {/* Header */}
            <View style={modalStyles.header}>
              <Text style={[modalStyles.title, { color: c.neutral.gray900 }]}>{title}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={12}>
                <Feather name="x" size={22} color={c.neutral.gray400} />
              </TouchableOpacity>
            </View>

            {/* Input */}
            <Text style={[modalStyles.label, { color: c.neutral.gray700 }]}>{label}</Text>
            <View style={[modalStyles.inputWrapper, { backgroundColor: c.neutral.gray50 }]}>
              <Text style={[modalStyles.currency, { color: c.neutral.gray500 }]}>S/</Text>
              <TextInput
                style={[modalStyles.input, { color: c.neutral.gray900 }]}
                keyboardType="decimal-pad"
                value={value}
                onChangeText={setValue}
                placeholder="0.00"
                placeholderTextColor={c.neutral.gray400}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </View>

            {/* Buttons */}
            <View style={modalStyles.buttonRow}>
              <TouchableOpacity
                style={[modalStyles.cancelBtn, { backgroundColor: c.neutral.gray100 }]}
                onPress={onClose}
              >
                <Text style={[modalStyles.cancelText, { color: c.neutral.gray700 }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  modalStyles.saveBtn,
                  saving && { opacity: 0.6 },
                ]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={modalStyles.saveText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

function SettingsItem({
  icon,
  label,
  subtitle,
  onPress,
  trailing,
  colors: c,
}: SettingsItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingsItem}
      activeOpacity={0.6}
      onPress={onPress}
      disabled={!onPress && !trailing}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.settingsIconContainer}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.settingsLabel, { color: c.neutral.gray700 }]}>
            {label}
          </Text>
          {subtitle && (
            <Text style={[styles.settingsSubtitle, { color: c.neutral.gray400 }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {trailing ?? (
        <Feather name="chevron-right" size={20} color={c.neutral.gray400} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl * 2,
  },

  // ── Profile ───────────────────────────────────────────────────────
  profileSection: {
    alignItems: "center",
    paddingTop: Spacing.xxxl * 2,
    paddingBottom: Spacing.xxl,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: Spacing.lg,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  userName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: FontSize.base,
  },

  // ── Settings ──────────────────────────────────────────────────────
  settingsSection: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
  },
  settingsCard: {
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.sm,
    ...Shadow.md,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  settingsIconContainer: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
  settingsSubtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.xl + 32 + Spacing.md,
  },

  // ── Sign out ──────────────────────────────────────────────────────
  signOutButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    marginTop: Spacing.md,
    ...Shadow.md,
  },
  signOutText: {
    color: "#FFFFFF",
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});

// ────────────────────────────────────────────────────────────────────────────
// Styles — edit modal
// ────────────────────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  card: {
    width: 320,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadow.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    height: 52,
    marginBottom: Spacing.lg,
  },
  currency: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    padding: 0,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  cancelText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    backgroundColor: Colors.primary.main,
  },
  saveText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: "#FFFFFF",
  },
});
