import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { fetchUnits, fetchUnitLesson, WordData, saveLevelTestResult } from "@/utils/api";
import { authHeaders, getAccessToken } from "@/contexts/AuthContext";
import VocabularyQuizTask from "@/components/tasks/VocabularyQuizTask";
import TypingTask from "@/components/tasks/TypingTask";
import TwoOptionTask from "@/components/tasks/TwoOptionTask";

const PARTS = [
  { id: 1, label: "1. rész — Alapok", units: ["1A", "1B", "1C", "1D"] },
  { id: 2, label: "2. rész — Jelenidő", units: ["2A", "2B", "2C", "2D", "2E"] },
  { id: 3, label: "3. rész — Múltidő", units: ["3A", "3B", "3C", "3D"] },
  { id: 4, label: "4. rész — Haladó", units: ["4A", "4B", "4C", "4D"] },
  { id: 5, label: "5. rész — Összetett", units: ["5A", "5B", "5C"] },
];

const QUESTIONS_PER_PART = 5;
const TIME_PER_PART_SEC = 60;

interface Question {
  word: WordData;
  taskType: "quiz" | "typing" | "twoOption";
}

type Phase = "loading" | "testing" | "completed";

const LevelTestPage = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("loading");
  const [allWords, setAllWords] = useState<Map<string, WordData[]>>(new Map());

  // Test state
  const [currentPart, setCurrentPart] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [correctInPart, setCorrectInPart] = useState(0);
  const [passedParts, setPassedParts] = useState(0);
  const [resultUnit, setResultUnit] = useState("1A");

  // Timer
  const [timeLeft, setTimeLeft] = useState(TIME_PER_PART_SEC);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load words
  useEffect(() => {
    const load = async () => {
      try {
        const units = await fetchUnits();
        const map = new Map<string, WordData[]>();
        for (const unit of units) {
          if (unit.wordCount > 0) {
            try {
              const lesson = await fetchUnitLesson(unit.id, 1);
              map.set(unit.id, lesson.words);
            } catch {}
          }
        }
        setAllWords(map);
        // Start first part
        startPart(0, map);
      } catch {}
    };
    load();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startPart = (partIndex: number, wordMap: Map<string, WordData[]>) => {
    if (partIndex >= PARTS.length) {
      finish(partIndex);
      return;
    }

    const part = PARTS[partIndex];
    const partWords: WordData[] = [];
    for (const uid of part.units) {
      partWords.push(...(wordMap.get(uid) || []));
    }

    if (partWords.length === 0) {
      finish(partIndex);
      return;
    }

    // Pick hardest words (longer = more complex)
    const sorted = [...partWords].sort((a, b) => b.word.length - a.word.length);
    const selected = sorted.slice(0, QUESTIONS_PER_PART);
    const types: ("quiz" | "typing" | "twoOption")[] = ["quiz", "twoOption", "quiz", "typing", "twoOption"];
    const qs = selected.map((word, i) => ({
      word,
      taskType: types[i % types.length],
    }));

    setQuestions(qs);
    setCurrentQ(0);
    setCorrectInPart(0);
    setCurrentPart(partIndex);
    setTimeLeft(TIME_PER_PART_SEC);
    setPhase("testing");

    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    let remaining = TIME_PER_PART_SEC;
    timerRef.current = setInterval(() => {
      remaining--;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        // Time up — end part as failed
        finish(partIndex);
      }
    }, 1000);
  };

  const finish = (failedAtPart: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const unit = failedAtPart < PARTS.length ? PARTS[failedAtPart].units[0] : "ismétlés";
    setResultUnit(unit);
    setPhase("completed");
    localStorage.setItem("playeng_start_unit", unit);
    localStorage.setItem("playeng_level_test_done", "true");

    // Save to server if logged in
    if (getAccessToken()) {
      saveLevelTestResult({
        startUnit: unit,
        partsPassed: failedAtPart,
        totalScore: correctInPart,
        totalQuestions: QUESTIONS_PER_PART * Math.min(failedAtPart + 1, PARTS.length),
      }, authHeaders()).catch(() => {});
    }
  };

  const handleAnswer = useCallback(
    (score: number, _isError: boolean) => {
      const isCorrect = score > 0;
      const newCorrect = correctInPart + (isCorrect ? 1 : 0);
      setCorrectInPart(newCorrect);

      if (currentQ < questions.length - 1) {
        setCurrentQ((q) => q + 1);
      } else {
        // Part finished
        if (timerRef.current) clearInterval(timerRef.current);
        const passed = newCorrect >= Math.ceil(QUESTIONS_PER_PART * 0.6);
        if (passed) {
          setPassedParts((p) => p + 1);
          startPart(currentPart + 1, allWords);
        } else {
          finish(currentPart);
        }
      }
    },
    [currentQ, questions, correctInPart, currentPart, allWords]
  );

  // Loading
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-muted-foreground">
          Szintfelmérő betöltése...
        </motion.div>
      </div>
    );
  }

  // Completed
  if (phase === "completed") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 sm:pt-24 pb-24 px-4 sm:px-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full">
            <div className="mb-6">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                <path d="m5 12 5 5L20 7"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Szintfelmérő kész!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {passedParts} / {PARTS.length} részt teljesítettél
            </p>

            {resultUnit === "ismétlés" ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 mb-6">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Gratulálunk! Mindent tudsz — az ismétlési módban folytathatod!
                </p>
              </div>
            ) : (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6">
                <p className="text-sm text-foreground mb-1">Javasolt kezdőpont:</p>
                <p className="text-2xl font-bold" style={{ color: "#4CAF50" }}>{resultUnit}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Innen érdemes indulnod a leghatékonyabb tanulás érdekében.
                </p>
              </div>
            )}

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

  // Testing
  if (questions.length === 0) return null;
  const q = questions[currentQ];
  const part = PARTS[currentPart];
  const timePercent = (timeLeft / TIME_PER_PART_SEC) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 sm:pt-24 pb-24 sm:pb-20 px-4 sm:px-6 max-w-2xl mx-auto flex flex-col items-center safe-bottom">
        <div className="w-full flex items-center justify-between mb-3">
          <span className="text-xs font-medium px-3 py-1.5 rounded-full text-white" style={{ background: "#1565C0" }}>
            {part.label}
          </span>
          <span className="text-sm font-medium" style={{ color: timeLeft <= 10 ? "#E91E63" : "inherit" }}>
            {timeLeft}s
          </span>
        </div>

        <div className="w-full h-1.5 bg-secondary rounded-full mb-4">
          <motion.div
            className="h-full rounded-full transition-all duration-1000"
            style={{ background: timeLeft <= 10 ? "#E91E63" : "#1565C0", width: `${timePercent}%` }}
          />
        </div>

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
