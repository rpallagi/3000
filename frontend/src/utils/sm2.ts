/**
 * SM-2 Spaced Repetition Algorithm
 * Based on Greta's spec: 1d → 3d → 7d → 18d → 45d (correct) / back to 1d (incorrect)
 *
 * Sources of review items:
 * 1. Wrong answer in practice
 * 2. Tapped word for help (2x = review trigger)
 * 3. Slow answer (>10s)
 */

const SM2_STORAGE_KEY = "playeng_sm2";

export interface SM2Item {
  wordId: number;
  word: string;
  unitId: string;
  easeFactor: number;     // 2.5 default, min 1.3
  interval: number;       // days until next review
  repetitions: number;    // successful reps in a row
  nextReview: string;     // ISO date string
  lastReview: string;     // ISO date string
}

// Greta's intervals: 1d → 3d → 7d → 18d → 45d
const GRETA_INTERVALS = [1, 3, 7, 18, 45];

interface SM2Data {
  items: Record<number, SM2Item>;  // keyed by wordId
}

const loadSM2 = (): SM2Data => {
  try {
    const raw = localStorage.getItem(SM2_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { items: {} };
};

const saveSM2 = (data: SM2Data): void => {
  localStorage.setItem(SM2_STORAGE_KEY, JSON.stringify(data));
};

/**
 * Record a review result for a word.
 * @param wordId - Word ID
 * @param word - Word text
 * @param unitId - Unit ID (e.g. "1A")
 * @param quality - 0-5 rating (0-2 = incorrect, 3-5 = correct)
 */
export const recordReview = (
  wordId: number,
  word: string,
  unitId: string,
  quality: number
): SM2Item => {
  const data = loadSM2();
  const existing = data.items[wordId];
  const today = new Date().toISOString().slice(0, 10);

  let item: SM2Item;

  if (!existing) {
    item = {
      wordId,
      word,
      unitId,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReview: today,
      lastReview: today,
    };
  } else {
    item = { ...existing };
  }

  if (quality >= 3) {
    // Correct answer
    item.repetitions += 1;

    // Use Greta's fixed intervals
    if (item.repetitions <= GRETA_INTERVALS.length) {
      item.interval = GRETA_INTERVALS[item.repetitions - 1];
    } else {
      // Beyond defined intervals: use SM-2 formula
      item.interval = Math.round(item.interval * item.easeFactor);
    }

    // Update ease factor (SM-2 formula)
    item.easeFactor = Math.max(
      1.3,
      item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
  } else {
    // Incorrect — reset to 1 day (Greta spec)
    item.repetitions = 0;
    item.interval = 1;
  }

  // Calculate next review date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + item.interval);
  item.nextReview = nextDate.toISOString().slice(0, 10);
  item.lastReview = today;

  data.items[wordId] = item;
  saveSM2(data);

  return item;
};

/**
 * Get all items due for review today.
 */
export const getDueItems = (): SM2Item[] => {
  const data = loadSM2();
  const today = new Date().toISOString().slice(0, 10);

  return Object.values(data.items)
    .filter((item) => item.nextReview <= today)
    .sort((a, b) => a.nextReview.localeCompare(b.nextReview));
};

/**
 * Get count of items due for review.
 */
export const getDueCount = (): number => {
  return getDueItems().length;
};

/**
 * Get all tracked items (for stats).
 */
export const getAllItems = (): SM2Item[] => {
  const data = loadSM2();
  return Object.values(data.items);
};

/**
 * Add a word to the review system (triggered by errors, taps, slow answers).
 */
export const addToReview = (wordId: number, word: string, unitId: string): void => {
  const data = loadSM2();
  if (data.items[wordId]) return; // Already tracked

  const today = new Date().toISOString().slice(0, 10);
  data.items[wordId] = {
    wordId,
    word,
    unitId,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReview: today,
    lastReview: today,
  };
  saveSM2(data);
};
