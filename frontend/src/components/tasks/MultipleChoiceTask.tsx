import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Volume2, CheckCircle2, XCircle } from "lucide-react";
import { WordData } from "@/utils/api";
import { speak } from "@/utils/tts";
import { isSilent } from "@/utils/settings";

interface Props {
  word: WordData;
  onComplete: (score: number, isError: boolean) => void;
}

const MultipleChoiceTask = ({ word, onComplete }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const options = useMemo(() => {
    const opts = [word.hungarian];
    // Use Hungarian distractors for multiple choice
    const distractors = word.distractorsHu || [];
    for (const d of distractors) {
      if (opts.length < 4 && !opts.includes(d)) opts.push(d);
    }
    // Shuffle
    return opts.sort(() => Math.random() - 0.5);
  }, [word]);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);

    const isCorrect = option === word.hungarian;
    const attempt = attempts + 1;
    setAttempts(attempt);

    if (isCorrect) {
      // Score: 5/2/1/0 based on attempt
      const scoreMap: Record<number, number> = { 1: 5, 2: 2, 3: 1 };
      const score = scoreMap[attempt] || 0;
      setTimeout(() => onComplete(score, attempt > 1), 1200);
    } else {
      // Wrong - let them try again after a delay
      setTimeout(() => {
        setSelected(null);
        setAttempts(attempt);
      }, 1000);
    }
  };

  const handleSpeak = () => {
    if (!isSilent()) speak(word.word);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <p className="text-sm text-muted-foreground tracking-widest uppercase font-medium">
        Mi a jelentése?
      </p>

      <div className="flex items-center gap-3">
        <h2 className="text-4xl font-semibold text-foreground">
          {word.wordDisplay || word.word}
        </h2>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSpeak}
          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <Volume2 className="w-5 h-5 text-primary" />
        </motion.button>
      </div>

      {word.sentences?.[0] && (
        <p className="text-lg text-muted-foreground italic text-center max-w-md">
          "{word.sentences[0].en}"
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {options.map((option) => {
          const isCorrect = option === word.hungarian;
          const isSelected = selected === option;

          let bgClass = "bg-card border-border hover:border-primary/30";
          if (isSelected && isCorrect)
            bgClass = "bg-success/10 border-success";
          else if (isSelected && !isCorrect)
            bgClass = "bg-destructive/10 border-destructive";

          return (
            <motion.button
              key={option}
              whileHover={!selected ? { y: -2 } : {}}
              whileTap={!selected ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(option)}
              disabled={!!selected && selected === word.hungarian}
              className={`p-5 rounded-2xl border text-left transition-colors ${bgClass} cursor-pointer`}
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-foreground">{option}</span>
                {isSelected && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                )}
                {isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleChoiceTask;
