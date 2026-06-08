import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { borderRadius, colors, spacing, typography } from "../constants/theme";

type AppHeaderProps = {
  titleEn: string;
  titleFa: string;
  subtitleEn?: string;
  subtitleFa?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  onBackPress?: () => void;
  onHomePress?: () => void;
};

export function AppHeader({
  titleEn,
  titleFa,
  subtitleEn,
  subtitleFa,
  showBackButton = false,
  showHomeButton = false,
  onBackPress,
  onHomePress,
}: AppHeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    router.back();
  };

  const handleHomePress = () => {
    if (onHomePress) {
      onHomePress();
      return;
    }

    router.replace("/");
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.leftWrap}>
          {showBackButton ? (
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={handleBackPress}
            >
              <Text style={styles.iconText}>←</Text>
            </Pressable>
          ) : (
            <View style={styles.iconSpacer} />
          )}
        </View>

        <View style={styles.centerWrap}>
          <Text style={styles.titleEn}>{titleEn}</Text>
          <Text style={styles.titleFa}>{titleFa}</Text>
          {subtitleEn ? (
            <Text style={styles.subtitleEn}>{subtitleEn}</Text>
          ) : null}
          {subtitleFa ? (
            <Text style={styles.subtitleFa}>{subtitleFa}</Text>
          ) : null}
        </View>

        <View style={styles.rightWrap}>
          {showHomeButton ? (
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go to home screen"
              onPress={handleHomePress}
            >
              <Text style={styles.iconText}>⌂</Text>
            </Pressable>
          ) : (
            <View style={styles.iconSpacer} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#E8F1FB",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: 6,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
    backgroundColor: "#E8F1FB",
  },
  leftWrap: {
    width: 50,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  rightWrap: {
    width: 50,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D6E5F5",
  },
  iconButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
  iconSpacer: {
    width: 44,
    height: 44,
  },
  iconText: {
    fontSize: 21,
    lineHeight: 24,
    color: colors.textPrimary,
    fontWeight: "800",
  },
  titleEn: {
    ...typography.title,
    fontSize: 22,
    lineHeight: 28,
    color: colors.textPrimary,
    textAlign: "left",
    writingDirection: "ltr",
    alignSelf: "stretch",
  },
  titleFa: {
    marginTop: 2,
    fontSize: 16,
    lineHeight: 23,
    color: "#1D4B74",
    fontWeight: "700",
    textAlign: "right",
    writingDirection: "rtl",
    alignSelf: "stretch",
  },
  subtitleEn: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#335F88",
    textAlign: "left",
    writingDirection: "ltr",
    alignSelf: "stretch",
  },
  subtitleFa: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 18,
    color: "#456E92",
    textAlign: "right",
    writingDirection: "rtl",
    alignSelf: "stretch",
  },
});
