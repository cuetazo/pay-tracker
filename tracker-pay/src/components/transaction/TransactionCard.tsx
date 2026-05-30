// components/transaction/TransactionCard.tsx
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from "@/constants/theme";
import { useAppColors } from "@/hooks/useAppColors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  amount: number;
  transaction_type: "income" | "expense";
  category: string;
  destinatary: string;
  date?: string;
  /** When true, renders without card background/shadow/margin (for use inside other cards) */
  flat?: boolean;
};

export default function TransactionCard({
  amount,
  transaction_type,
  category,
  destinatary,
  date,
  flat = false,
}: Props) {
  const c = useAppColors();
  const isIncome = transaction_type === "income";

  const fmt = (n: number) =>
    `S/ ${Math.abs(n).toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const cardBg =
    c.neutral.white === "#0F172A" ? "#1E293B" : Colors.neutral.white;

  return (
    <View
      style={[
        styles.card,
        !flat && { backgroundColor: cardBg },
        flat && styles.cardFlat,
      ]}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconBg,
          {
            backgroundColor: isIncome
              ? c.accent.income + "22"
              : c.accent.expense + "22",
          },
        ]}
      >
        <MaterialCommunityIcons
          name={isIncome ? "arrow-down-left" : "arrow-up-right"}
          size={22}
          color={isIncome ? c.accent.income : c.accent.expense}
        />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.destinatary, { color: c.neutral.gray900 }]} numberOfLines={1}>
          {destinatary}
        </Text>
        <Text style={[styles.meta, { color: c.neutral.gray400 }]} numberOfLines={1}>
          {date ? `${date} · ` : ""}
          {category}
        </Text>
      </View>

      {/* Amount */}
      <Text
        style={[
          styles.amount,
          { color: isIncome ? c.accent.income : c.accent.expense },
        ]}
      >
        {isIncome ? "+ " : "- "}
        {fmt(amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadow.md,
  },
  cardFlat: {
    backgroundColor: "transparent",
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: Spacing.sm,
    marginBottom: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },

  container__icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  destinatary: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  meta: {
    fontSize: FontSize.sm,
  },
  amount: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
});
