import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { WordData } from "@/utils/api";
import WordChip from "@/components/WordChip";

interface Props {
  word: WordData;
  onComplete: (score: number, isError: boolean) => void;
}

const SentenceBuildingTask = ({ word, onComplete }: Props) => {
  const sentence = word.sentences?.[0];
  const correctWords = useMemo(
    () => (sentence ? sentence.en.replace(/[.,!?;:]/g, "").split(/\s+/) : []),
    [sentence]
  );

  const allWords = useMemo(() => {
    const distractors = (word.distractors || []).slice(0, 3);
    return [...correctWords, ...distractors].sort(() => Math.random() - 0.5);
  }, [correctWords, word.distractors]);

  const [shuffled] = useState(allWords);
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleWordClick = (w: string) => {
    if (result === "correct") return;
    if (selected.includes(w)) return;
    const newSelected = [...selected, w];
    setSelected(newSelected);

    if (newSelected.length === correctWords.length) {
      const isCorrect = newSelected.every(
        (s, i) => s.toLowerCase() === correctWords[i].toLowerCase()
      );
      const attempt = attempts + 1;
      setAttempts(attempt);

      if (isCorrect) {
        setResult("correct");
        const scoreMap: Record<number, number> = { 1: 8, 2: 5, 3: 3 };
        const score = scoreMap[attempt] || 1;
        setTimeout(() => onComplete(score, attempt > 1), 1500);
      } else {
        setResult("wrong");
        setTimeout(() => {
          setSelected([]);
          setResult(null);
        }, 1200);
      }
    }
  };

  const handleRemove = (index: number) => {
    if (result === "correct") return;
    setSelected((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  if (!sentence) {
    // No sentence available, skip
    setTimeout(() => onComplete(8, false), 100);
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <p className="text-sm text-muted-foreground tracking-widest uppercase font-medium">
        Mondatépítés
      </p>
      <p className="text-xs text-muted-foreground -mt-4">
        Rakd össze az angol mondatot a magyar jelentés alapján.
        {(word.distractors?.length || 0) > 0 && (
          <span className="ml-1" style={{ color: "#FF9800" }}>Vigyázz, van csapda!</span>
        )}
      </p>

      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground text-center leading-snug px-2">
        {sentence.hu}
      </h2>

      {/* Drop zone */}
      <div
        className={`w-full max-w-2xl min-h-[80px] flex flex-wrap gap-3 p-5 rounded-2xl border-2 border-dashed transition-colors ${
          result === "correct"
            ? "border-success bg-success/5"
            : result === "wrong"
            ? "border-destructive bg-destructive/5"
            : "border-border bg-surface-subtle"
        }`}
      >
        <AnimatePresence mode="popLayout">
          {selected.map((w, i) => (
            <WordChip
              key={`sel-${w}-${i}`}
              word={w}
              selected
              onClick={() => handleRemove(i)}
            />
          ))}
        </AnimatePresence>
        {selected.length === 0 && (
          <span className="text-muted-foreground text-sm self-center mx-auto">
            Kattints a szavakra...
          </span>
        )}
      </div>

      {/* Result indicator */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium ${
              result === "correct"
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {result === "correct" ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Helyes!
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" /> Nem stimmel, próbáld újra!
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Word options */}
      <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
        {shuffled.map((w, i) => (
          <WordChip
            key={`opt-${w}-${i}`}
            word={w}
            onClick={() => handleWordClick(w)}
            disabled={selected.includes(w)}
          />
        ))}
      </div>
    </div>
  );
};

export default SentenceBuildingTask;
