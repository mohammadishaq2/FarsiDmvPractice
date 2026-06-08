import { StyleSheet, Text, View } from "react-native";

import { borderRadius, colors, shadows, spacing } from "../constants/theme";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: string;
};

export function EmptyState({
  title,
  description,
  icon = "📘",
}: EmptyStateProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    padding: spacing.xl,
    alignItems: "center",
    ...shadows.card,
  },
  icon: {
    fontSize: 32,
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
  },
  description: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 21,
  },
});
