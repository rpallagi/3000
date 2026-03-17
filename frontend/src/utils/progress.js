/**
 * Progress tracking via localStorage
 */

const STORAGE_KEY = 'playeng_progress';

function getAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { lessons: {}, errors: [], streak: { lastDate: null, count: 0 }, totalScore: 0 };
  } catch {
    return { lessons: {}, errors: [], streak: { lastDate: null, count: 0 }, totalScore: 0 };
  }
}

function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function saveLessonResult(chapterId, lessonId, score, maxScore) {
  const data = getAll();
  const key = `${chapterId}-${lessonId}`;
  const stars = score >= maxScore * 0.9 ? 3 : score >= maxScore * 0.6 ? 2 : 1;
  const existing = data.lessons[key];

  // Only update if better score
  if (!existing || score > existing.score) {
    data.lessons[key] = {
      score,
      maxScore,
      stars,
      completedAt: new Date().toISOString().split('T')[0]
    };
  }

  data.totalScore = Object.values(data.lessons).reduce((sum, l) => sum + l.score, 0);
  updateStreak(data);
  saveAll(data);
  return data.lessons[key];
}

export function getLessonResult(chapterId, lessonId) {
  const data = getAll();
  return data.lessons[`${chapterId}-${lessonId}`] || null;
}

export function getChapterProgress(chapterId) {
  const data = getAll();
  const lessons = Object.entries(data.lessons)
    .filter(([key]) => key.startsWith(`${chapterId}-`))
    .map(([, val]) => val);
  return {
    completedLessons: lessons.length,
    totalScore: lessons.reduce((sum, l) => sum + l.score, 0),
    totalStars: lessons.reduce((sum, l) => sum + l.stars, 0)
  };
}

export function getStreak() {
  const data = getAll();
  return data.streak;
}

export function getTotalScore() {
  return getAll().totalScore || 0;
}

export function addToErrorDictionary(word, hungarian, taskType, userAnswer) {
  const data = getAll();
  // Avoid duplicates
  const exists = data.errors.find(e => e.word === word && e.taskType === taskType);
  if (!exists) {
    data.errors.push({ word, hungarian, taskType, userAnswer, timestamp: Date.now() });
    // Keep max 200 errors
    if (data.errors.length > 200) data.errors = data.errors.slice(-200);
    saveAll(data);
  }
}

export function getErrorDictionary() {
  return getAll().errors || [];
}

export function clearErrorWord(word) {
  const data = getAll();
  data.errors = data.errors.filter(e => e.word !== word);
  saveAll(data);
}

function updateStreak(data) {
  const today = new Date().toISOString().split('T')[0];
  if (data.streak.lastDate === today) return;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (data.streak.lastDate === yesterday) {
    data.streak.count += 1;
  } else if (data.streak.lastDate !== today) {
    data.streak.count = 1;
  }
  data.streak.lastDate = today;
}
