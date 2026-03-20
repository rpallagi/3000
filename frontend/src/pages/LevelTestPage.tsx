import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { fetchUnits, fetchUnitLesson, UnitData, WordData } from "@/utils/api";
import VocabularyQuizTask from "@/components/tasks/VocabularyQuizTask";
import TypingTask from "@/components/tasks/TypingTask";
import TwoOptionTask from "@/components/tasks/TwoOptionTask";

/**
 * Szintfelmérő — Greta spec:
 * - 5 rész × 1 perc × 5 kérdés
 * - A LEGNEHEZEBB kérdéseket teszi fel
 * - Fail Part 1 → start 1A, pass Part 1 fail Part 2 → start 2A, stb.
 */

const PARTS = [
  { id: 1, label: "1. rész — Alapok", units: ["1A", "1B", "1C", "1D"] },
  { id: 2, label: "2. rész — Jelenidő", units: ["2A", "2B", "2C", "2D", "2E"] },
  { id: 3, label: "3. rész — Múltidő", units: ["3A", "3B", "3C", "3D"] },
  { id: 4, label: "4. rész — Haladó", units: ["4A", "4B", "4C", "4D"] },
  { id: 5, label: "5. rész — Összetett", units: ["5A", "5B", "5C"] },
];

const QUESTIONS_PER_PART = 5;
const TIME_PER_PART_MS = 60_000; // 1 perc

interface Question {
  word: WordData;
  taskType: "quiz" | "typing" | "twoOption";
}

const LevelTestPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allWords, setAllWords] = useState<Map<string, WordData[]>>(new Map());
  const [currentPart, setCurrentPart] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [partScores, setPartScores] = useState<number[]>([]);
  const [currentPartScore, setCurrentPartScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_PART_MS);
  const [timerActive, setTimerActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [resultLevel, setResultLevel] = useState("");

  // Load words for all units
  useEffect(() => {
    const loadAll = async () => {
      try {
        const units = await fetchUnits();
        const wordMap = new Map<string, WordData[]>();
        for (const unit of units) {
          if (unit.wordCount > 0) {
            try {
              const lesson = await fetchUnitLesson(unit.id, 1);
              wordMap.set(unit.id, lesson.words);
            } catch {}
          }
        }
        setAllWords(wordMap);
      } catch {}
      setLoading(false);
    };
    loadAll();
  }, []);

  // Start part
  useEffect(() => {
    if (loading || completed) return;
    if (currentPart >= PARTS.length) {
      finishTest();
      return;
    }

    const part = PARTS[currentPart];
    const partWords: WordData[] = [];
    for (const uid of part.units) {
      const words = allWords.get(uid) || [];
      partWords.push(...words);
    }

    if (partWords.length === 0) {
      // Skip empty part, mark as failed
      setPartScores((prev) => [...prev, 0]);
      setCurrentPart((p) => p + 1);
      return;
    }

    // Pick hardest words (longer words, more complex) — shuffle and take 5
    const sorted = [...partWords].sort((a, b) => b.word.length - a.word.length);
    const selected = sorted.slice(0, QUESTIONS_PER_PART);
    const taskTypes: ("quiz" | "typing" | "twoOption")[] = ["quiz", "typing", "twoOption", "quiz", "typing"];
    const qs = selected.map((word, i) => ({
      word,
      taskType: taskTypes[i % taskTypes.length],
    }));

    setQuestions(qs);
    setCurrentQ(0);
    setCurrentPartScore(0);
    setTimeLeft(TIME_PER_PART_MS);
    setTimerActive(true);
  }, [currentPart, loading, allWords, completed]);

  // Timer
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 100) {
          // Time's up — end part
          clearInterval(interval);
          setTimerActive(false);
          endPart();
          return 0;
        }
        return t - 100;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [timerActive]);

  const endPart = useCallback(() => {
    setTimerActive(false);
    const passed = currentPartScore >= Math.ceil(QUESTIONS_PER_PART * 0.6); // 60% to pass part
    setPartScores((prev) => [...prev, passed ? 1 : 0]);
    if (passed) {
      setCurrentPart((p) => p + 1);
    } else {
      finishTest();
    }
  }, [currentPartScore]);

  const finishTest = () => {
    setCompleted(true);
    setTimerActive(false);
    // Determine starting unit
    const scores = [...partScores];
    let startUnit = "1A";
    for (let i = 0; i < scores.length; i++) {
      if (scores[i] === 0) {
        startUnit = PARTS[i].units[0];
        break;
      }
      if (i === scores.length - 1 && scores[i] === 1) {
        startUnit = "ismétlés"; // All passed
      }
    }
    setResultLevel(startUnit);
    localStorage.setItem("playeng_start_unit", startUnit);
    localStorage.setItem("playeng_level_test_done", "true");
  };

  const handleAnswer = useCallback(
    (score: number, _isError: boolean) => {
      if (score > 0) setCurrentPartScore((s) => s + 1);

      if (currentQ < questions.length - 1) {
        setCurrentQ((q) => q + 1);
      } else {
        endPart();
      }
    },
    [currentQ, questions, endPart]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-muted-foreground">
          Szintfelmérő betöltése...
        </motion.div>
      </div>
    );
  }

  if (completed) {
    const passedParts = partScores.filter((s) => s > 0).length;
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 sm:pt-24 pb-24 px-4 sm:px-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full">
            <div className="text-5xl mb-6">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                <path d="m5 12 5 5L20 7"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Szintfelmérő kész!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {passedParts} / {PARTS.length} részt teljesítettél
            </p>

            {resultLevel === "ismétlés" ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 mb-6">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Gratulálunk! Mindent tudsz — az ismétlési módban folytathatod!
                </p>
              </div>
            ) : (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6">
                <p className="text-sm text-foreground mb-1">Javasolt kezdőpont:</p>
                <p className="text-2xl font-bold" style={{ color: "#4CAF50" }}>{resultLevel}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Innen érdemes indulnod a leghatékonyabb tanulás érdekében.
                </p>
              </div>
            )}

            {/* Time estimation */}
            <div className="bg-card rounded-2xl border border-border p-4 mb-6" style={{ boxShadow: "var(--card-shadow)" }}>
              <p className="text-sm text-muted-foreground mb-1">Becsült tanulási idő</p>
              <p className="text-lg font-semibold text-foreground">130 — 185 óra</p>
              <p className="text-xs text-muted-foreground">
                Napi 10 perccel ~11 hónap · Napi 20 perccel ~6 hónap
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/")}
              className="w-full max-w-xs py-3.5 rounded-2xl font-medium text-white mx-auto"
              style={{ background: "#4CAF50" }}
            >
              Kezdjük el!
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const q = questions[currentQ];
  const part = PARTS[currentPart];
  const timeLeftSec = Math.ceil(timeLeft / 1000);
  const timePercent = (timeLeft / TIME_PER_PART_MS) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 sm:pt-24 pb-24 sm:pb-20 px-4 sm:px-6 max-w-2xl mx-auto flex flex-col items-center safe-bottom">
        {/* Part header */}
        <div className="w-full flex items-center justify-between mb-3">
          <span className="text-xs font-medium px-3 py-1.5 rounded-full text-white" style={{ background: "#1565C0" }}>
            {part.label}
          </span>
          <span className="text-sm font-medium" style={{ color: timeLeftSec <= 10 ? "#E91E63" : "inherit" }}>
            {timeLeftSec}s
          </span>
        </div>

        {/* Timer bar */}
        <div className="w-full h-1.5 bg-secondary rounded-full mb-4">
          <motion.div
            className="h-full rounded-full"
            style={{ background: timeLeftSec <= 10 ? "#E91E63" : "#1565C0" }}
            animate={{ width: `${timePercent}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Question progress */}
        <div className="w-full flex items-center justify-between mb-6">
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < currentQ ? "bg-green-500" : i === currentQ ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {currentQ + 1} / {questions.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentPart}-${currentQ}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {q.taskType === "quiz" && <VocabularyQuizTask word={q.word} onComplete={handleAnswer} />}
            {q.taskType === "typing" && <TypingTask word={q.word} onComplete={handleAnswer} />}
            {q.taskType === "twoOption" && <TwoOptionTask word={q.word} onComplete={handleAnswer} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LevelTestPage;
