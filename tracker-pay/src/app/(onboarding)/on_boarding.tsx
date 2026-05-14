// app/(onboarding)/on_boarding.tsx
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from "@/constants/theme";
import { useAuthStore } from "@/utils/authStore";
import { supabase } from "@/utils/supabase";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type Step = 1 | 2 | 3;

export default function OnboardingScreen() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [salary, setSalary] = useState("");
  const [spendingLimit, setSpendingLimit] = useState("");
  const [loading, setLoading] = useState(false);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  const handleNext = () => {
    Keyboard.dismiss(); // Ocultar teclado al cambiar de paso
    if (step === 1) {
      if (!salary || isNaN(Number(salary)) || Number(salary) <= 0) {
        Alert.alert("Ingreso inválido", "Por favor ingresa un salario válido.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (
        !spendingLimit ||
        isNaN(Number(spendingLimit)) ||
        Number(spendingLimit) <= 0
      ) {
        Alert.alert(
          "Límite inválido",
          "Por favor ingresa un límite de gasto válido.",
        );
        return;
      }
      if (Number(spendingLimit) > Number(salary)) {
        Alert.alert(
          "Atención",
          "Tu límite de gasto no debería superar tu salario.",
        );
        return;
      }
      setStep(3);
    }
  };

  const handleFinish = async () => {
    if (!user?.id) return;
    Keyboard.dismiss();

    console.log("Guardando para usuario UUID:", user.id);

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          monthly_income: Number(salary),
          monthly_spending_limit: Number(spendingLimit),
          salary: Number(salary),
          spending_limit: Number(spendingLimit),
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (error) throw error;
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "No se pudo guardar tu perfil.");
    } finally {
      setLoading(false);
    }
  };

  const progress = step / 3;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.stepLabel}>Paso {step} de 3</Text>

          {/* Step 1: Welcome */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="hand-wave"
                  size={40}
                  color={Colors.primary.main}
                />
              </View>
              <Text style={styles.heading}>¡Hola, {firstName}!</Text>
              <Text style={styles.subheading}>
                Configura tu perfil financiero para comenzar a tomar el control
                de tu dinero.
              </Text>
              <Text style={styles.label}>¿Cuánto ganas al mes?</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>S/</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={Colors.neutral.gray400}
                  keyboardType="decimal-pad"
                  value={salary}
                  onChangeText={setSalary}
                  returnKeyType="done"
                  onSubmitEditing={handleNext}
                />
              </View>
              <Text style={styles.hint}>
                Este dato nos ayuda a calcular tu margen disponible.
              </Text>
            </View>
          )}

          {/* Step 2: Spending limit */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="piggy-bank"
                  size={40}
                  color={Colors.primary.main}
                />
              </View>
              <Text style={styles.heading}>Tu límite de gasto</Text>
              <Text style={styles.subheading}>
                Define cuánto quieres gastar como máximo al mes. Te avisaremos
                cuando te acerques.
              </Text>

              {/* Salary chip */}
              <View style={styles.referenceChip}>
                <MaterialCommunityIcons
                  name="cash"
                  size={16}
                  color={Colors.primary.main}
                />
                <Text style={styles.referenceChipText}>
                  Tu ingreso mensual:{" "}
                  <Text style={styles.referenceChipAmount}>
                    S/{" "}
                    {Number(salary).toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </Text>
              </View>

              <Text style={styles.label}>Límite de gasto mensual</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>S/</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={Colors.neutral.gray400}
                  keyboardType="decimal-pad"
                  value={spendingLimit}
                  onChangeText={setSpendingLimit}
                  returnKeyType="done"
                  onSubmitEditing={handleNext}
                />
              </View>

              {/* Percentage indicator */}
              {spendingLimit && salary && Number(salary) > 0 && (
                <View style={styles.percentageRow}>
                  <View style={styles.percentageBarTrack}>
                    <View
                      style={[
                        styles.percentageBarFill,
                        {
                          width: `${Math.min((Number(spendingLimit) / Number(salary)) * 100, 100)}%`,
                          backgroundColor:
                            Number(spendingLimit) / Number(salary) > 0.9
                              ? Colors.accent.expense
                              : Colors.accent.income,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.percentageLabel}>
                    {Math.round((Number(spendingLimit) / Number(salary)) * 100)}
                    % de tu ingreso
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Step 3: Summary */}
          {step === 3 && (
            <View style={styles.stepContainer}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={40}
                  color={Colors.accent.income}
                />
              </View>
              <Text style={styles.heading}>¡Todo listo!</Text>
              <Text style={styles.subheading}>
                Revisa tu configuración antes de empezar.
              </Text>

              <View style={styles.summaryCard}>
                <SummaryRow
                  icon="cash-multiple"
                  label="Ingreso mensual"
                  value={`S/ ${Number(salary).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`}
                  color={Colors.accent.income}
                />
                <View style={styles.divider} />
                <SummaryRow
                  icon="wallet"
                  label="Límite de gasto"
                  value={`S/ ${Number(spendingLimit).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`}
                  color={Colors.primary.main}
                />
                <View style={styles.divider} />
                <SummaryRow
                  icon="piggy-bank"
                  label="Ahorro estimado"
                  value={`S/ ${(Number(salary) - Number(spendingLimit)).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`}
                  color={Colors.accent.income}
                />
              </View>

              <Text style={styles.hint}>
                Puedes actualizar estos valores en cualquier momento desde tu
                perfil.
              </Text>
            </View>
          )}

          {/* CTA Buttons */}
          <View style={styles.buttonGroup}>
            {step > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  Keyboard.dismiss();
                  setStep((prev) => (prev - 1) as Step);
                }}
              >
                <Text style={styles.backButtonText}>Atrás</Text>
              </TouchableOpacity>
            )}

            {step < 3 ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleNext}
              >
                <Text style={styles.primaryButtonText}>Continuar</Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleFinish}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Comenzar</Text>
                    <MaterialCommunityIcons
                      name="rocket-launch"
                      size={20}
                      color="white"
                    />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={summaryStyles.row}>
      <View style={[summaryStyles.iconBg, { backgroundColor: color + "20" }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={color} />
      </View>
      <View style={summaryStyles.textGroup}>
        <Text style={summaryStyles.label}>{label}</Text>
        <Text style={[summaryStyles.value, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  textGroup: { flex: 1 },
  label: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray500,
    marginBottom: 2,
  },
  value: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    backgroundColor: Colors.primary.background,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.full,
  },
  stepLabel: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray500,
    marginBottom: Spacing.xxxl,
    textAlign: "right",
  },
  stepContainer: {
    flex: 1,
    alignItems: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary.soft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  heading: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.neutral.gray900,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subheading: {
    fontSize: FontSize.base,
    color: Colors.neutral.gray500,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.md,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral.gray700,
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral.gray50,
    borderWidth: 1.5,
    borderColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    width: "100%",
    height: 56,
    ...Shadow.sm,
  },
  currencySymbol: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary.main,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral.gray900,
    padding: 0,
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.neutral.gray400,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  referenceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.primary.soft,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  referenceChipText: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray700,
  },
  referenceChipAmount: {
    fontWeight: FontWeight.bold,
    color: Colors.primary.dark,
  },
  percentageRow: {
    width: "100%",
    marginTop: Spacing.lg,
  },
  percentageBarTrack: {
    height: 8,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    marginBottom: Spacing.xs,
  },
  percentageBarFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  percentageLabel: {
    fontSize: FontSize.xs,
    color: Colors.neutral.gray500,
    textAlign: "right",
  },
  summaryCard: {
    width: "100%",
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadow.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral.gray100,
    marginVertical: Spacing.xs,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xxl,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    gap: Spacing.sm,
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.lg,
  },
  primaryButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: "white",
  },
  buttonDisabled: {
    backgroundColor: Colors.primary.main + "80",
  },
  backButton: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.neutral.gray300,
  },
  backButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
