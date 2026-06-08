import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";

import { AppHeader } from "../components/AppHeader";
import { ProgressBar } from "../components/ProgressBar";
import { borderRadius, colors, shadows, spacing } from "../constants/theme";
import { DmvQuestion, getRandomQuestions } from "../utils/questionUtils";
import {
    incrementCompletedMockTests,
    requestAppReviewIfAppropriate,
} from "../utils/reviewUtils";
import { addTestResult, addWrongQuestion } from "../utils/storageUtils";

type MockStage = "intro" | "test" | "result";

type MockTestResult = {
  id: string;
  createdAt: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  percentage: number;
  passed: boolean;
  timerEnabled: boolean;
  durationSeconds: number;
};

const MOCK_COUNT = 36;
const TIMER_DURATION_SECONDS = 45 * 60;
const PASSING_CORRECT_COUNT = 30;

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function MockTestScreen() {
  const router = useRouter();

  const [stage, setStage] = useState<MockStage>("intro");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(
    TIMER_DURATION_SECONDS,
  );
  const [questions, setQuestions] = useState<DmvQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersByQuestionId, setAnswersByQuestionId] = useState<
    Record<string, string | undefined>
  >({});
  const [result, setResult] = useState<MockTestResult | null>(null);
  const celebrationScale = useState(new Animated.Value(1))[0];

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion
    ? answersByQuestionId[String(currentQuestion.id)]
    : undefined;

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const answeredCount = useMemo(
    () => Object.values(answersByQuestionId).filter(Boolean).length,
    [answersByQuestionId],
  );

  const submitTest = useCallback(async () => {
    if (questions.length === 0) {
      return;
    }

    let correctAnswers = 0;
    const wrongQuestionIds: number[] = [];

    for (const question of questions) {
      const selectedAnswerId = answersByQuestionId[String(question.id)];
      const selectedAnswer = question.answers.find(
        (answer) => answer.id === selectedAnswerId,
      );

      if (selectedAnswer?.correct) {
        correctAnswers += 1;
      } else {
        wrongQuestionIds.push(question.id);
      }
    }

    const totalQuestions = questions.length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = correctAnswers >= PASSING_CORRECT_COUNT;
    const durationSeconds = timerEnabled
      ? TIMER_DURATION_SECONDS - secondsRemaining
      : 0;

    const nextResult: MockTestResult = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      percentage,
      passed,
      timerEnabled,
      durationSeconds,
    };

    await addTestResult(nextResult);
    await Promise.all(
      wrongQuestionIds.map((questionId) => addWrongQuestion(questionId)),
    );

    if (passed) {
      await incrementCompletedMockTests();
      await requestAppReviewIfAppropriate({
        passed: true,
        source: "mockTestPassed",
      });
    }

    setResult(nextResult);
    setStage("result");
  }, [answersByQuestionId, questions, secondsRemaining, timerEnabled]);

  useEffect(() => {
    if (stage !== "test" || !timerEnabled) {
      return;
    }

    if (secondsRemaining <= 0) {
      void submitTest();
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [secondsRemaining, stage, submitTest, timerEnabled]);

  useEffect(() => {
    if (stage !== "result") {
      celebrationScale.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(celebrationScale, {
          toValue: 1.04,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(celebrationScale, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [celebrationScale, stage]);

  const startMockTest = () => {
    setQuestions(getRandomQuestions(MOCK_COUNT));
    setAnswersByQuestionId({});
    setCurrentIndex(0);
    setSecondsRemaining(TIMER_DURATION_SECONDS);
    setResult(null);
    setStage("test");
  };

  const retakeMockTest = () => {
    startMockTest();
  };

  const selectAnswer = (answerId: string) => {
    if (!currentQuestion) {
      return;
    }

    setAnswersByQuestionId((prev) => ({
      ...prev,
      [String(currentQuestion.id)]: answerId,
    }));
  };

  const goPrevious = () => {
    if (currentIndex === 0) {
      return;
    }

    setCurrentIndex((prev) => prev - 1);
  };

  const goNext = () => {
    if (currentIndex >= questions.length - 1) {
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const canAdvance = Boolean(currentAnswer);

  const hasTestProgress =
    stage === "test" && Object.values(answersByQuestionId).some(Boolean);

  const handleBackPress = () => {
    if (!hasTestProgress) {
      router.back();
      return;
    }

    Alert.alert(
      "Leave current test?",
      "Are you sure you want to leave this test? Your current test progress may be lost.\n\nآیا مطمئن هستید که می خواهید از آزمون خارج شوید؟ پیشرفت فعلی آزمون ممکن است از بین برود.",
      [
        { text: "Stay", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            router.back();
          },
        },
      ],
    );
  };

  if (stage === "intro") {
    return (
      <View style={styles.container}>
        <AppHeader
          titleEn="Mock Test / Exam Mode"
          titleFa="آزمون شبیه سازی شده / حالت آزمون"
          subtitleEn="Timed simulation designed like the real test"
          subtitleFa="شبیه سازی زمان دار مشابه آزمون واقعی"
          showBackButton
          onBackPress={handleBackPress}
        />

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Exam Setup</Text>
            <Text style={styles.infoText}>- 36 random questions</Text>
            <Text style={styles.infoText}>- Passing score: 30 out of 36</Text>
            <Text style={styles.infoText}>
              - No instant feedback during test
            </Text>
            <Text style={styles.infoText}>- Review results at the end</Text>
          </View>

          <View style={styles.timerCard}>
            <View>
              <Text style={styles.timerTitle}>45-Minute Timer</Text>
              <Text style={styles.timerText}>
                Enable countdown for real exam pressure
              </Text>
            </View>
            <Switch
              value={timerEnabled}
              onValueChange={setTimerEnabled}
              trackColor={{ false: "#C6D5E5", true: "#94BDE8" }}
              thumbColor={timerEnabled ? "#1F7AE0" : "#F5F7FA"}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={startMockTest}
          >
            <Text style={styles.primaryButtonText}>Start Mock Test</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (stage === "result" && result) {
    return (
      <View style={styles.container}>
        <AppHeader
          titleEn="Mock Test Result"
          titleFa="نتیجه آزمون شبیه سازی شده"
          subtitleEn="See your performance and improve your weak areas"
          subtitleFa="عملکرد خود را ببینید و نقاط ضعف را تقویت کنید"
          showBackButton
          onBackPress={handleBackPress}
        />

        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View
            style={[
              styles.resultHero,
              result.passed ? styles.passHero : styles.failHero,
              { transform: [{ scale: celebrationScale }] },
            ]}
          >
            <Text style={styles.resultEmoji}>
              {result.passed ? "🏆" : "📘"}
            </Text>
            <Text style={styles.resultTitle}>
              {result.passed ? "Pass" : "Keep Going"}
            </Text>
            <Text style={styles.resultSubtitle}>
              {result.passed
                ? "Excellent work. You are ready for the DMV exam."
                : "You are close. Focus on mistakes and retake confidently."}
            </Text>
          </Animated.View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Score</Text>
              <Text style={styles.metricValue}>{result.percentage}%</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Correct</Text>
              <Text style={styles.metricValue}>{result.correctAnswers}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Wrong</Text>
              <Text style={styles.metricValue}>{result.wrongAnswers}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Passing Rule</Text>
              <Text style={styles.metricValue}>30 / 36</Text>
            </View>
          </View>

          <View style={styles.resultActions}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
              onPress={() => router.push("/wrong-answers")}
            >
              <Text style={styles.primaryButtonText}>Review Wrong Answers</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
              onPress={retakeMockTest}
            >
              <Text style={styles.secondaryButtonText}>Retake Test</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        titleEn="Mock Test / Exam Mode"
        titleFa="آزمون شبیه سازی شده / حالت آزمون"
        subtitleEn="Answer each question, then submit at the end"
        subtitleFa="به هر سوال پاسخ دهید و در پایان ارسال کنید"
        showBackButton
        onBackPress={handleBackPress}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressTopRow}>
          <Text style={styles.progressLabel}>
            Question {currentIndex + 1} of {questions.length}
          </Text>
          {timerEnabled ? (
            <Text style={styles.timerBadge}>
              ⏱ {formatTime(secondsRemaining)}
            </Text>
          ) : (
            <Text style={styles.timerOff}>Timer Off</Text>
          )}
        </View>
        <ProgressBar value={progress} />

        <View style={styles.questionCard}>
          <Text style={styles.categoryBadge}>{currentQuestion?.category}</Text>
          <Text style={styles.questionEn}>{currentQuestion?.questionEn}</Text>
          <Text style={styles.questionFa}>{currentQuestion?.questionFa}</Text>
        </View>

        <View style={styles.answersWrap}>
          {currentQuestion?.answers.map((answer) => {
            const selected = currentAnswer === answer.id;
            return (
              <Pressable
                key={answer.id}
                style={({ pressed }) => [
                  styles.answerCard,
                  selected && styles.answerCardSelected,
                  pressed && styles.pressed,
                ]}
                onPress={() => selectAnswer(answer.id)}
              >
                <Text style={styles.answerEn}>
                  {answer.id}. {answer.en}
                </Text>
                <Text style={styles.answerFa}>{answer.fa}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footerSummary}>
          <Text style={styles.footerSummaryText}>
            Answered {answeredCount} of {questions.length}
          </Text>
        </View>

        <View style={styles.navRow}>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              currentIndex === 0 && styles.disabledButton,
              pressed && currentIndex > 0 ? styles.pressed : null,
            ]}
            onPress={goPrevious}
            disabled={currentIndex === 0}
          >
            <Text style={styles.secondaryButtonText}>Previous</Text>
          </Pressable>

          {currentIndex < questions.length - 1 ? (
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                !canAdvance && styles.disabledButton,
                pressed && canAdvance ? styles.pressed : null,
              ]}
              onPress={goNext}
              disabled={!canAdvance}
            >
              <Text style={styles.primaryButtonText}>Next</Text>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                !canAdvance && styles.disabledButton,
                pressed && canAdvance ? styles.pressed : null,
              ]}
              onPress={() => {
                void submitTest();
              }}
              disabled={!canAdvance}
            >
              <Text style={styles.primaryButtonText}>Submit Test</Text>
            </Pressable>
          )}
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
    paddingBottom: 28,
    gap: spacing.md,
  },
  infoCard: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    padding: spacing.lg,
    ...shadows.card,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#16324F",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#44627E",
    lineHeight: 21,
  },
  timerCard: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#D9E6F5",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1B466D",
  },
  timerText: {
    marginTop: 3,
    fontSize: 12,
    color: "#64809A",
  },
  progressTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2A5279",
  },
  timerBadge: {
    borderRadius: 999,
    backgroundColor: "#E9F2FF",
    color: "#1F5D95",
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 12,
    overflow: "hidden",
    fontWeight: "700",
  },
  timerOff: {
    color: "#668099",
    fontSize: 12,
    fontWeight: "700",
  },
  questionCard: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    padding: spacing.lg,
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
    gap: 6,
  },
  answerCardSelected: {
    borderColor: "#4F8BC8",
    backgroundColor: "#EDF6FF",
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
  footerSummary: {
    borderRadius: 12,
    backgroundColor: "#F5F9FF",
    borderWidth: 1,
    borderColor: "#D8E5F4",
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  footerSummaryText: {
    color: "#48637E",
    fontSize: 13,
    fontWeight: "700",
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    shadowColor: "#1F7AE0",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
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
  secondaryButtonText: {
    color: "#285075",
    fontSize: 14,
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  resultHero: {
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: "center",
    borderWidth: 1,
  },
  passHero: {
    backgroundColor: "#EAF8F0",
    borderColor: "#BCE5CC",
  },
  failHero: {
    backgroundColor: "#F2F7FC",
    borderColor: "#CADCED",
  },
  resultEmoji: {
    fontSize: 30,
  },
  resultTitle: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: "800",
    color: "#173A58",
  },
  resultSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    color: "#385C7E",
    textAlign: "center",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    width: "48%",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8E7F7",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: "#5B7490",
    fontWeight: "700",
  },
  metricValue: {
    marginTop: 5,
    fontSize: 23,
    color: "#16324F",
    fontWeight: "800",
  },
  resultActions: {
    gap: 10,
  },
});
