import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { WordData } from "@/utils/api";

interface Props {
  word: WordData;
  onComplete: (score: number, isError: boolean) => void;
  /** If true, show Hungarian word and ask for English (reverse direction) */
  reverse?: boolean;
}

const VocabularyQuizTask = ({ word, onComplete, reverse = false }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Build 3 options: 1 correct + 2 distractors — memoized to prevent re-randomization
  const { options, correctAnswer, questionText } = useMemo(() => {
    if (reverse) {
      // HU→EN: show Hungarian, ask for English
      const distractors = (word.distractors || []).slice(0, 2);
      const opts = [word.word, ...distractors].sort(() => Math.random() - 0.5);
      return {
        options: opts,
        correctAnswer: word.word,
        questionText: word.hungarian,
      };
    } else {
      // EN→HU: show English, ask for Hungarian
      const distractors = (word.distractorsHu || []).slice(0, 2);
      const opts = [word.hungarian, ...distractors].sort(() => Math.random() - 0.5);
      return {
        options: opts,
        correctAnswer: word.hungarian,
        questionText: word.wordDisplay || word.word,
      };
    }
  }, [word, reverse]);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    setShowFeedback(true);

    const isCorrect = option === correctAnswer;
    setTimeout(() => {
      onComplete(isCorrect ? 8 : 0, !isCorrect);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-muted-foreground tracking-widest uppercase font-medium">
        {reverse ? "Melyik az angol szó?" : "Mi a jelentése?"}
      </p>

      <div className="bg-card rounded-2xl border border-border p-6 w-full text-center"
        style={{ boxShadow: "var(--card-shadow)", borderLeftWidth: 4, borderLeftColor: "#E91E63" }}>
        <h2 className="text-3xl font-semibold text-foreground">{questionText}</h2>
        {!reverse && <span className="text-xs text-muted-foreground mt-1 block">{word.pos}</span>}
      </div>

      <div className="w-full flex flex-col gap-3">
        {options.map((option) => {
          let btnClass = "bg-card border-border hover:border-foreground/20";
          if (showFeedback && option === correctAnswer) {
            btnClass = "bg-green-50 dark:bg-green-900/20 border-green-500";
          } else if (showFeedback && option === selected && option !== correctAnswer) {
            btnClass = "bg-red-50 dark:bg-red-900/20 border-red-500";
          }

          return (
            <motion.button
              key={option}
              whileHover={!selected ? { scale: 1.01 } : {}}
              whileTap={!selected ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(option)}
              disabled={!!selected}
              className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all ${btnClass}`}
            >
              {option}
            </motion.button>
          );
        })}
      </div>

      {showFeedback && selected !== correctAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
        >
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            Helyes válasz: {correctAnswer}
          </p>
        </motion.div>
      )}

      {showFeedback && selected === correctAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-green-600"
        >
          Helyes!
        </motion.div>
      )}
    </div>
  );
};

export default VocabularyQuizTask;
