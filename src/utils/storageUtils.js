import AsyncStorage from "@react-native-async-storage/async-storage";

const SAVED_QUESTIONS_KEY = "savedQuestions";
const WRONG_QUESTIONS_KEY = "wrongQuestions";
const TEST_HISTORY_KEY = "testHistory";

function idEquals(a, b) {
  return String(a) === String(b);
}

async function readJsonArray(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJsonArray(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keep helper calls safe.
  }
}

export async function getSavedQuestionIds() {
  return readJsonArray(SAVED_QUESTIONS_KEY);
}

export async function isQuestionSaved(questionId) {
  try {
    const ids = await getSavedQuestionIds();
    return ids.some((id) => idEquals(id, questionId));
  } catch {
    return false;
  }
}

export async function toggleSavedQuestion(questionId) {
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

export async function removeSavedQuestion(questionId) {
  try {
    const ids = await getSavedQuestionIds();
    const next = ids.filter((id) => !idEquals(id, questionId));

    await writeJsonArray(SAVED_QUESTIONS_KEY, next);
    return next;
  } catch {
    return [];
  }
}

export async function clearSavedQuestions() {
  try {
    await AsyncStorage.setItem(SAVED_QUESTIONS_KEY, JSON.stringify([]));
    return [];
  } catch {
    return [];
  }
}

export async function getWrongQuestionIds() {
  return readJsonArray(WRONG_QUESTIONS_KEY);
}

export async function addWrongQuestion(questionId) {
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

export async function removeWrongQuestion(questionId) {
  try {
    const ids = await getWrongQuestionIds();
    const next = ids.filter((id) => !idEquals(id, questionId));

    await writeJsonArray(WRONG_QUESTIONS_KEY, next);
    return next;
  } catch {
    return [];
  }
}

export async function clearWrongQuestions() {
  try {
    await AsyncStorage.setItem(WRONG_QUESTIONS_KEY, JSON.stringify([]));
    return [];
  } catch {
    return [];
  }
}

export async function getTestHistory() {
  return readJsonArray(TEST_HISTORY_KEY);
}

export async function addTestResult(result) {
  try {
    const history = await getTestHistory();
    const next = [...history, result];

    await writeJsonArray(TEST_HISTORY_KEY, next);
    return next;
  } catch {
    return [];
  }
}

export async function clearTestHistory() {
  try {
    await AsyncStorage.setItem(TEST_HISTORY_KEY, JSON.stringify([]));
    return [];
  } catch {
    return [];
  }
}
