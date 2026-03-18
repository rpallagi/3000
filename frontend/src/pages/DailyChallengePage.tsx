import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap, Trophy, Clock } from "lucide-react";
import Header from "@/components/Header";
import { fetchLevels, WordData } from "@/utils/api";
import { getStreak } from "@/utils/progress";
import WordChip from "@/components/WordChip";

const DAILY_KEY = "playeng_daily_challenge";

interface DailyState {
  date: string;
  completed: boolean;
  score: number;
}

const getDailyState = (): DailyState | null => {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

const saveDailyState = (state: DailyState) => {
  localStorage.setItem(DAILY_KEY, JSON.stringify(state));
};

const DailyChallengePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [word, setWord] = useState<WordData | null>(null);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [previousScore, setPreviousScore] = useState(0);

  // Sentence building state
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  const streak = getStreak();

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const daily = getDailyState();
    if (daily?.date === today && daily.completed) {
      setAlreadyDone(true);
      setPreviousScore(daily.score);
      setLoading(false);
      return;
    }

    // Pick a random word for today (seeded by date)
    loadRandomWord(today);
  }, []);

  const loadRandomWord = async (date: string) => {
    try {
      const levels = await fetchLevels();
      // Use date as seed for consistent daily word
      const seed = date.split("-").reduce((a, b) => a + parseInt(b), 0);
      const allChapters = levels.flatMap((l) => l.chapters);
      const chapterIdx = seed % allChapters.length;
      const chapter = allChapters[chapterIdx];

      const res = await fetch(`/api/chapters/${chapter.id}/lesson/1`);
      if (!res.ok) throw new Error("Failed");
      const lesson = await res.json();

      const wordIdx = seed % lesson.words.length;
      const w = lesson.words[wordIdx];
      if (w?.sentences?.[0]) {
        setWord(w);
        setTimerActive(true);
      }
    } catch {}
    setLoading(false);
  };

  // Timer countdown
  useEffect(() => {
    if (!timerActive || completed) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          finishChallenge(1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, completed]);

  const sentence = word?.sentences?.[0];
  const correctWords = useMemo(
    () => (sentence ? sentence.en.replace(/[.,!?;:]/g, "").split(/\s+/) : []),
    [sentence]
  );

  const allWords = useMemo(() => {
    if (!word) return [];
    const distractors = (word.distractors || []).slice(0, 2);
    return [...correctWords, ...distractors].sort(() => Math.random() - 0.5);
  }, [correctWords, word?.distractors]);

  const [shuffled] = useState(allWords);

  const finishChallenge = (finalScore: number) => {
    setCompleted(true);
    setScore(finalScore);
    setTimerActive(false);
    const today = new Date().toISOString().slice(0, 10);
    saveDailyState({ date: today, completed: true, score: finalScore });
  };

  const handleWordClick = (w: string) => {
    if (result === "correct" || completed) return;
    if (selected.includes(w)) return;
    const newSelected = [...selected, w];
    setSelected(newSelected);

    if (newSelected.length === correctWords.length) {
      const isCorrect = newSelected.every(
        (s, i) => s.toLowerCase() === correctWords[i].toLowerCase()
      );
      const attempt = attempts + 1;
      setAttempts(attempt);

      if (isCorrect) {
        setResult("correct");
        const finalScore = 15; // Daily challenge: +15 for correct
        setTimeout(() => finishChallenge(finalScore), 1200);
      } else {
        setResult("wrong");
        setTimeout(() => {
          setSelected([]);
          setResult(null);
        }, 1000);
      }
    }
  };

  const handleRemove = (index: number) => {
    if (result === "correct" || completed) return;
    setSelected((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  };

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

  // Already completed today
  if (alreadyDone) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 sm:pt-24 pb-24 sm:pb-20 px-4 sm:px-6 max-w-lg mx-auto flex flex-col items-center gap-6 safe-bottom">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mt-8"
          >
            <Trophy className="w-10 h-10 text-success" />
          </motion.div>
          <h1 className="text-2xl font-semibold text-foreground">Mai kihívás teljesítve!</h1>
          <p className="text-muted-foreground text-center">
            +{previousScore} pont
            {streak > 1 && (
              <span className="block mt-1 text-primary font-medium">{streak} napos sorozat!</span>
            )}
          </p>
          <p className="text-sm text-muted-foreground">Gyere vissza holnap az új kihívásért!</p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Főoldal
          </button>
        </div>
      </div>
    );
  }

  // Completed just now
  if (completed) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 sm:pt-24 pb-24 sm:pb-20 px-4 sm:px-6 max-w-lg mx-auto flex flex-col items-center gap-6 safe-bottom">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mt-8"
          >
            <Zap className="w-10 h-10 text-primary" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-semibold text-foreground"
          >
            {score >= 15 ? "Hibátlan!" : "Kész!"}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-[24px] border border-border p-6 w-full text-center"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <p className="text-4xl font-semibold text-primary mb-2">+{score}</p>
            <p className="text-muted-foreground">pont</p>
            {streak > 0 && (
              <p className="text-sm text-primary font-medium mt-2">{streak + 1} napos sorozat!</p>
            )}
          </motion.div>
          {sentence && (
            <p className="text-lg text-foreground font-medium text-center">
              {sentence.en}
            </p>
          )}
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity mt-4"
          >
            Főoldal
          </button>
        </div>
      </div>
    );
  }

  if (!word || !sentence) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Nem sikerült betölteni a kihívást.</p>
        <button onClick={() => navigate("/")} className="text-primary underline">Főoldal</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 sm:pt-24 pb-24 sm:pb-20 px-4 sm:px-6 max-w-2xl mx-auto flex flex-col items-center gap-6 safe-bottom">
        <div className="w-full flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Vissza</span>
          </button>
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${timer <= 10 ? "text-destructive" : "text-muted-foreground"}`} />
            <span className={`text-sm font-mono font-medium ${timer <= 10 ? "text-destructive" : "text-muted-foreground"}`}>
              {timer}s
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <p className="text-sm text-muted-foreground tracking-widest uppercase font-medium">
            Napi kihívás
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          Fordítsd le 30 másodperc alatt!
        </p>

        {/* Hungarian sentence */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground text-center leading-snug px-2">
          {sentence.hu}
        </h2>

        {/* Drop zone */}
        <div
          className={`w-full max-w-2xl min-h-[80px] flex flex-wrap gap-3 p-5 rounded-2xl border-2 border-dashed transition-colors ${
            result === "correct"
              ? "border-success bg-success/5"
              : result === "wrong"
              ? "border-destructive bg-destructive/5"
              : "border-border bg-surface-subtle"
          }`}
        >
          <AnimatePresence mode="popLayout">
            {selected.map((w, i) => (
              <WordChip
                key={`sel-${w}-${i}`}
                word={w}
                selected
                onClick={() => handleRemove(i)}
              />
            ))}
          </AnimatePresence>
          {selected.length === 0 && (
            <span className="text-muted-foreground text-sm self-center mx-auto">
              Kattints a szavakra...
            </span>
          )}
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium ${
                result === "correct"
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {result === "correct" ? "Helyes!" : "Nem stimmel, próbáld újra!"}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Word options */}
        <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
          {(shuffled.length > 0 ? shuffled : allWords).map((w, i) => (
            <WordChip
              key={`opt-${w}-${i}`}
              word={w}
              onClick={() => handleWordClick(w)}
              disabled={selected.includes(w)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyChallengePage;
