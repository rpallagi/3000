import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import { getDueItems, recordReview, SM2Item } from "@/utils/sm2";
import VocabularyQuizTask from "@/components/tasks/VocabularyQuizTask";
import TypingTask from "@/components/tasks/TypingTask";
import { WordData } from "@/utils/api";

const ReviewPage = () => {
  const navigate = useNavigate();
  const [dueItems, setDueItems] = useState<SM2Item[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [taskType, setTaskType] = useState<"quiz" | "typing">("quiz");

  useEffect(() => {
    const items = getDueItems();
    setDueItems(items);
    if (items.length === 0) setCompleted(true);
  }, []);

  const handleComplete = useCallback(
    (score: number, isError: boolean) => {
      const item = dueItems[currentIndex];
      if (!item) return;

      // Record SM-2 review
      const quality = isError ? 1 : 5;
      recordReview(item.wordId, item.word, item.unitId, quality);

      if (!isError) setCorrectCount((c) => c + 1);

      if (currentIndex < dueItems.length - 1) {
        setCurrentIndex((i) => i + 1);
        // Alternate between quiz and typing
        setTaskType((t) => (t === "quiz" ? "typing" : "quiz"));
      } else {
        setCompleted(true);
      }
    },
    [currentIndex, dueItems]
  );

  if (dueItems.length === 0 || completed) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 sm:pt-24 pb-24 px-4 sm:px-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            {dueItems.length === 0 ? (
              <>
                <div className="text-5xl mb-4">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><path d="m5 12 5 5L20 7"/></svg>
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Nincs esedékes ismétlés!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Minden szót átismételtél. Gyere vissza holnap!
                </p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><path d="m5 12 5 5L20 7"/></svg>
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Ismétlés kész!
                </h2>
                <p className="text-muted-foreground mb-2">
                  {correctCount} / {dueItems.length} helyes
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  {correctCount === dueItems.length
                    ? "Tökéletes! Minden szót tudtál!"
                    : "A hibás szavak holnap újra jönnek."}
                </p>
              </>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/")}
              className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium"
            >
              Vissza a főoldalra
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  const item = dueItems[currentIndex];
  const progress = ((currentIndex + 1) / dueItems.length) * 100;

  // Build a WordData-like object from SM2Item
  const wordData: WordData = {
    id: item.wordId,
    word: item.word,
    wordDisplay: item.word,
    hungarian: "", // Will be filled by the quiz task from distractors
    pos: "",
    chapter: 0,
    sentences: [],
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 sm:pt-24 pb-24 sm:pb-20 px-4 sm:px-6 max-w-2xl mx-auto flex flex-col items-center safe-bottom">
        <div className="w-full flex items-center justify-between mb-4">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Kilépés</span>
          </motion.button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium px-3 py-1.5 rounded-full text-white bg-amber-500">
              Ismétlés
            </span>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {dueItems.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-secondary rounded-full mb-8">
          <motion.div
            className="h-full bg-amber-500 rounded-full"
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
            {taskType === "typing" ? (
              <TypingTask word={wordData} onComplete={handleComplete} />
            ) : (
              <TypingTask word={wordData} onComplete={handleComplete} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReviewPage;
