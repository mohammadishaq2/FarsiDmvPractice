import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    Image,
    LayoutAnimation,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    UIManager,
    View,
} from "react-native";

import { AppHeader } from "../components/AppHeader";
import { EmptyState } from "../components/EmptyState";
import { PrimaryButton } from "../components/PrimaryButton";
import { ProgressBar } from "../components/ProgressBar";
import { borderRadius, colors, shadows, spacing } from "../constants/theme";
import { DmvQuestion, getAllQuestions } from "../utils/questionUtils";
import {
    incrementPracticeAnswerStats,
    requestAppReviewIfAppropriate,
} from "../utils/reviewUtils";
import {
    addWrongQuestion,
    getSavedQuestionIds,
    QuestionId,
    toggleSavedQuestion,
} from "../utils/storageUtils";

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function PracticeScreen() {
  const params = useLocalSearchParams<{
    questionId?: string | string[];
    mode?: string | string[];
    ids?: string | string[];
  }>();
  const modeParam = readParam(params.mode);
  const idsParam = readParam(params.ids);
  const questionIdParam = readParam(params.questionId);

  const baseQuestions = useMemo(() => {
    const allQuestions = getAllQuestions();

    if (modeParam !== "wrong") {
      return allQuestions;
    }

    const wantedIds = new Set(
      (idsParam ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    );

    if (wantedIds.size === 0) {
      return allQuestions;
    }

    return allQuestions.filter((question) =>
      wantedIds.has(String(question.id)),
    );
  }, [idsParam, modeParam]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [savedIds, setSavedIds] = useState<QuestionId[]>([]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      baseQuestions
        .map((question) => question.category?.trim())
        .filter((category): category is string => Boolean(category)),
    );

    return [
      "All",
      ...Array.from(uniqueCategories).sort((a, b) => a.localeCompare(b)),
    ];
  }, [baseQuestions]);

  const selectedCategoryCount = useMemo(() => {
    if (selectedCategory === "All") {
      return baseQuestions.length;
    }

    return baseQuestions.filter(
      (question) => question.category === selectedCategory,
    ).length;
  }, [baseQuestions, selectedCategory]);

  const questions = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return baseQuestions.filter((question) => {
      const categoryMatches =
        selectedCategory === "All" || question.category === selectedCategory;

      if (!categoryMatches) {
        return false;
      }

      if (!search) {
        return true;
      }

      const english = question.questionEn.toLowerCase();
      const farsi = question.questionFa.toLowerCase();

      return english.includes(search) || farsi.includes(search);
    });
  }, [baseQuestions, searchQuery, selectedCategory]);

  const currentQuestion: DmvQuestion | undefined = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress =
    totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const correctAnswerId = currentQuestion?.answers.find(
    (answer) => answer.correct,
  )?.id;
  const isCurrentSaved =
    currentQuestion !== undefined &&
    savedIds.some((id) => String(id) === String(currentQuestion.id));

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    async function loadSavedIds() {
      const ids = await getSavedQuestionIds();
      setSavedIds(ids);
    }

    void loadSavedIds();
  }, []);

  useEffect(() => {
    setSelectedAnswerId(null);
    setIsSubmitted(false);
  }, [currentIndex]);

  useEffect(() => {
    if (currentIndex < questions.length) {
      return;
    }

    setCurrentIndex(0);
  }, [currentIndex, questions.length]);

  useEffect(() => {
    const targetQuestionId = questionIdParam;
    if (!targetQuestionId) {
      return;
    }

    const index = questions.findIndex(
      (question) => String(question.id) === String(targetQuestionId),
    );

    if (index >= 0) {
      setCurrentIndex(index);
    }
  }, [questionIdParam, questions]);

  const handleAnswerPress = async (answerId: string) => {
    if (!currentQuestion || isSubmitted) {
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedAnswerId(answerId);
    setIsSubmitted(true);

    const selected = currentQuestion.answers.find(
      (item) => item.id === answerId,
    );
    const isCorrect = Boolean(selected?.correct);

    await incrementPracticeAnswerStats(isCorrect);

    if (selected && !selected.correct) {
      await addWrongQuestion(currentQuestion.id);
    }
  };

  const toggleSaveQuestion = async () => {
    if (!currentQuestion) {
      return;
    }

    const next = await toggleSavedQuestion(currentQuestion.id);
    setSavedIds(next);
  };

  const goToPrevious = () => {
    if (currentIndex === 0) {
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentIndex((prev) => prev - 1);
  };

  const goToNext = async () => {
    if (isSubmitted) {
      await requestAppReviewIfAppropriate({
        source: "practiceMilestone",
      });
    }

    if (currentIndex >= totalQuestions - 1) {
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentIndex((prev) => prev + 1);
  };

  const getAnswerCardStyle = (answerId: string) => {
    if (!isSubmitted) {
      return selectedAnswerId === answerId ? styles.answerCardSelected : null;
    }

    if (answerId === correctAnswerId) {
      return styles.answerCardCorrect;
    }

    if (answerId === selectedAnswerId && answerId !== correctAnswerId) {
      return styles.answerCardWrong;
    }

    return null;
  };

  const onSelectCategory = (category: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCategory(category);
    setCurrentIndex(0);
    setSelectedAnswerId(null);
    setIsSubmitted(false);
  };

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <AppHeader
          titleEn="Practice"
          titleFa="تمرین"
          subtitleEn="Daily practice helps you lock in key rules"
          subtitleFa="تمرین روزانه به تثبیت قوانین مهم کمک می کند"
          showBackButton
        />
        <View style={styles.emptyWrap}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search English or Farsi question"
            placeholderTextColor="#7A92A8"
            style={styles.searchInput}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {categories.map((category) => {
              const selected = selectedCategory === category;
              return (
                <Pressable
                  key={category}
                  style={({ pressed }) => [
                    styles.categoryChip,
                    selected && styles.categoryChipSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => onSelectCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selected && styles.categoryChipTextSelected,
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.categoryCountText}>
            {selectedCategoryCount} questions in {selectedCategory}
          </Text>

          <EmptyState
            icon="🔎"
            title="No questions found"
            description="Try another category or a different search term."
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        titleEn="Practice"
        titleFa="تمرین"
        subtitleEn={
          modeParam === "wrong"
            ? "Focused review of questions you missed"
            : "Daily practice helps you lock in key rules"
        }
        subtitleFa={
          modeParam === "wrong"
            ? "مرور متمرکز روی سوالاتی که اشتباه زده اید"
            : "تمرین روزانه به تثبیت قوانین مهم کمک می کند"
        }
        showBackButton
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search English or Farsi question"
          placeholderTextColor="#7A92A8"
          style={styles.searchInput}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {categories.map((category) => {
            const selected = selectedCategory === category;
            return (
              <Pressable
                key={category}
                style={({ pressed }) => [
                  styles.categoryChip,
                  selected && styles.categoryChipSelected,
                  pressed && styles.pressed,
                ]}
                onPress={() => onSelectCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selected && styles.categoryChipTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.categoryCountText}>
          {selectedCategoryCount} questions in {selectedCategory}
        </Text>

        <View style={styles.progressWrap}>
          <Text style={styles.progressText}>
            Question {currentIndex + 1} of {totalQuestions}
          </Text>
          <ProgressBar value={progress} />
        </View>

        <View style={styles.questionCard}>
          <View style={styles.questionTopRow}>
            <Text style={styles.categoryBadge}>{currentQuestion.category}</Text>

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.pressed,
              ]}
              onPress={toggleSaveQuestion}
            >
              <Text style={styles.saveIcon}>
                {isCurrentSaved ? "🔖" : "📑"}
              </Text>
              <Text style={styles.saveText}>
                {isCurrentSaved ? "Saved" : "Save / Review Later"}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.questionEn}>{currentQuestion.questionEn}</Text>
          <Text style={styles.questionFa}>{currentQuestion.questionFa}</Text>

          {currentQuestion.image ? (
            <Image
              source={{ uri: currentQuestion.image }}
              style={styles.questionImage}
            />
          ) : null}
        </View>

        <View style={styles.answersWrap}>
          {currentQuestion.answers.map((answer) => (
            <Pressable
              key={answer.id}
              style={({ pressed }) => [
                styles.answerCard,
                getAnswerCardStyle(answer.id),
                pressed && !isSubmitted ? styles.pressed : null,
              ]}
              onPress={() => {
                void handleAnswerPress(answer.id);
              }}
            >
              <View style={styles.answerTopRow}>
                <Text style={styles.answerLabel}>{answer.id}.</Text>
                <Text style={styles.answerEn}>{answer.en}</Text>
              </View>
              <Text style={styles.answerFa}>{answer.fa}</Text>
            </Pressable>
          ))}
        </View>

        {isSubmitted ? (
          <View style={styles.explanationCard}>
            <Text style={styles.explanationTitle}>Explanation</Text>
            <Text style={styles.explanationEn}>
              {currentQuestion.explanationEn}
            </Text>
            <Text style={styles.explanationFa}>
              {currentQuestion.explanationFa}
            </Text>
          </View>
        ) : null}

        <View style={styles.navigationRow}>
          <Pressable
            style={({ pressed }) => [
              styles.navButton,
              currentIndex === 0 && styles.navButtonDisabled,
              pressed && currentIndex > 0 ? styles.pressed : null,
            ]}
            onPress={goToPrevious}
            disabled={currentIndex === 0}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </Pressable>

          {isSubmitted ? (
            <PrimaryButton label="Next" onPress={goToNext} />
          ) : null}

          {!isSubmitted ? (
            <Pressable
              style={({ pressed }) => [
                styles.navButton,
                currentIndex >= totalQuestions - 1 && styles.navButtonDisabled,
                pressed && currentIndex < totalQuestions - 1
                  ? styles.pressed
                  : null,
              ]}
              onPress={goToNext}
              disabled={currentIndex >= totalQuestions - 1}
            >
              <Text style={styles.navButtonText}>Next</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 30,
    gap: spacing.md,
  },
  searchInput: {
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: "#CEDFF1",
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1A3D5A",
  },
  chipsRow: {
    gap: 8,
    paddingRight: 4,
  },
  categoryChip: {
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: "#CFE0F2",
    backgroundColor: colors.card,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  categoryChipSelected: {
    borderColor: "#1F7AE0",
    backgroundColor: "#E8F2FF",
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4E6A84",
  },
  categoryChipTextSelected: {
    color: "#1F5F96",
  },
  categoryCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#597691",
  },
  progressWrap: {
    gap: 9,
  },
  progressText: {
    fontSize: 14,
    color: "#2A5279",
    fontWeight: "700",
  },
  questionCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    backgroundColor: colors.card,
    ...shadows.card,
    gap: 10,
  },
  questionTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  categoryBadge: {
    backgroundColor: "#E6F2FF",
    color: "#1C5F9D",
    fontSize: 12,
    fontWeight: "700",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    overflow: "hidden",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F6F9FD",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#D3E3F4",
  },
  saveIcon: {
    fontSize: 14,
  },
  saveText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#385C7F",
  },
  questionEn: {
    fontSize: 18,
    lineHeight: 28,
    color: "#173754",
    fontWeight: "800",
    textAlign: "left",
    writingDirection: "ltr",
  },
  questionFa: {
    fontSize: 18,
    lineHeight: 30,
    color: "#1B4A72",
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "700",
  },
  questionImage: {
    marginTop: 4,
    width: "100%",
    height: 190,
    borderRadius: 14,
    backgroundColor: "#EAF2FB",
  },
  answersWrap: {
    gap: 10,
  },
  answerCard: {
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D6E4F5",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  answerCardSelected: {
    borderColor: "#73A6DB",
    backgroundColor: "#F1F8FF",
  },
  answerCardCorrect: {
    borderColor: "#3A9C69",
    backgroundColor: "#EAF8F0",
  },
  answerCardWrong: {
    borderColor: "#CF5252",
    backgroundColor: "#FDEEEE",
  },
  answerTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  answerLabel: {
    fontSize: 14,
    color: "#2D516F",
    fontWeight: "800",
    marginTop: 1,
  },
  answerEn: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: "#1A3D5A",
    textAlign: "left",
    writingDirection: "ltr",
    fontWeight: "600",
  },
  answerFa: {
    fontSize: 14,
    lineHeight: 23,
    color: "#254D70",
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "600",
  },
  explanationCard: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D6E3F1",
    padding: 14,
    gap: 8,
  },
  explanationTitle: {
    fontSize: 14,
    color: "#215E95",
    fontWeight: "800",
  },
  explanationEn: {
    fontSize: 14,
    lineHeight: 22,
    color: "#274865",
    textAlign: "left",
    writingDirection: "ltr",
  },
  explanationFa: {
    fontSize: 14,
    lineHeight: 24,
    color: "#274865",
    textAlign: "right",
    writingDirection: "rtl",
  },
  navigationRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  navButton: {
    minWidth: 120,
    borderRadius: 13,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#1F6FB9",
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonDisabled: {
    backgroundColor: "#AFC5DA",
  },
  navButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  emptyWrap: {
    margin: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#16324F",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 14,
    color: "#4F6882",
  },
});
