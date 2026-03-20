import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { fetchUnitLesson, fetchUnitDialogue, UnitLessonData, WordData } from "@/utils/api";
import { saveLessonResult } from "@/utils/progress";

// Task components
import VocabularyIntroTask from "@/components/tasks/VocabularyIntroTask";
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

type V4TaskType = "vocabIntro" | "quiz" | "typing" | "grammar" | "sentence" | "fill" | "twoOption" | "dialogue" | "speaking" | "activity";

const TASK_TYPE_LABELS: Record<V4TaskType, string> = {
  vocabIntro: "Szókincs bemutatás",
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
  vocabIntro: "#E91E63",
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
  reverse?: boolean;  // For bidirectional quiz (HU→EN)
}

// Map task IDs to V4TaskType
const TASK_ID_MAP: Record<number, V4TaskType> = {
  1: "vocabIntro",
  2: "quiz",
  3: "typing",
  4: "grammar",
  5: "sentence",
  6: "fill",
  7: "twoOption",
  8: "dialogue",
  9: "speaking",
  10: "activity",
};

const UnitPracticePage = () => {
  const { unitId, lessonId } = useParams<{ unitId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [lesson, setLesson] = useState<UnitLessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [errors, setErrors] = useState<{ wordId: number; word: string }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [dialogueData, setDialogueData] = useState<{ id: number; turns: string[][] } | null>(null);
  const taskStartTime = useRef<number>(Date.now());

  useEffect(() => {
    if (!unitId || !lessonId) return;

    Promise.all([
      fetchUnitLesson(unitId, Number(lessonId)),
      fetchUnitDialogue(unitId),
    ]).then(([data, dialogue]) => {
        setLesson(data);
        setDialogueData(dialogue);
        buildTaskSequence(data);
      })
      .finally(() => setLoading(false));
  }, [unitId, lessonId]);

  const buildTaskSequence = (data: UnitLessonData) => {
    const words = data.words;
    const wordsWithSentences = words.filter((w) => w.sentences?.length);

    // Check if a specific task type was requested via ?startTask=N
    const startTaskId = Number(searchParams.get("startTask") || 0);
    const singleTaskType = startTaskId > 0 ? TASK_ID_MAP[startTaskId] : null;

    const addTasksForType = (type: V4TaskType, list: TaskItem[]) => {
      switch (type) {
        case "vocabIntro":
          // Vocab intro uses all words as a group (handled by VocabularyIntroTask)
          if (words.length > 0) list.push({ type: "vocabIntro" });
          break;
        case "quiz":
          // EN→HU direction
          for (const word of words.slice(0, 3)) list.push({ type: "quiz", word });
          // HU→EN direction (reverse)
          for (const word of words.slice(0, 3)) list.push({ type: "quiz", word, reverse: true });
          break;
        case "typing":
          for (const word of words.slice(0, 4)) list.push({ type: "typing", word });
          break;
        case "grammar":
          if (data.grammar?.ruleBasic) list.push({ type: "grammar" });
          break;
        case "sentence":
          for (const word of wordsWithSentences.slice(0, 4)) list.push({ type: "sentence", word });
          break;
        case "fill":
          for (const word of wordsWithSentences.slice(0, 4)) list.push({ type: "fill", word });
          break;
        case "twoOption":
          for (const word of words.slice(0, 4)) list.push({ type: "twoOption", word });
          break;
        case "dialogue":
          if (wordsWithSentences.length > 0) list.push({ type: "dialogue", word: wordsWithSentences[0] });
          break;
        case "speaking":
          for (const word of words.slice(0, 3)) list.push({ type: "speaking", word });
          break;
        case "activity":
          if (words.length > 0) list.push({ type: "activity", word: words[Math.floor(Math.random() * words.length)] });
          break;
      }
    };

    const taskList: TaskItem[] = [];

    if (singleTaskType) {
      // Only build tasks for the requested type
      addTasksForType(singleTaskType, taskList);
    } else {
      // Full lesson flow: all 10 task types in sequence (Greta v4 order)
      const allTypes: V4TaskType[] = ["vocabIntro", "quiz", "typing", "grammar", "sentence", "fill", "twoOption", "dialogue", "speaking", "activity"];
      for (const type of allTypes) {
        addTasksForType(type, taskList);
      }
    }

    setTasks(taskList);
  };

  const handleTaskComplete = useCallback(
    (score: number, isError: boolean) => {
      const elapsed = Date.now() - taskStartTime.current;
      setScores((prev) => [...prev, score]);

      const w = tasks[currentTaskIndex]?.word;
      if (w && lesson) {
        if (isError) {
          setErrors((prev) => [...prev, { wordId: w.id, word: w.word }]);
          // Add to SM-2 review system (wrong answer)
          addToReview(w.id, w.word, lesson.unitId, w.hungarian);
        } else if (elapsed > 10000) {
          // Slow answer (>10s) — Greta spec: add to SM-2
          addToReview(w.id, w.word, lesson.unitId, w.hungarian);
        }
      }

      // Reset timer for next task
      taskStartTime.current = Date.now();

      if (currentTaskIndex < tasks.length - 1) {
        setCurrentTaskIndex((i) => i + 1);
      } else {
        setShowResults(true);
      }
    },
    [currentTaskIndex, tasks, lesson]
  );

  useEffect(() => {
    if (showResults && lesson) {
      const totalScore = scores.reduce((a, b) => a + b, 0);
      const maxPossible = tasks.length * 8;
      saveLessonResult({
        chapterId: 0,
        lessonId: Number(lessonId),
        score: totalScore,
        maxScore: maxPossible,
        completedAt: new Date().toISOString(),
        errors,
        unitId: lesson.unitId,
        totalTasks: tasks.length,
        wordCount: lesson.words.length,
      });

      // Sync SM-2 to server
      import("@/utils/sm2").then(({ syncSM2ToServer }) => syncSM2ToServer().catch(() => {}));

      // Sync unit progress to server
      import("@/utils/api").then(({ saveUnitProgress }) => {
        import("@/contexts/AuthContext").then(({ getAccessToken, authHeaders }) => {
          if (getAccessToken()) {
            saveUnitProgress(lesson.unitId, {
              completedLessons: Number(lessonId),
              totalScore,
              totalMaxScore: maxPossible,
              wordCount: lesson.words.length,
            }, authHeaders()).catch(() => {});
          }
        });
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
            {task.type === "vocabIntro" && lesson && (
              <VocabularyIntroTask words={lesson.words.slice(0, 8)} onComplete={handleTaskComplete} />
            )}
            {task.type === "quiz" && task.word && (
              <VocabularyQuizTask word={task.word} reverse={task.reverse} onComplete={handleTaskComplete} />
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
            {task.type === "dialogue" && dialogueData && (
              <DialogueTask
                dialogue={{
                  id: dialogueData.id,
                  turns: parseDialogueTurns(dialogueData.turns),
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
