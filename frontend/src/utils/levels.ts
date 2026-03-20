/**
 * PlayENG Level System (Greta v4)
 * Not XP — human-readable level names with star ratings
 */

export interface UserLevel {
  stars: number;
  name: string;
  nameEn: string;
  nextLevelIn: number;  // lessons until next level
}

const LEVELS = [
  { stars: 1, name: "Kezdő", nameEn: "Beginner", minLessons: 0 },
  { stars: 2, name: "Tanuló", nameEn: "Learner", minLessons: 5 },
  { stars: 3, name: "Haladó", nameEn: "Intermediate", minLessons: 15 },
  { stars: 4, name: "Tapasztalt", nameEn: "Experienced", minLessons: 30 },
  { stars: 5, name: "Mester", nameEn: "Master", minLessons: 50 },
];

export const getUserLevel = (completedLessons: number): UserLevel => {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (completedLessons >= LEVELS[i].minLessons) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || LEVELS[i];
      break;
    }
  }

  const nextLevelIn = nextLevel.minLessons - completedLessons;

  return {
    stars: currentLevel.stars,
    name: currentLevel.name,
    nameEn: currentLevel.nameEn,
    nextLevelIn: Math.max(0, nextLevelIn),
  };
};

/**
 * Generate benchmark comparison (Greta spec)
 * "Gyorsabban haladsz, mint a tanulók 68%-a!"
 */
export const getBenchmarkPercentile = (learnedWords: number, streak: number): number => {
  // Simulated percentile based on engagement metrics
  // In production this would come from server analytics
  let percentile = 50;

  if (learnedWords > 100) percentile += 10;
  if (learnedWords > 300) percentile += 10;
  if (learnedWords > 500) percentile += 5;
  if (streak >= 3) percentile += 5;
  if (streak >= 7) percentile += 10;
  if (streak >= 14) percentile += 5;
  if (streak >= 30) percentile += 5;

  return Math.min(99, percentile);
};

export const getStarDisplay = (stars: number): string => {
  return "★".repeat(stars) + "☆".repeat(Math.max(0, 5 - stars));
};
