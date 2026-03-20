import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import { WordData } from "@/utils/api";
import { speak } from "@/utils/tts";
import { isSilent } from "@/utils/settings";

/**
 * Task 1: Szókincs bemutatás (Vocabulary Introduction)
 * Greta spec:
 * - Max 6-8 words, passive listening
 * - Image + word + TTS normal + slow (🐌)
 * - No answer required, just "next" after listening
 * - Mini beszédgyakorlat at end
 */

interface Props {
  words: WordData[];
  onComplete: (score: number, isError: boolean) => void;
}

const VocabularyIntroTask = ({ words, onComplete }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [hasListened, setHasListened] = useState(false);

  const word = words[currentIndex];
  const isLast = currentIndex >= words.length - 1;

  // Auto-play on mount and word change
  useEffect(() => {
    if (isSilent()) {
      setHasListened(true);
      return;
    }
    setHasListened(false);
    const timer = setTimeout(() => handleSpeak(), 400);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleSpeak = async () => {
    if (isSilent() || !word) return;
    setSpeaking(true);
    try {
      await speak(word.word);
      setHasListened(true);
    } catch {}
    setSpeaking(false);
  };

  const handleSpeakSlow = async () => {
    if (isSilent() || !word) return;
    setSpeaking(true);
    try {
      await speak(word.word, "en-US", 0.5);
      setHasListened(true);
    } catch {}
    setSpeaking(false);
  };

  const handleNext = () => {
    if (isLast) {
      onComplete(8, false); // Always passes — it's passive learning
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (!word) {
    onComplete(8, false);
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm tracking-widest uppercase font-medium" style={{ color: "#E91E63" }}>
        Szókincs bemutatás
      </p>
      <p className="text-xs text-muted-foreground -mt-4">
        Hallgasd meg a szót. Nem kell semmit csinálnod, csak figyelj.
      </p>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {words.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i < currentIndex ? "bg-pink-400" : i === currentIndex ? "bg-pink-600" : "bg-border"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-card rounded-2xl border border-border p-6 flex flex-col items-center gap-4"
          style={{ boxShadow: "var(--card-shadow)", borderLeftWidth: 4, borderLeftColor: "#E91E63" }}
        >
          {/* Word */}
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
            {word.wordDisplay || word.word}
          </h2>

          {/* POS tag */}
          <span className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
            {word.pos}
          </span>

          {/* Hungarian */}
          <p className="text-xl font-medium" style={{ color: "#E91E63" }}>
            {word.hungarian}
          </p>

          {/* Audio controls: normal + slow */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSpeak}
              disabled={speaking}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                speaking ? "bg-pink-200 dark:bg-pink-900/30 animate-pulse" : "bg-pink-100 dark:bg-pink-900/20 hover:bg-pink-200"
              }`}
            >
              <Volume2 className="w-5 h-5" style={{ color: "#E91E63" }} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSpeakSlow}
              disabled={speaking}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-100 dark:bg-orange-900/20 hover:bg-orange-200 transition-colors"
              title="Lassított"
            >
              <span className="text-lg">🐌</span>
            </motion.button>
          </div>

          {/* Example sentence */}
          {word.sentences?.[0] && (
            <button
              onClick={() => { if (!isSilent()) speak(word.sentences[0].en, "en-US", 0.85); }}
              className="w-full mt-2 p-4 bg-surface-subtle rounded-xl flex flex-col gap-2 text-left hover:bg-primary/5 transition-colors"
            >
              <p className="text-sm font-medium text-foreground">{word.sentences[0].en}</p>
              <p className="text-xs text-muted-foreground">{word.sentences[0].hu}</p>
            </button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next button */}
      <motion.button
        whileHover={hasListened ? { scale: 1.02 } : {}}
        whileTap={hasListened ? { scale: 0.98 } : {}}
        onClick={handleNext}
        disabled={!hasListened}
        className={`w-full py-3.5 rounded-2xl font-medium text-center transition-all ${
          hasListened
            ? "bg-pink-500 text-white hover:bg-pink-600"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        }`}
      >
        {isLast ? "Tovább a gyakorláshoz" : `Következő szó (${currentIndex + 1}/${words.length})`}
      </motion.button>
    </div>
  );
};

export default VocabularyIntroTask;
