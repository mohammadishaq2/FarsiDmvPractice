import { StyleSheet, View } from "react-native";

import { colors } from "../constants/theme";

type ProgressBarProps = {
  value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${safeValue}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    height: 10,
    backgroundColor: "#D8E7F8",
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.success,
    borderRadius: 999,
  },
});
