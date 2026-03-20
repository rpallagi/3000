import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { fetchUnits, UnitData } from "@/utils/api";
import { getCompletedUnits, getStreak, getTotalLearnedWords, getTotalCompletedTasks, getUnitProgress } from "@/utils/progress";
import { getDueCount } from "@/utils/sm2";
import { getUserLevel, getBenchmarkPercentile, getStarDisplay } from "@/utils/levels";
import { hasOnboarded } from "@/pages/OnboardingPage";

const COLOR_MAP: Record<string, string> = {
  pink: "#E91E63",
  green: "#4CAF50",
  blue: "#1565C0",
  orange: "#FF9800",
};

const PART_NAMES: Record<number, string> = {
  1: "Alapok",
  2: "Mindennapok",
  3: "Múlt és leírás",
  4: "Haladó nyelvtan",
  5: "Összetett struktúrák",
};

const UnitListPage = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState<UnitData[]>([]);
  const [loading, setLoading] = useState(true);
  const completedUnits = getCompletedUnits();
  const streak = getStreak();
  const dueCount = getDueCount();

  useEffect(() => {
    // Redirect to onboarding if first visit
    if (!hasOnboarded()) {
      navigate("/onboarding", { replace: true });
      return;
    }

    fetchUnits()
      .then(setUnits)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-muted-foreground"
        >
          Betöltés...
        </motion.div>
      </div>
    );
  }

  // Group units by part
  const parts = new Map<number, UnitData[]>();
  for (const unit of units) {
    const list = parts.get(unit.part) || [];
    list.push(unit);
    parts.set(unit.part, list);
  }

  const totalWords = units.reduce((sum, u) => sum + u.wordCount, 0);
  const learnedWords = getTotalLearnedWords() || completedUnits.reduce((sum, uid) => {
    const u = units.find((x) => x.id === uid);
    return sum + (u?.wordCount || 0);
  }, 0);
  const completedTasks = getTotalCompletedTasks();
  const userLevel = getUserLevel(Object.keys(completedUnits).length);
  const benchmark = getBenchmarkPercentile(learnedWords, streak);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 sm:pt-24 pb-24 px-4 sm:px-6 max-w-2xl mx-auto">
        {/* Progress header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-sm text-muted-foreground tracking-widest uppercase font-medium mb-2">
            Magyar fejjel, angol nyelven.
          </p>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            {learnedWords} szót tanultál
          </h1>
          {completedTasks > 0 && (
            <p className="text-sm text-muted-foreground mb-1">
              {completedTasks} feladat kész
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {getStarDisplay(userLevel.stars)} {userLevel.name}
            {userLevel.nextLevelIn > 0 && ` — Még ${userLevel.nextLevelIn} lecke a következő szintig`}
          </p>
          {learnedWords > 0 && (
            <p className="text-[10px] mt-1" style={{ color: "#4CAF50" }}>
              Gyorsabban haladsz, mint a tanulók {benchmark}%-a!
            </p>
          )}
          <div className="w-full h-1.5 bg-secondary rounded-full mt-2">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "#4CAF50" }}
              animate={{ width: `${totalWords > 0 ? (learnedWords / totalWords) * 100 : 0}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </motion.div>

        {/* Streak + Review banner */}
        <div className="flex gap-3 mb-6">
          {streak > 0 && (
            <div className="flex-1 bg-card rounded-2xl border border-border p-4 flex items-center gap-3" style={{ boxShadow: "var(--card-shadow)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#FF980020" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{streak} nap</p>
                <p className="text-[10px] text-muted-foreground">sorozat</p>
              </div>
            </div>
          )}
          {dueCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/review")}
              className="flex-1 bg-card rounded-2xl border border-border p-4 flex items-center gap-3 text-left hover:border-foreground/20 transition-all"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#E91E6320" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E91E63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{dueCount} szó ismétlésre vár</p>
                <p className="text-[10px] text-muted-foreground">Indítsd el a napi ismétlést</p>
              </div>
            </motion.button>
          )}
        </div>

        {/* Smart Resume — Folytatás gomb */}
        {(() => {
          // Find next uncompleted unit or the first unit
          const nextUnit = units.find((u) => !completedUnits.includes(u.id)) || units[0];
          if (!nextUnit) return null;
          const unitProgress = getUnitProgress(nextUnit.id);
          const nextLesson = unitProgress.completedLessons + 1;
          return (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(
                unitProgress.completedLessons > 0
                  ? `/unit/${nextUnit.id}/lesson/${nextLesson}/practice`
                  : `/unit/${nextUnit.id}/lesson/1`
              )}
              className="w-full bg-card rounded-2xl border border-border p-4 flex items-center gap-3 text-left mb-6 hover:border-foreground/20 transition-all"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#4CAF5020" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Folytatás: {nextUnit.id} — {nextUnit.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {unitProgress.completedLessons > 0
                    ? `${unitProgress.completedLessons}. lecke kész`
                    : `${nextUnit.wordCount} szó`
                  }
                </p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 flex-shrink-0 ml-auto"><path d="m9 18 6-6-6-6"/></svg>
            </motion.button>
          );
        })()}

        {/* Units by part */}
        {Array.from(parts.entries()).map(([part, partUnits]) => (
          <div key={part} className="mb-8">
            <h2 className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-3 px-1">
              {part}. rész — {PART_NAMES[part] || ""}
            </h2>
            <div className="flex flex-col gap-3">
              {partUnits.map((unit, i) => {
                const isCompleted = completedUnits.includes(unit.id);
                const unitColor = COLOR_MAP[unit.color] || "#4CAF50";

                return (
                  <motion.button
                    key={unit.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/unit/${unit.id}`)}
                    className="w-full bg-card rounded-2xl border border-border p-4 flex items-center gap-3 text-left hover:border-foreground/20 transition-all active:scale-[0.98]"
                    style={{ boxShadow: "var(--card-shadow)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                      style={{ background: unitColor }}
                    >
                      {unit.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {unit.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {unit.wordCount} szó
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
                        </div>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m9 18 6-6-6-6"/></svg>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnitListPage;
