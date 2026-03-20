import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ONBOARDING_KEY = "playeng_onboarded";

/** Check if user has completed onboarding. */
export const hasOnboarded = (): boolean => {
  return localStorage.getItem(ONBOARDING_KEY) === "true";
};

const setOnboarded = (): void => {
  localStorage.setItem(ONBOARDING_KEY, "true");
};

interface StepCard {
  title: string;
  desc: string;
}

const STEPS = [
  {
    title: "Magyaroknak fejlesztettük",
    subtitle: "A te logikádhoz igazítva.",
    cards: [
      { title: "Magyaroknak fejlesztett módszer", desc: "A magyar fejhez igazított tananyag." },
      { title: "Megtanulsz beszélni", desc: "Az első naptól mondatokat építesz." },
      { title: "Anyanyelvi oktatóval", desc: "Élő angol beszéd gyakorlás." },
    ] as StepCard[],
  },
  {
    title: "Hogyan működik?",
    subtitle: "Három lépésben tanulsz és beszélsz.",
    cards: [
      { title: "1. Megérted", desc: "Nyelvtant magyar fejjel kapod meg." },
      { title: "2. Gyakorlod", desc: "10 féle feladattal rögzíted az anyagot." },
      { title: "3. Beszélsz", desc: "Valódi szituációkban használod." },
    ] as StepCard[],
  },
  {
    title: "Gyakorolj napi pár percet!",
    subtitle: "Válaszd ki a neked ideális tempót:",
    timings: [
      { duration: "5 perc", desc: "Lazán — ~18 hónap", selected: false },
      { duration: "10 perc", desc: "Ajánlott — ~11 hónap", selected: true },
      { duration: "20 perc", desc: "Intenzív — ~6 hónap", selected: false },
    ],
  },
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedTiming, setSelectedTiming] = useState(1); // default: 10 min

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      // Save onboarding complete + selected timing
      setOnboarded();
      localStorage.setItem("playeng_daily_minutes", String([5, 10, 20][selectedTiming]));
      navigate("/level-test");
    }
  };

  const current = STEPS[step];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-8 safe-bottom">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold">
          <span style={{ color: "#4CAF50" }}>play</span>
          <span style={{ color: "#E91E63" }} className="font-bold">ENG</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Magyar fejjel, angol nyelven.</p>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -80 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-md flex flex-col items-center"
        >
          <h2 className="text-xl font-semibold text-foreground text-center mb-2">
            {current.title}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {current.subtitle}
          </p>

          {/* Cards (step 0 & 1) */}
          {"cards" in current && current.cards && (
            <div className="w-full flex flex-col gap-3 mb-8">
              {current.cards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-1"
                  style={{ boxShadow: "var(--card-shadow)" }}
                >
                  <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
                  <p className="text-xs text-muted-foreground">{card.desc}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Timing selection (step 2) */}
          {"timings" in current && current.timings && (
            <div className="w-full flex flex-col gap-3 mb-8">
              {current.timings.map((timing, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedTiming(i)}
                  className={`w-full rounded-2xl border p-5 flex items-center gap-4 text-left transition-all ${
                    selectedTiming === i
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-foreground/20"
                  }`}
                  style={{ boxShadow: "var(--card-shadow)" }}
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{timing.duration}</p>
                    <p className="text-xs text-muted-foreground">{timing.desc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedTiming === i ? "border-primary" : "border-border"
                    }`}
                  >
                    {selectedTiming === i && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex gap-2 mb-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === step ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleNext}
        className="w-full max-w-md py-4 rounded-2xl font-medium text-white text-center"
        style={{ background: "linear-gradient(135deg, #4CAF50, #4CAF50dd)" }}
      >
        {step === STEPS.length - 1 ? "Indulás!" : "Tovább"}
      </motion.button>

      {/* Skip */}
      {step < STEPS.length - 1 && (
        <button
          onClick={() => {
            setOnboarded();
            navigate("/");
          }}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Kihagyás
        </button>
      )}
    </div>
  );
};

export default OnboardingPage;
