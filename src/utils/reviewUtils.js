import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";

const APP_OPEN_COUNT_KEY = "appOpenCount";
const COMPLETED_MOCK_TESTS_KEY = "completedMockTests";
const ANSWERED_PRACTICE_QUESTIONS_KEY = "answeredPracticeQuestions";
const CORRECT_PRACTICE_ANSWERS_KEY = "correctPracticeAnswers";
const REVIEW_REQUESTED_KEY = "reviewRequested";

async function getNumber(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

async function setNumber(key, value) {
  try {
    await AsyncStorage.setItem(key, String(value));
  } catch {
    // Keep review helpers safe.
  }
}

async function hasAlreadyRequested() {
  try {
    const raw = await AsyncStorage.getItem(REVIEW_REQUESTED_KEY);
    return raw === "1";
  } catch {
    return false;
  }
}

async function markReviewRequested() {
  try {
    await AsyncStorage.setItem(REVIEW_REQUESTED_KEY, "1");
  } catch {
    // ignore
  }
}

export async function incrementAppOpenCount() {
  try {
    const next = (await getNumber(APP_OPEN_COUNT_KEY)) + 1;
    await setNumber(APP_OPEN_COUNT_KEY, next);
    return next;
  } catch {
    return 0;
  }
}

export async function incrementCompletedMockTests() {
  try {
    const next = (await getNumber(COMPLETED_MOCK_TESTS_KEY)) + 1;
    await setNumber(COMPLETED_MOCK_TESTS_KEY, next);
    return next;
  } catch {
    return 0;
  }
}

export async function incrementPracticeAnswerStats(isCorrect) {
  try {
    const answeredNext = (await getNumber(ANSWERED_PRACTICE_QUESTIONS_KEY)) + 1;
    await setNumber(ANSWERED_PRACTICE_QUESTIONS_KEY, answeredNext);

    let correctNext = await getNumber(CORRECT_PRACTICE_ANSWERS_KEY);
    if (isCorrect) {
      correctNext += 1;
      await setNumber(CORRECT_PRACTICE_ANSWERS_KEY, correctNext);
    }

    return {
      answeredPracticeQuestions: answeredNext,
      correctPracticeAnswers: correctNext,
    };
  } catch {
    return {
      answeredPracticeQuestions: 0,
      correctPracticeAnswers: 0,
    };
  }
}

export async function shouldRequestReview({ passed, source }) {
  try {
    const alreadyRequested = await hasAlreadyRequested();
    if (alreadyRequested) {
      return false;
    }

    if (source === "mockTestPassed") {
      const completedMockTests = await getNumber(COMPLETED_MOCK_TESTS_KEY);
      return Boolean(passed) && completedMockTests >= 1;
    }

    if (source === "practiceMilestone") {
      const answeredPracticeQuestions = await getNumber(
        ANSWERED_PRACTICE_QUESTIONS_KEY,
      );
      return answeredPracticeQuestions >= 10;
    }

    return false;
  } catch {
    return false;
  }
}

export async function requestAppReviewIfAppropriate({ passed, source }) {
  try {
    const canRequest = await shouldRequestReview({ passed, source });
    if (!canRequest) {
      return false;
    }

    await markReviewRequested();

    const isAvailable = await StoreReview.isAvailableAsync();
    if (isAvailable) {
      await StoreReview.requestReview();
    } else {
      // Fallback for Expo Go / dev builds where StoreReview is unavailable
      const { Alert } = await import("react-native");
      Alert.alert(
        "Enjoying the app? ⭐",
        "If Farsi DMV Practice is helping you study, please take a moment to rate it on the App Store.",
        [
          { text: "Not Now", style: "cancel" },
          { text: "Rate App", style: "default" },
        ],
      );
    }

    return true;
  } catch {
    return false;
  }
}
