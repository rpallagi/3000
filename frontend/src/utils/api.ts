const API_BASE = "/api";

export interface WordData {
  id: number;
  word: string;
  wordDisplay: string;
  hungarian: string;
  pos: string;
  chapter: number;
  sentences: { en: string; hu: string }[];
  distractors?: string[];
  distractorsHu?: string[];
}

export interface ChapterData {
  id: number;
  name: string;
  nameEn: string;
  level: number;
  wordCount: number;
  lessonCount: number;
}

export interface ChapterDetail {
  id: number;
  name: string;
  nameEn: string;
  level: number;
  wordCount: number;
  words: WordData[];
}

export interface LevelData {
  id: number;
  name: string;
  nameEn: string;
  wordRange: string;
  chapterCount: number;
  wordCount: number;
  chapters: { id: number; name: string; nameEn: string; wordCount: number }[];
}

export interface LessonData {
  chapterId: number;
  chapterName: string;
  lessonId: number;
  totalLessons: number;
  words: WordData[];
}

export interface DialogueData {
  id: number;
  chapterId: number;
  title: string;
  lines: { speaker: string; text: string; responses?: { text: string; score: number }[] }[];
}

export const fetchLevels = async (): Promise<LevelData[]> => {
  const res = await fetch(`${API_BASE}/levels`);
  if (!res.ok) throw new Error("Failed to fetch levels");
  return res.json();
};

export const fetchChapters = async (): Promise<ChapterData[]> => {
  const res = await fetch(`${API_BASE}/chapters`);
  if (!res.ok) throw new Error("Failed to fetch chapters");
  return res.json();
};

export const fetchChapter = async (id: number): Promise<ChapterDetail> => {
  const res = await fetch(`${API_BASE}/chapters/${id}`);
  if (!res.ok) throw new Error("Failed to fetch chapter");
  return res.json();
};

export const fetchLesson = async (chapterId: number, lessonId: number): Promise<LessonData> => {
  const res = await fetch(`${API_BASE}/chapters/${chapterId}/lesson/${lessonId}`);
  if (!res.ok) throw new Error("Failed to fetch lesson");
  return res.json();
};

export const fetchDialogues = async (chapterId: number): Promise<DialogueData[]> => {
  const res = await fetch(`${API_BASE}/chapters/${chapterId}/dialogues`);
  if (!res.ok) throw new Error("Failed to fetch dialogues");
  return res.json();
};

// --- V4 Unit-based API ---

export interface UnitData {
  id: string;
  part: number;
  order: number;
  title: string;
  titleEn: string;
  color: string;
  grammarFocus: string;
  wordCount: number;
}

export interface UnitDetail extends UnitData {
  grammar: GrammarData;
  taskTypes: TaskTypeData[];
  words: WordData[];
}

export interface GrammarData {
  ruleBasic: string;
  ruleExtra: string;
  examples: { en: string; hu: string }[];
}

export interface TaskTypeData {
  id: number;
  name: string;
  nameEn: string;
  type: string;
  color: string;
}

export interface UnitLessonData {
  unitId: string;
  unitTitle: string;
  lessonId: number;
  totalLessons: number;
  words: WordData[];
  grammar: GrammarData;
  taskTypes: TaskTypeData[];
}

export interface VocabularyItem {
  id: number;
  word: string;
  hungarian: string;
  pos: string;
  unitId: string;
  unitTitle: string;
}

export const fetchUnits = async (): Promise<UnitData[]> => {
  const res = await fetch(`${API_BASE}/units`);
  if (!res.ok) throw new Error("Failed to fetch units");
  return res.json();
};

export const fetchUnit = async (unitId: string): Promise<UnitDetail> => {
  const res = await fetch(`${API_BASE}/units/${unitId}`);
  if (!res.ok) throw new Error("Failed to fetch unit");
  return res.json();
};

export const fetchUnitLesson = async (unitId: string, lessonId: number): Promise<UnitLessonData> => {
  const res = await fetch(`${API_BASE}/units/${unitId}/lesson/${lessonId}`);
  if (!res.ok) throw new Error("Failed to fetch unit lesson");
  return res.json();
};

export const fetchGrammarSearch = async (query: string): Promise<{ unitId: string; unitTitle: string; grammar: GrammarData }[]> => {
  const res = await fetch(`${API_BASE}/grammar/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to search grammar");
  return res.json();
};

export const fetchVocabulary = async (params?: { unit?: string; q?: string; sort?: string }): Promise<VocabularyItem[]> => {
  const searchParams = new URLSearchParams();
  if (params?.unit) searchParams.set('unit', params.unit);
  if (params?.q) searchParams.set('q', params.q);
  if (params?.sort) searchParams.set('sort', params.sort);
  const res = await fetch(`${API_BASE}/vocabulary?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch vocabulary");
  return res.json();
};
