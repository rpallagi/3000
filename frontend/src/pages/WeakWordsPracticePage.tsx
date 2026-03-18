import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Target } from "lucide-react";
import Header from "@/components/Header";
import { getErrorWords } from "@/utils/progress";
import { fetchChapter, WordData } from "@/utils/api";
import { saveLessonResult } from "@/utils/progress";
import MultipleChoiceTask from "@/components/tasks/MultipleChoiceTask";
import SentenceBuildingTask from "@/components/tasks/SentenceBuildingTask";
import PronunciationTask from "@/components/tasks/PronunciationTask";
import ResultsScreen from "@/components/tasks/ResultsScreen";

type TaskType = "choice" | "sentence" | "pronunciation";

interface TaskItem {
  type: TaskType;
  word: WordData;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const WeakWordsPracticePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [errors, setErrors] = useState<{ wordId: number; word: string }[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadWeakWords();
  }, []);

  const loadWeakWords = async () => {
    const errorDict = getErrorWords();
    const sortedErrors = Object.entries(errorDict)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10); // Top 10 weakest

    if (sortedErrors.length === 0) {
      setLoading(false);
      return;
    }

    const wordIds = new Set(sortedErrors.map(([id]) => Number(id)));
    const foundWords: WordData[] = [];
    const chapterWords: WordData[] = [];

    // Fetch chapters to find word details
    try {
      const seenChapters = new Set<number>();
      // Try chapters 1-23 to find the words
      for (let chId = 1; chId <= 23 && foundWords.length < wordIds.size; chId++) {
        const chapterData = await fetchChapter(chId);
        for (const word of chapterData.words) {
          chapterWords.push(word);
          if (wordIds.has(word.id)) {
            foundWords.push(word);
            seenChapters.add(chId);
          }
        }
      }

      // Add distractors from collected chapter words
      const wordsWithDistractors = foundWords.map((w) => {
        const others = chapterWords.filter((o) => o.id !== w.id);
        const shuffled = shuffle(others);
        return {
          ...w,
          distractors: w.distractors?.length
            ? w.distractors
            : shuffled.slice(0, 3).map((o) => o.word),
          distractorsHu: w.distractorsHu?.length
            ? w.distractorsHu
            : shuffled.slice(0, 3).map((o) => o.hungarian),
        };
      });

      // Build tasks
      const taskList: TaskItem[] = [];
      for (const word of shuffle(wordsWithDistractors)) {
        taskList.push({ type: "choice", word });
        if (word.sentences?.[0]) {
          taskList.push({ type: "sentence", word });
        }
        taskList.push({ type: "pronunciation", word });
      }

      setTasks(taskList);
    } catch {}
    setLoading(false);
  };

  const handleTaskComplete = useCallback(
    (score: number, isError: boolean) => {
      setScores((prev) => [...prev, score]);
      if (isError && tasks[currentTaskIndex]?.word) {
        const w = tasks[currentTaskIndex].word;
        setErrors((prev) => [...prev, { wordId: w.id, word: w.word }]);
      }

      if (currentTaskIndex < tasks.length - 1) {
        setCurrentTaskIndex((i) => i + 1);
      } else {
        setShowResults(true);
      }
    },
    [currentTaskIndex, tasks]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-muted-foreground"
        >
          Gyenge szavak betöltése...
        </motion.div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Nincs elég hibás szó a gyakorláshoz</p>
        <button onClick={() => navigate("/error-dictionary")} className="text-primary underline">
          Vissza a hibaszótárhoz
        </button>
      </div>
    );
  }

  if (showResults) {
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const maxPossible = tasks.length * 8;
    return (
      <ResultsScreen
        score={totalScore}
        maxScore={maxPossible}
        errors={errors}
        chapterName="Gyenge szavak gyakorlás"
        onBack={() => navigate("/error-dictionary")}
        onRetry={() => {
          setCurrentTaskIndex(0);
          setScores([]);
          setErrors([]);
          setShowResults(false);
        }}
      />
    );
  }

  const task = tasks[currentTaskIndex];
  const progress = ((currentTaskIndex + 1) / tasks.length) * 100;
  const taskTypeLabel =
    task.type === "choice" ? "Válassz" :
    task.type === "sentence" ? "Építs mondatot" :
    "Mondd ki";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 sm:pt-24 pb-24 sm:pb-20 px-4 sm:px-6 max-w-2xl mx-auto flex flex-col items-center safe-bottom">
        <div className="w-full flex items-center justify-between mb-4">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/error-dictionary")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Kilépés</span>
          </motion.button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-destructive bg-destructive/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Target className="w-3 h-3" />
              Célzott gyakorlás
            </span>
            <span className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
              {taskTypeLabel}
            </span>
            <span className="text-sm text-muted-foreground">
              {currentTaskIndex + 1} / {tasks.length}
            </span>
          </div>
        </div>

        <div className="w-full h-1 bg-secondary rounded-full mb-8">
          <motion.div
            className="h-full bg-destructive rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentTaskIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="w-full"
          >
            {task.type === "choice" && (
              <MultipleChoiceTask word={task.word} onComplete={handleTaskComplete} />
            )}
            {task.type === "sentence" && (
              <SentenceBuildingTask word={task.word} onComplete={handleTaskComplete} />
            )}
            {task.type === "pronunciation" && (
              <PronunciationTask word={task.word} onComplete={handleTaskComplete} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WeakWordsPracticePage;
