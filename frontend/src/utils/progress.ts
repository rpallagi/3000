import { getAccessToken, authHeaders } from "@/contexts/AuthContext";

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

/** Sync lesson result to server if logged in, always save locally. */
export const saveLessonResult = async (result: LessonResult): Promise<void> => {
  const data = loadProgress();
  const key = `${result.chapterId}-${result.lessonId}`;

  // Keep best score locally
  const existing = data.lessons[key];
  if (!existing || result.score > existing.score) {
    data.lessons[key] = result;
  }

  // Update error dictionary locally
  for (const err of result.errors) {
    data.errorDict[err.wordId] = (data.errorDict[err.wordId] || 0) + 1;
  }

  // Update streak locally
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

  // Sync to server if logged in
  if (getAccessToken()) {
    try {
      await fetch("/api/progress/lesson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(result),
      });
    } catch {
      // Offline — local save is fine, will sync later
    }
  }
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

/** Get list of completed unit IDs (V4). */
export const getCompletedUnits = (): string[] => {
  const data = loadProgress();
  const completedUnits = new Set<string>();
  // Check lessons stored with unitId format (e.g. "1A-1", "2B-3")
  for (const key of Object.keys(data.lessons)) {
    const parts = key.split("-");
    if (parts.length >= 2 && /^[1-5][A-E]$/.test(parts[0])) {
      completedUnits.add(parts[0]);
    }
  }
  return Array.from(completedUnits);
};

/** Fetch server-side progress and merge with local data. */
export const syncProgressFromServer = async (): Promise<void> => {
  if (!getAccessToken()) return;

  try {
    const res = await fetch("/api/progress", {
      headers: authHeaders(),
    });
    if (!res.ok) return;

    const serverData = await res.json();
    const localData = loadProgress();

    // Merge server lessons with local (keep best score)
    for (const [key, lesson] of Object.entries(serverData.lessons)) {
      const serverLesson = lesson as LessonResult;
      const localLesson = localData.lessons[key];
      if (!localLesson || serverLesson.score > localLesson.score) {
        localData.lessons[key] = serverLesson;
      }
    }

    // Merge error dict (take max count)
    for (const err of serverData.errors || []) {
      const wordId = err.wordId;
      const serverCount = err.errorCount || 0;
      const localCount = localData.errorDict[wordId] || 0;
      localData.errorDict[wordId] = Math.max(serverCount, localCount);
    }

    // Take server streak if higher
    if (serverData.streak && serverData.streak.currentStreak > localData.streak.count) {
      localData.streak.count = serverData.streak.currentStreak;
    }

    saveProgress(localData);
  } catch {
    // Offline — keep local data
  }
};
