import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2, ArrowRight, Lock } from "lucide-react";
import Header from "@/components/Header";
import { fetchLesson, LessonData, WordData } from "@/utils/api";
import { speak } from "@/utils/tts";
import { isSilent } from "@/utils/settings";

const LessonPage = () => {
  const { chapterId, lessonId } = useParams<{ chapterId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [hasListened, setHasListened] = useState(false);

  useEffect(() => {
    if (!chapterId || !lessonId) return;
    fetchLesson(Number(chapterId), Number(lessonId))
      .then(setLesson)
      .finally(() => setLoading(false));
  }, [chapterId, lessonId]);

  // Reset listening state when word changes
  useEffect(() => {
    if (isSilent()) {
      setHasListened(true); // In silent mode, skip listening requirement
    } else {
      setHasListened(false);
    }
  }, [currentIndex]);

  // Auto-play word when it appears (mandatory first listen)
  useEffect(() => {
    if (!lesson || isSilent()) return;
    const word = lesson.words[currentIndex];
    if (!word) return;

    const timer = setTimeout(async () => {
      setSpeaking(true);
      try {
        await speak(word.word);
        if (word.sentences?.[0]) {
          await speak(word.sentences[0].en, "en-US", 0.85);
        }
        setHasListened(true);
      } catch {}
      setSpeaking(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [currentIndex, lesson]);

  const handleSpeak = async (word: WordData) => {
    if (isSilent()) return;
    setSpeaking(true);
    try {
      await speak(word.word);
      if (word.sentences?.[0]) {
        await speak(word.sentences[0].en, "en-US", 0.85);
      }
      setHasListened(true);
    } catch {}
    setSpeaking(false);
  };

  const handleNext = () => {
    if (!lesson) return;
    if (currentIndex < lesson.words.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      navigate(`/chapter/${chapterId}/lesson/${lessonId}/practice`);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
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

  if (!lesson || lesson.words.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Lecke nem található</p>
        <button onClick={() => navigate(-1)} className="text-primary underline">
          Vissza
        </button>
      </div>
    );
  }

  const word = lesson.words[currentIndex];
  const progress = ((currentIndex + 1) / lesson.words.length) * 100;
  const isLast = currentIndex === lesson.words.length - 1;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 sm:pt-24 pb-24 sm:pb-20 px-4 sm:px-6 max-w-2xl mx-auto flex flex-col items-center safe-bottom">
        <div className="w-full flex items-center justify-between mb-8">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Vissza</span>
          </motion.button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {lesson.words.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-secondary rounded-full mb-12">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <p className="text-sm text-muted-foreground tracking-widest uppercase font-medium mb-2">
          Figyelj meg
        </p>
        <p className="text-xs text-muted-foreground mb-8">
          Hallgasd meg a szót és a példamondatot. Nem kell semmit csinálnod, csak figyelj.
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="w-full bg-card rounded-[24px] sm:rounded-[32px] border border-border p-6 sm:p-8 md:p-12 flex flex-col items-center gap-5 sm:gap-6"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <div className="flex items-center gap-3">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground">
                {word.wordDisplay || word.word}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSpeak(word)}
                disabled={speaking}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  speaking ? "bg-primary/20 animate-pulse" : "bg-primary/10 hover:bg-primary/20"
                }`}
              >
                <Volume2 className={`w-5 h-5 text-primary ${speaking ? "animate-pulse" : ""}`} />
              </motion.button>
            </div>

            <span className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
              {word.pos}
            </span>

            <p className="text-2xl text-primary font-medium">{word.hungarian}</p>

            {word.sentences?.[0] && (
              <button
                onClick={() => { if (!isSilent()) speak(word.sentences[0].en, "en-US", 0.85); }}
                className="w-full mt-4 p-6 bg-surface-subtle rounded-2xl flex flex-col gap-3 text-left
                  hover:bg-primary/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-lg text-foreground leading-relaxed">
                    {word.sentences[0].en}
                  </p>
                </div>
                <p className="text-base text-muted-foreground">
                  {word.sentences[0].hu}
                </p>
              </button>
            )}

            {word.sentences?.[1] && (
              <button
                onClick={() => { if (!isSilent()) speak(word.sentences[1].en, "en-US", 0.85); }}
                className="w-full p-6 bg-surface-subtle rounded-2xl flex flex-col gap-3 text-left
                  hover:bg-primary/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-lg text-foreground leading-relaxed">
                    {word.sentences[1].en}
                  </p>
                </div>
                <p className="text-base text-muted-foreground">
                  {word.sentences[1].hu}
                </p>
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-3 mt-8 sm:mt-10 w-full sm:w-auto sm:justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 sm:flex-none px-6 py-3.5 rounded-full text-sm font-medium border border-border text-muted-foreground
              hover:text-foreground hover:border-foreground/20 transition-colors
              disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
          >
            Előző
          </motion.button>
          <motion.button
            whileHover={hasListened ? { scale: 1.02 } : {}}
            whileTap={hasListened ? { scale: 0.98 } : {}}
            onClick={handleNext}
            disabled={!hasListened}
            className={`flex-1 sm:flex-none px-8 py-3.5 rounded-full text-sm font-medium
              flex items-center justify-center gap-2 active:scale-95 transition-all ${
              hasListened
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {!hasListened && <Lock className="w-3.5 h-3.5" />}
            {isLast ? "Gyakorlás" : "Következő"}
            {hasListened && <ArrowRight className="w-4 h-4" />}
          </motion.button>
        </div>

        {!hasListened && !isSilent() && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground mt-3"
          >
            Hallgasd meg a szót a továbblépéshez
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default LessonPage;
