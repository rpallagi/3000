import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { fetchUnitLesson, UnitLessonData, WordData } from "@/utils/api";
import { saveLessonResult } from "@/utils/progress";

// Task components
import VocabularyQuizTask from "@/components/tasks/VocabularyQuizTask";
import TypingTask from "@/components/tasks/TypingTask";
import GrammarExplanationTask from "@/components/tasks/GrammarExplanationTask";
import SentenceBuildingTask from "@/components/tasks/SentenceBuildingTask";
import FillGapTask from "@/components/tasks/FillGapTask";
import TwoOptionTask from "@/components/tasks/TwoOptionTask";
import DialogueTask, { parseDialogueTurns } from "@/components/tasks/DialogueTask";
import PronunciationTask from "@/components/tasks/PronunciationTask";
import ActivityTask from "@/components/tasks/ActivityTask";
import ResultsScreen from "@/components/tasks/ResultsScreen";
import { addToReview } from "@/utils/sm2";

// V4 PlayENG method — 10 task types per unit
// Flow: vocab intro (done in UnitLessonPage) → quiz → typing → grammar → sentence builder
//       → fill gap → two options → dialogue → speaking → activity → results

type V4TaskType = "quiz" | "typing" | "grammar" | "sentence" | "fill" | "twoOption" | "dialogue" | "speaking" | "activity";

const TASK_TYPE_LABELS: Record<V4TaskType, string> = {
  quiz: "Visszakérdezés",
  typing: "Begépelés",
  grammar: "Nyelvtan",
  sentence: "Mondatépítő",
  fill: "Kiegészítés",
  twoOption: "Melyik a helyes?",
  dialogue: "Párbeszéd",
  speaking: "Beszédgyakorlat",
  activity: "Activity",
};

const TASK_TYPE_COLORS: Record<V4TaskType, string> = {
  quiz: "#E91E63",
  typing: "#E91E63",
  grammar: "#4CAF50",
  sentence: "#4CAF50",
  fill: "#4CAF50",
  twoOption: "#4CAF50",
  dialogue: "#1565C0",
  speaking: "#1565C0",
  activity: "#FF9800",
};

interface TaskItem {
  type: V4TaskType;
  word?: WordData;
}

