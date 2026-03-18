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
