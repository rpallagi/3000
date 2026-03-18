import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { fetchLesson, LessonData, WordData } from "@/utils/api";
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

const PracticePage = () => {
  const { chapterId, lessonId } = useParams<{ chapterId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [errors, setErrors] = useState<{ wordId: number; word: string }[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!chapterId || !lessonId) return;
    fetchLesson(Number(chapterId), Number(lessonId))
      .then((data) => {
        setLesson(data);
        // Build task sequence: choice -> sentence -> pronunciation for each word
        const taskList: TaskItem[] = [];
        for (const word of data.words) {
          taskList.push({ type: "choice", word });
        }
        for (const word of data.words) {
          if (word.sentences?.[0]) {
            taskList.push({ type: "sentence", word });
          }
        }
        for (const word of data.words) {
          taskList.push({ type: "pronunciation", word });
        }
        setTasks(taskList);
      })
      .finally(() => setLoading(false));
  }, [chapterId, lessonId]);

  const handleTaskComplete = useCallback(
    (score: number, isError: boolean) => {
      setScores((prev) => [...prev, score]);
      if (isError && tasks[currentTaskIndex]) {
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

  useEffect(() => {
    if (showResults && lesson) {
      const totalScore = scores.reduce((a, b) => a + b, 0);
      const maxPossible = tasks.length * 8; // max per task
      saveLessonResult({
        chapterId: Number(chapterId),
        lessonId: Number(lessonId),
        score: totalScore,
        maxScore: maxPossible,
        completedAt: new Date().toISOString(),
        errors,
      });
    }
  }, [showResults, lesson, scores, tasks, chapterId, lessonId, errors]);

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

  if (!lesson || tasks.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Nincs elérhető gyakorlat</p>
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-20 px-6 max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-4">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Kilépés</span>
          </motion.button>
          <span className="text-sm text-muted-foreground">
            {currentTaskIndex + 1} / {tasks.length}
          </span>
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

export default PracticePage;
