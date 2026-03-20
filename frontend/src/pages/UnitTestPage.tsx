import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { fetchUnit, UnitDetail, WordData } from "@/utils/api";
import VocabularyQuizTask from "@/components/tasks/VocabularyQuizTask";
import TypingTask from "@/components/tasks/TypingTask";
import TwoOptionTask from "@/components/tasks/TwoOptionTask";
import FillGapTask from "@/components/tasks/FillGapTask";

const PASS_THRESHOLD = 80; // Greta spec: 80% needed to pass

const UnitTestPage = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const [unit, setUnit] = useState<UnitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<{ type: string; word: WordData }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!unitId) return;
    fetchUnit(unitId)
      .then((data) => {
        setUnit(data);
        buildTest(data);
      })
      .finally(() => setLoading(false));
  }, [unitId]);

  const buildTest = (data: UnitDetail) => {
    // Select 10 random words from the unit for the test
    const shuffled = [...data.words].sort(() => Math.random() - 0.5).slice(0, 10);
    const taskTypes = ["quiz", "typing", "twoOption", "fill"];
    const qs = shuffled.map((word, i) => ({
      type: taskTypes[i % taskTypes.length],
      word,
    }));
    setQuestions(qs);
  };

  const handleComplete = useCallback(
    (score: number, _isError: boolean) => {
      setScores((prev) => [...prev, score]);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setCompleted(true);
      }
    },
    [currentIndex, questions]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-muted-foreground">
          Betöltés...
        </motion.div>
      </div>
    );
  }

  if (!unit || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Teszt nem elérhető</p>
        <button onClick={() => navigate(-1)} className="text-primary underline">Vissza</button>
      </div>
    );
  }

  if (completed) {
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const maxScore = questions.length * 8;
    const percentage = Math.round((totalScore / maxScore) * 100);
    const passed = percentage >= PASS_THRESHOLD;

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 sm:pt-24 pb-24 px-4 sm:px-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full">
            {/* Result circle */}
            <div className="w-28 h-28 mx-auto mb-6 relative">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke={passed ? "#4CAF50" : "#E91E63"} strokeWidth="3"
                  strokeDasharray={`${percentage}, 100`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-foreground">
                {percentage}%
              </span>
            </div>

            <h2 className="text-xl font-semibold text-foreground mb-2">
              {passed ? "Szép munka! Sikerült!" : "Még nem sikerült"}
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              {unit.id} — {unit.title}
            </p>
            <p className="text-sm mb-6" style={{ color: passed ? "#4CAF50" : "#E91E63" }}>
              {passed
                ? `${percentage}% — Továbblépés a következő egységre!`
                : `${percentage}% — 80% kell a továbblépéshez. Gyakorolj még!`}
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
              {passed && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/units")}
                  className="w-full py-3.5 rounded-2xl font-medium text-white"
                  style={{ background: "#4CAF50" }}
                >
                  Tovább
                </motion.button>
              )}
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setScores([]);
                  setCompleted(false);
                  if (unit) buildTest(unit);
                }}
                className="w-full py-3.5 rounded-2xl font-medium border border-border text-foreground hover:bg-secondary/50 transition-colors"
              >
                Újra próbálom
              </button>
              <button
                onClick={() => navigate(`/unit/${unitId}`)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Vissza az egységhez
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 sm:pt-24 pb-24 sm:pb-20 px-4 sm:px-6 max-w-2xl mx-auto flex flex-col items-center safe-bottom">
        <div className="w-full flex items-center justify-between mb-4">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(`/unit/${unitId}`)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Kilépés</span>
          </motion.button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium px-3 py-1.5 rounded-full text-white" style={{ background: "#E91E63" }}>
              Egység teszt
            </span>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>

        <div className="w-full h-1 bg-secondary rounded-full mb-8">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "#E91E63" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="w-full"
          >
            {q.type === "quiz" && <VocabularyQuizTask word={q.word} onComplete={handleComplete} />}
            {q.type === "typing" && <TypingTask word={q.word} onComplete={handleComplete} />}
            {q.type === "twoOption" && <TwoOptionTask word={q.word} onComplete={handleComplete} />}
            {q.type === "fill" && <FillGapTask word={q.word} onComplete={handleComplete} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UnitTestPage;
