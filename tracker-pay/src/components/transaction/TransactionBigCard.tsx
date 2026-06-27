// TransactionBigCard.tsx
import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

export type TransactionBigCardProps = {
  title: string;
  label: string;
  icon: string;
  color?: string;
};

export default function TransactionBigCard({
  title,
  label,
  icon,
  color = Colors.primary.main,
}: TransactionBigCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text numberOfLines={1} style={[styles.title, { color: color }]}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: Colors.neutral.gray500,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
});
