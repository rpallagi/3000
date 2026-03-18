import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, RotateCcw, ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

interface Props {
  score: number;
  maxScore: number;
  errors: { wordId: number; word: string }[];
  chapterName?: string;
  onBack: () => void;
  onRetry: () => void;
}

const ResultsScreen = ({ score, maxScore, errors, chapterName, onBack, onRetry }: Props) => {
  const navigate = useNavigate();
  const percentage = Math.round((score / maxScore) * 100);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const grade =
    percentage >= 90
      ? { text: "Kiváló!", color: "text-success" }
      : percentage >= 70
      ? { text: "Szép munka!", color: "text-primary" }
      : percentage >= 50
      ? { text: "Jó kezdés!", color: "text-foreground" }
      : { text: "Gyakorolj tovább!", color: "text-destructive" };

  // Fetch AI feedback
  useEffect(() => {
    const fetchFeedback = async () => {
      setLoadingFeedback(true);
      try {
        const res = await fetch("/api/ai/lesson-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            score,
            maxScore,
            errors,
            chapterName: chapterName || "",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.feedback) {
            setAiFeedback(data.feedback);
          }
        }
      } catch {}
      setLoadingFeedback(false);
    };

    fetchFeedback();
  }, [score, maxScore, errors, chapterName]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 sm:pt-24 pb-24 sm:pb-20 px-4 sm:px-6 max-w-lg mx-auto flex flex-col items-center gap-6 sm:gap-8 safe-bottom">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <Trophy className="w-12 h-12 text-primary" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`text-4xl font-semibold ${grade.color}`}
        >
          {grade.text}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-[24px] border border-border p-8 w-full flex flex-col items-center gap-4"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          <div className="text-6xl font-semibold text-foreground">{percentage}%</div>
          <p className="text-muted-foreground">
            {score} / {maxScore} pont
          </p>

          {/* Progress ring visual */}
          <div className="relative w-32 h-32 my-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="8"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 52}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 52 * (1 - percentage / 100),
                }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
              />
            </svg>
          </div>
        </motion.div>

        {/* AI Feedback */}
        {(aiFeedback || loadingFeedback) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full bg-gradient-to-br from-primary/5 to-primary/10 rounded-[24px] border border-primary/20 p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium text-primary">AI Tutor visszajelzés</p>
            </div>
            {loadingFeedback ? (
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-sm text-muted-foreground"
              >
                Gondolkodom...
              </motion.p>
            ) : (
              <p className="text-sm text-foreground leading-relaxed">{aiFeedback}</p>
            )}
          </motion.div>
        )}

        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full bg-card rounded-[24px] border border-border p-6"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <p className="text-sm text-muted-foreground tracking-widest uppercase font-medium mb-4">
              Nehezebb szavak
            </p>
            <div className="flex flex-wrap gap-2">
              {[...new Set(errors.map((e) => e.word))].map((word) => (
                <span
                  key={word}
                  className="px-4 py-2 bg-destructive/10 text-destructive rounded-full text-sm font-medium"
                >
                  {word}
                </span>
              ))}
            </div>
            <button
              onClick={() => navigate("/error-dictionary")}
              className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <BookOpen className="w-4 h-4" />
              Hibaszótár megnyitása
            </button>
          </motion.div>
        )}

        <div className="flex gap-3 mt-4 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-border text-foreground
              hover:border-primary/30 transition-colors text-sm font-medium active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Újra
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-full
              text-sm font-medium hover:opacity-90 transition-opacity active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Fejezet
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
