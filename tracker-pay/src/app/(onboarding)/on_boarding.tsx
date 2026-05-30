// app/(onboarding)/on_boarding.tsx
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from "@/constants/theme";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/stores/supabase";
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
          <View>
            <Text style={styles.stepLabel}>Paso {step} de 3</Text>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
          </View>

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
              <View style={styles.wrapContainer}>
                <Text style={styles.heading}>
                  ¡Hola, {firstName.toUpperCase()}!
                </Text>
                <Text style={styles.subheading}>
                  Configura tu perfil financiero para comenzar a tomar el
                  control de tu dinero.
                </Text>
              </View>
              <View style={styles.wrapTopContainer}>
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
                  Usaremos esto para calcular tus presupuestos sugeridos.
                </Text>
              </View>
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
              <View style={styles.wrapContainer}>
                <Text style={styles.heading}>Tu límite de gasto</Text>
                <Text style={styles.subheading}>
                  Define cuánto quieres gastar como máximo al mes. Te avisaremos
                  cuando te acerques.
                </Text>
              </View>

              {/* Salary chip */}
              <View style={styles.referenceChip}>
                <MaterialCommunityIcons
                  name="cash"
                  size={20}
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

              <View style={styles.wrapTopContainer}>
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
              <View
                style={{
                  backgroundColor: "#E6F3EF",
                  padding: Spacing.lg,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "#006947", fontSize: FontSize.sm }}>
                  Recomendamos no exceder el 80% de tus ingresos para mantener
                  una buena salud financiera.
                </Text>
              </View>
            </View>
          )}

          {/* Step 3: Summary */}
          {step === 3 && (
            <View style={styles.stepContainer}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={40}
                  color={Colors.primary.main}
                />
              </View>
              <View style={styles.wrapContainer}>
                <Text style={styles.heading}>¡Todo listo!</Text>
                <Text style={styles.subheading}>
                  Revisa tu configuración antes de empezar.
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <SummaryRow
                  icon="cash-multiple"
                  label="Ingreso mensual"
                  value={`S/ ${Number(salary).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`}
                  color={Colors.primary.main}
                />
                <SummaryRow
                  icon="wallet"
                  label="Límite de gasto"
                  value={`S/ ${Number(spendingLimit).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`}
                  color={Colors.primary.main}
                />
                <SummaryRow
                  icon="piggy-bank"
                  label="Ahorro estimado"
                  value={`S/ ${(Number(salary) - Number(spendingLimit)).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`}
                  color={Colors.primary.main}
                  variant="highlight"
                />
                <Text style={styles.hint}>
                  Puedes actualizar estos valores en cualquier momento desde tu
                  perfil.
                </Text>
              </View>
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
  variant = "default",
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  variant?: "default" | "highlight";
}) {
  const variantStyles = {
    default: {
      container: {},
      label: {},
      value: {},
    },
    highlight: {
      container: { backgroundColor: "#3282DE" },
      label: { color: "white" },
      value: { color: "white" },
      iconBg: { backgroundColor: "white" },
    },
  };

  return (
    <View style={[summaryStyles.row, variantStyles[variant].container]}>
      <View
        style={[
          summaryStyles.iconBg,
          variant === "highlight"
            ? variantStyles.highlight.iconBg
            : { backgroundColor: color + "20" },
        ]}
      >
        <MaterialCommunityIcons name={icon as any} size={20} color={color} />
      </View>
      <View style={summaryStyles.textGroup}>
        <Text style={[summaryStyles.label, variantStyles[variant].label]}>
          {label}
        </Text>
        <Text style={[summaryStyles.value, variantStyles[variant].value]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.lg,
    borderColor: "#C2C6D64D",
    borderWidth: 1,
    borderRadius: 8,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  textGroup: { flex: 1 },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral.gray500,
  },
  value: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
  },
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
    gap: Spacing.xxxl,
    backgroundColor: Colors.primary.background,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.full,
  },
  stepLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
    color: Colors.neutral.gray500,
    textAlign: "right",
  },
  stepContainer: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.xxl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary.soft,
    justifyContent: "center",
    alignItems: "center",
  },
  wrapContainer: {
    gap: Spacing.sm,
  },
  wrapTopContainer: {
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  heading: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    lineHeight: 32,
    color: Colors.neutral.gray900,
    textAlign: "center",
  },
  subheading: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    color: Colors.neutral.gray500,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 18,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.neutral.gray700,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral.gray50,
    borderRadius: 8,
    padding: Spacing.lg,
    width: "100%",
    height: 56,
  },
  currencySymbol: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.neutral.gray500,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral.gray500,
    padding: 0,
  },
  hint: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray400,
    fontWeight: FontWeight.regular,
  },
  referenceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.primary.soft,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  referenceChipText: {
    fontSize: FontSize.base,
    color: Colors.neutral.gray700,
    fontWeight: FontWeight.semibold,
  },
  referenceChipAmount: {
    fontWeight: FontWeight.semibold,
    color: Colors.primary.dark,
  },
  percentageRow: {
    width: "100%",
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
    fontSize: FontSize.sm,
    color: Colors.neutral.gray500,
    textAlign: "right",
  },
  summaryCard: {
    width: "100%",
    gap: 8,
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
    justifyContent: "center",
    borderRadius: 6,
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.lg,
  },
  primaryButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: "white",
  },
  buttonDisabled: {
    backgroundColor: Colors.primary.main + "80",
  },
  backButton: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxxl,
    borderRadius: 6,
    backgroundColor: "#E8EEFF",
  },
  backButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: "#0058BE",
  },
});
