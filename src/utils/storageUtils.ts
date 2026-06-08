import AsyncStorage from "@react-native-async-storage/async-storage";

const SAVED_QUESTIONS_KEY = "savedQuestions";
const WRONG_QUESTIONS_KEY = "wrongQuestions";
const TEST_HISTORY_KEY = "testHistory";

export type QuestionId = number | string;

function idEquals(a: QuestionId, b: QuestionId) {
  return String(a) === String(b);
}

async function readJsonArray<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function writeJsonArray<T>(key: string, value: T[]) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keep function calls safe by swallowing storage errors.
  }
}

export async function getSavedQuestionIds(): Promise<QuestionId[]> {
  return readJsonArray<QuestionId>(SAVED_QUESTIONS_KEY);
}

export async function isQuestionSaved(
  questionId: QuestionId,
): Promise<boolean> {
  try {
    const ids = await getSavedQuestionIds();
    return ids.some((id) => idEquals(id, questionId));
  } catch {
    return false;
  }
}

export async function toggleSavedQuestion(
  questionId: QuestionId,
): Promise<QuestionId[]> {
  try {
    const ids = await getSavedQuestionIds();
    const exists = ids.some((id) => idEquals(id, questionId));
    const next = exists
      ? ids.filter((id) => !idEquals(id, questionId))
      : [...ids, questionId];

    await writeJsonArray(SAVED_QUESTIONS_KEY, next);
    return next;
  } catch {
    return [];
  }
}

export async function removeSavedQuestion(
  questionId: QuestionId,
): Promise<QuestionId[]> {
  try {
    const ids = await getSavedQuestionIds();
    const next = ids.filter((id) => !idEquals(id, questionId));

    await writeJsonArray(SAVED_QUESTIONS_KEY, next);
    return next;
  } catch {
    return [];
  }
}

export async function clearSavedQuestions(): Promise<QuestionId[]> {
  try {
    await AsyncStorage.setItem(SAVED_QUESTIONS_KEY, JSON.stringify([]));
    return [];
  } catch {
    return [];
  }
}

export async function getWrongQuestionIds(): Promise<QuestionId[]> {
  return readJsonArray<QuestionId>(WRONG_QUESTIONS_KEY);
}

export async function addWrongQuestion(
  questionId: QuestionId,
): Promise<QuestionId[]> {
  try {
    const ids = await getWrongQuestionIds();
    const exists = ids.some((id) => idEquals(id, questionId));
    const next = exists ? ids : [...ids, questionId];

    await writeJsonArray(WRONG_QUESTIONS_KEY, next);
    return next;
  } catch {
    return [];
  }
}

export async function removeWrongQuestion(
  questionId: QuestionId,
): Promise<QuestionId[]> {
  try {
    const ids = await getWrongQuestionIds();
    const next = ids.filter((id) => !idEquals(id, questionId));

    await writeJsonArray(WRONG_QUESTIONS_KEY, next);
    return next;
  } catch {
    return [];
  }
}

export async function clearWrongQuestions(): Promise<QuestionId[]> {
  try {
    await AsyncStorage.setItem(WRONG_QUESTIONS_KEY, JSON.stringify([]));
    return [];
  } catch {
    return [];
  }
}

export async function getTestHistory<T = unknown>(): Promise<T[]> {
  return readJsonArray<T>(TEST_HISTORY_KEY);
}

export async function addTestResult<T>(result: T): Promise<T[]> {
  try {
    const history = await getTestHistory<T>();
    const next = [...history, result];

    await writeJsonArray(TEST_HISTORY_KEY, next);
    return next;
  } catch {
    return [];
  }
}

export async function clearTestHistory(): Promise<unknown[]> {
  try {
    await AsyncStorage.setItem(TEST_HISTORY_KEY, JSON.stringify([]));
    return [];
  } catch {
    return [];
  }
}

// Backward-compatible generic helpers.
export async function setItem(key: string, value: string) {
  await AsyncStorage.setItem(key, value);
}

export async function getItem(key: string) {
  return AsyncStorage.getItem(key);
}

export async function removeItem(key: string) {
  await AsyncStorage.removeItem(key);
}

export async function setJSON<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
