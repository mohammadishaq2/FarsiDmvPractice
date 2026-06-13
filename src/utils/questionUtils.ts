import dmvQuestionsJson from "../data/california_dmv_farsi_questions.json";

export type DmvQuestionAnswer = {
  id: string;
  en: string;
  fa: string;
  image?: string | null;
  correct: boolean;
};

export type DmvQuestion = {
  id: number;
  category: string;
  questionType?: "textChoices" | "imageChoices" | string;
  questionEn: string;
  questionFa: string;
  image: string | null;
  imageSourceUrl: string | null;
  answers: DmvQuestionAnswer[];
  explanationEn: string;
  explanationFa: string;
  sourcePage: number;
};

type DmvQuestionsPayload = {
  questions?: DmvQuestion[];
};

const ROAD_SIGN_CATEGORY_KEYWORDS = [
  "sign",
  "road signs",
  "traffic signals",
  "pedestrian signals",
  "railroad",
  "school zones",
];

function normalizeQuestions(payload: unknown): DmvQuestion[] {
  if (Array.isArray(payload)) {
    return payload as DmvQuestion[];
  }

  if (payload && typeof payload === "object" && "questions" in payload) {
    const typedPayload = payload as DmvQuestionsPayload;
    if (Array.isArray(typedPayload.questions)) {
      return typedPayload.questions;
    }
  }

  return [];
}

export function getAllQuestions() {
  return normalizeQuestions(dmvQuestionsJson);
}

export function getQuestionsByCategory(category: string) {
  const target = category.trim().toLowerCase();
  if (!target) {
    return [];
  }

  return getAllQuestions().filter(
    (question) => question.category?.trim().toLowerCase() === target,
  );
}

export function getCategories() {
  const uniqueCategories = new Set(
    getAllQuestions()
      .map((question) => question.category?.trim())
      .filter((category): category is string => Boolean(category)),
  );

  return [...uniqueCategories].sort((a, b) => a.localeCompare(b));
}

export function getRoadSignQuestions() {
  return getAllQuestions().filter((question) => {
    const category = (question.category || "").toLowerCase();
    const hasRoadSignCategory = ROAD_SIGN_CATEGORY_KEYWORDS.some((keyword) =>
      category.includes(keyword),
    );

    return hasRoadSignCategory || question.image !== null;
  });
}

export function shuffleArray<T>(array: T[]) {
  const next = [...array];

  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }

  return next;
}

export function getRandomQuestions(count: number) {
  const safeCount = Math.max(0, Math.floor(count));
  return shuffleArray(getAllQuestions()).slice(0, safeCount);
}

export function getQuestionById(id: number | string) {
  const normalizedId = String(id);
  return getAllQuestions().find(
    (question) => String(question.id) === normalizedId,
  );
}
