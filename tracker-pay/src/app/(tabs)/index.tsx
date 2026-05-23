// app/(protected)/profile.tsx
import {
    BorderRadius,
    Colors,
    FontSize,
    FontWeight,
    Spacing,
} from "@/constants/theme";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/stores/supabase";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Profile = {
  monthly_income: number;
  monthly_spending_limit: number;
  current_month_spending: number;
  onboarding_completed: boolean;
};

export default function ProfileScreen() {
  const { user, SignOut } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "monthly_income, monthly_spending_limit, current_month_spending, onboarding_completed",
      )
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const remainingBudget = profile
    ? profile.monthly_spending_limit - profile.current_month_spending
    : 0;

  const percentUsed =
    profile && profile.monthly_spending_limit > 0
      ? (profile.current_month_spending / profile.monthly_spending_limit) * 100
      : 0;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          {user?.photo ? (
            <Text style={styles.avatarText}>{user.name?.charAt(0)}</Text>
          ) : (
            <MaterialCommunityIcons
              name="account"
              size={50}
              color={Colors.primary.main}
            />
          )}
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="cash"
            size={24}
            color={Colors.accent.income}
          />
          <Text style={styles.statLabel}>Ingreso Mensual</Text>
          <Text style={styles.statValue}>
            S/{" "}
            {profile?.monthly_income?.toLocaleString("es-PE", {
              minimumFractionDigits: 2,
            }) ?? 0}
          </Text>
        </View>

        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="wallet"
            size={24}
            color={Colors.primary.main}
          />
          <Text style={styles.statLabel}>Límite de Gasto</Text>
          <Text style={styles.statValue}>
            S/{" "}
            {profile?.monthly_spending_limit?.toLocaleString("es-PE", {
              minimumFractionDigits: 2,
            }) ?? 0}
          </Text>
        </View>

        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="trending-down"
            size={24}
            color={Colors.accent.expense}
          />
          <Text style={styles.statLabel}>Gastado este mes</Text>
          <Text style={styles.statValue}>
            S/{" "}
            {profile?.current_month_spending?.toLocaleString("es-PE", {
              minimumFractionDigits: 2,
            }) ?? 0}
          </Text>
        </View>

        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="piggy-bank"
            size={24}
            color={Colors.accent.income}
          />
          <Text style={styles.statLabel}>Presupuesto Restante</Text>
          <Text
            style={[
              styles.statValue,
              remainingBudget < 0 && { color: Colors.accent.expense },
            ]}
          >
            S/{" "}
            {remainingBudget.toLocaleString("es-PE", {
              minimumFractionDigits: 2,
            })}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>
          Progreso del presupuesto mensual
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(percentUsed, 100)}%`,
                backgroundColor:
                  percentUsed > 90
                    ? Colors.accent.expense
                    : Colors.accent.income,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{percentUsed.toFixed(1)}% usado</Text>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={SignOut}>
        <MaterialCommunityIcons name="logout" size={20} color="white" />
        <Text style={styles.signOutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    padding: Spacing.xxl,
    backgroundColor: Colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary.soft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: Colors.primary.main,
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray500,
  },
  statsContainer: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  statCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  statLabel: {
    flex: 1,
    fontSize: FontSize.sm,
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neutral.gray900,
  },
  progressSection: {
    backgroundColor: Colors.neutral.white,
    margin: Spacing.xl,
    marginTop: 0,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  progressLabel: {
    fontSize: FontSize.sm,
    color: Colors.neutral.gray700,
    marginBottom: Spacing.md,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  progressText: {
    fontSize: FontSize.xs,
    color: Colors.neutral.gray500,
    marginTop: Spacing.xs,
    textAlign: "right",
  },
  signOutButton: {
    flexDirection: "row",
    backgroundColor: Colors.accent.expense,
    margin: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  signOutText: {
    color: Colors.neutral.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
