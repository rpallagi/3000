import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import { fetchLevels, LevelData } from "@/utils/api";
import { getChapterProgress } from "@/utils/progress";

const LEVEL_INFO: Record<number, { motivation: string; method: string }> = {
  1: {
    motivation: "Az alapok, amelyek nélkül nem megy semmi. Köszönés, bemutatkozás, számok, színek.",
    method: "Hallgasd, értsd, mondd ki. Minden szót mondatban tanulsz, nem önmagában.",
  },
  2: {
    motivation: "A mindennapok szavai: család, étel, ruha, otthon. Amit nap mint nap használsz.",
    method: "Már tudod az alapokat - most építesz rá. Témánként haladunk, ahogy a valós életben is.",
  },
  3: {
    motivation: "A világ körülötted: idő, iskola, helyek, utazás, természet. Így mesélsz a világodról.",
    method: "Hosszabb mondatokat építesz, a szókincsed elég széles lesz egy turista beszélgetéshez.",
  },
  4: {
    motivation: "Érzelmek, szabadidő, foglalkozások. Nem csak tényeket mondasz, hanem véleményt is.",
    method: "A párbeszédek fontosabbá válnak - élő helyzetekben gyakorolsz.",
  },
  5: {
    motivation: "Munka, technológia, és az igék világa. A mondataid összetettebbek, természetesebbek lesznek.",
    method: "93 ige egy helyen - ezek a mondatépítés építőkövei. Aki az igéket tudja, az beszél.",
  },
  6: {
    motivation: "Melléknevek, határozószók, szókapcsolatok. A magabiztos, folyékony beszéd szintje.",
    method: "Nem szavakat tanulsz, hanem kifejezéseket. Így beszél egy anyanyelvi.",
  },
};

const LevelPage = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [level, setLevel] = useState<LevelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLevels()
      .then((levels) => {
        const found = levels.find((l) => l.id === Number(levelId));
        setLevel(found || null);
      })
      .finally(() => setLoading(false));
  }, [levelId]);

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

  if (!level) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Szint nem található</p>
        <button onClick={() => navigate("/")} className="text-primary underline">
          Vissza a főoldalra
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 sm:pt-24 pb-24 sm:pb-20 px-4 sm:px-6 max-w-2xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
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
          <p className="text-sm text-muted-foreground tracking-widest uppercase font-medium">
            Szint {level.id}
          </p>
          <h1 className="text-4xl font-semibold text-foreground">{level.nameEn}</h1>
          <p className="text-lg text-muted-foreground">{level.name}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {level.chapterCount} fejezet · {level.wordCount} szó
          </p>
          {LEVEL_INFO[level.id] && (
            <div className="mt-4 p-5 bg-primary/5 rounded-2xl flex flex-col gap-2">
              <p className="text-base text-foreground leading-relaxed">
                {LEVEL_INFO[level.id].motivation}
              </p>
              <p className="text-sm text-primary font-medium">
                {LEVEL_INFO[level.id].method}
              </p>
            </div>
          )}
        </motion.div>

        <div className="flex flex-col gap-4">
          {level.chapters.map((chapter, i) => {
            const progress = getChapterProgress(chapter.id);
            const totalLessons = Math.max(1, Math.ceil(chapter.wordCount / 10));
            const completedLessons = progress.length;
            const isComplete = completedLessons >= totalLessons;

            return (
              <motion.button
                key={chapter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                whileHover={{ y: -4, boxShadow: "var(--card-shadow-hover)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/chapter/${chapter.id}`)}
                className="w-full text-left p-6 md:p-8 bg-card rounded-[24px] border border-border hover:border-primary/20 transition-colors cursor-pointer"
                style={{ boxShadow: "var(--card-shadow)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-lg font-semibold text-foreground">{chapter.nameEn}</h3>
                      <p className="text-sm text-muted-foreground">{chapter.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                      {chapter.wordCount} szó
                    </span>
                    {completedLessons > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {completedLessons}/{totalLessons} lecke
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

export default LevelPage;
