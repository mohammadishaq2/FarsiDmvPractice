import { useEffect, useMemo, useState } from "react";
import {
    Image,
    LayoutAnimation,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    UIManager,
    View,
} from "react-native";

import { AppHeader } from "../components/AppHeader";
import { ImageAnswerOption } from "../components/ImageAnswerOption";
import { ProgressBar } from "../components/ProgressBar";
import { borderRadius, colors, shadows, spacing } from "../constants/theme";
import { signImages } from "../utils/imageMap";
import { getRoadSignQuestions } from "../utils/questionUtils";

function extractImageKey(imageValue: string | null) {
  if (!imageValue) {
    return null;
  }

  const cleanValue = imageValue.split("?")[0];
  const parts = cleanValue.split("/");
  return parts[parts.length - 1] || null;
}

export default function RoadSignsScreen() {
  const questions = useMemo(() => getRoadSignQuestions(), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress =
    totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const correctAnswerId = currentQuestion?.answers.find(
    (answer) => answer.correct,
  )?.id;
  const questionType = currentQuestion?.questionType ?? "textChoices";
  const isImageChoicesQuestion = questionType === "imageChoices";
  const imageKey = extractImageKey(currentQuestion?.image ?? null);
  const mappedImage = imageKey ? signImages[imageKey] : undefined;

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const onSelectAnswer = (answerId: string) => {
    if (isSubmitted || !currentQuestion) {
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedAnswerId(answerId);
    setIsSubmitted(true);
  };

  const goPrevious = () => {
    if (currentIndex === 0) {
      return;
    }

    setCurrentIndex((prev) => prev - 1);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedAnswerId(null);
    setIsSubmitted(false);
  };

  const goNext = () => {
    if (currentIndex >= totalQuestions - 1) {
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedAnswerId(null);
    setIsSubmitted(false);
  };

  const getAnswerStyle = (answerId: string) => {
    if (!isSubmitted) {
      return selectedAnswerId === answerId ? styles.answerSelected : null;
    }

    if (answerId === correctAnswerId) {
      return styles.answerCorrect;
    }

    if (answerId === selectedAnswerId && answerId !== correctAnswerId) {
      return styles.answerWrong;
    }

    return null;
  };

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <AppHeader
          titleEn="Road Signs"
          titleFa="تابلوهای راهنمایی"
          subtitleEn="Visual learning for California DMV sign questions"
          subtitleFa="یادگیری تصویری برای سوالات تابلوهای دی ام وی کالیفرنیا"
          showBackButton
        />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No road sign questions found</Text>
          <Text style={styles.emptyText}>
            Add sign, signal, or image-based questions to your JSON to start
            practicing.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        titleEn="Road Signs"
        titleFa="تابلوهای راهنمایی"
        subtitleEn="Dedicated sign and signal practice mode"
        subtitleFa="حالت تمرین اختصاصی تابلوها و چراغ ها"
        showBackButton
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.progressLabel}>
          Question {currentIndex + 1} of {totalQuestions}
        </Text>
        <ProgressBar value={progress} />

        <View style={styles.questionCard}>
          <Text style={styles.categoryBadge}>{currentQuestion.category}</Text>
          <Text style={styles.questionEn}>{currentQuestion.questionEn}</Text>
          <Text style={styles.questionFa}>{currentQuestion.questionFa}</Text>

          {currentQuestion.image ? (
            mappedImage ? (
              <Image
                source={mappedImage}
                style={styles.signImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderTitle}>Image coming soon</Text>
                {__DEV__ ? (
                  <Text style={styles.placeholderSource}>
                    {currentQuestion.imageSourceUrl || currentQuestion.image}
                  </Text>
                ) : null}
              </View>
            )
          ) : null}
        </View>

        <View
          style={
            isImageChoicesQuestion ? styles.imageAnswersWrap : styles.answersWrap
          }
        >
          {currentQuestion.answers.map((answer) => {
            if (isImageChoicesQuestion) {
              const answerImageKey = extractImageKey(answer.image ?? null);
              const answerImageSource = answerImageKey
                ? signImages[answerImageKey]
                : undefined;

              return (
                <ImageAnswerOption
                  key={answer.id}
                  imageSource={answerImageSource}
                  enLabel={answer.en}
                  faLabel={answer.fa}
                  isSelected={selectedAnswerId === answer.id}
                  isCorrect={Boolean(isSubmitted && answer.id === correctAnswerId)}
                  isWrong={Boolean(
                    isSubmitted &&
                      selectedAnswerId === answer.id &&
                      answer.id !== correctAnswerId,
                  )}
                  onPress={() => onSelectAnswer(answer.id)}
                />
              );
            }

            return (
              <Pressable
                key={answer.id}
                style={({ pressed }) => [
                  styles.answerCard,
                  getAnswerStyle(answer.id),
                  pressed && !isSubmitted ? styles.pressed : null,
                ]}
                onPress={() => onSelectAnswer(answer.id)}
              >
                <Text style={styles.answerEn}>
                  {answer.id}. {answer.en}
                </Text>
                <Text style={styles.answerFa}>{answer.fa}</Text>
              </Pressable>
            );
          })}
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

        <View style={styles.navRow}>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              currentIndex === 0 && styles.buttonDisabled,
              pressed && currentIndex > 0 ? styles.pressed : null,
            ]}
            onPress={goPrevious}
            disabled={currentIndex === 0}
          >
            <Text style={styles.secondaryButtonText}>Previous</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              (!isSubmitted || currentIndex >= totalQuestions - 1) &&
                styles.buttonDisabled,
              pressed && isSubmitted && currentIndex < totalQuestions - 1
                ? styles.pressed
                : null,
            ]}
            onPress={goNext}
            disabled={!isSubmitted || currentIndex >= totalQuestions - 1}
          >
            <Text style={styles.primaryButtonText}>Next</Text>
          </Pressable>
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
    gap: spacing.sm,
  },
  progressLabel: {
    color: "#2A5279",
    fontSize: 14,
    fontWeight: "700",
  },
  questionCard: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
    gap: 10,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E7F2FF",
    color: "#1F5F96",
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "700",
  },
  questionEn: {
    fontSize: 18,
    lineHeight: 27,
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
  signImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    backgroundColor: "#F6FAFF",
  },
  imagePlaceholder: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8E7F7",
    backgroundColor: "#F7FBFF",
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
    gap: 6,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2F5A80",
  },
  placeholderSource: {
    fontSize: 11,
    color: "#6A839C",
    textAlign: "center",
  },
  answersWrap: {
    gap: 10,
  },
  imageAnswersWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  answerCard: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: "#D6E4F5",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 6,
  },
  answerSelected: {
    borderColor: "#4F8BC8",
    backgroundColor: "#EDF6FF",
  },
  answerCorrect: {
    borderColor: "#3A9C69",
    backgroundColor: "#EAF8F0",
  },
  answerWrong: {
    borderColor: "#CF5252",
    backgroundColor: "#FDEEEE",
  },
  answerEn: {
    fontSize: 14,
    lineHeight: 21,
    color: "#1A3D5A",
    textAlign: "left",
    writingDirection: "ltr",
    fontWeight: "700",
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
    gap: 6,
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
  navRow: {
    marginTop: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#1F7AE0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#C8D8EA",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButtonText: {
    color: "#285075",
    fontSize: 14,
    fontWeight: "800",
  },
  buttonDisabled: {
    opacity: 0.45,
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
