import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import Header from "@/components/Header";
import { fetchChapter, fetchDialogues, ChapterDetail, WordData } from "@/utils/api";
import { saveLessonResult } from "@/utils/progress";
import MultipleChoiceTask from "@/components/tasks/MultipleChoiceTask";
import SentenceBuildingTask from "@/components/tasks/SentenceBuildingTask";
import PronunciationTask from "@/components/tasks/PronunciationTask";
import DialogueTask, { parseDialogueTurns } from "@/components/tasks/DialogueTask";
import ResultsScreen from "@/components/tasks/ResultsScreen";

type TaskType = "choice" | "sentence" | "pronunciation" | "dialogue";

interface TaskItem {
  type: TaskType;
  word?: WordData;
  dialogue?: any;
}

/** Shuffle array (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ChapterTestPage = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [errors, setErrors] = useState<{ wordId: number; word: string }[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!chapterId) return;

    Promise.all([
      fetchChapter(Number(chapterId)),
      fetchDialogues(Number(chapterId)).catch(() => []),
    ]).then(([chapterData, dialogues]) => {
      setChapter(chapterData);

      // Pick 10 random words from the entire chapter for the test
      const testWords = shuffle(chapterData.words).slice(0, 10);

      // Generate distractors from chapter words for each test word
      const allWords = chapterData.words;
      const wordsWithDistractors: WordData[] = testWords.map((w) => {
        const others = allWords.filter((o) => o.id !== w.id);
        const shuffledOthers = shuffle(others);
        return {
          ...w,
          distractors: w.distractors?.length
            ? w.distractors
            : shuffledOthers.slice(0, 3).map((o) => o.word),
          distractorsHu: w.distractorsHu?.length
            ? w.distractorsHu
            : shuffledOthers.slice(0, 3).map((o) => o.hungarian),
        };
      });

      // Build task list — same PlayENG method per word
      const taskList: TaskItem[] = [];
      for (const word of wordsWithDistractors) {
        taskList.push({ type: "choice", word });
        if (word.sentences?.[0]) {
          taskList.push({ type: "sentence", word });
        }
        taskList.push({ type: "pronunciation", word });
      }

      // Add a dialogue at the end if available
      if (dialogues.length > 0) {
        const dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
        const parsedTurns = parseDialogueTurns(dialogue.turns);
        taskList.push({
          type: "dialogue",
          dialogue: { id: dialogue.id, turns: parsedTurns },
        });
      }

      setTasks(taskList);
    }).finally(() => setLoading(false));
  }, [chapterId]);

  const handleTaskComplete = useCallback(
    (score: number, isError: boolean) => {
      setScores((prev) => [...prev, score]);
      if (isError && tasks[currentTaskIndex]?.word) {
        const w = tasks[currentTaskIndex].word!;
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

  const handleDialogueComplete = useCallback(
    (dialogueScore: number) => {
      setScores((prev) => [...prev, dialogueScore]);
      if (currentTaskIndex < tasks.length - 1) {
        setCurrentTaskIndex((i) => i + 1);
      } else {
        setShowResults(true);
      }
    },
    [currentTaskIndex, tasks]
  );

  // Save result as lessonId=0 (chapter test marker)
  useEffect(() => {
    if (showResults && chapter) {
      const totalScore = scores.reduce((a, b) => a + b, 0);
      const maxPossible = tasks.length * 8;
      saveLessonResult({
        chapterId: Number(chapterId),
        lessonId: 0, // 0 = chapter test
        score: totalScore,
        maxScore: maxPossible,
        completedAt: new Date().toISOString(),
        errors,
      });
    }
  }, [showResults, chapter, scores, tasks, chapterId, errors]);

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

  if (!chapter || tasks.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Nincs elérhető teszt</p>
        <button onClick={() => navigate(-1)} className="text-primary underline">
          Vissza
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
        chapterName={chapter.nameEn}
        onBack={() => navigate(`/chapter/${chapterId}`)}
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
    task.type === "pronunciation" ? "Mondd ki" :
    "Párbeszéd";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 sm:pt-24 pb-24 sm:pb-20 px-4 sm:px-6 max-w-2xl mx-auto flex flex-col items-center safe-bottom">
        <div className="w-full flex items-center justify-between mb-4">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(`/chapter/${chapterId}`)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Kilépés</span>
          </motion.button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              Fejezet teszt
            </span>
            <span className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
              {taskTypeLabel}
            </span>
            <span className="text-sm text-muted-foreground">
              {currentTaskIndex + 1} / {tasks.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-secondary rounded-full mb-8">
          <motion.div
            className="h-full bg-primary rounded-full"
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
            {task.type === "choice" && task.word && (
              <MultipleChoiceTask word={task.word} onComplete={handleTaskComplete} />
            )}
            {task.type === "sentence" && task.word && (
              <SentenceBuildingTask word={task.word} onComplete={handleTaskComplete} />
            )}
            {task.type === "pronunciation" && task.word && (
              <PronunciationTask word={task.word} onComplete={handleTaskComplete} />
            )}
            {task.type === "dialogue" && task.dialogue && (
              <DialogueTask dialogue={task.dialogue} onComplete={handleDialogueComplete} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChapterTestPage;
