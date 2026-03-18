const STORAGE_KEY = "playeng_progress";

export interface LessonResult {
  chapterId: number;
  lessonId: number;
  score: number;
  maxScore: number;
  completedAt: string;
  errors: { wordId: number; word: string }[];
}

interface ProgressData {
  lessons: Record<string, LessonResult>;
  streak: { lastDate: string; count: number };
  errorDict: Record<number, number>; // wordId -> error count
}

const loadProgress = (): ProgressData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { lessons: {}, streak: { lastDate: "", count: 0 }, errorDict: {} };
};

const saveProgress = (data: ProgressData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const saveLessonResult = (result: LessonResult): void => {
  const data = loadProgress();
  const key = `${result.chapterId}-${result.lessonId}`;

  // Keep best score
  const existing = data.lessons[key];
  if (!existing || result.score > existing.score) {
    data.lessons[key] = result;
  }

  // Update error dictionary
  for (const err of result.errors) {
    data.errorDict[err.wordId] = (data.errorDict[err.wordId] || 0) + 1;
  }

  // Update streak
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (data.streak.lastDate === today) {
    // Already logged today
  } else if (data.streak.lastDate === yesterday) {
    data.streak.count += 1;
    data.streak.lastDate = today;
  } else {
    data.streak.count = 1;
    data.streak.lastDate = today;
  }

  saveProgress(data);
};

export const getChapterProgress = (chapterId: number): LessonResult[] => {
  const data = loadProgress();
  return Object.values(data.lessons).filter((l) => l.chapterId === chapterId);
};

export const getLessonResult = (chapterId: number, lessonId: number): LessonResult | null => {
  const data = loadProgress();
  return data.lessons[`${chapterId}-${lessonId}`] || null;
};

export const getStreak = (): number => {
  const data = loadProgress();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (data.streak.lastDate === today || data.streak.lastDate === yesterday) {
    return data.streak.count;
  }
  return 0;
};

export const getErrorWords = (): Record<number, number> => {
  return loadProgress().errorDict;
};
