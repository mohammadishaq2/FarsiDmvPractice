import { Pressable, StyleSheet, Text, View } from "react-native";

type AnswerOptionProps = {
  label: string;
  isSelected?: boolean;
  isCorrect?: boolean;
  onPress?: () => void;
};

export function AnswerOption({
  label,
  isSelected = false,
  isCorrect,
  onPress,
}: AnswerOptionProps) {
  const stateStyle =
    isCorrect === true
      ? styles.correct
      : isCorrect === false && isSelected
        ? styles.wrong
        : isSelected
          ? styles.selected
          : undefined;

  return (
    <Pressable style={[styles.option, stateStyle]} onPress={onPress}>
      <View style={[styles.dot, isSelected && styles.dotActive]} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D5E5F7",
    backgroundColor: "#F9FCFF",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selected: {
    borderColor: "#1F7AE0",
    backgroundColor: "#EDF5FF",
  },
  correct: {
    borderColor: "#24A06E",
    backgroundColor: "#EAF9F2",
  },
  wrong: {
    borderColor: "#D24D4D",
    backgroundColor: "#FCEEEE",
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#88A5C3",
  },
  dotActive: {
    borderColor: "#1F7AE0",
    backgroundColor: "#1F7AE0",
  },
  label: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#173958",
    fontWeight: "600",
  },
});