const UnitPracticePage = () => {
  const { unitId, lessonId } = useParams<{ unitId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<UnitLessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [errors, setErrors] = useState<{ wordId: number; word: string }[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!unitId || !lessonId) return;

    fetchUnitLesson(unitId, Number(lessonId))
      .then((data) => {
        setLesson(data);
        buildTaskSequence(data);
      })
      .finally(() => setLoading(false));
  }, [unitId, lessonId]);

  const buildTaskSequence = (data: UnitLessonData) => {
    const taskList: TaskItem[] = [];
    const words = data.words;

    // Task 2: Vocabulary Quiz — all words
    for (const word of words.slice(0, 4)) {
      taskList.push({ type: "quiz", word });
    }

    // Task 3: Typing (Wordle) — first 2-3 words
    for (const word of words.slice(0, 3)) {
      taskList.push({ type: "typing", word });
    }

    // Task 4: Grammar explanation (once per lesson)
    if (data.grammar?.ruleBasic) {
      taskList.push({ type: "grammar" });
    }

    // Task 5: Sentence building — words with sentences
    const wordsWithSentences = words.filter((w) => w.sentences?.length);
    for (const word of wordsWithSentences.slice(0, 3)) {
      taskList.push({ type: "sentence", word });
    }

    // Task 6: Fill in the gap
    for (const word of wordsWithSentences.slice(0, 2)) {
      taskList.push({ type: "fill", word });
    }

    // Task 7: Two options
    for (const word of words.slice(0, 3)) {
      taskList.push({ type: "twoOption", word });
    }

    // Task 8: Dialogue (reuse existing)
    if (wordsWithSentences.length > 0) {
      taskList.push({ type: "dialogue", word: wordsWithSentences[0] });
    }

    // Task 9: Speaking
    for (const word of words.slice(0, 2)) {
      taskList.push({ type: "speaking", word });
    }

    // Task 10: Activity
    if (words.length > 0) {
      taskList.push({ type: "activity", word: words[Math.floor(Math.random() * words.length)] });
    }

    setTasks(taskList);
  };

  const handleTaskComplete = useCallback(
    (score: number, isError: boolean) => {
      setScores((prev) => [...prev, score]);
      if (isError && tasks[currentTaskIndex]?.word) {
        const w = tasks[currentTaskIndex].word!;
        setErrors((prev) => [...prev, { wordId: w.id, word: w.word }]);
        // Add to SM-2 review system
        if (lesson) {
          addToReview(w.id, w.word, lesson.unitId);
        }
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
      const maxPossible = tasks.length * 8;
      saveLessonResult({
        chapterId: 0, // V4 uses unitId instead
        lessonId: Number(lessonId),
        score: totalScore,
        maxScore: maxPossible,
        completedAt: new Date().toISOString(),
        errors,
      });
    }
  }, [showResults]);

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
        <button onClick={() => navigate(-1)} className="text-primary underline">Vissza</button>
      </div>
    );
  }

  if (showResults) {
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const maxPossible = tasks.length * 8;
    const wordCount = lesson.words.length;
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 sm:pt-24 pb-24 px-4 sm:px-6 max-w-2xl mx-auto">
          <ResultsScreen
            score={totalScore}
            maxScore={maxPossible}
            errors={errors}
            chapterName={`${lesson.unitId} — ${lesson.unitTitle}`}
            onBack={() => navigate(`/unit/${unitId}`)}
            onRetry={() => {
              setCurrentTaskIndex(0);
              setScores([]);
              setErrors([]);
              setShowResults(false);
            }}
          />

          {/* V4 completion extras */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex flex-col gap-3"
          >
            <div className="bg-card rounded-2xl border border-border p-4 text-center" style={{ boxShadow: "var(--card-shadow)" }}>
              <p className="text-sm text-muted-foreground">{wordCount} szót tanultál ebben a leckében</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const task = tasks[currentTaskIndex];
  const progress = ((currentTaskIndex + 1) / tasks.length) * 100;
  const taskColor = TASK_TYPE_COLORS[task.type];

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
            <span
              className="text-xs font-medium px-3 py-1.5 rounded-full text-white"
              style={{ background: taskColor }}
            >
              {TASK_TYPE_LABELS[task.type]}
            </span>
            <span className="text-sm text-muted-foreground">
              {currentTaskIndex + 1} / {tasks.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-secondary rounded-full mb-8">
          <motion.div
            className="h-full rounded-full"
            style={{ background: taskColor }}
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
            {task.type === "quiz" && task.word && (
              <VocabularyQuizTask word={task.word} onComplete={handleTaskComplete} />
            )}
            {task.type === "typing" && task.word && (
              <TypingTask word={task.word} onComplete={handleTaskComplete} />
            )}
            {task.type === "grammar" && lesson.grammar && (
              <GrammarExplanationTask
                grammar={lesson.grammar}
                unitId={lesson.unitId}
                onComplete={handleTaskComplete}
              />
            )}
            {task.type === "sentence" && task.word && (
              <SentenceBuildingTask word={task.word} onComplete={handleTaskComplete} />
            )}
            {task.type === "fill" && task.word && (
              <FillGapTask word={task.word} onComplete={handleTaskComplete} />
            )}
            {task.type === "twoOption" && task.word && (
              <TwoOptionTask word={task.word} onComplete={handleTaskComplete} />
            )}
            {task.type === "dialogue" && task.word && (
              <DialogueTask
                dialogue={{
                  id: 0,
                  turns: task.word.sentences?.length
                    ? parseDialogueTurns([[task.word.sentences[0].en, task.word.sentences[0].hu]])
                    : [],
                }}
                onComplete={(s) => handleTaskComplete(s, false)}
              />
            )}
            {task.type === "speaking" && task.word && (
              <PronunciationTask word={task.word} onComplete={handleTaskComplete} />
            )}
            {task.type === "activity" && task.word && (
              <ActivityTask
                word={task.word}
                allWords={lesson.words}
                onComplete={handleTaskComplete}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UnitPracticePage;
