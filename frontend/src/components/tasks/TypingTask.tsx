import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { WordData } from "@/utils/api";

interface Props {
  word: WordData;
  onComplete: (score: number, isError: boolean) => void;
}

const KEYBOARD_ROWS = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  "ZXCVBNM".split(""),
];

const TypingTask = ({ word, onComplete }: Props) => {
  const target = word.word.toLowerCase().replace(/[^a-z]/g, "");
  const [typed, setTyped] = useState<string[]>([]);
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [errors, setErrors] = useState(0);

  const handleKey = useCallback((letter: string) => {
    if (completed) return;
    const idx = typed.length;
    if (idx >= target.length) return;

    const expected = target[idx].toUpperCase();
    if (letter === expected) {
      const newTyped = [...typed, letter];
      setTyped(newTyped);
      setWrongKey(null);

      if (newTyped.length === target.length) {
        setCompleted(true);
        setTimeout(() => {
          onComplete(errors === 0 ? 8 : Math.max(2, 8 - errors * 2), errors > 0);
        }, 1500);
      }
    } else {
      setWrongKey(letter);
      setErrors((e) => e + 1);
      setTimeout(() => setWrongKey(null), 400);
    }
  }, [typed, target, completed, errors, onComplete]);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-muted-foreground tracking-widest uppercase font-medium">
        Gépeld be a szót
      </p>

      <p className="text-lg text-primary font-medium">{word.hungarian}</p>

      {/* Letter boxes (Wordle-style) */}
      <div className="flex gap-2 justify-center flex-wrap">
        {target.split("").map((letter, i) => {
          const isFilled = i < typed.length;
          return (
            <motion.div
              key={i}
              animate={isFilled ? { scale: [1.1, 1] } : {}}
              className={`w-12 h-14 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-all ${
                isFilled
                  ? "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300"
                  : i === typed.length
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              {isFilled ? typed[i] : ""}
            </motion.div>
          );
        })}
      </div>

      {completed && (
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-lg font-semibold text-green-600"
        >
          Helyes!
        </motion.p>
      )}

      {/* On-screen keyboard */}
      <div className="flex flex-col items-center gap-1.5 mt-4 w-full max-w-sm">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1 justify-center">
            {row.map((letter) => {
              const isUsed = typed.includes(letter);
              const isWrong = wrongKey === letter;
              return (
                <motion.button
                  key={letter}
                  whileTap={{ scale: 0.9 }}
                  animate={isWrong ? { x: [-4, 4, -4, 0] } : {}}
                  transition={isWrong ? { duration: 0.3 } : {}}
                  onClick={() => handleKey(letter)}
                  disabled={completed}
                  className={`w-8 h-10 sm:w-9 sm:h-11 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isUsed
                      ? "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200"
                      : isWrong
                      ? "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200"
                      : "bg-secondary hover:bg-secondary/80 text-foreground"
                  }`}
                >
                  {letter}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TypingTask;
