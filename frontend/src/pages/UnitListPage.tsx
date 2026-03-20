import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { fetchUnits, UnitData } from "@/utils/api";
import { getCompletedUnits } from "@/utils/progress";

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

  useEffect(() => {
    fetchUnits()
      .then(setUnits)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
  const learnedWords = completedUnits.reduce((sum, uid) => {
    const u = units.find((x) => x.id === uid);
    return sum + (u?.wordCount || 0);
  }, 0);

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
          <h1 className="text-2xl font-semibold text-foreground mb-4">
            {learnedWords} / {totalWords} szó
          </h1>
          <div className="w-full h-2 bg-secondary rounded-full">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #4CAF50, #E91E63)" }}
              animate={{ width: `${totalWords > 0 ? (learnedWords / totalWords) * 100 : 0}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </motion.div>

        {/* Units by part */}
        {Array.from(parts.entries()).map(([part, partUnits]) => (
          <div key={part} className="mb-8">
            <h2 className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-3 px-1">
              {part}. rész — {PART_NAMES[part] || ""}
            </h2>
            <div className="flex flex-col gap-3">
              {partUnits.map((unit, i) => {
                const isCompleted = completedUnits.includes(unit.id);
                const borderColor = COLOR_MAP[unit.color] || "#4CAF50";

                return (
                  <motion.button
                    key={unit.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/unit/${unit.id}`)}
                    className="w-full bg-card rounded-2xl border border-border p-4 sm:p-5 flex items-center gap-4 text-left
                      hover:border-foreground/20 transition-all active:scale-[0.98]"
                    style={{
                      borderLeftWidth: 4,
                      borderLeftColor: borderColor,
                      boxShadow: "var(--card-shadow)",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-md text-white"
                          style={{ background: borderColor }}
                        >
                          {unit.id}
                        </span>
                        <span className="text-sm font-semibold text-foreground truncate">
                          {unit.title}
                        </span>
                      </div>
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
