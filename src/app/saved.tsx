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
    clearSavedQuestions,
    getSavedQuestionIds,
    removeSavedQuestion,
} from "../utils/storageUtils";

export default function SavedScreen() {
  const router = useRouter();
  const allQuestions = useMemo(() => getAllQuestions(), []);
  const [savedQuestions, setSavedQuestions] = useState<DmvQuestion[]>([]);

  const loadSavedQuestions = useCallback(async () => {
    const savedIds = await getSavedQuestionIds();
    const mapped = savedIds
      .map((id) =>
        allQuestions.find((question) => String(question.id) === String(id)),
      )
      .filter((question): question is DmvQuestion => Boolean(question));

    setSavedQuestions(mapped);
  }, [allQuestions]);

  useFocusEffect(
    useCallback(() => {
      void loadSavedQuestions();
    }, [loadSavedQuestions]),
  );

  const handleRemoveSaved = async (questionId: number) => {
    const nextIds = await removeSavedQuestion(questionId);
    setSavedQuestions(
      nextIds
        .map((id) =>
          allQuestions.find((question) => String(question.id) === String(id)),
        )
        .filter((question): question is DmvQuestion => Boolean(question)),
    );
  };

  const handleClearAll = () => {
    Alert.alert("Clear All Saved", "Remove all saved questions?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: async () => {
          await clearSavedQuestions();
          setSavedQuestions([]);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        titleEn="Saved / Review Later"
        titleFa="ذخیره شده / مرور بعدی"
        subtitleEn="Questions you bookmarked for another pass"
        subtitleFa="سوالاتی که برای مرور بعدی نشان کرده اید"
        showBackButton
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Text style={styles.countText}>Saved: {savedQuestions.length}</Text>
          {savedQuestions.length > 0 ? (
            <Pressable
              style={({ pressed }) => [
                styles.clearButton,
                pressed && styles.pressed,
              ]}
              onPress={handleClearAll}
            >
              <Text style={styles.clearButtonText}>Clear All Saved</Text>
            </Pressable>
          ) : null}
        </View>

        {savedQuestions.length === 0 ? (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateIcon}>🔖</Text>
            <Text style={styles.emptyStateTitle}>No saved questions yet</Text>
            <Text style={styles.emptyStateDescription}>
              Tap the bookmark icon while practicing to save questions for
              later.
            </Text>
          </View>
        ) : (
          <View style={styles.listWrap}>
            {savedQuestions.map((question) => (
              <Pressable
                key={question.id}
                style={({ pressed }) => [
                  styles.questionCard,
                  pressed && styles.pressed,
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/practice",
                    params: { questionId: String(question.id) },
                  })
                }
              >
                <View style={styles.cardTopRow}>
                  <Text style={styles.categoryBadge}>{question.category}</Text>
                  <Text style={styles.sourceText}>
                    Source page: {question.sourcePage}
                  </Text>
                </View>

                <Text style={styles.questionEn}>{question.questionEn}</Text>
                <Text style={styles.questionFa}>{question.questionFa}</Text>

                <View style={styles.cardActionsRow}>
                  <Text style={styles.reviewHint}>
                    Tap to review in Practice
                  </Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.removeButton,
                      pressed && styles.pressed,
                    ]}
                    onPress={(event) => {
                      event.stopPropagation();
                      void handleRemoveSaved(question.id);
                    }}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
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
    color: "#295278",
  },
  clearButton: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FDEDEE",
    borderWidth: 1,
    borderColor: "#F5C7CB",
  },
  clearButtonText: {
    color: "#A33B46",
    fontSize: 12,
    fontWeight: "800",
  },
  listWrap: {
    gap: 11,
  },
  questionCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderWidth: 1,
    borderColor: "#D8E7F7",
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
    lineHeight: 25,
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
  cardActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  reviewHint: {
    flex: 1,
    color: "#5D7892",
    fontSize: 12,
    fontWeight: "600",
  },
  removeButton: {
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: "#FDEDEE",
    borderWidth: 1,
    borderColor: "#F5C7CB",
  },
  removeButtonText: {
    color: "#A33B46",
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
    marginTop: 10,
  },
  emptyStateIcon: {
    fontSize: 30,
  },
  emptyStateTitle: {
    marginTop: 8,
    fontSize: 19,
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
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
});
