import { useState } from "react";
import { motion } from "framer-motion";
import { WordData } from "@/utils/api";

interface Props {
  word: WordData;
  onComplete: (score: number, isError: boolean) => void;
}

const VocabularyQuizTask = ({ word, onComplete }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Build 3 options: 1 correct + 2 distractors
  const distractors = (word.distractorsHu || []).slice(0, 2);
  const options = [word.hungarian, ...distractors].sort(() => Math.random() - 0.5);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    setShowFeedback(true);

    const isCorrect = option === word.hungarian;
    setTimeout(() => {
      onComplete(isCorrect ? 8 : 0, !isCorrect);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-muted-foreground tracking-widths uppercase font-medium">
        Mi a jelentése?
      </p>

      <div className="bg-card rounded-2xl border border-border p-6 w-full text-center"
        style={{ boxShadow: "var(--card-shadow)", borderLeftWidth: 4, borderLeftColor: "#E91E63" }}>
        <h2 className="text-3xl font-semibold text-foreground">{word.wordDisplay || word.word}</h2>
        <span className="text-xs text-muted-foreground mt-1 block">{word.pos}</span>
      </div>

      <div className="w-full flex flex-col gap-3">
        {options.map((option) => {
          let btnClass = "bg-card border-border hover:border-foreground/20";
          if (showFeedback && option === word.hungarian) {
            btnClass = "bg-green-50 dark:bg-green-900/20 border-green-500";
          } else if (showFeedback && option === selected && option !== word.hungarian) {
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

      {showFeedback && selected !== word.hungarian && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
        >
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            Helyes válasz: {word.hungarian}
          </p>
        </motion.div>
      )}

      {showFeedback && selected === word.hungarian && (
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
