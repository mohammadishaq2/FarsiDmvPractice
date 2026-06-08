import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { AppHeader } from "../components/AppHeader";
import { DmvQuestion, getAllQuestions } from "../utils/questionUtils";
import {
    clearWrongQuestions,
    getWrongQuestionIds,
    removeWrongQuestion,
} from "../utils/storageUtils";

export default function WrongAnswersScreen() {
  const router = useRouter();
  const allQuestions = useMemo(() => getAllQuestions(), []);
  const [wrongQuestions, setWrongQuestions] = useState<DmvQuestion[]>([]);

  const loadWrongQuestions = useCallback(async () => {
    const wrongIds = await getWrongQuestionIds();
    const mapped = wrongIds
      .map((id) =>
        allQuestions.find((question) => String(question.id) === String(id)),
      )
      .filter((question): question is DmvQuestion => Boolean(question));

    setWrongQuestions(mapped);
  }, [allQuestions]);

  useFocusEffect(
    useCallback(() => {
      void loadWrongQuestions();
    }, [loadWrongQuestions]),
  );

  const handleRemove = async (questionId: number) => {
    const nextIds = await removeWrongQuestion(questionId);
    setWrongQuestions(
      nextIds
        .map((id) =>
          allQuestions.find((question) => String(question.id) === String(id)),
        )
        .filter((question): question is DmvQuestion => Boolean(question)),
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear Wrong Answers",
      "Remove all wrong answers from review list?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await clearWrongQuestions();
            setWrongQuestions([]);
          },
        },
      ],
    );
  };

  const startWrongPractice = () => {
    const ids = wrongQuestions.map((question) => String(question.id)).join(",");
    router.push({
      pathname: "/practice",
      params: { mode: "wrong", ids },
    });
  };

  return (
    <View style={styles.container}>
      <AppHeader
        titleEn="Wrong Answers"
        titleFa="پاسخ های اشتباه"
        subtitleEn="Your mistake bank for smart repetition"
        subtitleFa="بانک اشتباهات شما برای مرور هوشمند"
        showBackButton
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Text style={styles.countText}>
            Questions: {wrongQuestions.length}
          </Text>

          {wrongQuestions.length > 0 ? (
            <Pressable
              style={({ pressed }) => [
                styles.clearButton,
                pressed && styles.pressed,
              ]}
              onPress={handleClearAll}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </Pressable>
          ) : null}
        </View>

        {wrongQuestions.length > 0 ? (
          <Pressable
            style={({ pressed }) => [
              styles.practiceButton,
              pressed && styles.pressed,
            ]}
            onPress={startWrongPractice}
          >
            <Text style={styles.practiceButtonText}>
              Practice Wrong Questions
            </Text>
          </Pressable>
        ) : null}

        {wrongQuestions.length === 0 ? (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateIcon}>🎉</Text>
            <Text style={styles.emptyStateTitle}>Great job!</Text>
            <Text style={styles.emptyStateDescription}>
              You do not have any wrong answers to review.
            </Text>
          </View>
        ) : (
          <View style={styles.listWrap}>
            {wrongQuestions.map((question) => {
              const correct = question.answers.find((answer) => answer.correct);

              return (
                <View key={question.id} style={styles.card}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.categoryBadge}>
                      {question.category}
                    </Text>
                    <Text style={styles.sourceText}>
                      Source page: {question.sourcePage}
                    </Text>
                  </View>

                  <Text style={styles.questionEn}>{question.questionEn}</Text>
                  <Text style={styles.questionFa}>{question.questionFa}</Text>

                  <View style={styles.correctAnswerWrap}>
                    <Text style={styles.correctTitle}>Correct Answer</Text>
                    <Text style={styles.correctEn}>{correct?.en ?? ""}</Text>
                    <Text style={styles.correctFa}>{correct?.fa ?? ""}</Text>
                  </View>

                  <View style={styles.explanationWrap}>
                    <Text style={styles.explanationTitle}>Explanation</Text>
                    <Text style={styles.explanationEn}>
                      {question.explanationEn}
                    </Text>
                    <Text style={styles.explanationFa}>
                      {question.explanationFa}
                    </Text>
                  </View>

                  <View style={styles.cardActionsRow}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.reviewButton,
                        pressed && styles.pressed,
                      ]}
                      onPress={() =>
                        router.push({
                          pathname: "/practice",
                          params: { questionId: String(question.id) },
                        })
                      }
                    >
                      <Text style={styles.reviewButtonText}>
                        Review in Practice
                      </Text>
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.removeButton,
                        pressed && styles.pressed,
                      ]}
                      onPress={() => {
                        void handleRemove(question.id);
                      }}
                    >
                      <Text style={styles.removeButtonText}>
                        Remove from Wrong Answers
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F7FB",
  },
  content: {
    padding: 16,
    paddingBottom: 28,
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  countText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#285075",
  },
  clearButton: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#F4C5C5",
    backgroundColor: "#FDECEC",
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#A53D3D",
  },
  practiceButton: {
    borderRadius: 14,
    backgroundColor: "#1F7AE0",
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1F7AE0",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  practiceButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  listWrap: {
    gap: 12,
  },
  card: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8E7F7",
    padding: 14,
    shadowColor: "#173958",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    gap: 10,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: "#E7F2FF",
    color: "#1F5F96",
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "700",
  },
  sourceText: {
    color: "#64809B",
    fontSize: 11,
    fontWeight: "600",
  },
  questionEn: {
    fontSize: 16,
    lineHeight: 24,
    color: "#173A58",
    fontWeight: "700",
    textAlign: "left",
    writingDirection: "ltr",
  },
  questionFa: {
    fontSize: 16,
    lineHeight: 26,
    color: "#214F75",
    fontWeight: "700",
    textAlign: "right",
    writingDirection: "rtl",
  },
  correctAnswerWrap: {
    borderRadius: 12,
    backgroundColor: "#EAF8F0",
    borderWidth: 1,
    borderColor: "#B9E3CB",
    padding: 10,
    gap: 4,
  },
  correctTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#24754A",
  },
  correctEn: {
    fontSize: 14,
    lineHeight: 21,
    color: "#1E633F",
    writingDirection: "ltr",
    textAlign: "left",
    fontWeight: "700",
  },
  correctFa: {
    fontSize: 14,
    lineHeight: 23,
    color: "#1E633F",
    writingDirection: "rtl",
    textAlign: "right",
    fontWeight: "700",
  },
  explanationWrap: {
    borderRadius: 12,
    backgroundColor: "#F6F9FD",
    borderWidth: 1,
    borderColor: "#D8E4F0",
    padding: 10,
    gap: 5,
  },
  explanationTitle: {
    fontSize: 12,
    color: "#245A89",
    fontWeight: "800",
  },
  explanationEn: {
    fontSize: 14,
    lineHeight: 21,
    color: "#2B4C6A",
    writingDirection: "ltr",
    textAlign: "left",
  },
  explanationFa: {
    fontSize: 14,
    lineHeight: 23,
    color: "#2B4C6A",
    writingDirection: "rtl",
    textAlign: "right",
  },
  cardActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  reviewButton: {
    borderRadius: 10,
    backgroundColor: "#E8F3FF",
    borderWidth: 1,
    borderColor: "#C6DEFA",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  reviewButtonText: {
    color: "#1D5D95",
    fontSize: 12,
    fontWeight: "700",
  },
  removeButton: {
    borderRadius: 10,
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F4C5C5",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  removeButtonText: {
    color: "#A53D3D",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyStateCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D8E7F7",
    shadowColor: "#173958",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    marginTop: 8,
  },
  emptyStateIcon: {
    fontSize: 30,
  },
  emptyStateTitle: {
    marginTop: 8,
    fontSize: 21,
    fontWeight: "800",
    color: "#16324F",
    textAlign: "center",
  },
  emptyStateDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#4C6983",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
