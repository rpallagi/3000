import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WordChip from "./WordChip";
import SentenceCard from "./SentenceCard";

const DEMO_SENTENCE = {
  hungarian: "Szeretek kávét inni reggel.",
  words: ["I", "like", "to", "drink", "coffee", "in", "the", "morning"],
  correct: ["I", "like", "to", "drink", "coffee", "in", "the", "morning"],
  distractors: ["she", "eat", "water"],
};

const ExerciseDemo = () => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const allWords = [...DEMO_SENTENCE.words, ...DEMO_SENTENCE.distractors].sort(
    () => 0.5 - Math.random()
  );

  const [shuffledWords] = useState(allWords);

  const handleWordClick = (word: string) => {
    if (selectedWords.includes(word)) return;
    const newSelected = [...selectedWords, word];
    setSelectedWords(newSelected);

    if (newSelected.length === DEMO_SENTENCE.correct.length) {
      const correct = newSelected.every((w, i) => w === DEMO_SENTENCE.correct[i]);
      setIsCorrect(correct);
    }
  };

  const handleRemoveWord = (index: number) => {
    setSelectedWords(prev => prev.filter((_, i) => i !== index));
    setIsCorrect(null);
  };

  const handleReset = () => {
    setSelectedWords([]);
    setIsCorrect(null);
  };

  return (
    <section id="demo" className="w-full flex flex-col items-center py-20 px-6 gap-8">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-sm text-muted-foreground tracking-widest uppercase font-medium"
      >
        Próbáld ki
      </motion.p>

      <SentenceCard
        hungarian={DEMO_SENTENCE.hungarian}
        progress={Math.round((selectedWords.length / DEMO_SENTENCE.correct.length) * 100)}
      >
        <AnimatePresence mode="popLayout">
          {selectedWords.map((word, i) => (
            <WordChip
              key={`selected-${word}-${i}`}
              word={word}
              selected
              onClick={() => handleRemoveWord(i)}
            />
          ))}
        </AnimatePresence>
      </SentenceCard>

      <AnimatePresence>
        {isCorrect !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`px-6 py-3 rounded-full text-sm font-medium ${
              isCorrect
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {isCorrect ? "Szép munka! 🎉" : "Próbáld újra!"}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
        {shuffledWords.map((word, i) => (
          <WordChip
            key={`option-${word}-${i}`}
            word={word}
            onClick={() => handleWordClick(word)}
            disabled={selectedWords.includes(word)}
          />
        ))}
      </div>

      {selectedWords.length > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleReset}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          Újrakezdés
        </motion.button>
      )}
    </section>
  );
};

export default ExerciseDemo;
