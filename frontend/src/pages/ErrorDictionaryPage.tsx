import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Volume2, RotateCcw, Target } from "lucide-react";
import Header from "@/components/Header";
import { getErrorWords } from "@/utils/progress";
import { speak } from "@/utils/tts";
import { isSilent } from "@/utils/settings";

interface ErrorWord {
  wordId: number;
  word: string;
  hungarian: string;
  errorCount: number;
  chapterId: number;
  chapterName: string;
}

const ErrorDictionaryPage = () => {
  const navigate = useNavigate();
  const [errorWords, setErrorWords] = useState<ErrorWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    loadErrorWords();
  }, []);

  const loadErrorWords = async () => {
    const errorDict = getErrorWords() || {};
    const entries = Object.entries(errorDict)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 30);

    if (entries.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const ids = entries.map(([id]) => Number(id));
      const res = await fetch("/api/words/by-ids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Failed to fetch words");
      const words = await res.json();

      const allWords: ErrorWord[] = words.map((w: any) => ({
        wordId: w.id,
        word: w.word,
        hungarian: w.hungarian,
        errorCount: errorDict[w.id] || 0,
        chapterId: w.chapterId,
        chapterName: w.chapterName,
      }));

      allWords.sort((a, b) => b.errorCount - a.errorCount);
      setErrorWords(allWords);
    } catch {}
    setLoading(false);
  };

  const handleSpeak = (text: string) => {
    if (!isSilent()) speak(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-muted-foreground"
        >
          Betöltés...
        </motion.div>
      </div>
    );
  }

  // Practice mode - flashcard style review
  if (practiceMode && errorWords.length > 0) {
    const currentWord = errorWords[currentPracticeIndex % errorWords.length];
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 sm:pt-24 pb-24 sm:pb-20 px-4 sm:px-6 max-w-lg mx-auto flex flex-col items-center gap-6 safe-bottom">
          <div className="w-full flex items-center justify-between">
            <button
              onClick={() => setPracticeMode(false)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Vissza</span>
            </button>
            <span className="text-sm text-muted-foreground">
              {(currentPracticeIndex % errorWords.length) + 1} / {errorWords.length}
            </span>
          </div>

          {/* Progress */}
          <div className="w-full h-1 bg-secondary rounded-full">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${(((currentPracticeIndex % errorWords.length) + 1) / errorWords.length) * 100}%` }}
            />
          </div>

          <p className="text-sm text-muted-foreground tracking-widths uppercase font-medium">
            Gyakorlás
          </p>

          <motion.div
            key={currentPracticeIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-card rounded-[24px] border border-border p-8 flex flex-col items-center gap-6"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <div className="flex items-center gap-3">
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
                {currentWord.word}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSpeak(currentWord.word)}
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <Volume2 className="w-5 h-5 text-primary" />
              </motion.button>
            </div>

            <span className="text-xs text-muted-foreground bg-destructive/10 text-destructive px-3 py-1 rounded-full">
              {currentWord.errorCount}x hibáztál
            </span>

            <AnimatePresence>
              {showAnswer ? (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl text-primary font-medium"
                >
                  {currentWord.hungarian}
                </motion.p>
              ) : (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="px-6 py-3 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  Mutasd a jelentést
                </button>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => {
                setShowAnswer(false);
                setCurrentPracticeIndex((i) => i + 1);
              }}
              className="flex-1 px-6 py-3.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Következő
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 sm:pt-24 pb-24 sm:pb-20 px-4 sm:px-6 max-w-2xl mx-auto safe-bottom">
        <div className="flex items-center justify-between mb-8">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Vissza</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Hibaszótár</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          A nehezebb szavaid, ahol többször hibáztál. Gyakorold őket!
        </p>

        {errorWords.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-[24px] border border-border p-8 text-center"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <p className="text-4xl mb-4">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            </p>
            <h3 className="text-lg font-semibold text-foreground mb-2">Nincs hibás szó!</h3>
            <p className="text-muted-foreground">
              Kezdj el gyakorolni, és a nehezebb szavak itt fognak megjelenni.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Practice buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/weak-words-practice")}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-2xl text-base font-medium hover:opacity-90 transition-opacity"
              >
                <Target className="w-5 h-5" />
                Célzott gyakorlás
              </motion.button>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setPracticeMode(true);
                  setCurrentPracticeIndex(0);
                  setShowAnswer(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border border-border text-foreground rounded-2xl text-base font-medium hover:border-primary/30 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Villámkártyák
              </motion.button>
            </div>

            {/* Word list */}
            <div className="space-y-3">
              {errorWords.map((ew, idx) => (
                <motion.div
                  key={ew.wordId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between"
                  style={{ boxShadow: "var(--card-shadow)" }}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSpeak(ew.word)}
                      className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                    >
                      <Volume2 className="w-4 h-4 text-primary" />
                    </button>
                    <div>
                      <p className="font-medium text-foreground">{ew.word}</p>
                      <p className="text-sm text-muted-foreground">{ew.hungarian}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full font-medium">
                      {ew.errorCount}x
                    </span>
                    <button
                      onClick={() => navigate(`/chapter/${ew.chapterId}`)}
                      className="text-xs text-primary hover:underline"
                    >
                      {ew.chapterName}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ErrorDictionaryPage;
