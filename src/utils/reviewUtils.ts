import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";

const APP_OPEN_COUNT_KEY = "appOpenCount";
const COMPLETED_MOCK_TESTS_KEY = "completedMockTests";
const ANSWERED_PRACTICE_QUESTIONS_KEY = "answeredPracticeQuestions";
const CORRECT_PRACTICE_ANSWERS_KEY = "correctPracticeAnswers";
const LAST_REVIEW_PROMPT_DATE_KEY = "lastReviewPromptDate";
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

type ReviewSource = "mockTestPassed" | "practiceMilestone";

type ReviewInput = {
  passed?: boolean;
  source: ReviewSource;
};

async function getNumber(key: string): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(key);
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

async function setNumber(key: string, value: number) {
  try {
    await AsyncStorage.setItem(key, String(value));
  } catch {
    // Keep review helpers safe.
  }
}

async function hasAskedRecently(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(LAST_REVIEW_PROMPT_DATE_KEY);
    if (!raw) {
      return false;
    }

    const lastTime = new Date(raw).getTime();
    if (Number.isNaN(lastTime)) {
      return false;
    }

    return Date.now() - lastTime < NINETY_DAYS_MS;
  } catch {
    return false;
  }
}

export async function incrementAppOpenCount(): Promise<number> {
  try {
    const next = (await getNumber(APP_OPEN_COUNT_KEY)) + 1;
    await setNumber(APP_OPEN_COUNT_KEY, next);
    return next;
  } catch {
    return 0;
  }
}

export async function incrementCompletedMockTests(): Promise<number> {
  try {
    const next = (await getNumber(COMPLETED_MOCK_TESTS_KEY)) + 1;
    await setNumber(COMPLETED_MOCK_TESTS_KEY, next);
    return next;
  } catch {
    return 0;
  }
}

export async function incrementPracticeAnswerStats(
  isCorrect: boolean,
): Promise<{
  answeredPracticeQuestions: number;
  correctPracticeAnswers: number;
}> {
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

export async function shouldRequestReview({
  passed,
  source,
}: ReviewInput): Promise<boolean> {
  try {
    const appOpenCount = await getNumber(APP_OPEN_COUNT_KEY);
    const completedMockTests = await getNumber(COMPLETED_MOCK_TESTS_KEY);
    const answeredPracticeQuestions = await getNumber(
      ANSWERED_PRACTICE_QUESTIONS_KEY,
    );
    const correctPracticeAnswers = await getNumber(
      CORRECT_PRACTICE_ANSWERS_KEY,
    );
    const askedRecently = await hasAskedRecently();

    if (askedRecently || appOpenCount < 3) {
      return false;
    }

    if (source === "mockTestPassed") {
      return Boolean(passed) && completedMockTests >= 1;
    }

    if (source === "practiceMilestone") {
      return answeredPracticeQuestions >= 25 && correctPracticeAnswers >= 15;
    }

    return false;
  } catch {
    return false;
  }
}

export async function requestAppReviewIfAppropriate({
  passed,
  source,
}: ReviewInput): Promise<boolean> {
  try {
    const canRequest = await shouldRequestReview({ passed, source });
    if (!canRequest) {
      return false;
    }

    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) {
      return false;
    }

    await StoreReview.requestReview();
    await AsyncStorage.setItem(
      LAST_REVIEW_PROMPT_DATE_KEY,
      new Date().toISOString(),
    );

    return true;
  } catch {
    return false;
  }
}
