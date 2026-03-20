import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { fetchUnit, UnitDetail, TaskTypeData } from "@/utils/api";
import { getUnitProgress } from "@/utils/progress";

const COLOR_MAP: Record<string, string> = {
  pink: "#E91E63",
  green: "#4CAF50",
  blue: "#1565C0",
  orange: "#FF9800",
};

const TASK_COLOR_MAP: Record<string, string> = {
  vocab: "#E91E63",
  grammar: "#4CAF50",
  communication: "#1565C0",
  activity: "#FF9800",
};

const UnitPage = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const [unit, setUnit] = useState<UnitDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!unitId) return;
    fetchUnit(unitId)
      .then(setUnit)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [unitId]);

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

  if (!unit) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Egység nem található</p>
        <button onClick={() => navigate("/units")} className="text-primary underline">Vissza</button>
      </div>
    );
  }

  const borderColor = COLOR_MAP[unit.color] || "#4CAF50";
  const totalLessons = Math.max(1, Math.ceil(unit.wordCount / 8));
  const unitProgress = getUnitProgress(unit.id);
  const progressPct = unitProgress.totalMaxScore > 0
    ? Math.round((unitProgress.totalScore / unitProgress.totalMaxScore) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 sm:pt-24 pb-24 px-4 sm:px-6 max-w-2xl mx-auto">
        {/* Back + Title */}
        <div className="flex items-center gap-3 mb-6">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/units")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold px-2.5 py-1 rounded-lg text-white"
              style={{ background: borderColor }}
            >
              {unit.id}
            </span>
            <h1 className="text-xl font-semibold text-foreground">{unit.title}</h1>
          </div>
        </div>

        {/* Grammar card */}
        {unit.grammar && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-5 mb-6"
            style={{ borderLeftWidth: 4, borderLeftColor: "#4CAF50", boxShadow: "var(--card-shadow)" }}
          >
            <h3 className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-3">
              Nyelvtani szabály
            </h3>
            <p className="text-sm text-foreground whitespace-pre-line mb-3">
              {unit.grammar.ruleBasic}
            </p>
            {unit.grammar.examples && unit.grammar.examples.length > 0 && (
              <div className="flex flex-col gap-2 mt-3">
                {unit.grammar.examples.map((ex, i) => (
                  <div key={i} className="bg-surface-subtle rounded-xl p-3">
                    <p className="text-sm font-medium text-foreground">{ex.en}</p>
                    <p className="text-xs text-muted-foreground mt-1">{ex.hu}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Unit progress */}
        {unitProgress.completedLessons > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-4 mb-6 flex items-center gap-4"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {unitProgress.wordCount} szót tanultál
              </p>
              <p className="text-xs text-muted-foreground">
                {unitProgress.completedLessons} lecke · {progressPct}% helyes
              </p>
            </div>
            <div className="w-12 h-12 relative">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke={borderColor} strokeWidth="3"
                  strokeDasharray={`${progressPct}, 100`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                {progressPct}%
              </span>
            </div>
          </motion.div>
        )}

        {/* Task list — 10 tasks */}
        <h3 className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-3 px-1">
          Feladatok · {unitProgress.completedLessons > 0 ? `${Math.min(10, unitProgress.completedLessons)}/10` : "0/10"}
        </h3>
        <div className="flex flex-col gap-2 mb-6">
          {(unit.taskTypes || []).map((task: TaskTypeData, i: number) => {
            const taskColor = TASK_COLOR_MAP[task.type] || "#4CAF50";
            return (
              <motion.button
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/unit/${unit.id}/lesson/1?task=${task.id}`)}
                className="w-full bg-card rounded-xl border border-border p-4 flex items-center gap-3 text-left
                  hover:border-foreground/20 transition-all active:scale-[0.98]"
                style={{
                  borderLeftWidth: 3,
                  borderLeftColor: taskColor,
                  boxShadow: "var(--card-shadow)",
                }}
              >
                <span className="text-sm font-medium text-muted-foreground w-6">{task.id}.</span>
                <span className="text-sm font-medium text-foreground flex-1">{task.name}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={taskColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </motion.button>
            );
          })}
        </div>

        {/* Start all button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(`/unit/${unit.id}/lesson/1`)}
          className="w-full py-4 rounded-2xl font-medium text-white text-center"
          style={{ background: `linear-gradient(135deg, ${borderColor}, ${borderColor}dd)` }}
        >
          Összes feladat indítása
        </motion.button>

        {/* Unit test button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(`/unit/${unit.id}/test`)}
          className="w-full py-4 rounded-2xl font-medium text-center mt-3 border-2 transition-colors"
          style={{ borderColor: "#E91E63", color: "#E91E63" }}
        >
          Egység teszt (80% kell)
        </motion.button>

        {/* Word list preview */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-3 px-1">
            Szavak · {unit.wordCount} db
          </h3>
          <div className="bg-card rounded-2xl border border-border overflow-hidden" style={{ boxShadow: "var(--card-shadow)" }}>
            {unit.words.slice(0, 10).map((word, i) => (
              <div
                key={word.id}
                className={`px-4 py-3 flex items-center justify-between ${i > 0 ? "border-t border-border" : ""}`}
              >
                <div>
                  <span className="text-sm font-medium text-foreground">{word.wordDisplay || word.word}</span>
                  <span className="text-xs text-muted-foreground ml-2">{word.pos}</span>
                </div>
                <span className="text-sm text-muted-foreground">{word.hungarian}</span>
              </div>
            ))}
            {unit.wordCount > 10 && (
              <div className="px-4 py-3 border-t border-border text-center">
                <span className="text-xs text-muted-foreground">
                  + {unit.wordCount - 10} további szó
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitPage;
