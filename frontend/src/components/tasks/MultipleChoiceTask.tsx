import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, CheckCircle2, XCircle, Clock } from "lucide-react";
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
  const [hintIndex, setHintIndex] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Build cloze sentence: replace the target word with ___
  const cloze = useMemo(() => {
    const sentence = word.sentences?.[0];
    if (!sentence) return null;

    const en = sentence.en;
    const target = word.word.toLowerCase();

    // Try to find the word in the sentence (case-insensitive, whole word)
    const regex = new RegExp(`\\b${target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    const match = en.match(regex);

    if (match && match.index !== undefined) {
      const before = en.slice(0, match.index);
      const after = en.slice(match.index + match[0].length);
      return {
        before,
        after,
        originalWord: match[0],
        hu: sentence.hu,
      };
    }

    // Fallback: show full sentence + word separately
    return null;
  }, [word]);

  // Build options: correct word + 3 English distractors
  const options = useMemo(() => {
    if (cloze) {
      // Cloze mode: options are English words
      const opts = [cloze.originalWord];
      const distractors = word.distractors || [];
      for (const d of distractors) {
        if (opts.length < 4 && !opts.map(o => o.toLowerCase()).includes(d.toLowerCase())) {
          opts.push(d);
        }
      }
      // Pad if needed with Hungarian distractors fallback
      if (opts.length < 4) {
        const huDistractors = word.distractorsHu || [];
        for (const d of huDistractors) {
          if (opts.length < 4) opts.push(d);
        }
      }
      return opts.sort(() => Math.random() - 0.5);
    }

    // Fallback: Hungarian meaning matching (original behavior)
    const opts = [word.hungarian];
    const distractors = word.distractorsHu || [];
    for (const d of distractors) {
      if (opts.length < 4 && !opts.includes(d)) opts.push(d);
    }
    return opts.sort(() => Math.random() - 0.5);
  }, [word, cloze]);

  const correctAnswer = cloze ? cloze.originalWord : word.hungarian;

  // 30-second hint timer
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      const idx = options.findIndex(
        (o) => o.toLowerCase() === correctAnswer.toLowerCase()
      );
      if (idx >= 0) setHintIndex(idx);
    }, 30000);
    return () => clearTimeout(timerRef.current);
  }, [options, correctAnswer]);

  const handleSelect = (option: string) => {
    if (selected) return;
    clearTimeout(timerRef.current);
    setSelected(option);

    const isCorrect = option.toLowerCase() === correctAnswer.toLowerCase();
    const attempt = attempts + 1;
    setAttempts(attempt);

    if (isCorrect) {
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
    if (!isSilent()) {
      if (cloze) {
        speak(cloze.before + cloze.originalWord + cloze.after);
      } else {
        speak(word.word);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <p className="text-sm text-muted-foreground tracking-widest uppercase font-medium">
        Felismerés
      </p>

      {cloze ? (
        <>
          <p className="text-xs text-muted-foreground -mt-4">
            Melyik szó illik a mondatba?
          </p>

          {/* Cloze sentence with gap */}
          <div className="flex items-start gap-3 max-w-lg">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSpeak}
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1"
            >
              <Volume2 className="w-5 h-5 text-primary" />
            </motion.button>
            <p className="text-xl sm:text-2xl font-medium text-foreground leading-relaxed text-center">
              {cloze.before}
              <span className="inline-block mx-1 px-3 py-0.5 border-b-2 border-primary bg-primary/5 rounded-lg min-w-[80px] text-center">
                {selected && selected.toLowerCase() === correctAnswer.toLowerCase()
                  ? correctAnswer
                  : "___"}
              </span>
              {cloze.after}
            </p>
          </div>

          {/* Hungarian translation hint */}
          <p className="text-base text-muted-foreground italic text-center max-w-md">
            {cloze.hu}
          </p>
        </>
      ) : (
        <>
          <p className="text-xs text-muted-foreground -mt-4">
            Hallgasd meg a szót, és válaszd ki a helyes magyar jelentését.
          </p>

          <div className="flex items-center gap-3">
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
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
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg px-1">
        {options.map((option, idx) => {
          const isCorrect = option.toLowerCase() === correctAnswer.toLowerCase();
          const isSelected = selected === option;
          const isHinted = hintIndex === idx;

          let bgClass = "bg-card border-border hover:border-primary/30";
          if (isSelected && isCorrect)
            bgClass = "bg-success/10 border-success";
          else if (isSelected && !isCorrect)
            bgClass = "bg-destructive/10 border-destructive";
          else if (isHinted)
            bgClass = "bg-card border-primary/40";

          return (
            <motion.button
              key={option}
              whileHover={!selected ? { y: -2 } : {}}
              whileTap={!selected ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(option)}
              disabled={!!selected && selected.toLowerCase() === correctAnswer.toLowerCase()}
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

      {/* Explanation after wrong answer */}
      {selected && selected.toLowerCase() !== correctAnswer.toLowerCase() && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground text-center max-w-md"
        >
          A helyes válasz: <span className="font-semibold text-foreground">{correctAnswer}</span>
          {" "}({word.hungarian})
        </motion.p>
      )}
    </div>
  );
};

export default MultipleChoiceTask;
