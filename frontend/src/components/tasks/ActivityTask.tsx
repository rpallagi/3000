import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { WordData } from "@/utils/api";

interface Props {
  word: WordData;
  allWords: WordData[];
  onComplete: (score: number, isError: boolean) => void;
}

const KEYBOARD_ROWS = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  "ZXCVBNM".split(""),
];

const ActivityTask = ({ word, allWords, onComplete }: Props) => {
  const target = word.word.toLowerCase().replace(/[^a-z]/g, "");
  const [typed, setTyped] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [errors, setErrors] = useState(0);
  const [wrongKey, setWrongKey] = useState<string | null>(null);

  // Build a simple riddle/clue
  const clue = word.hungarian;

  const handleKey = useCallback((letter: string) => {
    if (completed) return;
    const idx = typed.length;
    if (idx >= target.length) return;

    if (letter.toLowerCase() === target[idx]) {
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
    <div className="flex flex-col items-center gap-5">
      <p className="text-sm tracking-widest uppercase font-medium" style={{ color: "#FF9800" }}>
        Activity
      </p>

      {/* Clue card */}
      <div className="bg-card rounded-2xl border border-border p-5 w-full text-center"
        style={{ boxShadow: "var(--card-shadow)", borderLeftWidth: 4, borderLeftColor: "#FF9800" }}>
        <p className="text-sm text-muted-foreground mb-2">Találd ki a szót!</p>
        <p className="text-lg font-medium text-foreground">{clue}</p>
        {word.sentences?.[0] && (
          <p className="text-sm text-muted-foreground mt-2 italic">
            Tipp: {word.sentences[0].hu}
          </p>
        )}
      </div>

      {/* Letter boxes */}
      <div className="flex gap-1.5 justify-center flex-wrap">
        {target.split("").map((_, i) => {
          const isFilled = i < typed.length;
          return (
            <motion.div
              key={i}
              animate={isFilled ? { scale: [1.1, 1] } : {}}
              className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-all ${
                isFilled
                  ? "border-orange-500 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                  : i === typed.length
                  ? "border-orange-400 bg-orange-50 dark:bg-orange-900/10"
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
          className="text-lg font-semibold" style={{ color: "#FF9800" }}
        >
          Helyes!
        </motion.p>
      )}

      {/* Keyboard */}
      <div className="flex flex-col items-center gap-1.5 w-full max-w-sm">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1 justify-center">
            {row.map((letter) => (
              <motion.button
                key={letter}
                whileTap={{ scale: 0.9 }}
                animate={wrongKey === letter ? { x: [-4, 4, -4, 0] } : {}}
                onClick={() => handleKey(letter)}
                disabled={completed}
                className={`w-8 h-10 sm:w-9 sm:h-11 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  wrongKey === letter
                    ? "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200"
                    : "bg-secondary hover:bg-secondary/80 text-foreground"
                }`}
              >
                {letter}
              </motion.button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTask;
