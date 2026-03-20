import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { WordData } from "@/utils/api";

interface Props {
  word: WordData;
  onComplete: (score: number, isError: boolean) => void;
}

const TwoOptionTask = ({ word, onComplete }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Generate two options from the word's sentence
  const sentence = word.sentences?.[0];
  if (!sentence) {
    // Fallback: simple word recognition
    const correct = word.word;
    const wrong = word.distractors?.[0] || "___";
    return <FallbackTwoOption correct={correct} wrong={wrong} hungarian={word.hungarian} onComplete={onComplete} />;
  }

  // Build correct and wrong options from sentence — memoized
  const { correct, options } = useMemo(() => {
    const c = sentence.en;
    const wrongVersion = sentence.en.replace(word.word, word.distractors?.[0] || "___");
    return {
      correct: c,
      options: [c, wrongVersion].sort(() => Math.random() - 0.5),
    };
  }, [word, sentence]);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    setShowFeedback(true);

    const isCorrect = option === correct;
    setTimeout(() => {
      onComplete(isCorrect ? 8 : 0, !isCorrect);
    }, 1800);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-muted-foreground tracking-widest uppercase font-medium">
        Melyik a helyes?
      </p>

      <p className="text-lg text-foreground font-medium text-center px-2">
        {sentence.hu}
      </p>

      <div className="w-full flex flex-col gap-3">
        {options.map((option) => {
          let btnClass = "bg-card border-border hover:border-foreground/20";
          if (showFeedback && option === correct) {
            btnClass = "bg-green-50 dark:bg-green-900/20 border-green-500";
          } else if (showFeedback && option === selected && option !== correct) {
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
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              {option}
            </motion.button>
          );
        })}
      </div>

      {showFeedback && selected !== correct && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
        >
          <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
            A helyes válasz:
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">{correct}</p>
        </motion.div>
      )}
    </div>
  );
};

// Fallback for words without sentences
const FallbackTwoOption = ({
  correct, wrong, hungarian, onComplete,
}: {
  correct: string; wrong: string; hungarian: string;
  onComplete: (score: number, isError: boolean) => void;
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  const options = [correct, wrong].sort(() => Math.random() - 0.5);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    const isCorrect = option === correct;
    setTimeout(() => onComplete(isCorrect ? 8 : 0, !isCorrect), 1500);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-muted-foreground tracking-widest uppercase font-medium">Melyik a helyes?</p>
      <p className="text-lg font-medium text-primary">{hungarian}</p>
      <div className="w-full flex flex-col gap-3">
        {options.map((opt) => (
          <motion.button
            key={opt}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(opt)}
            disabled={!!selected}
            className={`w-full p-4 rounded-xl border text-left text-sm font-medium ${
              selected === opt
                ? opt === correct
                  ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                  : "bg-red-50 dark:bg-red-900/20 border-red-500"
                : "bg-card border-border"
            }`}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default TwoOptionTask;
