import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import {
    borderRadius,
    colors,
    shadows,
    spacing
} from "../constants/theme";

type HomeCardProps = {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
};

export function HomeCard({ title, description, icon, onPress }: HomeCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scaleAnim, {
      toValue: value,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={onPress}
        onPressIn={() => animateTo(0.985)}
        onPressOut={() => animateTo(1)}
      >
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    padding: spacing.md,
    ...shadows.card,
  },
  cardPressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.chipBg,
  },
  icon: {
    fontSize: 21,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  description: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 26,
    lineHeight: 30,
    color: "#7C99B8",
  },
});
