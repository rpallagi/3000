import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LevelCard from "@/components/LevelCard";
import ExerciseDemo from "@/components/ExerciseDemo";
import { motion } from "framer-motion";
import { fetchLevels, LevelData } from "@/utils/api";
import { getStreak } from "@/utils/progress";

const FALLBACK_LEVELS = [
  { level: 1, title: "Foundations", subtitle: "A túlélőkészlet", wordRange: "1–500 szó", active: true },
  { level: 2, title: "Daily Life", subtitle: "A mindennapok nyelve", wordRange: "501–1000 szó" },
  { level: 3, title: "Social", subtitle: "Vélemény és kapcsolódás", wordRange: "1001–1500 szó", locked: true },
  { level: 4, title: "Professional", subtitle: "Munka és hatékonyság", wordRange: "1501–2000 szó", locked: true },
  { level: 5, title: "Nuance", subtitle: "Árnyalatok és érzelmek", wordRange: "2001–2500 szó", locked: true },
  { level: 6, title: "Mastery", subtitle: "Folyékony önkifejezés", wordRange: "2501–3000 szó", locked: true },
];

const LEVEL_SUBTITLES: Record<number, string> = {
  1: "A túlélőkészlet",
  2: "A mindennapok nyelve",
  3: "Vélemény és kapcsolódás",
  4: "Munka és hatékonyság",
  5: "Árnyalatok és érzelmek",
  6: "Folyékony önkifejezés",
};

const Index = () => {
  const navigate = useNavigate();
  const [levels, setLevels] = useState<{ level: number; title: string; subtitle: string; wordRange: string; active?: boolean; locked?: boolean }[]>(FALLBACK_LEVELS);

  useEffect(() => {
    fetchLevels()
      .then((apiLevels: LevelData[]) => {
        const mapped = apiLevels.map((l) => ({
          level: l.id,
          title: l.nameEn,
          subtitle: LEVEL_SUBTITLES[l.id] || l.name,
          wordRange: `${l.wordCount} szó`,
          active: l.id === 1,
          locked: l.wordCount === 0,
        }));
        setLevels(mapped);
      })
      .catch(() => {
        // Keep fallback
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <ExerciseDemo />

      {/* Method section */}
      <section id="method" className="w-full flex flex-col items-center py-16 sm:py-20 px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="max-w-2xl text-center flex flex-col gap-4 mb-16"
        >
          <p className="text-sm text-muted-foreground tracking-widest uppercase font-medium">
            A PlayENG módszer
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
            Nem magolsz. Beszélsz.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            10 év tapasztalat, az Oxford 3000 leggyakoribb szava, és egy egyszerű elv:
            a nyelvet használva tanulod meg, nem szabályokat memorizálva.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {[
            { num: "01", title: "Mondatot építesz", desc: "Nem szavakat tanulsz, hanem azonnal mondatokban gondolkodsz." },
            { num: "02", title: "Hallod a kiejtést", desc: "Minden mondat natív kiejtéssel szólal meg. A füled is tanul." },
            { num: "03", title: "Ismételsz okosan", desc: "A rendszer megjegyzi, mi megy nehezen, és visszahozza." },
          ].map((item, i) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="p-8 bg-card rounded-[32px] border border-border flex flex-col gap-3"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <span className="text-sm font-medium text-primary">{item.num}</span>
              <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Streak & Daily Challenge */}
      <section className="w-full flex flex-col items-center gap-4 px-5 sm:px-6">
        {(() => {
          const streak = getStreak();
          if (streak <= 0) return null;

          const messages = [
            "", // 0
            "Szuper kezdet!", // 1
            "Szépen haladsz!", // 2
            "Három nap sorozatban!", // 3
            "Kitartás!", // 4
            "Öt napos lendület!", // 5
            "Egy hete nem állsz meg!", // 6-7
            "Egy hete nem állsz meg!",
          ];
          const msg = streak >= 30 ? "Legenda vagy!" :
                      streak >= 14 ? "Két hete tanulsz!" :
                      streak >= 7  ? messages[6] :
                      messages[Math.min(streak, 7)];

          const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
              label: ["V", "H", "K", "Sze", "Cs", "P", "Szo"][d.getDay()],
              active: i >= 7 - Math.min(streak, 7),
            };
          });

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl w-full bg-card border border-border rounded-2xl p-5 sm:p-6"
              style={{ boxShadow: "var(--card-shadow)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--warning, 38 92% 50%))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{streak} napos sorozat</p>
                    <p className="text-sm text-muted-foreground">{msg}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between gap-1">
                {days.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                        d.active
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {d.active ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
                      ) : null}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{d.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })()}
      </section>

      {/* Daily Challenge Banner */}
      <section className="w-full flex justify-center px-5 sm:px-6 mt-4">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => navigate("/daily")}
          className="max-w-2xl w-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 sm:p-6 flex items-center justify-between hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Napi kihívás</p>
              <p className="text-xs text-muted-foreground">Fordíts le egy mondatot 30 mp alatt! +15 pont</p>
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0"><path d="m9 18 6-6-6-6"/></svg>
        </motion.button>
      </section>

      {/* Levels */}
      <section id="levels" className="w-full flex flex-col items-center py-16 sm:py-20 px-5 sm:px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-sm text-muted-foreground tracking-widest uppercase font-medium mb-12"
        >
          6 szint · 3000 szó
        </motion.p>
        <div className="flex flex-col gap-4 max-w-2xl w-full">
          {levels.map((lvl) => (
            <LevelCard
              key={lvl.level}
              {...lvl}
              onClick={() => navigate(`/level/${lvl.level}`)}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            © 2026 <span className="text-primary">Play</span><span className="text-foreground font-bold">ENG</span>
          </span>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/terms")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ÁSZF
            </button>
            <button onClick={() => navigate("/privacy")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Adatvédelem
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
