import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LevelCard from "@/components/LevelCard";
import ExerciseDemo from "@/components/ExerciseDemo";
import { motion } from "framer-motion";
import { fetchLevels, LevelData } from "@/utils/api";

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
      <section id="method" className="w-full flex flex-col items-center py-20 px-6">
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

      {/* Levels */}
      <section id="levels" className="w-full flex flex-col items-center py-20 px-6">
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
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            © 2026 Play<span className="text-foreground font-medium">ENG</span>
          </span>
          <span className="text-sm text-muted-foreground">
            Oxford 3000 alapú mondatépítő platform
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
