import { useState } from "react";
import { motion } from "framer-motion";
import { GrammarData } from "@/utils/api";

interface Props {
  grammar: GrammarData;
  unitId: string;
  onComplete: (score: number, isError: boolean) => void;
}

const GrammarExplanationTask = ({ grammar, unitId, onComplete }: Props) => {
  const [showExtra, setShowExtra] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground tracking-widest uppercase font-medium text-center">
        Nyelvtani szabály
      </p>

      {/* Basic rule */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-5"
        style={{ borderLeftWidth: 4, borderLeftColor: "#4CAF50", boxShadow: "var(--card-shadow)" }}
      >
        <h3 className="text-xs font-bold text-green-600 tracking-widest uppercase mb-3">
          Alapszabály
        </h3>
        <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
          {grammar.ruleBasic}
        </p>
      </motion.div>

      {/* Examples */}
      {grammar.examples && grammar.examples.length > 0 && (
        <div className="flex flex-col gap-2">
          {grammar.examples.map((ex, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface-subtle rounded-xl p-4"
            >
              <p className="text-sm font-medium text-foreground">{ex.en}</p>
              <p className="text-xs text-muted-foreground mt-1">{ex.hu}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Extra rule (collapsible) */}
      {grammar.ruleExtra && (
        <motion.button
          onClick={() => setShowExtra(!showExtra)}
          className="w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-left transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Haladóknak (ritka kivételek)
            </span>
            <motion.span
              animate={{ rotate: showExtra ? 180 : 0 }}
              className="text-amber-500"
            >
              ▼
            </motion.span>
          </div>
          {showExtra && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-sm text-amber-600 dark:text-amber-400 mt-3 whitespace-pre-line"
            >
              {grammar.ruleExtra}
            </motion.p>
          )}
        </motion.button>
      )}

      {/* Continue button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onComplete(8, false)}
        className="w-full py-4 rounded-2xl font-medium text-white text-center mt-2"
        style={{ background: "#4CAF50" }}
      >
        Megértettem
      </motion.button>
    </div>
  );
};

export default GrammarExplanationTask;
