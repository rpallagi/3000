import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, CheckCircle2, Shield, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import { fetchChapter, ChapterDetail } from "@/utils/api";
import { getLessonResult, getChapterProgress } from "@/utils/progress";

const ChapterPage = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chapterId) return;
    fetchChapter(Number(chapterId))
      .then(setChapter)
      .finally(() => setLoading(false));
  }, [chapterId]);

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

  if (!chapter) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Fejezet nem található</p>
        <button onClick={() => navigate(-1)} className="text-primary underline">
          Vissza
        </button>
      </div>
    );
  }

  const totalLessons = Math.max(1, Math.ceil(chapter.wordCount / 10));
  const lessons = Array.from({ length: totalLessons }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 sm:pt-24 pb-24 sm:pb-20 px-4 sm:px-6 max-w-2xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Vissza</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col gap-2 mb-12"
        >
          <h1 className="text-4xl font-semibold text-foreground">{chapter.nameEn}</h1>
          <p className="text-lg text-muted-foreground">{chapter.name}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {chapter.wordCount} szó · {totalLessons} lecke
          </p>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate(`/tutor?chapter=${chapterId}`)}
            className="mt-3 self-start flex items-center gap-2 text-sm text-primary hover:underline transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Gyakorolj AI Tutorral
          </motion.button>
        </motion.div>

        <div className="flex flex-col gap-4">
          {(() => {
            const completedLessons = getChapterProgress(Number(chapterId)).filter(
              (l) => l.lessonId !== 0
            ).length;
            const allComplete = completedLessons >= totalLessons;
            const testResult = getLessonResult(Number(chapterId), 0);

            if (allComplete) {
              return (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  whileHover={{ y: -4, boxShadow: "var(--card-shadow-hover)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/chapter/${chapterId}/test`)}
                  className="w-full text-left p-6 md:p-8 bg-gradient-to-br from-primary/5 to-primary/10 rounded-[24px] border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer mb-6"
                  style={{ boxShadow: "var(--card-shadow)" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        {testResult ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <Shield className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-semibold text-primary">Fejezet teszt</h3>
                        <p className="text-sm text-muted-foreground">
                          10 random szó az egész fejezetből · +50 pont
                        </p>
                      </div>
                    </div>
                    {testResult && (
                      <span className="text-xs text-success font-medium">
                        {Math.round((testResult.score / testResult.maxScore) * 100)}%
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            }
            return null;
          })()}

          {lessons.map((lessonId, i) => {
            const result = getLessonResult(Number(chapterId), lessonId);
            const start = (lessonId - 1) * 10;
            const end = Math.min(start + 10, chapter.wordCount);
            const wordPreview = chapter.words
              .slice(start, end)
              .map((w) => w.wordDisplay || w.word)
              .slice(0, 5)
              .join(", ");

            return (
              <motion.button
                key={lessonId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                whileHover={{ y: -4, boxShadow: "var(--card-shadow-hover)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/chapter/${chapterId}/lesson/${lessonId}`)}
                className="w-full text-left p-6 md:p-8 bg-card rounded-[24px] border border-border hover:border-primary/20 transition-colors cursor-pointer"
                style={{ boxShadow: "var(--card-shadow)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {result ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <Play className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {lessonId}. lecke
                      </h3>
                      <p className="text-sm text-muted-foreground truncate max-w-[250px] md:max-w-[400px]">
                        {wordPreview}...
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                      {end - start} szó
                    </span>
                    {result && (
                      <span className="text-xs text-success">
                        {Math.round((result.score / result.maxScore) * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChapterPage;
