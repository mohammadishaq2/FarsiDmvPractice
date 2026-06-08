import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type QuestionCardProps = {
  questionNumber: number;
  questionText: string;
  children?: ReactNode;
};

export function QuestionCard({
  questionNumber,
  questionText,
  children,
}: QuestionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.badge}>Question {questionNumber}</Text>
      <Text style={styles.questionText}>{questionText}</Text>
      {children ? <View style={styles.answers}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: "700",
    color: "#2265A8",
    backgroundColor: "#E9F3FF",
  },
  questionText: {
    marginTop: 10,
    fontSize: 18,
    lineHeight: 27,
    color: "#16324F",
    fontWeight: "700",
  },
  answers: {
    marginTop: 14,
    gap: 10,
  },
});
